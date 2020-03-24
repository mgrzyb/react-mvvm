import { IRoutedPage } from "./index";
import { IRouteBinding } from "./IRouteBinding";

export interface IChildRoute {
    bindToPath(updateLocation: () => void, parentModel: IRoutedPage, remainingPath: string, hash : string): Promise<IRouteBinding | undefined>;

    bindToModel(updateLocation: () => void, model: IRoutedPage): IRouteBinding | undefined;
}