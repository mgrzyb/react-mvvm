import { FormField } from "./formField";
import { Form } from "./form";
import { BindableFormFieldDefinition } from "./bindableFormFieldDefinition";
import { isLoaded } from "../index";
import { reaction } from "mobx";
import { BindableFormBuilder } from "./bindableFormBuilder";

export function bindableForm<TDto>(metadata?: { [P in keyof TDto] : { required? : boolean }}) : BindableFormBuilder<TDto> {
    return new BindableFormBuilder<TDto>({}, metadata);
}

export class BindableForm<TDto, TSchema> {
    
    get isPristine() { return this.inner.isPristine; }
    get isDirty() { return this.inner.isDirty; }
    
    readonly fields: { [P in keyof TSchema]: FormField<TSchema[P]> };

    private readonly inner: Form;
    private readonly fieldBindings: [FormField<any>, BindableFormFieldDefinition<TDto, any>][] = [];

    constructor(private fieldDefinitions: { [P in keyof TSchema]: BindableFormFieldDefinition<TDto, TSchema[P]> }, private dtoAccessor: () => Partial<TDto>) {
        const fields: any = {};
        for (const p in fieldDefinitions) {
            if (!fieldDefinitions.hasOwnProperty(p))
                continue;

            const fieldDefinition = fieldDefinitions[p];
            const field = new FormField<any>(undefined, fieldDefinition.validator);

            fields[p] = field;
            this.fieldBindings.push([field, fieldDefinition])
        }
        this.fields = fields;
        this.inner = new Form(fields);
        
        this.reset();
        reaction(dtoAccessor, dto => {
            this._reset(dto);
        });
    }

    reset() {
        return this._reset(this.dtoAccessor());
    }

    validate() {
        return this.inner.validate();
    }

    commit() {
        const dto = this.dtoAccessor();
        if (isLoaded(dto))
            this._commit(dto)
    }

    async validateAndCommit() {
        if (!await this.validate())
            return false;
        await this.commit();
        return true;
    }
    
    private async _reset(dto: Partial<TDto>) {
        if (!dto) 
            return;
        await Promise.all(this.fieldBindings.map(b => {
            return b[1].getValueFromDto(dto).then(v => {
                b[0].reset(v);
            });
        }));
    }

    private _commit(dto : Partial<TDto>) {
        for (const binding of this.fieldBindings) {
            binding[1].updateDto(dto, binding[0].value);
        }
    }
}