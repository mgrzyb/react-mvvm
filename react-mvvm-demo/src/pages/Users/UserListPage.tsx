import { observable } from "mobx";
import { asyncCommand, bindTo, bindToApi, ContentView, Deferred, isLoaded, Page, property } from "react-mvvm";
import { UserDetailsPage } from "./UserDetailsPage";
import * as React from "react";
import { observer } from "mobx-react";
import { TextInput } from "../../components/TextIput";
import { DropDown } from "../../components/DropDown";
import { getUserGroupList, getUserList, UserGroupDto } from "../../api";
import { NewUserDialog } from "./NewUserDialog";

export class UserListPage extends Page<NewUserDialog> {

    @observable.ref
    users: Deferred<any[]> = "Loading";
    
    @observable.ref
    userGroups : Deferred<UserGroupDto[]> = "Loading";
    
    @observable
    filter = { 
        nameLike: "",
        userGroup: undefined
    };
    
    newUser = asyncCommand(async () => {
        await this.showModal(close => new NewUserDialog(close));
    });
    
    constructor() {
        super();
        bindToApi(property(this, "users"), () => getUserList(this.filter), 500);
        bindToApi(property(this, "userGroups"), () => getUserGroupList());
    }
    
    showUser(userId: string) {
        return this.showChildPage(new UserDetailsPage(userId));
    }
}

