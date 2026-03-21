import { autorun, observable, runInAction, untracked, trace } from "mobx";
import {List, SortOrder} from "./List";
import { command } from "my-objects/commands";
 
export class PaginatedList<TId extends number | string, T extends { id : TId }, TContinuation = { skip: number }> extends List<TId, T> {

    @observable private accessor continuation: TContinuation | null = null;
    get hasNextPage() {
        return this.continuation !== null;
    }

    @observable private accessor _isLoadingFirstPage = 0;
    get isLoadingFirstPage() {
        return this._isLoadingFirstPage > 0;
    }

    @observable private accessor _isLoadingNextPage  = 0;
    get isLoadingNextPage() {
        return this._isLoadingNextPage > 0;
    }

    get isLoading() {
        return this.isLoadingFirstPage || this.isLoadingNextPage;
    }

    readonly loadNextPage = command(() => this._loadNextPage(), () => this.hasNextPage);
    
    private reqId = 0;
    
    constructor(private load: (sortOrder: SortOrder<T> | null, continuation: TContinuation | null) => Promise<{ items: ReadonlyArray<T>, continuation: TContinuation | null }>) {
        super([]);
        autorun(this.loadFirstPage, { delay: 500});
    }

    loadFirstPage = async () : Promise<void> => {
        trace();
        
        const isLoadingFirstPage = untracked(() => this._isLoadingFirstPage);
        
        this._isLoadingFirstPage = isLoadingFirstPage+1;
        try {
            this.continuation = null;
            this.clear()
            await this.loadMoreItems();
        } finally {
            this._isLoadingFirstPage--;
        }
    };

    private async _loadNextPage(): Promise<void> {
        
        const isLoadingNextPage = untracked(() => this._isLoadingNextPage);

        this._isLoadingNextPage = isLoadingNextPage+1;
        try {
            await this.loadMoreItems();
        } finally {
            this._isLoadingNextPage--;
        }
    };

    private async loadMoreItems(): Promise<void> {
        
        const currentReqId = ++this.reqId;
        
        const { items: newItems, continuation } = await this.load(this.sortOrder, untracked(() => this.continuation));
        
        if (currentReqId !== this.reqId)
            return;
        
        const items = untracked(() => this.items);
        runInAction(() => {
            this.continuation = continuation;
            this._items = this._items.concat(newItems);
        });
    }
}