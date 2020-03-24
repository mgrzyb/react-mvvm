import { IFormFieldValidator } from "./formField";

export class BindableFormFieldDefinition<TDto, TValue> {
    constructor(public validator : IFormFieldValidator<TValue>, public getValueFromDto: (dto: TDto) => Promise<TValue>, public updateDto: (dto: TDto, value: TValue) => void) {
    }
}