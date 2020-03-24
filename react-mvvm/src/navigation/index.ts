import { computed } from "mobx";
import { IRoutedPage } from "../routing";

class Navigation<T> {

    @computed get selectedItem() {
        for (const i in this.items){
            if (!this.items.hasOwnProperty(i))
                continue;
            if (this.items[i].isActive)
                return this.items[i];
        }
        return undefined;
    }

    @computed get selectedItems() {
        return this.selectedItem ? [this.selectedItem] : [];
    }

    constructor(public readonly items : { [P in keyof T] : NavigationItem }) {

    }

}

type NavigationPage = {
    readonly childPage: IRoutedPage | undefined;
    showChildPage(newPage: any) : void;
    removeChildPage() : void;
};

class NavigationItem {

    @computed get isActive() {
        return (this.page.childPage && Object.getPrototypeOf(this.page.childPage).constructor === this.item) ||
            (this.page.childPage === undefined && this.item === undefined);
    }

    constructor(public readonly key : string, private page: NavigationPage, private item: (new () => IRoutedPage) | undefined) {
    }

    activate = () => {
        if (this.item)
            this.page.showChildPage(new this.item());
        else
            this.page.removeChildPage();
    }
}

export function navigation<T extends { [k : string] : (new () => IRoutedPage) | undefined}>(page : NavigationPage, items : T ) : Navigation<T> {

    const navItems : { [P in keyof T]? : NavigationItem } = { };

    for (const i in items){
        if (!items.hasOwnProperty(i))
            continue;

        navItems[i] = new NavigationItem(i, page, items[i])
    }

    return new Navigation<T>(navItems as any);
}
