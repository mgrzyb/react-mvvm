import {INavigationEntry} from "./INavigationEntry";
import {IContent} from "./IContent";

export interface IIntent<TContent extends IContent> {
    createContent: (entry: INavigationEntry<TContent>) => TContent;
}
