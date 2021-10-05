import { IRoutedPage } from './index';
import { IRouteBinding } from './IRouteBinding';

export interface IChildRoute {
  bindToPath(
    updateLocation: () => void,
    parentModel: IRoutedPage,
    remainingPath: string,
    query : { [key : string] : string },
    hash: string
  ): Promise<IRouteBinding | 'unauthorized' | 'notfound' | 'blocked' | undefined>;
  bindToModel(updateLocation: () => void, model: IRoutedPage): IRouteBinding | undefined;
}
