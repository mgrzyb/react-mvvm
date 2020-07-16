import { FormFieldValidator } from "./formField";

function isEmpty(value : {} | string | number | undefined | null) {
    if (!value)
        return true;

    if (Array.isArray(value))
        return value.length === 0;

    return value.toString().length === 0
}

export const NullValidator = (value : any) : true => true;

export function required(message? : string) {
    return (value : any | undefined) => {
        if (!isEmpty(value)) {
            return true;
        } else {
            return [message ?? "Field is required"];
        }
    }
}

export function email(message? : string) {
    return (value : any | undefined) => {
        const re = /\S+@\S+\.\S+/;
        
        if (!isEmpty(value) && re.test(value.toString())) {
            return true;
        } else {
            return [message ?? "Field is required"];
        }
    }
}

export function validators<T>(...validators : FormFieldValidator<T>[]) {
    return async (value: T) => {
        const result = await Promise.all(validators.map(v => v(value)));
        if (result.every(r => r === true))
            return true;
        
        return Array.prototype.concat([], result.filter(r => r !== true));
    }
}