import {autorun, observable, untracked} from "mobx";

export type SWR<T> = {
    readonly value: T | undefined,
    readonly state: "loading" | "loaded" | "stale" | "failed-to-load",
    readonly isLoading: boolean,
    readonly isLoaded: boolean
    readonly isStale: boolean
    readonly failedToLoad: boolean
};

class SWRImpl<TArgs, TResult> {
    @observable private accessor _state: "loading" | "loaded" | "stale" | "failed-to-load" = "stale";
    get state() { return this._state; }
    
    get isLoading() { return this.state === "loading"; }
    
    get isLoaded() { return this.state === "loaded"; }
    
    get isStale() { return this.state === "stale" || (this.state === "loading" && this._value !== undefined); }
    
    get failedToLoad() { return this.state === "failed-to-load"; }
    
    @observable private accessor _value: TResult | undefined;
    get value() {
        this.firstAccess();
        return this._value; 
    }
    
    // @ts-ignore
    private firstAccess : () => void;
    // @ts-ignore
    @observable private accessor latestArgs : TArgs;

    private argsVersion = 0;
    private loadedVersion = 0;
    private loadingInProgress = false;
    
    constructor(private readonly load : (args: TArgs) => Promise<TResult>, private readonly getArgs: () => TArgs) {
        
        new Promise<void>(resolve => {
            this.firstAccess = resolve;
        }).then(() => {
            console.log("First access!")
            autorun(() => {
                this._state = "stale";
                const args = getArgs();
                this.latestArgs = args;
                this.argsVersion++;
                console.log("Stale again: " + args, this.argsVersion);
            });

            autorun(async () => {
                await this.loadInternal();
            }, {delay: 500})
        });
    }
    
    
    private async loadInternal() {
        const a = this.latestArgs;
        if (this.loadingInProgress || this.argsVersion === this.loadedVersion) return;
        this.loadingInProgress = true;
        this._state = "loading";
        do {
            const myVersion = this.argsVersion;
            console.log("Load internal...", myVersion)
            try {
                const v = await this.load(this.latestArgs)
                console.log("Loaded!", myVersion)
                this.loadedVersion = myVersion;
                if (myVersion === this.argsVersion) {
                    this.loadingInProgress = false;
                    this._state = "loaded";
                    this._value = v;
                    return;
                }
            } catch (e) {
                console.error(e);
                this.loadingInProgress = false;
                this._state = "failed-to-load";
                throw e;
            }
        } while (true);
    }
} 

export function swr<TArgs, TResult>(getArgs: () => TArgs, load : (args: TArgs) => Promise<TResult>) : SWR<TResult> {
    return new SWRImpl<TArgs, TResult>(load, getArgs);
}
