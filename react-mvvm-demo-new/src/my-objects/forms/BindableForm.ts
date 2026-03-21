import {FormField, FormFieldValidator} from "./FormField";
import {Form} from "./Form";
import {observable, reaction} from "mobx";
import {BindableFormBuilder} from "./BindableFormBuilder";

export function bindableForm<TDto>(metadata?: { [P in keyof TDto] : { required? : boolean }}) : BindableFormBuilder<TDto> {
    return new BindableFormBuilder<TDto>({}, metadata);
}

interface IFormFieldBinding<TDto, TValue> {
    getValueFromDto: (dto: Partial<TDto>) => Promise<TValue | undefined>;
    updateDto: (dto: Partial<TDto>, value: TValue) => void;
}

export class BindableFormFieldDefinition<TDto, TValue> implements IFormFieldBinding<TDto, TValue> {
    constructor(public validator : FormFieldValidator<TValue>, public getValueFromDto: (dto: Partial<TDto>) => Promise<TValue | undefined>, public updateDto: (dto: Partial<TDto>, value: TValue) => void) {
    }
}

export class BindableForm<TDto, TSchema> {
    
    get isPristine() { return this.inner.isPristine; }
    get isDirty() { return this.inner.isDirty; }
    
    readonly fields: { [P in keyof TSchema]: FormField<TSchema[P]> };

    @observable private accessor _isLoading = true;
    get isLoading() { return this._isLoading; }

    @observable private accessor _isBusy = false;
    get isBusy() { return this._isBusy || this.isLoading; }
    
    private readonly inner: Form;
    private readonly fieldBindings: [FormField<any>, IFormFieldBinding<TDto, any>][] = [];

    
    public readonly initialBinding : Promise<any>;
    constructor(fieldDefinitions: { [P in keyof TSchema]: BindableFormFieldDefinition<TDto, TSchema[P]> }, private dtoAccessor: () => Partial<TDto> | undefined) {
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
        
        this.initialBinding = this.reset().then(() => this._isLoading = false);
        
        reaction(dtoAccessor, dto => {
            this._reset(dto);
        });
    }

    async reset() {
        this.initialBinding && await this.initialBinding;
        return this._reset(this.dtoAccessor());
    }

    async validate() {
        await this.initialBinding;
        return this.inner.validate();
    }

    async commit() {
        await this.initialBinding;
        const dto = this.dtoAccessor();
        if (dto) this._commit(dto)
    }

    async tryCommit(callback? : () => Promise<any> | any) {
        if (!await this.validate())
            return false;
        this._isBusy = true;
        await this.commit();
        try{
            await callback?.();
        } finally {
            this._isBusy = false
        }
        return true;
    }
    
    private async _reset(dto: Partial<TDto> | undefined) {
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
            binding[0].reset(binding[0].value);
        }
    }
}