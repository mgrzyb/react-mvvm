import {IAuthenticatedApplicationContext, contentStack} from "my-objects";
import {User} from "../User";

export class AuthenticatedShell {
    get user() { return this.context.user; }
    
    readonly navigation = contentStack()
    constructor(private readonly context : IAuthenticatedApplicationContext<User>){}
}

