export interface Loaded<T> {
    readonly state: "loaded"
    readonly value: T;
    readonly isLoading: boolean;
}

interface Pending {
    readonly state: "pending"
    readonly isLoading: true
}

interface FailedToLoad {
    readonly state : "failed-to-load"
    readonly error: Error;
}

export type SWR<T> = Pending | Loaded<T> | FailedToLoad;

class SWRImpl<T>
{
    state : "pending" | "loaded" | "failed" = "pending";
    value : T | undefined;
    isLoading: boolean = true;
    constructor(private readonly load : () => Promise<T>) {
    }
}

export function swr<T>(load : () => Promise<T>) : SWR<T> {
    const swr : SWR<T> = new SWRImpl<T>(load);
    return swr as SWR<T>;
}