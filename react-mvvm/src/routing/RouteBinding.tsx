import { IReactionDisposer, reaction, runInAction } from 'mobx';
import { IRoutedPage } from './index';
import { IRouteBinding } from './IRouteBinding';
import { IRouteDefinition } from './IRouteDefinition';

export class RouteBinding<TModel extends IRoutedPage> implements IRouteBinding {
  private readonly unObserveChildPage: IReactionDisposer;
  private readonly unObserveState: IReactionDisposer | undefined;
  private suspended = false;

  constructor(
    public readonly updateLocation: () => void,
    public readonly route: IRouteDefinition<TModel>,
    private path: string,
    private query : { [key : string] : string },
    private model: TModel,
    private nextBinding: IRouteBinding | undefined
  ) {
    this.unObserveChildPage = reaction(
      () => model.childPage,
      (newChildPage) => {
        if (this.suspended) return;

        runInAction(() => {
          if (this.nextBinding) {
            this.nextBinding.destroy();
            this.nextBinding = undefined;
          }

          if (!newChildPage) return;

          this.nextBinding = this.route.bindFirstMatchingChildToModel(updateLocation, newChildPage);
        });

        updateLocation();
      }
    );

    if (!nextBinding) {
      this.unObserveState = reaction(
        () => this.route.getModelState(model),
        () => {
          updateLocation();
        }
      );
    }
  }

  getLocation(): { path: string, query : { [key : string] : string }, hash: string } {
    if (this.nextBinding) {
      const childLocation = this.nextBinding.getLocation();
      return { path: this.path + childLocation.path, query: { ...childLocation.query, ...this.query}, hash: childLocation.hash };
    }
    return { path: this.path, query: this.query, hash: this.route.getModelState(this.model) };
  }

  destroy() {
    this.unObserveChildPage();

    if (this.unObserveState) this.unObserveState();

    if (this.nextBinding) this.nextBinding.destroy();
  }

  private async suspend<T>(a: () => Promise<T>): Promise<T> {
    this.suspended = true;
    try {
      return await a();
    } finally {
      this.suspended = false;
    }
  }

  async update(remainingPath: string, query: { [key : string] : string }, hash: string): Promise<'ok' | 'notfound' | 'unauthorized' | 'blocked'> {
    if (this.nextBinding) {
      const outcome = await this.nextBinding.tryUpdate(remainingPath, query, hash);
      if (outcome === 'blocked') return outcome;
      
      if (!outcome) {
        if (await this.suspend(() => this.model.tryRemoveChildPage())) {
          this.nextBinding.destroy();
          this.nextBinding = undefined;
        } else {
          return 'blocked';
        }
      }
    }

    if (!this.nextBinding) {
      let bindingOutcome = await this.route.bindFirstMatchingChildToPath(this.updateLocation, this.model, remainingPath, query, hash);
      if (bindingOutcome === 'unauthorized' || bindingOutcome === 'blocked' || bindingOutcome === 'notfound') return bindingOutcome;
      this.nextBinding = bindingOutcome;
    }

    if (!this.nextBinding) this.route.setModelState(this.model, hash);

    if (!this.nextBinding && remainingPath.length > 0)
      return 'notfound';
    
    return 'ok';
  }

  async tryUpdate(remainingPath: string, query: {[key : string] : string}, hash: string): Promise<boolean | 'blocked'> {
    if (remainingPath.startsWith(this.path)) {
      const outcome = await this.update(remainingPath.substring(this.path.length), query, hash);
      if (outcome === 'blocked') return outcome;
      return outcome === 'ok';
    }

    return false;
  }
}
