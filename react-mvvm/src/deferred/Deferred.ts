import { reaction } from "mobx";

type LoadingType = 'Loading';
type LoadingErrorType = 'LoadingError';

export const Loading: LoadingType = 'Loading';
export const LoadingError: LoadingErrorType = 'LoadingError';

export type Deferred<T> = T | LoadingType | LoadingErrorType;

export function loadedOrUndefined<T extends object>(model: T | string): T | undefined {
  if (typeof model !== 'object') return undefined;
  return model;
}

export function ensureResolved<T>(expr: () => Deferred<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let value = expr();
    if (isResolved(value)) {
      if (value === LoadingError) reject(value);
      else resolve(value);
      return;
    }

    reaction(expr, (model, r) => {
      if (!isResolved(model)) return;
      r.dispose();
      if (model === LoadingError) reject(model);
      else resolve(model);
    });
  });
}

export function isResolved<T>(model: Deferred<T>): model is T | LoadingErrorType {
  return model !== Loading;
}

export function isLoaded<T>(model: Deferred<T>): model is T {
  return model !== Loading && model !== LoadingError;
}