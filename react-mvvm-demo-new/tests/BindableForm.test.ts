import { bindableForm } from "my-objects/forms";

interface UserDto {
    id: string;
    name: string;
    age: number;
    departmentId: string
    roleIds: string[];
}

interface UserRoleDto {
    id: string;
    title: string;
}

interface DepartmentDto {
    id: string;
    name: string;
}

test("Foo", async () => {
    const u = {
        id: "a",
        name: "John",
        age: 30,
        departmentId: "a",
        roleIds: ["a", "b"]
    }
    const form = bindableForm<UserDto>()
        .addField("name")
        .addField("age")
        .addLookupField("departmentId", async (id: string) => ({
            id,
            name: "Department " + id.toUpperCase()
        }), {fieldName: "department"})
        .addMultiLookupField("roleIds", async () => [{id: "a", title: "Role A"}, {id: "b", title: "Role B"}, {
            id: "c",
            title: "Role C"
        }], {fieldName: "roles"})
        .bindTo(() => u);

    await form.initialBinding;
    
    form.fields.age.value = 31;
    
    await form.commit();

    expect(u.age).toBe(31);
});