import * as React from "react";
import { observer } from "mobx-react";
import { IProperty } from "react-mvvm";

export const TextInput = ({value, onChange, onCommit} : { value? : string | undefined, onChange? : (value : string) => void, onCommit? : () => void })=>
  <input type="text" value={value ?? ""} onChange={e => onChange && onChange(e.target.value)} onBlur={() => onCommit && onCommit() }/>;

export const BetterTextInput = observer(({value, onCommit} : { value : IProperty<string>, onCommit? : () => void })=>
  <input type="text" value={value.get()} onChange={e => value.set(e.target.value)} onBlur={() => onCommit && onCommit() }/>);