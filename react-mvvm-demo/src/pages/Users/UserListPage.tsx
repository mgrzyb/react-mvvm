import { observable } from "mobx";
import {
    asyncCommand,
    IDeferredValue,
    lazyValue,
    Page,
    withModal
} from "react-mvvm";
import { UserDetailsPage } from "./UserDetailsPage";
import * as React from "react";
import { getUserGroupList, getUserList, UserDto, UserGroupDto } from "../../api";
import { NewUserDialog } from "./NewUserDialog";
import { PaginatedList } from "react-mvvm";

export class UserListPage extends withModal<NewUserDialog>()(Page) {
    
    @observable.ref
    private _userGroups : IDeferredValue<UserGroupDto[]>;
    get userGroups() {
        return this._userGroups.value;
    }
    
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
        this._userGroups = lazyValue(() => getUserGroupList());
    }
    
    showUser(userId: string) {
        return this.showChildPage(new UserDetailsPage(userId));
    }
}