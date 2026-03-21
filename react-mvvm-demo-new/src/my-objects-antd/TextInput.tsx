import React, {ReactNode, useEffect} from "react";
import {Input, InputProps, InputRef} from "antd";
import { IProperty } from "my-objects";
import { observer } from "mobx-react-lite";

type CommonProps = { password?: boolean, onCommit?: () => void } & Omit<InputProps, "value" | "onChange"> & React.RefAttributes<InputRef>;
type SimpleProps = CommonProps & { value?: string, onChange?: (value: string) => void };
type BindableProps = CommonProps & { bindTo: IProperty<string> };

export type TextInputProps = SimpleProps | BindableProps;

function TextInputImpl(props: SimpleProps): ReactNode;
function TextInputImpl(props: BindableProps): ReactNode;
function TextInputImpl({ onCommit, password, autoFocus, ...props }: TextInputProps) {
    
    const inputRef = React.useRef<InputRef>(null);
    
    const Component = password ? Input.Password : Input;
    
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            const input = inputRef.current;
            setTimeout(() => input.focus({
                cursor: 'start',
            }), 500);
        }
    }, [autoFocus]);
    
    if ("bindTo" in props) {
        const { bindTo, ...p } = props;
        
        return <Component
            {...p} 
            ref={inputRef}
            type="text" 
            value={bindTo.get()} 
            onChange={e => props.bindTo.set(e.target.value)}
            onBlur={() => onCommit && onCommit()}
        />
    } else {
        return <Component 
            {...props}
            ref={inputRef}
            type="text" 
            value={props.value ?? ""} 
            onChange={e => props.onChange && props.onChange(e.target.value)}
            onBlur={() => onCommit && onCommit()}
        />
    }
};

export const TextInput = observer(TextInputImpl);