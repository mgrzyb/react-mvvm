import {IUITransaction} from "../UITransaction";
import {INavigationEntry} from "./INavigationEntry";
import {StackNavigationEntry} from "./StackNavigationEntry";
import {IContent} from "./IContent";

export function createStackNavigation() : IStackNavigation{
    return new StackNavigation();
}

export interface IStackNavigation {
    readonly entries: Iterable<INavigationEntry<IContent>>;
    push<T extends IContent>(createContent: (entry: INavigationEntry<T>) => T) : INavigationEntry<T>;
}

export class StackNavigation implements IStackNavigation {
    private readonly _entries: StackNavigationEntry<IContent>[] = [];
    get entries() : Iterable<StackNavigationEntry<IContent>> { return this._entries}

    push<T extends IContent>(createContent: (entry: INavigationEntry<T>) => T) {
        const entry = new StackNavigationEntry<T>(this);
        entry._setContent(createContent(entry));
        this._entries.push(entry);
        return entry;
    }

    async tryPop(entry: StackNavigationEntry<any>, transaction: IUITransaction) {
        console.log("tryPop", entry.content.title);

        if (this._entries.indexOf(entry) == -1) {
            throw new Error("Entry not found in stack");
        }

        for (const e of [entry, ...this.getDescendantsOf(entry)].reverse()) {
            await e.closing(transaction);
            if (transaction.canceled) {
                break;
            }
        }

        return transaction.append(() => {
            console.log("popping", entry.content.title);
            while (this._entries.pop() != entry) {}
        })
    }

    getChildOf(entry: StackNavigationEntry<IContent>) : StackNavigationEntry<IContent> | undefined {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries[index + 1];
    }

    getDescendantsOf(entry: StackNavigationEntry<IContent>) {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries.slice(index + 1);
    }
}
