import { IProperty } from "../index";
import { BindableForm } from "./BindableForm";

export * from "./Form";
export * from "./FormField";
export * from "./BindableForm";
export * from "./validators";

export function formField<TDto, TSchema, P extends keyof  TSchema>(form : BindableForm<TDto, TSchema>, field : P) : IProperty<TSchema[P] | undefined> {
    return {
        get: () => form.fields[field].value,
        set: v => form.fields[field].value = v
    }
}