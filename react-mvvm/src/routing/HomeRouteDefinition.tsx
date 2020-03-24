import { History } from "history";
import { IRoutedPage, IHomeRoute } from "./index";
import { RouteBinding } from "./RouteBinding";
import { RouteDefinitionBase } from "./RouteDefinition";

export class HomeRouteDefinition<TModel extends IRoutedPage & { activate: ()=>void }> extends RouteDefinitionBase<TModel, {}, {}> implements IHomeRoute<TModel> {
    model: TModel | null = null;
    constructor(public modelFactory: () => Promise<TModel> | TModel) {
        super();
    }
    
    async bind(history: History<any>) {
        
        let updatingLocation = false;
        let updatingBindings = false;
        
        const updateLocation = () => {
            if (updatingBindings)
                return;
            
            let newLocation = binding.getLocation();
            if (!newLocation.path.startsWith("/"))
                newLocation.path = "/" + newLocation.path;
            
            if (history.location.pathname.toLowerCase() != newLocation.path.toLowerCase()) {
                updatingLocation = true;
                try {
                    history.push({pathname: newLocation.path, hash: newLocation.hash});
                } finally {
                    updatingLocation = false;
                }
            } else if (history.location.hash != newLocation.hash) {
                updatingLocation = true;
                try {
                    history.replace({ pathname: newLocation.path, hash: newLocation.hash });
                } finally {
                    updatingLocation = false;
                }
            }
        };
        
        const model = await this.modelFactory();
        const childBinding =  await this.bindFirstMatchingChildToPath(updateLocation, model, history.location.pathname, history.location.hash);
        const binding = new RouteBinding<TModel>(updateLocation, this, "", model, childBinding);
        
        const unlisten = history.listen(async (location, action) => {
            if (updatingLocation)
                return;
            updatingBindings = true;
            try {
                await binding.update(location.pathname, location.hash.substr(1));
            } finally {
                updatingBindings = false;    
            }
        });
        
        model.activate();
        
        return {
            page : model,
            destroy: () => {
                unlisten();
                binding.destroy();
            }
        };
    }
    
    getPath(params: {}) {
        return "";
    }
}
