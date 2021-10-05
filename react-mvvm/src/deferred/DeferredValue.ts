import { IDisposable } from "../Disposable";
import { Deferred } from "./Deferred";
import { ICommand } from "../commands";

export interface IDeferredValue<T> extends IDisposable {
  readonly value: Deferred<T>;
  reloadCommand: ICommand;
  invalidate(): void;
  update(patch: (value: T) => T): void;
}