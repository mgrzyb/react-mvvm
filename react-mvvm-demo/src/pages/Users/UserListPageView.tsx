import { observer } from "mobx-react";
import { bindTo, bindToCommand, ContentView, isLoaded, property } from "react-mvvm";
import * as React from "react";
import { UserListPage } from "./UserListPage";
import { NewUserDialogView } from "./NewUserDialogView";
import { Button, PageHeader, Table } from "antd";
import { AntTextInput } from "../../components/AntTextInput";
import { AntSingleSelect } from "../../components/AntSelect";
import { UserGroupDto } from "../../api";
import { PaginatedAntTable } from "../../components/AntTable";
import { Deferred } from "react-mvvm";

export const UsersPageView = observer(({ model } : { model : UserListPage}) => {

    return (
        <div>
            <ContentView content={model.childPage}>
                <PageHeader title="Users" subTitle={
                    <>
                        { model.users.sortOrder && <>{model.users.sortOrder?.field} | {model.users.sortOrder?.direction} <a onClick={() => model.users.sortOrder = undefined}>(clear)</a></> }
                        {model.users.selection.length > 0 && 
                        <>
                            &nbsp;{`Selected ${model.users.selection.length} users`} <a onClick={() => model.users.selection = []}>(clear)</a>
                        </>}
                    </>} 
                    extra={[
                        <Filter filter={model.filter} userGroups={model.userGroups} />,
                        <Button {...bindToCommand(model.newUser)}>New user</Button>
                    ]}>
                    
                    <PaginatedAntTable list={model.users} selection={true} columns={[
                        {
                            title: "First Name",
                            dataIndex: model.users.field("firstName"),
                            canSort: true,
                            render: (value: any, record : any) => <a onClick={() => model.showUser(record.id)}>{value}</a>
                        },
                        {
                            title: "Last Name",
                            dataIndex: model.users.field("lastName"),
                        },
                        {
                            title: "Email",
                            dataIndex: model.users.field("email"),
                        }
                    ]} />

                </PageHeader>
                
                { model.dialog?.type === "NewUserDialog" && <NewUserDialogView dialog={model.dialog}/> }
            </ContentView>             
        </div>);
});

const Filter = observer(({ filter, userGroups } : { filter : { nameLike : string, userGroup : UserGroupDto | undefined }, userGroups : Deferred<readonly UserGroupDto[]>}) => (
    <>
        <AntTextInput {...bindTo(property(filter, "nameLike"))} placeholder="Search" style={{ width: 150}} />
        <AntSingleSelect
            {...bindTo(property(filter, "userGroup"))}
            dataSource={userGroups}
            optionText={ug => ug.name}
            placeholder="User group"
            style={{ width: 150, marginLeft: 10 }}/>
    </>

));
