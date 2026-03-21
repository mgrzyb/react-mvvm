import { action, computed, isAction, observable } from 'mobx';

export interface ICommand<T = void> {
  readonly isEnabled: boolean;
  readonly isRunning: boolean;
  execute(): Promise<Awaited<T>>;
  then<K>(f: (r : Awaited<T>) => Promise<K> | K): ICommand<K>;
}

class CommandDecorator<T, K> implements ICommand<K> {
  constructor(private readonly command: ICommand<T>, private readonly f: (r: Awaited<T>) => Promise<K> | K) {}

  get isEnabled() {
    return this.command.isEnabled && !this.isRunning;
  }
  
  @observable private accessor _isRunning = false;
  get isRunning() {
    return this.command.isRunning || this._isRunning;
  }

  async execute(): Promise<Awaited<K>> {
    this._isRunning = true;
    try {
      const r = await this.command.execute();
      return await this.f(r);
    } finally {
      this._isRunning = false;
    }
  }

  then<J>(f: (r: Awaited<K>) => Promise<J> | J): ICommand<J> {
    return new CommandDecorator(this, f);
  }
}

export class Command<T = any, K = any> {
  @computed get isEnabled(): boolean {
    return (!this._enabledValueAccessor || !!this._enabledValueAccessor()) && !this._isRunning;
  }

  @observable private accessor _isRunning: boolean = false;
  @computed get isRunning() {
    return this._isRunning;
  }

  private readonly _enabledValueAccessor: (() => K | boolean | undefined) | undefined;
  private readonly _execute: ((v: K) => Promise<T> |T) | ((v: K) => T);

  constructor(execute: ((v: K) => Promise<T> | T) | ((v: K) => T), enabled?: () => K | boolean | undefined) {
    this._execute = isAction(execute) ? execute : action(execute);
    this._enabledValueAccessor = enabled;
  }

  @action.bound async execute(): Promise<Awaited<T>> {
    const enabledValue = this._enabledValueAccessor && this._enabledValueAccessor();
    if (this._enabledValueAccessor && !enabledValue) return Promise.reject<Awaited<T>>();

    this._isRunning = true;
    try {
      console.log("execute");
      return await this._execute(enabledValue as any);
    } finally {
      console.log("finally");
      this._isRunning = false;
    }
  }

  then<J>(f: (r: Awaited<T>) => Promise<J> | J): ICommand<J> {
    return new CommandDecorator(this, f);
  }
}
