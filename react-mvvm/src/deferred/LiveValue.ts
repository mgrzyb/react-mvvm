import { autorun, computed, IReactionDisposer, observable, reaction, untracked } from "mobx";
import { Deferred, isLoaded } from "./Deferred";
import { asyncCommand } from "../commands";
import { IDeferredValue } from "./DeferredValue";
import { isDisposable } from "../Disposable";

class LiveValue<T> implements IDeferredValue<T> {
  @observable.ref
  private _value: Deferred<T> = 'Loading';
  @computed get value(): Deferred<T> {
    if (!this.autoLoader) {
      this.autoLoader = this.runAutoloader();
    }
    return this._value;
  }

  reloadCommand = asyncCommand(
    () => this._reload(),
    () => this._value !== 'Loading'
  );

  @observable
  private requestedVersion = 0;

  @observable
  private loadedVersion = 0;

  private autoLoader: IReactionDisposer | undefined;

  constructor(private readonly load: () => Promise<T | 'LoadingError' | 'Loading'>, private readonly delay = 250) {}

  private _reload() {
    this.setValue('Loading');
    this.requestedVersion++;
    return new Promise<void>((resolve) => {
      reaction(
        () => this.loadedVersion,
        (v, r) => {
          if (this.loadedVersion >= this.requestedVersion) {
            r.dispose();
            resolve();
          }
        }
      );
    });
  }

  private setValue(value: Deferred<T>) {
    const previousValue = untracked(() => this._value);
    this._value = value;
    if (value !== previousValue && isLoaded(previousValue) && isDisposable(previousValue)) {
      previousValue.dispose();
    }
  }

  async dispose() {
    if (this.autoLoader) this.autoLoader();
    this.autoLoader = undefined;
    if (isDisposable(this._value)) await this._value.dispose();
    this._value = 'Loading';
  }

  invalidate() {
    this.requestedVersion++;
  }

  update(patch: (value: T) => T): Deferred<T> {
    if (isLoaded(this._value)) this.setValue(patch(this._value));
    return this._value;
  }

  private runAutoloader() {
    let reqId = 0;

    return autorun(
      async () => {
        reqId++;
        const currentReqId = reqId;

        this.setValue('Loading');

        try {
          const reqVersion = this.requestedVersion;
          const v = await this.load();

          if (currentReqId == reqId) {
            this._value = v;
            this.loadedVersion = reqVersion;
          } else {
            if (isDisposable(v)) v.dispose();
          }
        } catch (e) {
          console.log('Failed to load LiveValue: ', e);
          this._value = 'LoadingError';
        }
      },
      {
        delay: this.delay
      }
    );
  }
}


export function liveValue<T>(load: () => Promise<T | 'Loading' | 'LoadingError' | void>): IDeferredValue<T> {
  return new LiveValue<T>(load as () => Promise<T | 'Loading' | 'LoadingError'>);
}
