export interface UserDto {
    id : string | undefined;
    firstName : string;
    lastName : string;
    email : string;
    departmentId : string;
    tags : string[]
}

export interface UserListItemDto {
    id : string;
    firstName : string;
    lastName : string;
    email : string;
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
    },
    tags: {}
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
            () => r(userId === "user-1" ? { id: "user-1", firstName: "John", lastName: "Doe", email: "john.doe@people.com", departmentId: "dep1", tags: ["A"]} : null),
            2000))
}

export function getUserList(nameLike : string, options : { skip : number, take : number}) {
    return new Promise<UserListItemDto[]>(
        r => setTimeout(
            () => r(new Array(options.take).fill(undefined).map((_, i) => ({ id: `user-${options.skip + i}`, firstName: `User ${nameLike} ${options.skip + i}`, lastName: "Smith", email: "agent@smith.com" }))),
            2000));
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