import {IIntent} from "./IIntent";
import {IUITransaction} from "../UITransaction";

export interface IContent {
    tryGetIntentHandler?<T extends IContent>(intent: IIntent<T>) : ((intent: IIntent<T>) => Promise<any>) | undefined;
}