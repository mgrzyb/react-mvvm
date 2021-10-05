export type IDisposable = { dispose: () => Promise<void> | void };

export default class Disposable implements IDisposable {
  private readonly disposers: (() => void | Promise<void>)[] = [];

  using(disposer: () => void): void;
  using<T extends IDisposable>(disposable: T): T;
  using(disposerOrDisposable: (() => void) | IDisposable) {
    if (typeof disposerOrDisposable === 'function') {
      this.disposers.push(disposerOrDisposable);
      return;
    } else {
      this.disposers.push(disposerOrDisposable.dispose.bind(disposerOrDisposable));
      return disposerOrDisposable;
    }
  }

  async dispose() {
    for (const disposer of this.disposers) {
      await disposer();
    }
  }
}

export function isDisposable(a: any): a is IDisposable {
  return typeof a === 'object' && 'dispose' in a && typeof a.dispose === 'function';
}
