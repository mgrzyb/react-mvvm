import { BindableFormFieldDefinition } from "./bindableFormFieldDefinition";
import { Deferred, ensureLoaded } from "../index";
import { BindableForm } from "./bindableForm";
import { IFormFieldValidator, NullValidator, RequiredFieldValidator } from "./formField";

export class BindableFormBuilder<T, S = {}> {
    constructor(private fieldDefinitions: { [P in keyof S]: BindableFormFieldDefinition<T, S[P]> }, private metadata?: { [P in keyof T] : { required? : boolean }}) {
    }

    addAllFields<TOmit extends keyof T>(...except : TOmit[]) : BindableFormBuilder<T, S & Omit<{ [P in keyof T]: T[P] }, TOmit>> {
        if (!this.metadata)
            throw new Error("Missing metadata");
        
        for(const f in this.metadata) {
            if (!this.metadata.hasOwnProperty(f))
                continue;

            if (except.includes(f as any))
                continue;
            
            const fieldDefinition = new BindableFormFieldDefinition<T, any>(
                (this.metadata[f].required ? new RequiredFieldValidator() : undefined) || NullValidator,
                async dto => {
                    console.log("getValueFromDto", dto);
                    return dto[f];
                },
                (dto, value) => dto[f] = value);
            (this.fieldDefinitions as any)[f] = fieldDefinition;
        }
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    bindField<TDtoKey extends keyof T>(dtoField: TDtoKey): BindableFormBuilder<T, S & { [P in TDtoKey]: T[TDtoKey] }>
    bindField<TDtoKey extends keyof T>(dtoField: TDtoKey, options : { validator? : IFormFieldValidator<T[TDtoKey]>}): BindableFormBuilder<T, S & { [P in TDtoKey]: T[TDtoKey] }>
    bindField<TDtoKey extends keyof T, TField extends keyof any>(dtoField: TDtoKey, options : { fieldName: TField, validator? : IFormFieldValidator<T[TDtoKey]> }): BindableFormBuilder<T, S & { [P in TField]: T[TDtoKey] }>
    bindField<TDtoKey extends keyof T, TField extends keyof any>(dtoField: TDtoKey, options? : { fieldName?: TField, validator? : IFormFieldValidator<T[TDtoKey]> }): any {

        const fieldDefinition = new BindableFormFieldDefinition<T, T[TDtoKey]>(
            this.getValidator(dtoField, options),
            async dto => dto[dtoField], 
            (dto, value) => dto[dtoField] = value);
        const fieldName = options?.fieldName ?? dtoField;
        (this.fieldDefinitions as any)[fieldName] = fieldDefinition;
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }

    private getValidator<TField, TDtoKey extends keyof T>(dtoField: TDtoKey, options?: { validator?: IFormFieldValidator<any> }) {
        return (options?.validator ?? (this.metadata && (this.metadata[dtoField].required ? new RequiredFieldValidator() : undefined))) || NullValidator;
    }

    addLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }>(dtoField: TDtoKey, dataSource: () => Deferred<readonly TComponent[]>)
        : BindableFormBuilder<T, S & { [P in TDtoKey]: TComponent }>
    addLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }, TField extends keyof any>(dtoField: TDtoKey, dataSource: () => Deferred<readonly TComponent[]>, fieldNameOverride: TField)
        : BindableFormBuilder<T, S & { [P in TField]: TComponent | undefined }>
    addLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }, TField extends keyof any>(dtoField: TDtoKey, dataSource: () => Deferred<readonly TComponent[]>, fieldNameOverride?: TField)
        : BindableFormBuilder<T, S & { [P in TField]: TComponent | undefined }> {
        const fieldDefinition = new BindableFormFieldDefinition<T, TComponent | undefined>(
            this.getValidator(dtoField),
            async dto => {
                const ds = await ensureLoaded(dataSource);
                // @ts-ignore
                return ds.find(i => i.id == dto[dtoField]);
            },
            (dto, value) => dto[dtoField] = value && value.id as any);
        const fieldName = fieldNameOverride ?? dtoField;
        (this.fieldDefinitions as any)[fieldName] = fieldDefinition;
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }

    bindTo(dtoAccessor : () => T): BindableForm<T, S> {
        return new BindableForm<T, S>(this.fieldDefinitions, dtoAccessor);
    }
}