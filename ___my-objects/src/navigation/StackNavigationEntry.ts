import {Event} from "../Event";
import {IUITransaction, runInTransactionAndGetResult} from "../UITransaction";
import {IIntent} from "./IIntent";
import {INavigationEntry} from "./INavigationEntry";
import {StackNavigation} from "./StackNavigation";
import {IContent} from "./IContent";

export class StackNavigationEntry<TContent extends IContent> implements INavigationEntry<TContent> {

    private readonly _onClosing = new Event<[IUITransaction]>();

    private _content: TContent | undefined;
    get content() { return this._content!; }

    constructor(private readonly navigation: StackNavigation) {
    }

    async tryClose(transaction: IUITransaction) {
        return this.navigation.tryPop(this, transaction)
    }

    async tryOpenChild<T extends IContent>(createContent: (entry: INavigationEntry<T>) => T, transaction: IUITransaction) {
        const child = this.navigation.getChildOf(this);
        child && !await child.tryClose(transaction);
        return transaction.append(() => {
            const e : INavigationEntry<T> = this.navigation.push(createContent);
            return e
        });
    }

    async tryOpenChildFromIntent<T extends IContent>(intent: IIntent<T>, transaction: IUITransaction) {
        
        const child = this.navigation.getChildOf(this);

        if (child) {
            const handler = child.content?.tryGetIntentHandler?.(intent);
            if (handler) {
                return transaction.append(async () => {
                    await handler(intent);
                    return child as unknown as INavigationEntry<T>;
                });
            }
        }

        return this.tryOpenChild(intent.createContent, transaction)
    }

    onClosing(handler: (action: IUITransaction) => Promise<void>) {
        return this._onClosing.addListener(handler);
    }

    closing(action: IUITransaction) {
        return this._onClosing.emit(action);
    }

    _setContent(content: TContent) {
        this._content = content;
    }
    
    showModal<TResult>(modalFactory: (c: (result: TResult) => void) => object): Promise<TResult> {
        return Promise.resolve(undefined as TResult); // TODO
    }
}
