import { asyncCommand, bindableForm, bindToApi, command, Deferred, Loading, Page, property } from "react-mvvm";
import { observable } from "mobx";
import { createUser, DepartmentDto, getDepartments, UserDto, userDtoMetadata } from "../../api";
import { email, required, validators } from "react-mvvm";

export class NewUserDialog {
    type: "NewUserDialog" = "NewUserDialog";
    
    user : Partial<UserDto> = {};
    
    @observable.ref departments : Deferred<readonly DepartmentDto[]> = Loading;

    constructor(private close : (u : UserDto | undefined) => void)  {
        bindToApi(property(this, "departments"), () => getDepartments());
    }

    userForm = bindableForm<UserDto>(userDtoMetadata)
        .addAllFieldsExcept("id", "departmentId", "email")
        .addField("email", { validator: validators(
                required(),
                email("Email"),
                this.customValidate.bind(this)) })
        .addLookupField("departmentId", () => this.departments, { fieldName: "department" })
        .bindTo(() => this.user);

    save = asyncCommand(
        async () => {
            if (await this.userForm.validateAndCommit()) {
                this.close(await createUser(this.user as UserDto));
            }
        },
        () => !this.userForm.isPristine);
    
    cancel = () => this.close(undefined);
    
    customValidate<T>(v : T | undefined) : true | string[] {
        return this.userForm.fields.email.value?.startsWith(this.userForm.fields.firstName?.value ?? "") ? 
            true : 
            ["Must start with first name"];        
    }
}