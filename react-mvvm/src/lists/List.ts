import { observable } from "mobx";

export class List<T extends { id : number | string }> {
    
    @observable.ref selection: ReadonlyArray<T> = [];
    @observable.ref items: ReadonlyArray<T & { isNew? : boolean }> = [];
    @observable.ref sortOrder : { readonly field : keyof T, readonly direction : "descend" | "ascend" } | undefined;
    
    get length() { return this.items.length; }

    push(item : T) {
        this.items = [...this.items, item];
    }

    removeItems(items: ReadonlyArray<T>) {
        this.items = this.items.filter(i => items.indexOf(i) < 0);
    }

    prependNewItem(item: T) {
        this.items = [Object.assign(item, { isNew: true }), ...this.items];
    }

    prependNewItems(items: T[]) {
        const newItems = items.map(i => (Object.assign(i, { isNew: true })));
        this.items = [...newItems, ...this.items];
    }

    patchItem(item : T, patch : Partial<T>){
        this.items = this.items.map((i : any) => i === item ? {...i, ...patch as any} : i)
    }
    
    field<P extends keyof T>(key : P) : keyof T {
        return key;
    }
}
