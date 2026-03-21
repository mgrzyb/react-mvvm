import { BindableForm, BindableFormFieldDefinition } from "./BindableForm";
import { NullValidator, required } from "./validators";
import { FormFieldValidator } from "./FormField";

interface IAsyncDataSource<TId extends string | number, T extends { readonly id: TId }> {
    findMany(ids: readonly TId[]): Promise<T[]>;
}

type DataSource<TId extends string | number, T extends { readonly id: TId }> = IAsyncDataSource<TId, T> | PromiseLike<Pick<Array<T>, "filter">>;

export class BindableFormBuilder<T, S = {}> {
    constructor(private fieldDefinitions: { [P in keyof S]: BindableFormFieldDefinition<T, S[P]> }, private metadata?: { [P in keyof T] : { required? : boolean }}) {
    }

    addFields<TInclude extends keyof T>(...fields : TInclude[]) : BindableFormBuilder<T, S & Pick<{ [P in keyof T]: T[P] }, TInclude>> {
        if (!this.metadata)
            throw new Error("Missing metadata");

        for(const f of fields) {
            (this.fieldDefinitions as any)[f] = this.createFieldDefinitionFromMetadata(f);
        }

        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    addAllFieldsExcept<TOmit extends keyof T>(...except : TOmit[]) : BindableFormBuilder<T, S & Omit<{ [P in keyof T]: T[P] }, TOmit>> {
        if (!this.metadata)
            throw new Error("Missing metadata");
        
        for(const f in this.metadata) {
            if (!this.metadata.hasOwnProperty(f))
                continue;

            if (except.includes(f as any))
                continue;
            
            (this.fieldDefinitions as any)[f] = this.createFieldDefinitionFromMetadata(f);
        }
        
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    addField<TDtoKey extends keyof T>(dtoField: TDtoKey): BindableFormBuilder<T, S & { [P in TDtoKey]: T[TDtoKey] }>
    addField<TDtoKey extends keyof T>(dtoField: TDtoKey, options : { validator? : FormFieldValidator<T[TDtoKey]>}): BindableFormBuilder<T, S & { [P in TDtoKey]: T[TDtoKey] }>
    addField<TDtoKey extends keyof T, TField extends keyof any>(dtoField: TDtoKey, options : { fieldName: TField, validator? : FormFieldValidator<T[TDtoKey]> }): BindableFormBuilder<T, S & { [P in TField]: T[TDtoKey] }>
    addField<TDtoKey extends keyof T, TField extends keyof any>(dtoField: TDtoKey, options? : { fieldName?: TField, validator? : FormFieldValidator<T[TDtoKey]> }): any {

        const fieldDefinition = new BindableFormFieldDefinition<T, T[TDtoKey]>(
            this.getValidator(dtoField, options),
            async dto => dto[dtoField], 
            (dto, value) => dto[dtoField] = value);
        const fieldName = options?.fieldName ?? dtoField;
        (this.fieldDefinitions as any)[fieldName] = fieldDefinition;
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    addLookupField<TDtoKey extends keyof T, TItemId, TItem extends { id: TItemId }>(dtoField: TDtoKey, dataSource: (id : TItemId) => Promise<TItem | undefined>)
        : BindableFormBuilder<T, S & { [P in TDtoKey]: TItem }>
    addLookupField<TDtoKey extends keyof T, TItemId, TItem extends { id: TItemId }, TField extends keyof any>(dtoField: TDtoKey, dataSource: (id : TItemId) => Promise<TItem | undefined>, options : { validator? : FormFieldValidator<TItem> })
        : BindableFormBuilder<T, S & { [P in TDtoKey]: TItem }>
    addLookupField<TDtoKey extends keyof T, TItemId, TItem extends { id: TItemId }, TField extends keyof any>(dtoField: TDtoKey, dataSource: (id : TItemId) => Promise<TItem | undefined>, options : { fieldName: TField, validator? : FormFieldValidator<TItem> })
        : BindableFormBuilder<T, S & { [P in TField]: TItem | undefined }>
    addLookupField<TDtoKey extends keyof T, TItemId, TItem extends { id: TItemId }, TField extends keyof any>(dtoField: TDtoKey, dataSource: (id : TItemId) => Promise<TItem | undefined>, options? : { fieldName?: TField, validator? : FormFieldValidator<TItem> })
        : BindableFormBuilder<T, S & { [P in TField]: TItem | undefined }> {
        const fieldDefinition = new BindableFormFieldDefinition<T, TItem | undefined>(
            this.getValidator(dtoField, options),
            async dto => {
                try {
                    return dataSource(dto[dtoField] as unknown as TItemId); // TODO
                } catch (e) {
                    return undefined;
                }
            },
            (dto, value) => dto[dtoField] = value && value.id as any);
        const fieldName = options?.fieldName ?? dtoField;
        (this.fieldDefinitions as any)[fieldName] = fieldDefinition;
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }

    addMultiLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }>(dtoField: TDtoKey, dataSource: () => DataSource<string | number , TComponent>)
        : BindableFormBuilder<T, S & { [P in TDtoKey]: readonly TComponent[] }>
    addMultiLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }, TField extends keyof any>(dtoField: TDtoKey, dataSource: () => DataSource<string | number , TComponent>, options : { validator? : FormFieldValidator<TComponent[]> })
        : BindableFormBuilder<T, S & { [P in TDtoKey]: readonly TComponent[] }>
    addMultiLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }, TField extends keyof any>(dtoField: TDtoKey, dataSource: () => DataSource<string | number , TComponent>, options : { fieldName: TField, validator? : FormFieldValidator<TComponent[]> })
        : BindableFormBuilder<T, S & { [P in TField]: readonly TComponent[] }>
    addMultiLookupField<TDtoKey extends keyof T, TComponent extends { id: string | number }, TField extends keyof any>(dtoField: TDtoKey, dataSource: () => DataSource<string | number , TComponent>, options? : { fieldName?: TField, validator? : FormFieldValidator<TComponent[]> })
        : BindableFormBuilder<T, S & { [P in TField]: readonly TComponent[] }> {
        const fieldDefinition = new BindableFormFieldDefinition<T, TComponent[]>(
            this.getValidator(dtoField, options),
            async dto => {
                const fieldValue = dto[dtoField] as (string | number)[] | undefined;
                if (!fieldValue)
                    return [];
                const ds = dataSource();
                if ("findMany" in ds) {
                    return ds.findMany(fieldValue as any);
                } else {
                    return (await ds).filter(i => fieldValue.includes(i.id));
                }
            },
            (dto, value) => dto[dtoField] = value.map(v => v.id) as any);
        const fieldName = options?.fieldName ?? dtoField;
        (this.fieldDefinitions as any)[fieldName] = fieldDefinition;
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    addCustomField<TField extends keyof any, TValue>(fieldName : TField, getValueFromDto : (dto : Partial<T>) => Promise<TValue>, updateDto : (dto : Partial<T>, value : TValue) => void, options? : { validator?: FormFieldValidator<TValue>})
        : BindableFormBuilder<T, S & { [P in TField]: TValue }> {

        (this.fieldDefinitions as any)[fieldName] = new BindableFormFieldDefinition<T, TValue>(
            options?.validator ?? NullValidator,
            getValueFromDto,
            updateDto);
        
        return new BindableFormBuilder(this.fieldDefinitions as any, this.metadata);
    }
    
    bindTo(dtoAccessor : () => T | undefined): BindableForm<T, S> {
        return new BindableForm<T, S>(this.fieldDefinitions, dtoAccessor);
    }

    private createFieldDefinitionFromMetadata(f: keyof T) {
        return new BindableFormFieldDefinition<T, any>(
            this.getValidator(f),
            async dto => dto[f],
            (dto, value) => dto[f] = value);
    }
    
    private getValidator<TField, TDtoKey extends keyof T>(dtoField: TDtoKey, options?: { validator?: FormFieldValidator<any> }) {
        return (options?.validator ?? (this.metadata && (this.metadata[dtoField].required ? required() : undefined))) || NullValidator;
    }
}