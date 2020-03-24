export interface IRouteBinding {
    getLocation(): { path: string, hash: string };

    destroy(): void;

    tryUpdate(remainingPath: string, hash: string): Promise<boolean>;
}