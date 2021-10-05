import { compile, Key, Key as PathToRegexpKey, parse, PathFunction, pathToRegexp } from 'path-to-regexp';
import { IRoutedPage, IRoute } from './index';
import { IParentRoute } from './IParentRoute';
import { RouteBinding } from './RouteBinding';
import { ConstructorOf } from '../ConstructorOf';
import { IRouteBinding } from './IRouteBinding';
import { IChildRoute } from './IChildRoute';
import { IRouteDefinition } from './IRouteDefinition';

export abstract class RouteDefinitionBase<TModel extends IRoutedPage, TParentParams, TParams>
  implements IRoute<TModel, TParentParams, TParams>, IRouteDefinition<TModel> {
  children: IChildRoute[] = [];

  protected constructor(private stateAccessor?: { get: (page: TModel) => string; set: (page: TModel, state: string) => void }) {}

  addRoute<TNewModel extends IRoutedPage, TNewParams>(
    path: string,
    modelConstructor: ConstructorOf<TNewModel>,
    modelFactory: (currentModel: TModel, params: TNewParams) => Promise<TNewModel | 'unauthorized'> | TNewModel | 'unauthorized',
    paramsSelector?: (page: TNewModel) => TNewParams,
    stateAccessor?: { get: (page: TNewModel) => string; set: (page: TNewModel, state: string) => void }
  ): RouteDefinition<TModel, TNewModel, TParentParams & TParams, TNewParams> {
    const route = new RouteDefinition<TModel, TNewModel, TParentParams & TParams, TNewParams>(
      this,
      path,
      modelConstructor,
      modelFactory,
      paramsSelector,
      stateAccessor
    );
    this.children.push(route);
    return route;
  }

  abstract getPath(params: TParentParams): string;

  public async bindFirstMatchingChildToPath(updateLocation: () => void, model: TModel, remainingPath: string, query : { [key : string] : string }, hash: string) {
    for (const childRoute of this.children) {
      const binding = await childRoute.bindToPath(updateLocation, model, remainingPath, query, hash);
      if (binding && binding !== 'notfound') {
        return binding;
      }
    }
    
    if (remainingPath.length > 0)
      return 'notfound';
    
    return undefined;
  }

  public bindFirstMatchingChildToModel(updateLocation: () => void, model: IRoutedPage) {
    for (const childBindingDefinition of this.children) {
      let binding = childBindingDefinition.bindToModel(updateLocation, model);
      if (binding) return binding;
    }
    return undefined;
  }

  getModelState(model: TModel): string {
    return (this.stateAccessor && this.stateAccessor.get(model)) || '';
  }

  setModelState(model: TModel, state: string): void {
    this.stateAccessor && this.stateAccessor.set(model, state);
  }
}

export class RouteDefinition<TParentModel extends IRoutedPage, TModel extends IRoutedPage, TParentParams, TParams>
  extends RouteDefinitionBase<TModel, TParentParams, TParams>
  implements IChildRoute {
  readonly pathRegExp: RegExp;
  readonly pathRegExpKeys: PathToRegexpKey[] = [];
  readonly pathFactory: PathFunction<any>;
  private readonly pathKeys: Key[];

  constructor(
    public readonly parentRoute: IParentRoute<TParentParams>,
    public path: string,
    protected modelConstructor: ConstructorOf<TModel>,
    protected modelFactory: (parent: TParentModel, params: TParams) => Promise<TModel | 'unauthorized'> | TModel | 'unauthorized',
    protected paramsSelector?: (model: TModel) => TParams,
    stateAccessor?: { get: (page: TModel) => string; set: (page: TModel, state: string) => void } | undefined
  ) {
    super(stateAccessor);
    this.pathRegExp = pathToRegexp(path, this.pathRegExpKeys, { end: false });
    this.pathKeys = parse(path).filter(t => typeof t !== "string") as Key[];
    this.pathFactory = compile(path, { encode: encodeURIComponent });
  }

  getPath(params: TParentParams & TParams) {
    return this.parentRoute.getPath(params) + this.pathFactory(params);
  }

  matchPath(
    path: string
  ):
    | {
        path: string;
        remainingPath: string;
        params: TParams;
      }
    | undefined {
    // path = path.replace(/\/$/, ''); // Trim trailing slash
    const match = this.pathRegExp.exec(path);
    if (!match) return;
    const params: {
      [k: string]: string | undefined;
    } = {};
    for (let i = 1; i < match.length; i++) {
      params[this.pathRegExpKeys[i - 1].name] = (match[i] && decodeURIComponent(match[i])) || undefined;
    }
    return {
      path: match[0],
      remainingPath: path.substring(match[0].length),
      params: (params as unknown) as TParams
    };
  }

  async bindToPath(
    updateLocation: () => void,
    parentModel: TParentModel,
    remainingPath: string,
    query : { [key : string] : string },
    hash: string
  ): Promise<IRouteBinding | 'unauthorized' | 'notfound' | 'blocked' | undefined> {
    const match = this.matchPath(remainingPath);
    if (!match) return;
    const model = await this.modelFactory(parentModel, { ...match.params, ...query });
    if (model === 'unauthorized') return model;
    const childBinding = await this.bindFirstMatchingChildToPath(updateLocation, model, match.remainingPath, query, hash);
    if (childBinding === 'unauthorized' || childBinding === 'blocked' || childBinding === 'notfound') return childBinding;
    if (!childBinding) this.setModelState(model, hash);
    return new RouteBinding(updateLocation, this, match.path, query, model, childBinding);
  }

  bindToModel(updateLocation: () => void, model: IRoutedPage) {
    if (model.constructor !== this.modelConstructor) return;

    let childBinding: IRouteBinding | undefined;
    if (model.childPage) {
      childBinding = this.bindFirstMatchingChildToModel(updateLocation, model.childPage);
    }

    const params = (this.paramsSelector?.(model as TModel) ?? {}) as { [key : string] : string };

    const query : { [key : string] : string } = {};
    for (const key in params) {
      if (this.pathKeys.some(k => k.name === key))
        continue;
      if (params[key] !== undefined)
        query[key] = params[key];
    }
    
    return new RouteBinding(updateLocation, this, this.pathFactory(params), query, model, childBinding);
  }
}
