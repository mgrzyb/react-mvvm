import * as React from "react";
import { asyncCommand, command, ensureLoaded, isLoaded } from "react-mvvm";
import { observable } from "mobx";
import { Deferred, bindToApi, Loading, property } from "react-mvvm";
import { Page } from "react-mvvm";
import { bindableForm } from "react-mvvm";
import { DepartmentDto, getDepartments, getUser, updateUser, UserDto, userDtoMetadata } from "../../api/index";

export class UserDetailsPage extends Page {

    @observable.ref state : "Loading" | "NotFound" | Loaded = "Loading";

    constructor(public userId: string) {
        super();
    }

    protected async onActivated(): Promise<any> {
        const user = await getUser(this.userId);
        this.state = user ? new Loaded(user) : "NotFound";
    }
}

class Loaded {
    @observable.ref user : UserDto;
    @observable.ref departments : Deferred<readonly DepartmentDto[]> = Loading;

    constructor(user : UserDto)  {
        this.user = user;
        bindToApi(property(this, "departments"), () => getDepartments());
    }
    
    userForm = bindableForm<UserDto>(userDtoMetadata)
        .addAllFields("id", "departmentId")
        .addLookupField("departmentId", () => this.departments, "department")
        .bindTo(() => this.user);

    save = asyncCommand(
        async () => {
            
            if (!await this.userForm.validate())
                return;
            this.userForm.commit();
            this.user = await updateUser(this.user);
        },
        () => this.userForm.isDirty);

    reset = command(
        () => this.userForm.reset(),
        () => !this.userForm.isPristine);
}