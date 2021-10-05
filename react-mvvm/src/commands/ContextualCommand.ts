import { action, computed, isAction, observable, runInAction } from 'mobx';
import { Command } from './Command';

export function contextualCommand<TContext>(execute: (context: TContext) => void, enabled?: (context: TContext) => boolean) {
  return new ContextualCommand(execute, enabled);
}

export class ContextualCommand<TContext, TResult = any> {
  private readonly _canExecute: ((context: TContext) => boolean) | null;
  private readonly _execute: ((context: TContext) => Promise<TResult>) | ((context: TContext) => TResult);

  @computed get isRunning() {
    return this._isRunning;
  }

  @observable private _isRunning: boolean = false;

  constructor(execute: ((context: TContext) => Promise<TResult>) | ((context: TContext) => TResult), canExecute?: (context: TContext) => boolean) {
    this._execute = isAction(execute) ? execute : action(execute);
    this._canExecute = canExecute || null;
  }

  canExecute(context: TContext) {
    return !this.isRunning && (!this._canExecute || this._canExecute(context));
  }

  @action.bound
  async execute(context: TContext): Promise<TResult> {
    if (!this.canExecute(context)) return Promise.reject(`Cannot execute a contextual command that is not enabled for ${context}`);

    this._isRunning = true;
    try {
      return await this._execute(context);
    } finally {
      runInAction(() => (this._isRunning = false));
    }
  }

  asCommand(contextAccessor: () => TContext, isEnabled: () => boolean) {
    return new Command<TResult>(
      () => this.execute(contextAccessor()),
      () => isEnabled() && this.canExecute(contextAccessor())
    );
  }
}
