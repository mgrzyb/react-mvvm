export interface IRouteBinding {
  getLocation(): { path: string; query: { [key : string] : string}, hash: string };
  tryUpdate(remainingPath: string, query: { [key : string] : string }, hash: string): Promise<boolean | 'blocked'>;
  destroy(): void;
}
