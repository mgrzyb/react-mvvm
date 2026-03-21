import {runInAction} from "mobx";

export * from './navigation';
export {IContentStackEntry} from "./navigation/IContentStackEntry";
export {IIntent} from "./navigation/IIntent";
export {ContentStackEntry} from "./navigation/ContentStackEntry";
export {IContent} from "./navigation/IContent";
export * from './Application';
export * from './UITransaction';
export * from './Event';
export * from './commands';
export * from './ContentView';
export * from './forms'
export * from './lists'
export * from './swr'

export interface IProperty<T> {
    get: () => T;
    set: (v: T) => void;
}

type PropertyCache<T> = { [P in keyof T]: IProperty<T[P]> };

export function property<T, K extends keyof T>(model: T, propertyName: K): IProperty<T[K]> {
    const properties : PropertyCache<T> = (model as any).__properties || ((model as any).__properties = {});
    return properties[propertyName] || (properties[propertyName] =  {
        get: () => model[propertyName],
        set: (value: T[K]) => runInAction(() => model[propertyName] = value)
    });
}

export function bindTo<T>(property: IProperty<T>) {
    return {
        value: property.get(),
        onChange: (value: T) => property.set(value)
    };
}