import { FormFieldValidator } from "./formField";

export class BindableFormFieldDefinition<TDto, TValue> {
    constructor(public validator : FormFieldValidator<TValue>, public getValueFromDto: (dto: Partial<TDto>) => Promise<TValue | undefined>, public updateDto: (dto: Partial<TDto>, value: TValue) => void) {
    }
}