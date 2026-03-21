import {default as React, ReactElement, ReactNode} from "react";
import {bindTo, FormField, FormFields, FormValidationState, IFormField, IProperty, property} from "my-objects";
import {Form as AntForm, Input, InputNumber} from "antd";
import {observer} from "mobx-react-lite";
import {FormProps} from "antd/lib/form";
import {FormItemProps} from "antd/lib/form/FormItem";
import {TextInput, TextInputProps} from "my-objects-antd/TextInput";
import {InputNumberProps} from "antd/es/input-number";

type FieldInputProps<T> = { bindTo: IProperty<T | undefined>, onCommit: () => void };

interface AntFormParams<T> {
    form: { fields: FormFields<T>, isBusy?: boolean };
    children: (fields: FormFields<T>) => ReactNode | ReactNode[];
}

function antFormImpl<T>(props: AntFormParams<T> & Omit<FormProps, "form" | "children">) {
    return (
        <AntForm {...props} form={undefined} disabled={props.form.isBusy || props.disabled}>
            {props.children(props.form.fields)}
        </AntForm>);
}

function getValidationStatus(field: IFormField) {
    if (field.validationState === FormValidationState.Invalid)
        return "error";
    if (field.isValidating)
        return "validating";
    if (field.validationState === FormValidationState.Valid)
        return "success";
    return "";
}

type ChildrenType<T> = ((inputProps: FieldInputProps<T>) => ReactElement);

type FieldProps<T> = { field: FormField<T>, children: ChildrenType<T> } & Omit<FormItemProps, "children">;

function fieldImpl<T>(props: FieldProps<T>) {
    const field = props.field;
    const inputProps = { bindTo: property(field, "value"), onCommit: () => field.commit()};

    return (
        <AntForm.Item {...props} validateStatus={getValidationStatus(field)}
                      help={field.errors?.map(e => <span>{e}</span>)}
                      hasFeedback={field.validationState === FormValidationState.Invalid}>
            {props.children(inputProps)}
        </AntForm.Item>);
}

const TextField = ({ field, inputProps, ...fieldProps }: { field: FormField<string>, inputProps?: Omit<TextInputProps, "bindTo" | "value" | "onChange" | "onCommit"> } & Omit<FieldProps<string>, "field" | "children">) => <Form.Field {...fieldProps} field={field}>{props => <TextInput {...inputProps} {...props} />}</Form.Field>
const NumberField = ({ field, inputProps, ...fieldProps }: { field: FormField<number>, inputProps?: InputNumberProps<number> } & Omit<FieldProps<number>, "field" | "children">) => <Form.Field {...fieldProps} field={field}>{props => <InputNumber<number> {...inputProps} value={props.bindTo.get()} onChange={v => props.bindTo.set(v!)} />}</Form.Field>

export const Form: typeof antFormImpl & { Field: typeof fieldImpl, TextField: typeof TextField, NumberField: typeof NumberField } = observer(antFormImpl) as any;
Form.Field = observer(fieldImpl);
Form.TextField = TextField;
Form.NumberField = NumberField;