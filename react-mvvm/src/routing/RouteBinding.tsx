import { IReactionDisposer, reaction, runInAction } from "mobx";
import { IRoutedPage } from "./index";
import { IRouteBinding } from "./IRouteBinding";
import { IRouteDefinition } from "./IRouteDefinition";

export class RouteBinding<TModel extends IRoutedPage> implements IRouteBinding {
    
    private readonly unObserveChildPage: IReactionDisposer;
    private readonly unObserveState: IReactionDisposer | undefined;
    
    constructor(public readonly updateLocation: () => void, public readonly route: IRouteDefinition<TModel>, private path : string, private model: TModel, private nextBinding: IRouteBinding | undefined) {
        this.unObserveChildPage = reaction(() => model.childPage, newChildPage => {
            runInAction(() => {
                if (this.nextBinding) {
                    this.nextBinding.destroy();
                    this.nextBinding = undefined;
                }

                if (!newChildPage)
                    return;

                this.nextBinding = this.route.bindFirstMatchingChildToModel(updateLocation, newChildPage);
            });
            
            updateLocation();
        });

        if (!nextBinding) {
            this.unObserveState = reaction(() => this.route.getModelState(model), newState => {
                updateLocation();
            });
        }
    }

    getLocation(): { path: string, hash: string } {
        if (this.nextBinding) {
            const childLocation = this.nextBinding.getLocation();
            return { path: this.path + childLocation.path, hash: childLocation.hash };
        }
        return { path: this.path, hash: this.route.getModelState(this.model) };
    }

    destroy() {
        this.unObserveChildPage();
        
        if (this.unObserveState)
            this.unObserveState();
        
        if (this.nextBinding)
            this.nextBinding.destroy();
    }

    async update(remainingPath: string, hash : string) {
        if (this.nextBinding) {
            if (!await this.nextBinding.tryUpdate(remainingPath, hash)) {
                this.nextBinding.destroy();
                this.nextBinding = undefined;
                this.model.removeChildPage();
            }
        }
        
        if (!this.nextBinding) {
            this.nextBinding = await this.route.bindFirstMatchingChildToPath(this.updateLocation, this.model, remainingPath, hash);
        }
        
        if (!this.nextBinding)
            this.route.setModelState(this.model, hash);
    }

    async tryUpdate(remainingPath: string, hash : string) : Promise<boolean> {
        if (remainingPath.startsWith(this.path)) {
            await this.update(remainingPath.substring(this.path.length), hash);
            return true;
        }
        
        return false;
    }
}
