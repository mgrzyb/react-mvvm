import {Anchor, bindableForm, command, IAnonymousApplicationContext, required } from "my-objects";
import {User} from "../../User";

interface LoginRequestDto {
    username: string;
    password: string;
}
export class LoginPage {

    private readonly dto : LoginRequestDto = {
        username: "",
        password: ""
    };

    readonly form = bindableForm<LoginRequestDto>()
        .addField("username", { validator: required("Username is required") })
        .addField("password")
        .bindTo(() => this.dto);
    
    readonly submit = command(async () => {
        await this.form.tryCommit(async () => {
            await delay(1000);
            await this.context.trySignIn(new User(this.dto.username));
        });
    });
    constructor(private readonly context: IAnonymousApplicationContext<User>, readonly links: { registration: Anchor }) {
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

