import { IFormFieldValidator } from "./formField";

export class BindableFormFieldDefinition<TDto, TValue> {
    constructor(public validator : IFormFieldValidator<TValue>, public getValueFromDto: (dto: Partial<TDto>) => Promise<TValue | undefined>, public updateDto: (dto: Partial<TDto>, value: TValue) => void) {
    }
}