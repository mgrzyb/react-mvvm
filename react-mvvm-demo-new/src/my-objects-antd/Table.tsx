import React, {Key, ReactNode} from "react";
import {observer} from "mobx-react-lite";
import {Table as AntTable, TablePaginationConfig} from "antd";
import {List, PaginatedList} from "my-objects";
import {TableProps} from "antd";
import {SorterResult, TableCurrentDataSource, TableRowSelection} from "antd/lib/table/interface";
import {Button} from "my-objects-antd/Button";

import "./Table.css";

interface TableColumnProps<T> {
    title: string,
    canSort?: boolean,
    dataIndex: keyof T,
    render?: (value: any, item: T) => ReactNode
}

type Props<TId extends number | string, T extends { id: TId }> = {
    list: List<TId, T> | PaginatedList<TId, T>,
    selection?: {
        allowMultiple: boolean;
        readonly items: T[], update: (items: T[]) => void, toggle: (item: T) => void },
    clickTogglesSelection?: boolean,
    columns: TableColumnProps<T>[],

    onDoubleClick?: (item: T) => void
};

function TableImpl<TId extends number | string, T extends { id: TId }>({
                                                                           list,
                                                                           columns,
                                                                           selection,
                                                                           clickTogglesSelection,
                                                                           ...props
                                                                       }: Props<TId, T> & Omit<TableProps<T>, "rowSelection" | "dataSource" | "rowKey" | "columns">) {

    const rowSelection: TableRowSelection<T> = {
        selectedRowKeys: selection ? selection.items.map(i => i.id) : [],
        onChange: (selectedRowKeys: Key[], selectedRows: T[]) => {
            return selection?.update(selectedRows);
        },
        type: selection?.allowMultiple ? "checkbox" : "radio"
    };

    return <AntTable {...props} className={(clickTogglesSelection && selection?.allowMultiple === false && "clickTogglesSingleSelection") || undefined }
                     rowKey={(r: T) => r.id}
                     dataSource={list.items as []}
                     rowSelection={selection ? rowSelection : undefined}
                     onChange={(pagination: TablePaginationConfig, filters: Record<string, (Key | boolean)[] | null>, sorter: SorterResult<T> | SorterResult<T>[], extra: TableCurrentDataSource<T>) => {
                         if (!Array.isArray(sorter)) {
                             list.sortOrder = sorter?.column ? {
                                 field: sorter.field as keyof T,
                                 direction: sorter.order!
                             } : null;
                         }
                     }}
                     loading={list.isLoading}
                     pagination={false}
                     onRow={(record: T) => ({
                         onClick: (e) => (e.ctrlKey || clickTogglesSelection) && selection?.toggle(record),
                         onDoubleClick: (e) => {
                             if (props.onDoubleClick) {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 return props.onDoubleClick(record);
                             }
                         }
                     })}
                     columns={columns.map(c => ({
                         title: c.title,
                         dataIndex: c.dataIndex as string,
                         render: c.render,
                         sorter: !!c.canSort,
                         sortOrder: list.sortOrder?.field == c.dataIndex ? list.sortOrder.direction : undefined,
                     }))}
                     components={"hasNextPage" in list ? {
                         body: {
                             wrapper: ({children, className}: any) => (
                                 <tbody className={className}>
                                 {children}
                                 {list.hasNextPage &&
                                     <LoadNextPageRow list={list} span={columns.length + (selection ? 1 : 0)}/>}
                                 </tbody>)
                         }
                     } : {}}/>;
}

const LoadNextPageRow = observer(({list, span}: { list: PaginatedList<any, any>, span: number }) => (
    <tr>
        <td colSpan={span}>
            <Button command={list.loadNextPage}>Load more</Button>
        </td>
    </tr>
));

export const Table = observer(TableImpl);