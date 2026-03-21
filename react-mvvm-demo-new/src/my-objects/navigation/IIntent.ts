import {IContent} from "./IContent";
import {IContentStackEntry} from "my-objects/navigation/IContentStackEntry";

export interface IIntent<TContent extends IContent> {
    createContent: (entry: IContentStackEntry<TContent>) => TContent;
}
