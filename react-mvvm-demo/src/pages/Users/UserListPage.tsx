import { observable, reaction, runInAction } from "mobx";
import { asyncCommand, bindTo, bindToApi, ContentView, Deferred, isLoaded, Page, property } from "react-mvvm";
import { UserDetailsPage } from "./UserDetailsPage";
import * as React from "react";
import { getUserGroupList, getUserList, UserDto, UserGroupDto, UserListItemDto } from "../../api";
import { NewUserDialog } from "./NewUserDialog";
import { PaginatedList } from "react-mvvm";

export class UserListPage extends Page<NewUserDialog> {
    
    @observable.ref
    userGroups : Deferred<UserGroupDto[]> = "Loading";
    
    @observable
    filter : { nameLike : string, userGroup : UserGroupDto | undefined } = { 
        nameLike: "a",
        userGroup: undefined
    };
    
    newUser = asyncCommand(async () => {
        const newUser = await this.showModal<UserDto | undefined>(close => new NewUserDialog(close));
        if (newUser) {
            this.users.prependNewItem({ ...newUser, id: newUser.id! });
        }
    });

    users = new PaginatedList(o => getUserList(this.filter.nameLike + this.filter.userGroup?.name, o));
    
    constructor() {
        super();
        bindToApi(property(this, "userGroups"), () => getUserGroupList());
    }
    
    showUser(userId: string) {
        return this.showChildPage(new UserDetailsPage(userId));
    }
}