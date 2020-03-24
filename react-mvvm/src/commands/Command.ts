import { action, computed, isAction, observable, runInAction } from "mobx";
import { ContextualCommand } from "./ContextualCommand";

export interface ICommand {
    readonly isEnabled : boolean;
    readonly isRunning : boolean;
    execute() : Promise<any>
}

export class Command<T = any, K = any> {

    @computed get isEnabled() : boolean {
        return (!this._enabledValueAccessor || !!this._enabledValueAccessor()) && !this._isRunning;
    }

    @observable private _isRunning: boolean = false;
    @computed get isRunning() {
        return this._isRunning;
    }
    
    private readonly _enabledValueAccessor: (() => K | undefined) | undefined;
    private readonly _execute: ((v : K) => Promise<T>) | (() => T);
    
    constructor(execute: ((v : K) => Promise<T>) | (() => T), enabled?: () => K | undefined) {
        this._execute = isAction(execute) ? execute : action(execute);
        this._enabledValueAccessor = enabled;
    }

    @action.bound async execute(): Promise<T> {
        const enabledValue = this._enabledValueAccessor && this._enabledValueAccessor();
        if (this._enabledValueAccessor && !enabledValue)
            return Promise.reject();

        this._isRunning = true;
        try {
            return await this._execute(enabledValue as any);
        }   
        finally {
            this._isRunning = false;
        }
    }

    asContextualCommand<TContext>() {
        return new ContextualCommand<TContext, void>(c => this.execute(), c => this.isEnabled);
    }
}
