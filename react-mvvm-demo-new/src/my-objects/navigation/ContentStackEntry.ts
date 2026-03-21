import {Event, IEvent} from "../Event";
import {IUITransaction, runInTransactionAndGetResult} from "../UITransaction";
import {IIntent} from "./IIntent";
import {IContentStackEntry} from "./IContentStackEntry";
import {ContentStack} from "./ContentStack";
import {IContent} from "./IContent";

export class ContentStackEntry<TContent extends IContent> implements IContentStackEntry<TContent> {

    private readonly _discarding = new Event<[IUITransaction]>();
    get discarding() : IEvent<[IUITransaction]> { return this._discarding; }

    
    private _content: TContent | undefined;
    get content() { return this._content!; }

    
    constructor(private readonly navigation: ContentStack) {
    }

    async tryClose(transaction: IUITransaction) {
        return this.navigation.tryPop(this, transaction)
    }

    async tryOpenChild<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T, transaction: IUITransaction) {
        const child = this.navigation.getChildOf(this);
        child && !await child.tryClose(transaction);
        return transaction.append(() => {
            const e : IContentStackEntry<T> = this.navigation.push(createContent);
            return e
        });
    }

    async tryOpenChildFromIntent<T extends IContent>(intent: IIntent<T>, transaction: IUITransaction) {
        
        const child = this.navigation.getChildOf(this);

        if (child) {
            const tryHandleIntent = child.content?.getIntentHandler?.(intent);
            if (tryHandleIntent) {
                await tryHandleIntent(transaction);
                return transaction.append(async () => {
                    return child as unknown as IContentStackEntry<T>;
                });
            }
        }

        return this.tryOpenChild(intent.createContent, transaction)
    }

    tryDiscard(action: IUITransaction) {
        return this._discarding.emit(action);
    }

    _setContent(content: TContent) {
        this._content = content;
    }
    
    showModal<TResult>(modalFactory: (c: (result: TResult) => void) => object): Promise<TResult> {
        return Promise.resolve(undefined as TResult); // TODO
    }
}
