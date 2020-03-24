import React from "react";

export const TextInput = ({value, onChange, onCommit} : { value? : string | undefined, onChange? : (value : string) => void, onCommit? : () => void })=>
    <input type="text" value={value ?? ""} onChange={e => onChange && onChange(e.target.value)} onBlur={() => onCommit && onCommit() }/>;