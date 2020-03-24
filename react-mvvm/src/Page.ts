import { computed, observable } from "mobx";
import { IRoutedPage } from "./routing";

export interface IPage extends IRoutedPage {
    activate() : Promise<void>;
    deactivate() : Promise<void>
}

export abstract class Page<TDialog = never> implements IPage {

    @observable.ref dialog : TDialog | undefined;

    @computed get childPage(): IPage | undefined {
        return this._childPage;
    }
    
    @observable.ref private _childPage: IPage | undefined = undefined;

    private isActive: boolean = false;

    async activate() {
        this.isActive = true;
        if (this._childPage)
            await this._childPage.activate();
        this.onActivated();
    }

    async deactivate() {
        if (this._childPage)
            await this._childPage.deactivate();
        this.isActive = false;
        await this.onDeactivated();
    }

    async removeChildPage() {
        if (this._childPage && this.isActive)
            await this._childPage.deactivate();
        this._childPage = undefined;
    }

    async showChildPage<T extends IPage>(newPage: T) {
        if (this._childPage && this.isActive)
            await this._childPage.deactivate();
        this._childPage = newPage;
        console.log(this, "Changed current page");
        if (this._childPage && this.isActive)
            await this._childPage.activate();
        return newPage;
    }

    async showModal<TResult>(createDialog : (close : (result : TResult) => void) => TDialog) {
        return new Promise(r => {
            this.dialog = createDialog(result => {
                this.dialog = undefined;
                r(result);
            });
        });
    }
    
    protected async onActivated() {
    }

    protected async onDeactivated() {
    }
}
