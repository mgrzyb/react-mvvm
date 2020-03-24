import React from "react";
import { observer } from "mobx-react";
import { Deferred, isLoaded } from "react-mvvm";

function dropDownImpl<T extends { id: number | string }>({ dataSource, value, onChange, optionText}: { dataSource: Deferred<ReadonlyArray<T>>, value? : T | undefined, onChange? : (item : T | undefined) => void, optionText: (i : T) => string }) {
    return (
        <select value={value && value.id} onChange={e =>  onChange && isLoaded(dataSource) && onChange(dataSource.find(i => i.id == e.target.value))}>
            { !value && <option value="">{ isLoaded(dataSource) ? "" : "Loading..."}</option> }
            { isLoaded(dataSource) && dataSource.map(i => <option value={i.id}>{optionText(i)}</option>) }
        </select>);
}

export const DropDown = observer(dropDownImpl);
