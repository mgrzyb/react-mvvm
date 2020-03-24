import React from "react";
import { observer } from "mobx-react";
import { Deferred, isLoaded, Loading } from "react-mvvm";
import { Select } from "antd";

function antSelectImpl<T extends { id: number | string }>({ dataSource, value, onChange, optionText}: { dataSource: Deferred<ReadonlyArray<T>>, value? : T | undefined, onChange? : (item : T | undefined) => void, optionText: (i : T) => string }) {
    return (
        <Select value={value && value.id} onChange={v =>  onChange && isLoaded(dataSource) && onChange(dataSource.find(i => i.id == v))} loading={dataSource === Loading}>
            { isLoaded(dataSource) && dataSource.map(i => <Select.Option value={i.id}>{optionText(i)}</Select.Option>) }
        </Select>);
}

export const AntSelect = observer(antSelectImpl);
