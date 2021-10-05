import { computed, observable } from 'mobx';
import { IRoutedPage } from './routing';
import { ICancelableAction, runWithCancelableAction } from './CancelableAction';

export interface IPage extends IRoutedPage {
  unload(): boolean;
  activate(): Promise<void>;
  deactivate(): Promise<any>;
  tryDeactivate(deactivate: ICancelableAction): Promise<void>;
}

export function withModal<TDialog>() {
  return function <T extends new (...args: any[]) => object>(Ctor: T) {
    class WithModalClass extends Ctor {
      @observable.ref modal: TDialog | undefined;

      async showModal<TResult>(createModal: (close: (result: (TResult | undefined)) => void) => TDialog) {
        return new Promise<TResult | undefined>((r) => {
          this.modal = createModal((result) => {
            this.modal = undefined;
            r(result);
          });
        });
      }
    }

    return WithModalClass;
  };
}

export class Page implements IPage {
  @observable.ref private _childPage: Page | undefined = undefined;
  get childPage(): Page | undefined {
    return this._childPage;
  }

  get topMostChildPage() : Page {
    return this.childPage ? this.childPage.topMostChildPage : this;
  }

  private isActive: boolean = false;
  async activate() {
    this.isActive = true;

    await this.onActivated();

    if (this._childPage) await this._childPage.activate();
    else await this.onActivatedAsTopMostPage();
  }

  async deactivate() {
    if (this._childPage) {
      await this._childPage.deactivate();
    }
    await this.onDeactivating({ cancelable: false });
    this.isActive = false;
    await this.onDeactivated();
  }

  tryDeactivate(): Promise<boolean>;
  tryDeactivate(deactivate: ICancelableAction): Promise<void>;
  async tryDeactivate(deactivate?: ICancelableAction): Promise<any> {
    if (!deactivate) {
      return await runWithCancelableAction((a) => this.tryDeactivate(a));
    }

    if (this._childPage) {
      await this._childPage.tryDeactivate(deactivate);
    }

    if (deactivate.canceled) return;

    if (!(await this.onDeactivating({ cancelable: true }))) {
      deactivate.cancel();
    }

    deactivate.then(async () => {
      this.isActive = false;
      await this.onDeactivated();
    });
  }

  tryRemoveChildPage(): Promise<boolean>;
  tryRemoveChildPage(action: ICancelableAction): Promise<void>;
  async tryRemoveChildPage(action?: ICancelableAction): Promise<any> {
    if (!this._childPage) throw Error('no child page');

    if (!action) {
      return await runWithCancelableAction((a) => this.tryRemoveChildPage(a));
    }

    if (this.isActive) {
      await this._childPage.tryDeactivate(action);
    }

    action.then(async () => {
      this._childPage = undefined;
      await this.onActivatedAsTopMostPage();
    });
  }

  unload(): boolean {
    if (this._childPage) return this._childPage.unload();
    return true;
  }

  async showChildPage<T extends Page>(newPageOrNewPageFactory: T | (() => T)): Promise<any> {
    if (this.childPage && this.childPage === newPageOrNewPageFactory) return this.childPage;

    if (this._childPage && this.isActive) {
      await this._childPage.deactivate();
    }

    const childPage = typeof newPageOrNewPageFactory == 'function' ? newPageOrNewPageFactory() : newPageOrNewPageFactory;

    this._childPage = childPage;
    console.log(this, 'Changed current page');
    if (this._childPage && this.isActive) await this._childPage.activate();

    return childPage;
  }

  tryShowChildPage<T extends Page>(newPageOrNewPageFactory: T | (() => T)): Promise<T | 'blocked'>;
  tryShowChildPage<T extends Page>(newPageOrNewPageFactory: T | (() => T), action: ICancelableAction): Promise<void>;
  async tryShowChildPage<T extends Page>(newPageOrNewPageFactory: T | (() => T), action?: ICancelableAction): Promise<any> {
    if (this.childPage && this.childPage === newPageOrNewPageFactory) return this.childPage;

    if (!action) {
      return (await runWithCancelableAction((a) => this.tryShowChildPage(newPageOrNewPageFactory, a))) ? this._childPage : 'blocked';
    }

    if (this._childPage && this.isActive) {
      await this._childPage.tryDeactivate(action);
    }

    action.then(async () => {
      this._childPage = typeof newPageOrNewPageFactory == 'function' ? newPageOrNewPageFactory() : newPageOrNewPageFactory;
      console.log(this, 'Changed current page');
      if (this._childPage && this.isActive) await this._childPage.activate();
    });
  }

  protected async onActivated() {}

  protected async onDeactivating(options: { cancelable: boolean }): Promise<boolean> {
    return Promise.resolve(true);
  }

  protected async onDeactivated() {}

  protected async onActivatedAsTopMostPage() {}
}
