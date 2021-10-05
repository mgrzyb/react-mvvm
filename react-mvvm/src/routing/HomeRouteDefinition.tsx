import { History, Location } from 'history';
import { IRoutedPage, IHomeRoute, IRoute } from './index';
import { RouteBinding } from './RouteBinding';
import { RouteDefinitionBase } from './RouteDefinition';

export class HomeRouteDefinition<TModel extends IRoutedPage & { activate: () => void; unload: () => boolean }>
  extends RouteDefinitionBase<TModel, {}, {}>
  implements IHomeRoute<TModel> {
  constructor() {
    super();
  }

  async bind(model: TModel, history: History, callbacks?: { unauthorized?: (path: string) => Promise<void>, notFound?: (pathname: string) => void; }) {
    let updatingLocation = false;
    let resettingLocation = false;
    let updatingBindings = false;

    const updateLocation = () => {
      if (updatingBindings) return;

      const newLocation = binding.getLocation();
      const newPath = newLocation.path.startsWith('/') ? newLocation.path : '/' + newLocation.path;
      const newSearch = new URLSearchParams(newLocation.query).toString();
      const newHash = newLocation.hash;
      
      if (history.location.pathname.toLowerCase() != newPath.toLowerCase() || history.location.search !== newSearch) {
        updatingLocation = true;
        try {
          history.push({ pathname: newPath, search: newSearch, hash: newHash || undefined });
        } finally {
          updatingLocation = false;
        }
      } else if (history.location.hash != newHash) {
        updatingLocation = true;
        try {
          history.replace({ pathname: newLocation.path, search: newSearch, hash: newHash || undefined });
        } finally {
          updatingLocation = false;
        }
      }
    };

    const rootPath = history.location.pathname.replace(/\/$/, '') || "/";

    // @ts-ignore
    const query = Object.fromEntries<string>(new URLSearchParams(history.location.search).entries());

    const childBinding = await this.bindFirstMatchingChildToPath(updateLocation, model, rootPath, query, history.location.hash.substr(1));
    const binding = new RouteBinding<TModel>(
      updateLocation,
      this,
      '',
      query,
      model,
      childBinding !== 'unauthorized' && childBinding !== 'notfound' && childBinding !== 'blocked' ? childBinding : undefined
    );

    if (childBinding === 'unauthorized') callbacks?.unauthorized?.(location.pathname);
    if (childBinding === 'notfound') callbacks?.notFound?.(location.pathname);

    const unlisten = history.listen(async (location, action) => {
      if (resettingLocation) {
        resettingLocation = false;
        return;
      }

      if (updatingLocation) {
        updatingLocation = false;
        return;
      }

      let outcome: 'ok' | 'notfound' | 'unauthorized' | 'blocked';
      updatingBindings = true;
      try {
        outcome = await binding.update(location.pathname, query, location.hash.substr(1));
      } finally {
        updatingBindings = false;
      }

      if (outcome === 'blocked') {
        resettingLocation = true;
        switch (action) {
          case 'PUSH':
            history.goBack();
            return;
          case 'POP':
            history.goForward();
            return;
        }
      }

      if (outcome === 'unauthorized') callbacks?.unauthorized?.(location.pathname);
      if (outcome === 'notfound') callbacks?.notFound?.(location.pathname);
    });

    const beforeUnload = (ev: BeforeUnloadEvent) => {
      console.log('Before unload');
      if (!model.unload()) {
        ev.preventDefault();
        ev.returnValue = 'Stop';
        return 'Stop';
      }
      return;
    };

    window.addEventListener('beforeunload', beforeUnload);

    model.activate();

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      unlisten();
      binding.destroy();
    };
  }

  getPath(params: {}) {
    return '';
  }
}
