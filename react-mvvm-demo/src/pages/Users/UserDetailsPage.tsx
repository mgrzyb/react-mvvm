import * as React from "react";
import { asyncCommand, command } from "react-mvvm";
import { observable } from "mobx";
import { Page } from "react-mvvm";
import { IDeferredValue, bindableForm, lazyValue } from "react-mvvm";
import { DepartmentDto, getDepartments, getUser, updateUser, UserDto, userDtoMetadata } from "../../api";
import { required, ensureResolved, BindableForm } from "react-mvvm";

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

function form(host : { getDepartmentById(id : string) : Promise<DepartmentDto| undefined>, tags: { id: string}[] }) {
    return bindableForm<UserDto>(userDtoMetadata)
      .addFields("firstName")
      .addCustomField("lastName",
        async dto => dto.lastName?.toUpperCase() ?? "",
        (dto, value) => dto.lastName = value,
        { validator: required() })
      .addField("email", { validator: required() })
      .addLookupField("departmentId", host.getDepartmentById, { fieldName: "department" })
      .addMultiLookupField("tags", () => host.tags, { validator: required() })
}
class Loaded {
    @observable.ref user : UserDto;

    _departments : IDeferredValue<readonly DepartmentDto[]>;
    get departments() {
        return this._departments.value;
    }
    tags = [{id: "A"}, {id:"B"}, {id:"C"}];

    constructor(user : UserDto)  {
        this.user = user;

        this._departments = lazyValue(() => getDepartments());

        this.userForm = form(this)
          .bindTo(() => this.user)
    }

    userForm : G<typeof form>;

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

    getDepartmentById = async (id: string) => {
        return (await ensureResolved(() => this.departments)).find(d => d.id === id);
    }

}

type G<T> = T extends (...arg : any[]) => { bindTo(...args : any[]): BindableForm<infer TDto, infer TShape> } ? BindableForm<TDto, TShape> : never;