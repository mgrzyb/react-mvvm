import { asyncCommand, email, lazyValue, required, validators } from "react-mvvm";
import { createUser, DepartmentDto, getDepartments, UserDto, userDtoMetadata } from "../../api";
import { IDeferredValue, bindableForm, ensureResolved } from "react-mvvm";

export class NewUserDialog {
    type: "NewUserDialog" = "NewUserDialog";
    
    user : Partial<UserDto> = {};
    
    _departments : IDeferredValue<readonly DepartmentDto[]>;
    get departments() {
        return this._departments.value;
    }

    userForm = bindableForm<UserDto>(userDtoMetadata)
      .addField("email", { validator: (value : string | undefined) => true})
      .addAllFieldsExcept("id", "departmentId", "email")
      .addField("email", { validator: validators(
            required(),
            email("Email"),
            this.customValidate.bind(this)) })
      .addLookupField("departmentId", this.getDepartmentById, { fieldName: "department" })
      .bindTo(() => this.user);

    save = asyncCommand(
        async () => {
            if (await this.userForm.validateAndCommit()) {
                this.close(await createUser(this.user as UserDto));
            }
        },
        () => !this.userForm.isPristine);

    cancel = () => this.close(undefined);

    constructor(private close : (u : UserDto | undefined) => void)  {
        this._departments = lazyValue(() => getDepartments());
    }

    customValidate<T>(v : T | undefined) : true | string[] {
        return this.userForm.fields.email.value?.startsWith(this.userForm.fields.firstName?.value ?? "") ? 
            true : 
            ["Must start with first name"];        
    }

    private async getDepartmentById(id: string) {
        return (await ensureResolved(() => this.departments)).find(d => d.id === id);
    }
}