import {autorun, computed, observable, untracked} from "mobx";
import {Event, IEvent} from "my-objects/Event";
import {IUITransaction, runInTransaction} from "my-objects/UITransaction";

class SingleSelection<T extends { id: number | string }> {

    private readonly _changing = new Event<[T | null, IUITransaction]>()
    get changing() : IEvent<[T | null, IUITransaction]> {
        return this._changing;
    }
    
    readonly allowMultiple = false;

    @observable.ref private accessor _current: T | null = null;
    get current() {
        return this._current;
    }

    @computed get items() {
        return this._current ? [this._current] : [];
    }
    
    get isEmpty() {
        return this._current === null;
    }

    update(items: readonly T[]) {
        if (items.length === 0) {
            runInTransaction(async t => {
                await this._changing.emit(null, t);
                return t.append(() => this._current = null);
            });
        } else {
            runInTransaction(async t => {
                await this._changing.emit(items[0], t);
                return t.append(() => this._current = items[0]);
            });
        }
    }

    toggle(item: T): void {
        this.update(this._current === item ? [] : [item]);
    }
    
    clear() {
        this.update([]);
    }
}

class MultiSelection<T extends { id: number | string }> {

    readonly allowMultiple = true;

    @observable.shallow private accessor _items: Set<T> = new Set();
    @computed get items() {
        return [...this._items.values()];
    }

    get isEmpty() {
        return this._items.size === 0;
    }

    update(items: readonly T[]) {
        this._items = new Set(items);
    }

    clear() {
        this._items.clear()
    }

    add(item: T) {
        this._items.add(item);
    }

    remove(item: T) {
        this._items.delete(item);
    }

    toggle(item: T): void {
        if (this._items.has(item)) {
            this._items.delete(item);
        } else {
            this._items.add(item);
        }
    }
}

export function selection<T extends { id: number | string }>() {
    return new SingleSelection<T>();
}

export function multiSelection<T extends { id: number | string }>() {
    return new MultiSelection<T>();
}

export type SortOrder<T> = {
    readonly field: keyof T,
    readonly direction: "descend" | "ascend"
};

abstract class ListBase<TId extends number | string, T extends { id: TId }> {

    @observable.ref protected accessor _items: ReadonlyArray<T & { isNew?: boolean }> = [];

    get items() {
        return this._items;
    }

    get length() {
        return this.items.length;
    }

    @observable.ref accessor sortOrder: SortOrder<T> | null = null;

    clear() {
        this._items = [];
    }

    removeItems(items: ReadonlyArray<T>) {
        this._items = this.items.filter(i => items.includes(i));
    }

    removeItemsById(items: TId[]) {
        this._items = this.items.filter(i => items.includes(i.id));
    }

    prependNewItem(item: T) {
        this._items = [Object.assign(item, {isNew: true}), ...this.items];
    }

    prependNewItems(items: readonly T[]) {
        const newItems = items.map(i => (Object.assign(i, {isNew: true})));
        this._items = [...newItems, ...this.items];
    }

    patchItem(item: T, patch: Partial<T>) {
        this._items = this._items.map((i: any) => i === item ? {...i, ...patch as any} : i)
    }
}

export class List<TId extends number | string, T extends { id: TId }> extends ListBase<TId, T> {

    @observable.ref private accessor originalItems: readonly T[] = [];

    @observable private accessor _isLoading = 0;
    get isLoading() {
        return this._isLoading > 0;
    }

    constructor(itemsOrLoad: T[] | (() => Promise<readonly T[]>)) {
        super();
        if (Array.isArray(itemsOrLoad)) {
            this.originalItems = itemsOrLoad;
        } else {
            autorun(async () => {
                const isLoading = untracked(() => this._isLoading);
                this._isLoading = isLoading + 1;
                try {
                    this.originalItems = await itemsOrLoad();
                } finally {
                    this._isLoading--;
                }
            });
        }

        autorun(() => {
            if (this.sortOrder) {
                this._items = this.originalItems
                    .slice()
                    .sort((a, b) => (this.sortOrder?.direction === "ascend" ? 1 : -1) * (a[this.sortOrder!.field] > b[this.sortOrder!.field] ? 1 : -1));
            } else {
                this._items = this.originalItems;
            }
        });
    }
}