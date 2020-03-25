import { asyncCommand, bindableForm, bindToApi, command, Deferred, Loading, Page, property } from "react-mvvm";
import { observable } from "mobx";
import { createUser, DepartmentDto, getDepartments, UserDto, userDtoMetadata } from "../../api";

export class NewUserDialog {
    type: "NewUserDialog" = "NewUserDialog";
    
    user : Partial<UserDto> = {};
    
    @observable.ref departments : Deferred<readonly DepartmentDto[]> = Loading;

    constructor(private close : (u : UserDto | undefined) => void)  {
        bindToApi(property(this, "departments"), () => getDepartments());
    }

    userForm = bindableForm<UserDto>(userDtoMetadata)
        .addAllFields("id", "departmentId")
        .addLookupField("departmentId", () => this.departments, "department")
        .bindTo(() => this.user);

    save = asyncCommand(
        async () => {
            if (await this.userForm.validateAndCommit()) {
                this.close(await createUser(this.user as UserDto));
            }
        },
        () => !this.userForm.isPristine);
    
    cancel = () => this.close(undefined);
}