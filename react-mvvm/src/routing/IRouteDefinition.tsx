import { IRouteBinding } from "./IRouteBinding";
import { IRoutedPage } from "./index";

export interface IRouteDefinition<TModel> {
    getModelState(model: TModel): string;

    setModelState(model: TModel, state: string): void;

    bindFirstMatchingChildToPath(updateLocation: () => void, parentModel: TModel, remainingPath: string, hash : string): Promise<IRouteBinding | undefined>;

    bindFirstMatchingChildToModel(updateLocation: () => void, model: IRoutedPage): IRouteBinding | undefined;
}