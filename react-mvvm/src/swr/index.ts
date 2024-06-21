
export type SWR<T> = {
    () : T | undefined,
    readonly state: "loading" | "loaded" | "failed-to-load",
    readonly isLoading: boolean,
    readonly isLoaded: boolean
    readonly isStale: boolean
    readonly failedToLoad: boolean
};

export function swr<T>(load : () => Promise<T>) : SWR<T> {
    const swr : SWR<T> = new SWRImpl<T>(load);
    return swr as SWR<T>;
}
