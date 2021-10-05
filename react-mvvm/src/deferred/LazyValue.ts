import { computed, observable } from "mobx";
import { Deferred, isLoaded, isResolved } from "./Deferred";
import { IDeferredValue } from "./DeferredValue";
import { asyncCommand } from "../commands";
import { isDisposable } from "../Disposable";

class LazyValue<T> implements IDeferredValue<T> {
  @observable.ref
  private _value: Deferred<T> = 'Loading';
  @computed get value(): Deferred<T> {
    if (!isResolved(this._value) && !this.running) {
      this.running = true;
      this.load()
        .then((r) => {
          this.running = false;
          this._value = r;
        })
        .catch((e) => {
          console.log('Failed to load LazyValue: ', e);
          this.running = false;
        });
    }
    return this._value;
  }

  reloadCommand = asyncCommand(
    () => this._reload(),
    () => this._value !== 'Loading'
  );

  private requestedVersion = 0;
  private loadedVersion = 0;

  private running = false;

  constructor(private readonly load: () => Promise<T | 'LoadingError'>) {}

  invalidate() {
    if (this._value === 'Loading') this.requestedVersion++;
    else this._reload();
  }

  update(patch: (value: T) => T) {
    if (isLoaded(this._value)) this._value = patch(this._value);
  }

  dispose() {
    if (isDisposable(this._value)) this._value.dispose();
  }

  private async _reload() {
    const previousValue = this._value;
    this._value = 'Loading';
    if (isDisposable(previousValue)) await previousValue.dispose();

    const reqVersion = this.requestedVersion;
    this.running = true;
    try {
      do {
        this._value = await this.load();
        this.loadedVersion = reqVersion;
      } while (this.loadedVersion < this.requestedVersion);
    } finally {
      this.running = false;
    }
  }
}

export function lazyValue<T>(load: () => Promise<T | 'LoadingError'>): IDeferredValue<T> {
  return new LazyValue<T>(load);
}