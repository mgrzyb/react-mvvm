import {CancelableAction} from "../CancelableAction";
import {Event} from "../Event";

export interface INavigationEntry {
    tryClose() : Promise<boolean>;
    onClosing(handler: (action: CancelableAction) => Promise<void>) : () => void

    tryOpenChild(contentFactory: (entry: INavigationEntry) => object) : Promise<INavigationEntry | undefined>;
    tryOpenChildFromIntent(intent: object) : Promise<INavigationEntry | undefined>

    openModal<TResult>(modalFactory: (c : (result: TResult) => void) => object): Promise<TResult>;
}

export interface IContent {
    tryHandleIntent?(intent: object) : Promise<boolean>
}

export interface IIntent {
    contentFactory: (entry: INavigationEntry) => object;
}

class StackNavigationEntry implements INavigationEntry {
    
    private readonly _onClosing = new Event<[CancelableAction]>();

    private _content: IContent | undefined;
    get content() { return this._content!; }
    
    constructor(private readonly navigation: StackNavigation) {
    }
    
    tryClose() : Promise<boolean> {
        return this.navigation.tryPop(this);
    }

    async tryOpenChild(contentFactory: (entry: INavigationEntry) => IContent) : Promise<INavigationEntry | undefined> {
        const child = this.navigation.getChildOf(this);
        if (child && !await child.tryClose())
            return undefined;
        return this.navigation.push(contentFactory);
    }
    
    async tryOpenChildFromIntent(intent: IIntent) : Promise<INavigationEntry | undefined> {
        const child = this.navigation.getChildOf(this);
        if (child && await child.tryHandleIntent(intent))
            return child;
        
        return this.tryOpenChild(intent.contentFactory)        
    }
    onClosing(handler: (action: CancelableAction) => Promise<void>) {
        return this._onClosing.addListener(handler);
    }
    
    closing(action: CancelableAction) {
        return this._onClosing.emit(action);
    }
    
    setContent(content: IContent) {
        this._content = content;
    }

    private async tryHandleIntent(intent: object) {
        return (await this.content?.tryHandleIntent?.(intent))
    }
}

export interface IStackNavigation {
    readonly entries: Iterable<INavigationEntry>;
    push(contentFactory: (entry: INavigationEntry) => object) : INavigationEntry;
}

class StackNavigation implements IStackNavigation {
    private readonly _entries: StackNavigationEntry[] = [];
    get entries() : Iterable<StackNavigationEntry> { return this._entries}
    
    push(contentFactory: (entry: INavigationEntry) => object) {
        const entry = new StackNavigationEntry(this);
        entry.setContent(contentFactory(entry));
        this._entries.push(entry);
        return entry;
    }
    
    getChildOf(entry: StackNavigationEntry) : StackNavigationEntry | undefined {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries[index + 1];
    }
    
    getDescendantsOf(entry: StackNavigationEntry) {
        const index = this._entries.indexOf(entry);
        if (index == -1) {
            throw new Error("Entry not found in stack");
        }
        return this._entries.slice(index + 1);
    }
    
    async tryPop(entry: StackNavigationEntry) {
        if (this._entries.indexOf(entry) == -1) {
            throw new Error("Entry not found in stack");
        }
        
        const popAction = new CancelableAction(() => {
            while (this._entries.pop() != entry) {}
        })
    
        for (const e of [entry, ...this.getDescendantsOf(entry)].reverse()) {
            await e.closing(popAction);
        }
        
        return popAction.complete()
    }
}