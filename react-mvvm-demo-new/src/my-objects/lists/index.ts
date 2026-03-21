import {List, SortOrder} from "./List";
import {PaginatedList} from "./PaginatedList";

export * from "./List";
export * from "./PaginatedList";

export function list<TItem extends { id: number | string }>(itemsOrLoad: TItem[] | (() => Promise<readonly TItem[]>)) {
    return new List(itemsOrLoad);
}
export function paginatedList<TItem extends { id: number | string }, TContinuation>(load: (sortOrder: SortOrder<TItem> | null, continuation: TContinuation | null) => Promise<{ items: readonly TItem[], continuation: TContinuation | null }>) {
    return new PaginatedList(load);
}