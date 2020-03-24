import { IProperty } from "../index";
import { BindableForm } from "./bindableForm";
import { default as React, ReactElement, ReactNode } from "react";

export * from "./form";
export * from "./formField";
export * from "./bindableForm";

export function formField<TDto, TSchema, P extends keyof  TSchema>(form : BindableForm<TDto, TSchema>, field : P) : IProperty<TSchema[P] | undefined> {
    return {
        get: () => form.fields[field].value,
        set: v => form.fields[field].value = v
    }
}