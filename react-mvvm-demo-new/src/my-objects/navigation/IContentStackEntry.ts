import {IUITransaction } from "../UITransaction";
import {IIntent} from "./IIntent";
import {IContent} from "./IContent";
import {IEvent} from "my-objects/Event";

interface INavigationEntry<TContent extends IContent = IContent> {

    readonly content : TContent;

    // Events
    readonly discarding : IEvent<[IUITransaction]>;

    showModal<TResult>(modalFactory: (closeModal : (result: TResult) => void) => object): Promise<TResult>;
}

export interface IContentStackEntry<TContent extends IContent = IContent> extends INavigationEntry<TContent> {
    tryClose(transaction: IUITransaction) : Promise<IUITransaction<void>>
    tryOpenChild<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T, transaction: IUITransaction) : Promise<IUITransaction<IContentStackEntry<T>>>;
    tryOpenChildFromIntent<T extends IContent>(intent: IIntent<T>, transaction: IUITransaction) : Promise<IUITransaction<IContentStackEntry<T>>>
}
