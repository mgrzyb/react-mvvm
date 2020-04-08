import { autorun, observable, runInAction, untracked } from "mobx";
import { List } from "./List";
import { asyncCommand, ICommand } from "../commands";

const PAGE_SIZE: number = 50;

export class PaginatedList<T extends { id : string | number }> extends List<T> {

    @observable private _currentPageNo: number = 1;
    get currentPageNo() {
        return this._currentPageNo;
    }

    @observable private _hasNextPage: boolean = false;
    get hasNextPage() {
        return this._hasNextPage;
    }

    @observable private _isLoadingFirstPage = 0;
    get isLoadingFirstPage() {
        return this._isLoadingFirstPage > 0;
    }

    @observable private _isLoadingNextPage  = 0;
    get isLoadingNextPage() {
        return this._isLoadingNextPage > 0;
    }

    get isLoading() {
        return this.isLoadingFirstPage || this.isLoadingNextPage;
    }

    readonly loadNextPage = asyncCommand<void>(() => this._loadNextPage(), () => this.hasNextPage);
    
    private reqId = 0;
    
    constructor(private load: (options: { skip : number, take : number}) => Promise<ReadonlyArray<T>>) {
        super();
        autorun(this.loadFirstPage, { delay: 500});
    }

    loadFirstPage = async () : Promise<void> => {
        
        const isLoadingFirstPage = untracked(() => this._isLoadingFirstPage);
        
        this._isLoadingFirstPage = isLoadingFirstPage+1;
        try {
            this._currentPageNo = 1;
            await this.loadMoreItems([], 1);
        } finally {
            this._isLoadingFirstPage--;
        }
    };

    private async _loadNextPage(): Promise<void> {
        
        const isLoadingNextPage = untracked(() => this._isLoadingNextPage);

        this._isLoadingNextPage = isLoadingNextPage+1;
        try {
            this._currentPageNo++;
            await this.loadMoreItems(this.items, this.currentPageNo);
        } finally {
            this._isLoadingNextPage--;
        }
    };

    private async loadMoreItems(currentItems : ReadonlyArray<T & { isNew? : boolean }>, currentPage : number): Promise<void> {
        
        const currentReqId = ++this.reqId;
        
        let newItems = await this.load({
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE+1
        });
        
        if (currentReqId !== this.reqId)
            return;
        
        runInAction(() => {
            if (newItems.length > PAGE_SIZE) {
                this._hasNextPage = true;
                newItems = newItems.slice(0, PAGE_SIZE);
            } else {
                this._hasNextPage = false;
            }
            this.items = currentItems.concat(newItems)
        });
    }
}