import React from "react";
import { Input } from "antd";

export const AntTextInput = ({value, onChange, onCommit} : { value? : string | undefined, onChange? : (value : string) => void, onCommit? : () => void })=>
    <Input type="text" value={value ?? ""} onChange={e => onChange && onChange(e.target.value)} onBlur={() => onCommit && onCommit() }/>;