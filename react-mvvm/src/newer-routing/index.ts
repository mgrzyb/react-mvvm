import {IReactionDisposer, reaction} from "mobx";
import {IProperty} from "../index";

type ModelMatcher<TParentContext, TContext extends object> = (c: TParentContext) => TContext | false | undefined;

type ExtractPathParams<T extends string> =
    T extends `${infer _Start}{${infer Token}}${infer Rest}`
        ? Token | ExtractPathParams<Rest>
        : never;

function pathPatternToRegExp(pattern: string): RegExp {
    // Escape regex special chars, except for { and }
    const escaped = pattern.replace(/([.*+?^$()|\[\]\\])/g, "\\$1");

    // Replace {token} with named capture group
    const regexSource = "^" + escaped.replace(/\{(\w+)}/g, (_, token) => `(?<${token}>[^/]+)`);

    return new RegExp(regexSource);
}

class Route<TParentModel, TAncestorParams extends Record<string, string>, TModel extends object, TParams extends Record<string, string>> {

    readonly routes: Route<TModel, any, any, any>[] = [];

    private readonly pathRegExp: RegExp;

    constructor(readonly path: string, readonly action: (c: TParentModel, params: TAncestorParams & Record<string, string>) => TModel | Promise<TModel>, readonly modelMatcher: ModelMatcher<TParentModel, TModel>, readonly extractParams?: (ctx: TModel) => TParams) {
        this.pathRegExp = pathPatternToRegExp(path)
    }

    add<T extends object, TPath extends string>(path: TPath, action: (c: TModel, params: TAncestorParams & Record<ExtractPathParams<TPath>, string>) => T | Promise<T>, matcher: ModelMatcher<TModel, T>, extractParams?: (ctx: T) => Record<ExtractPathParams<TPath>, string>): Route<TModel, TAncestorParams & Record<ExtractPathParams<TPath>, string>, T, Record<ExtractPathParams<TPath>, string>> {
        const newRoute = new Route(path, action, matcher, extractParams);
        this.routes.push(newRoute)
        return newRoute;
    }

    getPath(params: TParams | undefined): string {
        if (!params) return this.path;

        let result = this.path;
        for (const key in params) {
            if (!Object.prototype.hasOwnProperty.call(params, key)) continue;

            const value = params[key];
            if (value === undefined) {
                throw new Error(`Missing parameter ${String(key)} for route ${this.path}`);
            }
            result = result.replace(`{${String(key)}}`, encodeURIComponent(value));
        }
        return result;
    }

    getFullPath(model: TModel): string {
        const myPath = this.getPath(this.extractParams ? this.extractParams(model) : undefined);
        for (const r of this.routes) {
            const nextModel = r.modelMatcher(model);
            if (nextModel) {
                return myPath + "/" + r.getFullPath(nextModel);
            }
        }
        return myPath;
    }

    async tryApplyPath(path: string, parentModel: TParentModel, parentParams: Record<string, string>) {

        path = path.replace(/^\//, ""); // Remove leading slash

        const pathMatch = path.match(this.pathRegExp);
        if (!pathMatch) {
            return undefined;
        }

        const params = {...parentParams, ...pathMatch.groups};
        const model = await this.action(parentModel, params as any);

        const reminingPath = path.slice(pathMatch[0].length).replace(/^\//, "");
        if (reminingPath.length === 0) {
            return true;
        }

        for (const childRoute of this.routes) {
            if (await childRoute.tryApplyPath(reminingPath, model, params)) {
                return true;
            }
        }
        return false;
    }
}

/*
class RouteBinding<TModel extends object, TParams extends Record<string, string>> {

    private currentParams: TParams | undefined;
    private currentChildBinding: RouteBinding<any, any> | undefined;

    private readonly childBindingObserverDisposer: IReactionDisposer;
    private readonly paramsObserverDisposer: IReactionDisposer;

    constructor(readonly route: Route<any, any, TModel, TParams>, readonly model: TModel, onModelChanged: () => void) {

        let firstRun1 = true;
        this.paramsObserverDisposer = autorun(() => {
            const newParams = route.extractParams ? route.extractParams(this.model) : undefined;
            if (!deepEqual(this.currentParams, newParams)) {
                this.currentParams = newParams;
                untracked(() => { !firstRun1 && onModelChanged?.() });
            }
            firstRun1 = false;
        });

        let firstRun2 = true;
        this.childBindingObserverDisposer = autorun(() => {
            for (const childRoute of this.route.routes) {
                const newChildModel = childRoute.modelMatcher(this.model);
                if (newChildModel && newChildModel !== this.currentChildBinding?.model) {
                    if (this.currentChildBinding) {
                        this.currentChildBinding.dispose()
                    }
                    this.currentChildBinding = new RouteBinding(childRoute, newChildModel, onModelChanged);
                    untracked(() => {
                        !firstRun2 && onModelChanged?.() 
                    });
                    break;
                }
            }
            firstRun2 = false;
        });
    }

    dispose() {
        this.currentChildBinding?.dispose();
        this.paramsObserverDisposer();
        this.childBindingObserverDisposer();
    }

    getFullPath(): string {
        return this.currentChildBinding ? this.route.getPath(this.currentParams) + "/" + this.currentChildBinding.getFullPath() : this.route.path;
    }
}
*/

class RootRoute<TRootModel extends object> extends Route<TRootModel, {}, TRootModel, {}> {

    constructor(path: string) {
        super(path, (m) => m, (m) => m);
    }

    async bindTo(rootModel: TRootModel, currentPath: IProperty<string>) {
        await this.tryApplyPath(currentPath.get(), rootModel, {});
        return new RouteBinding(this, rootModel, currentPath);
    }
}

class RouteBinding<TModel extends object> {

    private readonly disposers: IReactionDisposer[] = [];

    constructor(private readonly rootRoute: RootRoute<TModel>, private readonly rootModel: TModel, private readonly currentPath: IProperty<string>) {
        this.rootRoute = rootRoute;
        this.rootModel = rootModel;
        this.currentPath = currentPath;

        this.disposers.push(reaction(() => this.currentPath.get(), async (path) => {
            if (path !== this.rootRoute.getFullPath(this.rootModel)) {
                await this.rootRoute.tryApplyPath(path, this.rootModel, {});
            }
        }));

        this.disposers.push(reaction(() => this.rootRoute.getFullPath(this.rootModel), (fullPath) => {
            if (fullPath !== this.currentPath.get()) {
                this.currentPath.set(fullPath);
            }
        }));
    }

    dispose() {
        this.disposers.forEach(d => d());
    }
}

export function r<T extends object>(path: string) {
    return new RootRoute<T>(path)
}

function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) return false;
    const keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
}