export * from './routing';
export * from './commands';
export * from './dialogs';
export * from './deferred';
export * from './forms';
export * from './lists';
export * from './ContentView';
export * from './Page';

export interface IProperty<T> {
  get: () => T;
  set: (v: T) => void;
}

export function property<T, K extends keyof T>(model: T, propertyName: K) {
  return {
    get: () => model[propertyName],
    set: (value: T[K]) => (model[propertyName] = value)
  };
}

export function bindTo<T>(property: IProperty<T>) {
  return {
    value: property.get(),
    onChange: (value: T) => property.set(value)
  };
}