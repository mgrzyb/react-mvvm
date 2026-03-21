import {IUITransaction } from "../UITransaction";
import {IIntent} from "./IIntent";
import {IContent} from "./IContent";

export interface INavigationEntry<TContent extends IContent> {

    readonly content : TContent;

    // Events
    onClosing(handler: (action: IUITransaction) => void | Promise<void>) : () => void

    tryClose(transaction: IUITransaction) : Promise<IUITransaction<void>>
    tryOpenChild<T extends IContent>(createContent: (entry: INavigationEntry<T>) => T, transaction: IUITransaction) : Promise<IUITransaction<INavigationEntry<T>>>;
    tryOpenChildFromIntent<T extends IContent>(intent: IIntent<T>, transaction: IUITransaction) : Promise<IUITransaction<INavigationEntry<T>>>

    showModal<TResult>(modalFactory: (c : (result: TResult) => void) => object): Promise<TResult>;
}
