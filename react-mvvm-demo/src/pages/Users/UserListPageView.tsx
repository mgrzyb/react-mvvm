import { observer } from "mobx-react";
import { bindTo, bindToCommand, ContentView, isLoaded, property } from "react-mvvm";
import { TextInput } from "../../components/TextIput";
import { DropDown } from "../../components/DropDown";
import { UserGroupDto } from "../../api";
import * as React from "react";
import { UserListPage } from "./UserListPage";
import { NewUserDialogView } from "./NewUserDialogView";

export const UsersPageView = observer(({ model } : { model : UserListPage}) => {

    return (
        <div>
            <ContentView content={model.childPage}>
                <div>
                    <ul>
                        <li>
                            <button onClick={e => model.showUser("user-1")}>User 1</button>
                        </li>
                        <li>
                            <button onClick={e => model.showUser("user-2")}>User 2</button>
                        </li>
                        <li>
                            <button {...bindToCommand(model.newUser)}>New user</button>
                        </li>
                    </ul>
                </div>
                <div>
                    <TextInput {...bindTo(property(model.filter, "nameLike"))} />
    
                    <DropDown<UserGroupDto>
                        {...bindTo(property(model.filter, "userGroup"))}
                        dataSource={model.userGroups}
                        optionText={ug => ug.name} />
    
                    UG: { model.filter.userGroup && model.filter.userGroup.name }
    
                    {!isLoaded(model.users) ?
                        <span>Loading...</span> :
                        <ul>
                            {model.users.map(u => <li>{u}</li>)}
                        </ul>}
                </div>
            
                { model.dialog?.type === "NewUserDialog" && <NewUserDialogView dialog={model.dialog}/> }
            </ContentView>             
        </div>);
});
