export interface IUITransaction<T = void> {
  readonly canceled: boolean;
  abort(): void;
  append<TReturn>(continuation: (a : T) => TReturn | Promise<TReturn>): IUITransaction<TReturn>;
}

export class UITransaction<T = void> implements IUITransaction<T> {
  private _complete : () => void = () => {};
  private continuation: Promise<any>;
  
  private _canceled = false;
  get canceled() {
    return this._canceled;
  }
  
    constructor() {
        this.continuation = new Promise<void>(resolve => this._complete = resolve);
    }
  abort(): void {
    this._canceled = true;
  }

  append<TReturn>(continuation: (a : T) => TReturn | Promise<TReturn>): IUITransaction<TReturn> {
    this.continuation = this.continuation.then(continuation);
    return this as unknown as IUITransaction<TReturn>;
  }

  async complete() {
    if (this.canceled) return false;
    this._complete();
    await this.continuation;
    return true;
  }
}

export async function runInTransaction<T>(action: (t: IUITransaction) => Promise<IUITransaction<T>>) {
  const t = new UITransaction();
  await action(t);
  await t.complete();
  return !t.canceled;
}
export async function runInTransactionAndGetResult<T>(action: (t: IUITransaction) => Promise<IUITransaction<T>>) : Promise<T | undefined> {
  const t = new UITransaction();
  const result = await action(t);
  await t.complete();
  
  return new Promise<T | undefined>((resolve) => {
    if (t.canceled) 
      resolve(undefined)
    else
      result.append(resolve);
  });
}