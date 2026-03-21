import {IIntent} from "./IIntent";
import {IUITransaction} from "../UITransaction";

export interface IContent {
    readonly title: string;
    getIntentHandler?<T extends IContent>(intent: IIntent<T>) : ((t: IUITransaction) => Promise<any>) | undefined;
}