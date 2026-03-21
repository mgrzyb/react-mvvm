import { observable } from "mobx";
import {IEvent} from "../Event";
import {IUITransaction} from "../UITransaction";
import {IContent} from "./IContent";
import {IContentStackEntry} from "./IContentStackEntry";
import {ContentStackEntry} from "./ContentStackEntry";

export function contentStack(context?: { discarding?: IEvent<[IUITransaction]> }) : IContentStack {

    const stack = new ContentStack();
    
    context?.discarding?.once(async t => {
        const entry = stack.entries[0];
        if (entry) {
            await stack.tryPop(entry, t);
        }
    });
    
    return stack;
}

export interface IContentStack {
    readonly entries: Iterable<IContentStackEntry<IContent>>;
    tryReplace<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T, transaction: IUITransaction) : Promise<IUITransaction<IContentStackEntry<T>>>;
    push<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T) : IContentStackEntry<T>;
}

export class ContentStack implements IContentStack {
    @observable.shallow private accessor _entries: ContentStackEntry<IContent>[] = [];
    get entries() : ReadonlyArray<ContentStackEntry<IContent>> { return this._entries}

    async tryReplace<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T, transaction: IUITransaction) : Promise<IUITransaction<IContentStackEntry<T>>> {
        if (this.entries.length > 0) {
            await this.tryPop(this.entries[0], transaction);
        }
        return transaction.append(() => this.push(createContent));
    }
    
    push<T extends IContent>(createContent: (entry: IContentStackEntry<T>) => T) {
        const entry = new ContentStackEntry<T>(this);
        entry._setContent(createContent(entry));
        this._entries.push(entry);
        return entry;
    }

    async tryPop(entry: ContentStackEntry<any>, transaction: IUITransaction) {
        console.log("tryPop", entry.content.title);

        if (this._entries.indexOf(entry) == -1) {
            throw new Error("Entry not found in stack");
        }

        for (const e of [entry, ...this.getDescendantsOf(entry)].reverse()) {
            await e.tryDiscard(transaction);
            if (transaction.canceled) {
                break;
            }
        }

        return transaction.append(() => {
            console.log("popping", entry.content.title);
            while (this._entries.pop() != entry) {}
        })
    }

    getChildOf(entry: ContentStackEntry<IContent>) : ContentStackEntry<IContent> | undefined {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries[index + 1];
    }

    getDescendantsOf(entry: ContentStackEntry<IContent>) {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries.slice(index + 1);
    }
}
