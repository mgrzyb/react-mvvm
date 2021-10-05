import { IRouteBinding } from './IRouteBinding';
import { IRoutedPage } from './index';

export interface IRouteDefinition<TModel> {
  getModelState(model: TModel): string;
  setModelState(model: TModel, state: string): void;

  bindFirstMatchingChildToPath(
    updateLocation: () => void,
    parentModel: TModel,
    remainingPath: string,
    query : { [key : string] : string },
    hash: string
  ): Promise<IRouteBinding | 'notfound' | 'unauthorized' | 'blocked' | undefined>;
  bindFirstMatchingChildToModel(updateLocation: () => void, model: IRoutedPage): IRouteBinding | undefined;
}
