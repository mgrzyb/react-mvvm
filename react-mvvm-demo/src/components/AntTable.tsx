import React, { Key, ReactNode } from "react";
import { observer } from "mobx-react";
import { Table } from "antd";
import { bindToCommand, List, PaginatedList} from "react-mvvm";
import { TableProps } from "antd/lib/table";
import { SorterResult, TableCurrentDataSource, TableRowSelection } from "antd/lib/table/interface";
import { PaginationConfig } from "antd/lib/pagination";

interface TableColumnProps<T> {
    title : string,
    canSort? : boolean,
    dataIndex: keyof T,
    render? : (value : any, item : T) => ReactNode
}

type Props<T extends { id : number | string }> = {
    list : List<T>,
    selection? : boolean,
    columns : TableColumnProps<T>[]
};

function AntTableImpl<T extends { id : string | number }>({ list, selection, columns, ...props } : Props<T> & Omit<TableProps<T>, "rowSelection" | "dataSource" | "rowKey" | "columns">) {
    
    const rowSelection : TableRowSelection<T> = {
        selectedRowKeys: list.selection.map(i => i.id),
        onChange: (selectedRowKeys : Key[], selectedRows : T[]) => list.selection = selectedRows 
    };
    
    return <Table {...props} 
        rowKey={(r : T) => r.id}    
        dataSource={list.items as []} 
        rowSelection={selection ? rowSelection : undefined}
        onChange={(pagination: PaginationConfig, filters: Record<string, Key[] | null>, sorter: SorterResult<T> | SorterResult<T>[], extra: TableCurrentDataSource<T>) => {
            if (!Array.isArray(sorter)) {
                list.sortOrder = sorter ? {field: sorter.field?.toString(), direction: sorter.order?.toString()} as any : undefined;
            }
        }}
        columns={columns.map(c => ({
            title: c.title,
            dataIndex: c.dataIndex as string,
            render: c.render,
            sorter: !!c.canSort,
            sortOrder: list.sortOrder?.field == c.dataIndex ? list.sortOrder.direction : undefined,
            }))}/>;
}

type PaginatedProps<T extends { id : number | string }> = {
    list : PaginatedList<T>
    selection? : boolean,
    columns : TableColumnProps<T>[]
};

function AntPaginatedTableImpl<T extends { id : number | string }>({ list, ...props } : PaginatedProps<T> & Omit<TableProps<T>, "rowSelection" | "dataSource" | "rowKey" | "pagination" | "loading" | "columns">) {
    return <AntTableImpl 
        {...props}
        list={list}
        pagination={false}
        loading={list.isLoading}
        components={{
            body: {
                wrapper: ({children, className} : any) => (
                    <tbody className={className}>
                        {children}
                        { list.hasNextPage && 
                        <tr>
                            <td colSpan={props.columns.length + (props.selection ? 1 : 0)}>
                                <button {...bindToCommand(list.loadNextPage)}>Load more</button>
                            </td>
                        </tr>}
                    </tbody>)}
        }} />
}

export const AntTable = observer(AntTableImpl);
export const PaginatedAntTable = observer(AntPaginatedTableImpl);