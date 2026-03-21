import {command, IEvent, Event, IUITransaction, IUser, runInTransaction, ICommand} from 'my-objects';
export class User implements IUser {

    readonly signOut = command(() => this.trySignOut());
    
    private readonly _signingOut = new Event<[IUITransaction]>();
    get signingOut(): IEvent<[IUITransaction]> { return this._signingOut; }

    constructor(public readonly name : string) {
    }
    
    private trySignOut() {
        return runInTransaction(async t => {
            await this._signingOut.emit(t);
            return t.append(() => {
                alert("Signed out.");
            })
        });
    }
}