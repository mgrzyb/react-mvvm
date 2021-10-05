import { FormField, FormValidationState, IFormField } from "./formField";
import { computed } from "mobx";

export type FormFields<T> = { [P in keyof T]: FormField<T[P]> }

export class Form<TSchema = any> {

    @computed get isPristine() {
        return this.getFields().every(f => f.isPristine);
    }

    get isDirty() { return !this.isPristine; }

    @computed get state() {
        return this.getFields().reduce((s, f) => { switch (f.state) {
            case FormValidationState.Pending:
                return s !== FormValidationState.Invalid ? FormValidationState.Pending : s;
            case FormValidationState.Valid:
                return s;
            case FormValidationState.Invalid:
                return FormValidationState.Invalid;
        }}, FormValidationState.Valid);
    }
    
    @computed get isValidating() {
        return this.getFields().some(f => f.isValidating);
    }
    
    readonly fields: FormFields<TSchema>;

    constructor(fields: FormFields<TSchema>) {
        this.fields = fields;
    }

    validate() {
        return Promise
            .all(this.getFields().map(f => f.validate()))
            .then(results => results.every(r => r === true));
    }
    
    private getFields() : readonly IFormField[] {
        const fields : IFormField[] = [];
        
        for(const f in this.fields) {
            if(!this.fields.hasOwnProperty(f))
                continue;
            fields.push(this.fields[f]);
        }
        return fields;
    }
}