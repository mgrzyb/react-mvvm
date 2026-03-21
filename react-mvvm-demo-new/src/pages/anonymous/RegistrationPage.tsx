import {Anchor, IAnonymousApplicationContext} from "my-objects";
import { User } from "../User";

export class RegistrationPage {
    constructor(private readonly context: IAnonymousApplicationContext<User>, readonly links: { login: Anchor }) {
    }
}