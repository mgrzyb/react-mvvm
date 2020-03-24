import { autorun, reaction } from "mobx";

export * from "./routing";
export * from "./forms";
export * from "./commands";
export * from "./dialogs";
export * from "./ContentView";
export * from "./Page";
export * from "./navigation";

export interface IProperty<T> {
  get: () => T;
  set: (v: T) => void;
}

export function predicates(...predicates: (() => boolean)[]) {
  return () => predicates.every(p => p());
}

export function required(get: () => string) {
  return () => !!get();
}

export function email(get: () => string) {
  const re = /\S+@\S+\.\S+/;
  return () => !!get() && re.test(get());
}

export function property<T, K extends keyof T>(model: T, propertyName: K) {
  return {
    get: () => model[propertyName],
    set: (value: T[K]) => (model[propertyName] = value)
  };
}

export function bindTo<T>(property: {
  get: () => T;
  set: (value: T) => void;
}) {
  return {
    value: property.get(),
    onChange: (value: T) =>
      property.set(value)
  };
}

type LoadingType = "Loading";
type LoadingErrorType = "LoadingError";

export const Loading : LoadingType = "Loading";
export const LoadingError : LoadingErrorType = "LoadingError";

export type Deferred<T> = T | LoadingType | LoadingErrorType;

export function bindToApi<T>(
  p: IProperty<Deferred<T>>,
  api: () => Promise<T>,
  delay?: number
): void {
  let reqId = 0;

  autorun(
    async () => {
      reqId++;
      const currentReqId = reqId;

      p.set("Loading");

      try {
        const v = await api();

        if (currentReqId == reqId) {
          p.set(v);
        }
      } catch (e) {
        p.set(LoadingError);
      }
    },
    {
      delay: delay || 250
    }
  );
}

export function loadedOrUndefined<T>(model: Deferred<T>): T | undefined {
  if (model == Loading || model == LoadingError) return undefined;
  return model;
}

export function ensureLoaded<T>(expr: () => Deferred<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let value = expr();
    if (isLoaded(value)) {
      resolve(value);
      return;
    }

    let dispose = reaction(expr, model => {
      if (model == LoadingError) reject(model);
      else if (isLoaded(model)) resolve(model);
      dispose();
    });
  });
}

export function isLoaded<T>(model: Deferred<T>): model is T {
  return !(model == Loading || model === LoadingError);
}

export function bindToDataSource<T>(dataSource : Deferred<T[]>){
    return {
        loading: dataSource == "Loading",
        dataSource: isLoaded(dataSource) ? dataSource : undefined
    }
}