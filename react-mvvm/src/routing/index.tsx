import { History } from 'history';
import { HomeRouteDefinition } from './HomeRouteDefinition';
import { ConstructorOf } from '../ConstructorOf';

export interface IRoutedPage {
  readonly childPage: IRoutedPage | undefined;
  tryRemoveChildPage(): Promise<boolean>;
}

export interface IRoute<TModel, TParentParams, TParams> {
  addRoute<TNewModel extends IRoutedPage, TNewParams extends { [k: string]: string | undefined } = {}>(
    path: string,
    modelConstructor: ConstructorOf<TNewModel>,
    modelFactory: (currentModel: TModel, params: TNewParams) => Promise<TNewModel | 'unauthorized' | 'blocked'> | TNewModel | 'unauthorized' | 'blocked',
    paramsSelector?: (page: TNewModel) => TNewParams,
    stateAccessor?: { get: (page: TNewModel) => string; set: (page: TNewModel, state: string) => void }
  ): IRoute<TNewModel, TParentParams & TParams, TNewParams>;
  getPath(params: TParentParams & TParams): string;
}

export interface IHomeRoute<TModel> extends IRoute<TModel, {}, {}> {
  bind(model: TModel, history: History, callbacks?: { unauthorized?: (path: string) => void, notFound?: (path: string) => void }): Promise<() => void>;
}

export function route<TModel extends IRoutedPage & { activate: () => void; unload: () => boolean }>(): IHomeRoute<TModel> {
  return new HomeRouteDefinition<TModel>();
}
