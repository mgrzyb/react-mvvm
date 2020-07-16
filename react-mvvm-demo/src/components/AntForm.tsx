import { default as React, ReactElement, ReactNode } from "react";
import { bindTo, FormField, FormFields, FormState, IFormField, property } from "react-mvvm";
import { Form as TheForm } from "antd";
import { observer } from "mobx-react";
import { FormProps } from "antd/lib/form";
import { FormItemProps } from "antd/lib/form/FormItem";

type FieldInputProps<T> = { value: T | undefined, onChange: (value : T) => void, onCommit: () => void };

interface AntFormParams<T> {
    form: { fields: FormFields<T> };
    children: (fields: FormFields<T>) => ReactNode | ReactNode[];
}

function antFormImpl<T>(props : AntFormParams<T> & Omit<FormProps, "form" | "children">) {
    return (    
    <TheForm {...props} form={undefined}>
        { props.children(props.form.fields) }
    </TheForm>);
}

export const AntForm = observer(antFormImpl);

function getValidationStatus(field : IFormField) {
    if (field.state === FormState.Invalid)
        return "error";
    if (field.isValidating)
        return "validating";
    if (field.state === FormState.Valid)
        return "success";
    return "";
}

type ChildrenType<T> = ((inputProps : FieldInputProps<T>) => ReactElement); 

function fieldImpl<T>(props : { field : FormField<T>, children : ChildrenType<T> } & Omit<FormItemProps, "children">) {
    const field = props.field;
    const inputProps = { ...bindTo(property(field, "value")), onCommit: () => field.commit() };
    
    return (
        <TheForm.Item {...props} validateStatus={getValidationStatus(field)} help={field.errors?.map(e => <span>{e}</span>)} hasFeedback={field.state === FormState.Invalid}>
            { props.children(inputProps) }
        </TheForm.Item>);
}

export const AntField = observer(fieldImpl);