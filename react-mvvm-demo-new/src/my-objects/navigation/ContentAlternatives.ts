import {Anchor, IEvent, IUITransaction} from "my-objects";
import {observable} from "mobx";

export function contentAlternatives<T extends Record<string, {} | (()=> {})>>(defaultContent: keyof T, f : T, context?: { discarding?: IEvent<[IUITransaction]> }): { [K in keyof T as `switchTo${Capitalize<string & K>}`]: () => void} & { [K in keyof T]: Anchor } & { readonly current: unknown } {
    return new ContentAlternatives(f, defaultContent, context) as any;
}

class ContentAlternatives<T extends Record<string, {} | (()=> {})>> {
    
    @observable private accessor _current: {} | null = null;
    get current() : {} {
        if (!this._current) 
            return this.getContent(this.defaultContentKey);
        
        return this._current;
    }
    
    constructor(private readonly contentDefinition : T, private readonly defaultContentKey: keyof T, context?: { discarding?: IEvent<[IUITransaction]> }) {
        for (const key in contentDefinition) {
            
            const switchFunctionName = `switchTo${key.charAt(0).toUpperCase()}${key.slice(1)}`;

            const value = contentDefinition[key];

            if (typeof value !== "function") {
                this.content[key] = value;
            }

            const switchFunction = () => this._current = this.getContent(key);

            (this as any)[switchFunctionName] = switchFunction;
            (this as any)[key] = switchFunction;
        }
    }
    
    private readonly content : any = {};
    private getContent(key: keyof T) {
        if (key in this.content)
            return this.content[key];
        
        const value = this.contentDefinition[key];
        if (typeof value === "function") {
            return this.content[key] = value();
        } else {
            return this.content[key] = value;
        }
    }
}