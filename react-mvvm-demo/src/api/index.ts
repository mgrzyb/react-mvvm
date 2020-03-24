export interface UserDto {
    id : string | undefined;
    firstName : string;
    lastName : string;
    email : string;
    departmentId : string;
}

export const userDtoMetadata : { [P in keyof UserDto] : { required? : boolean }} = {
    id : {},
    firstName: {
        required: true
    },
    lastName: {
        required: true
    },
    email : {},
    departmentId: {
        required: true
    }
};

export type DepartmentDto = { id : string, name : string };

export function getDepartments() {
    return new Promise<DepartmentDto[]>(
        r => setTimeout(
            () => r([{ id: "dep1", name : "Department 1"}, { id: "dep2", name: "Department 2"}]),
            2000))
}

export function getUser(userId : string) {
    return new Promise<UserDto | null>(
        r => setTimeout(
            () => r(userId === "user-1" ? { id: "user-1", firstName: "Maciej", lastName: "Sraciej", email: "macio@sracio.com", departmentId: "dep1"} : null),
            2000))
}

export function updateUser(user : UserDto) {
    console.log({...user});
    return new Promise<UserDto>(
        r => setTimeout(
            () => {
                console.log("saved");
                r({...user});
            },
            2000))
}

export function createUser(user : UserDto) {
    console.log({...user});
    return new Promise<UserDto>(
        r => setTimeout(
            () => {
                console.log("saved");
                r({...user});
            },
            2000))
}

export function getUserList(filter: { nameLike: string, userGroup: UserGroupDto | undefined }) {
    return new Promise<any[]>(r => {
        const result = [
            filter.nameLike + "1 " + (filter.userGroup && filter.userGroup.name || ""),
            filter.nameLike + "2 " + (filter.userGroup && filter.userGroup.name || "")
        ];
        setTimeout(() => r(result), 1000);
    });
}

export function getUserGroupList() {
    return new Promise<any[]>(r => {
        const result = [{id: "1", name: "Group 1"}, {id: "2", name: "Group 2"}];
        setTimeout(() => r(result), 1000);
    });
}

export interface UserGroupDto {
    id: string,
    name: string
}