import {contentAlternatives, IAnonymousApplicationContext} from "my-objects";
import {User} from "../User";
import {LoginPage} from "../pages/anonymous/LoginPage";
import {RegistrationPage} from "../pages/anonymous/RegistrationPage";

export class AnonymousShell {

    readonly content = contentAlternatives("login",{
        login: () => new LoginPage(this.context, this.content),
        registration: () => new RegistrationPage(this.context, this.content)
    }, {
        discarding: this.context.userSigningIn
    });

    constructor(private readonly context: IAnonymousApplicationContext<User>) {
    }
}