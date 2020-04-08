import React from "react";
import { Input } from "antd";
import { InputProps } from "antd/lib/input/Input";

type Props = { value? : string | undefined, onChange? : (value : string) => void, onCommit? : () => void };

export const AntTextInput = ({value, onChange, onCommit, ...props} : Props & Omit<InputProps, "value" | "onChange">)=>
    <Input {...props} type="text" value={value ?? ""} onChange={e => onChange && onChange(e.target.value)} onBlur={() => onCommit && onCommit() }/>;