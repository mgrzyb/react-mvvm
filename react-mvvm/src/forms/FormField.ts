import { action, computed, observable, reaction } from "mobx";

export type FormFieldValidator<T> = (value : T | undefined) => (true | string[]) | PromiseLike<true | string[]>;

export enum FormValidationState {
    Pending,
    Valid,
    Invalid
}

export interface IFormField {
    readonly isValidating: boolean;
    readonly isPristine: boolean;
    readonly state: FormValidationState;

    validate(): Promise<readonly string[] | true>;
    commit(): Promise<void>;
}

export class FormField<T> implements IFormField {
    
    @observable.ref value: T | undefined;

    get isValidating(): boolean {
        return !!this._currentValidation;
    }

    @computed get isPristine() {
        return this.areEqual(this.value, this._pristineValue);
    }

    get isDirty() {
        return !this.isPristine;
    }
    
    @computed get state(): FormValidationState {
        if (this._isPendingValidation)
            return FormValidationState.Pending;
        if (this._currentValidation)
            return FormValidationState.Pending;
        return this.errors.length === 0 ? FormValidationState.Valid : FormValidationState.Invalid;
    }

    @observable.ref private _errors: ReadonlyArray<string> = [];
    get errors(): ReadonlyArray<string> {
        return this._errors;
    }

    @observable.ref private _pristineValue: T | undefined;
    @observable private _valueHasBeenCommitted : boolean = false;
    @observable.ref private _currentValidation : Promise<readonly string[] | true> | undefined;
    @observable private _isPendingValidation = true;
    private _needsValidation: boolean = false;
    
    constructor(value: T | undefined, private validator : FormFieldValidator<T>, private comparer? : (a : T, b : T) => boolean) {
        this.value = value;
        this._pristineValue = value;
        
        reaction(
            () => this.value, 
            value => {
                if (this._valueHasBeenCommitted || !this._isPendingValidation){
                    this.validate();
                }
            }, 
            {
                delay: 250
            });
    }

    validate(): Promise<readonly string[] | true> {
        this._isPendingValidation = false;
        if (!this._currentValidation) {
            this._currentValidation = this._validate();
        }
        return this._currentValidation
    }

    @action
    reset(pristineValue? : T) {
        if (pristineValue !== undefined){
            this._pristineValue = pristineValue;
        }
        
        this.value = this._pristineValue;
        this._isPendingValidation = true;
        this._errors = [];
        this._valueHasBeenCommitted = false;
    }

    async commit() {
        if (this.state !== FormValidationState.Invalid)
            await this.validate();
        this._valueHasBeenCommitted = true;
    }

    private async _validate() {
        try {
            do {
                this._needsValidation = false;
                const result = await this.validator(this.value);
                if (result !== true) {
                    this._errors = result;
                    return result;
                }
            } while (this._needsValidation)

            this._errors = [];
            return true;
            
        } finally {
            this._currentValidation = undefined;
        }
    }
    
    private areEqual(a : T | undefined, b : T | undefined) {
        if (a === b)
            return true;
        if (a === undefined || b === undefined)
            return false;
        if (this.comparer)
            return this.comparer(a, b);
        return false;
    }
}
