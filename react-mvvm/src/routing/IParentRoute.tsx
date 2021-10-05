export interface IParentRoute<TParams> {
  getPath(params: TParams): string;
}
