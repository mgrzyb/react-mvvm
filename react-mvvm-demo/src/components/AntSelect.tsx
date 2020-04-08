import React from "react";
import { observer } from "mobx-react";
import { Deferred, isLoaded, Loading } from "react-mvvm";
import { Select } from "antd";
import { SelectProps, SelectValue } from "antd/lib/select";

type SingleSelectProps<T> = { dataSource: Deferred<ReadonlyArray<T>>, value? : T | undefined, onChange? : (item : T | undefined) => void, optionText: (i : T) => string };

function selectImpl<T extends { id: number | string }>({ dataSource, value, onChange, optionText, ...props}: SingleSelectProps<T> & Omit<SelectProps<SelectValue>, "value" | "onChange">) {
    return (
        <Select {...props} value={value && value.id} onChange={v =>  onChange && isLoaded(dataSource) && onChange(dataSource.find(i => i.id == v))} loading={dataSource === Loading}>
            { isLoaded(dataSource) && dataSource.map(i => <Select.Option value={i.id}>{optionText(i)}</Select.Option>) }
        </Select>);
}


function multiSelectImpl<T extends { id: number | string }>({ dataSource, value, onChange, optionText}: { dataSource: Deferred<ReadonlyArray<T>>, value? : readonly T[], onChange? : (item : readonly T[]) => void, optionText: (i : T) => string }) {
    return (
        <Select mode="multiple" value={value && value.map(v => v.id)} onChange={v =>  onChange && isLoaded(dataSource) && onChange(dataSource.filter(i => v.includes(i.id)))} loading={dataSource === Loading}>
            { isLoaded(dataSource) && dataSource.map(i => <Select.Option value={i.id}>{optionText(i)}</Select.Option>) }
        </Select>);
}

export const AntSingleSelect = observer(selectImpl);

export const AntMultiSelect = observer(multiSelectImpl);