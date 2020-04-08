import * as React from "react";
import { asyncCommand, command, RequiredFieldValidator } from "react-mvvm";
import { observable } from "mobx";
import { Deferred, bindToApi, Loading, property } from "react-mvvm";
import { Page } from "react-mvvm";
import { bindableForm } from "react-mvvm";
import { DepartmentDto, getDepartments, getUser, updateUser, UserDto, userDtoMetadata } from "../../api";

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

    tags = [{id: "A"}, {id:"B"}, {id:"C"}];
    
    constructor(user : UserDto)  {
        this.user = user;
        bindToApi(property(this, "departments"), () => getDepartments());
    }
     
    userForm = bindableForm<UserDto>(userDtoMetadata)
        .addFields("firstName")
        .addCustomField("lastName", 
            async dto => dto.lastName?.toUpperCase() ?? "",
            (dto, value) => dto.lastName = value, 
            { validator: RequiredFieldValidator })
        .addField("email", { validator: RequiredFieldValidator })
        .addLookupField("departmentId", () => this.departments, { fieldName: "department" })
        .addMultiLookupField("tags", () => this.tags, { validator: RequiredFieldValidator })
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