import { compile, Key as PathToRegexpKey, PathFunction, pathToRegexp } from "path-to-regexp";
import { IRoutedPage, IRoute } from "./index";
import { IParentRoute } from "./IParentRoute";
import { RouteBinding } from "./RouteBinding";
import { ConstructorOf } from "../ConstructorOf";
import { IRouteBinding } from "./IRouteBinding";
import { IChildRoute } from "./IChildRoute";
import { IRouteDefinition } from "./IRouteDefinition";

export abstract class RouteDefinitionBase<TModel extends IRoutedPage, TParentParams, TParams> implements IRoute<TModel, TParentParams, TParams>, IRouteDefinition<TModel> {

    children: IChildRoute[] = [];

    protected constructor(private stateAccessor?: { get: (page: TModel) => string, set: (page: TModel, state: string) => void }) {
    }

    addRoute<TNewModel extends IRoutedPage, TNewParams>(path: string, modelConstructor: ConstructorOf<TNewModel>, modelFactory: (currentModel: TModel, params: TNewParams) => Promise<TNewModel> | TNewModel, paramsSelector?: (page: TNewModel) => TNewParams, stateAccessor?: { get: (page: TNewModel) => string, set: (page: TNewModel, state: string) => void }): RouteDefinition<TModel, TNewModel, TParentParams & TParams, TNewParams> {
        const route = new RouteDefinition<TModel, TNewModel, TParentParams & TParams, TNewParams>(this, path, modelConstructor, modelFactory, paramsSelector, stateAccessor);
        this.children.push(route);
        return route;
    }

    abstract getPath(params: TParentParams): string;

    public async bindFirstMatchingChildToPath(updateLocation: () => void, model: TModel, remainingPath: string, hash : string) {
        for (const childRoute of this.children) {
            const binding = await childRoute.bindToPath(updateLocation, model, remainingPath, hash);
            if (binding) {
                return binding;
            }
        }
        return undefined;
    }

    public bindFirstMatchingChildToModel(updateLocation: () => void, model: IRoutedPage) {
        for (const childBindingDefinition of this.children) {
            let binding = childBindingDefinition.bindToModel(updateLocation, model);
            if (binding)
                return binding;
        }
        return undefined;
    }

    getModelState(model: TModel): string {
        return this.stateAccessor && this.stateAccessor.get(model) || "";
    }

    setModelState(model: TModel, state: string): void {
        this.stateAccessor && this.stateAccessor.set(model, state)
    }
}

export class RouteDefinition<TParentModel extends IRoutedPage, TModel extends IRoutedPage, TParentParams, TParams> extends RouteDefinitionBase<TModel, TParentParams, TParams> implements IChildRoute {
    readonly pathRegExp: RegExp;
    readonly pathRegExpKeys: PathToRegexpKey[] = [];
    readonly pathFactory: PathFunction<any>;

    constructor(public readonly parentRoute: IParentRoute<TParentParams>, public path: string, private modelConstructor: ConstructorOf<TModel>, private modelFactory: (parent: TParentModel, params: TParams) => (Promise<TModel> | TModel), private paramsSelector?: (model: TModel) => TParams, stateAccessor?: { get: (page: TModel) => string; set: (page: TModel, state: string) => void } | undefined) {
        super(stateAccessor);
        this.pathRegExp = pathToRegexp(path, this.pathRegExpKeys, { end: false });
        this.pathFactory = compile(path);
    }

    getPath(params: TParentParams & TParams) {
        return this.parentRoute.getPath(params) + this.pathFactory(params);
    }

    matchPath(path: string): {
        path: string;
        remainingPath: string;
        params: TParams;
    } | undefined {
        const match = this.pathRegExp.exec(path);
        if (!match)
            return;
        const params: {
            [k: string]: string;
        } = {};
        for (let i = 1; i < match.length; i++) {
            params[this.pathRegExpKeys[i - 1].name] = match[i];
        }
        return {
            path: match[0],
            remainingPath: path.substring(match[0].length),
            params: params as unknown as TParams
        };
    }

    async bindToPath(updateLocation: () => void, parentModel: TParentModel, remainingPath: string, hash : string): Promise<IRouteBinding | undefined> {
        const match = this.matchPath(remainingPath);
        if (!match)
            return;
        const model = await this.modelFactory(parentModel, match.params);
        const childBinding = await this.bindFirstMatchingChildToPath(updateLocation, model, match.remainingPath, hash);
        if (!childBinding)
            this.setModelState(model, hash);
        return new RouteBinding(updateLocation, this, match.path, model, childBinding);
    }

    bindToModel(updateLocation: () => void, model: IRoutedPage) {
        if (model.constructor !== this.modelConstructor)
            return;

        let childBinding: IRouteBinding | undefined;
        if (model.childPage) {
            childBinding = this.bindFirstMatchingChildToModel(updateLocation, model.childPage);
        }

        return new RouteBinding(updateLocation, this, this.pathFactory(this.paramsSelector?.(model as TModel) ?? {}), model, childBinding);
    }
}
