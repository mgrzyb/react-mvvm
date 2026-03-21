import {Event, IEvent} from './Event'
import {IUITransaction, runInTransaction} from "./UITransaction";
import {observable} from "mobx";

export interface IUser {
    readonly signingOut: IEvent<[IUITransaction]>;
}

export interface IAnonymousApplicationContext<TUser extends IUser> {

    readonly discarding: IEvent<[IUITransaction]>;
    readonly userSigningIn: IEvent<[IUITransaction, TUser]>;
    
    trySignIn(user: TUser): Promise<boolean>;
    trySignIn(user: TUser, transaction: IUITransaction): Promise<IUITransaction<void>>;
}

class AnonymousApplicationContext<TUser extends IUser> implements IAnonymousApplicationContext<TUser> {
    constructor(readonly application: Application<TUser>) {}

    private readonly _userSigningIn = new Event<[IUITransaction, TUser]>();
    get userSigningIn() : IEvent<[IUITransaction, TUser]> { return this._userSigningIn; }
    get discarding() : IEvent<[IUITransaction]> { return this._userSigningIn; }
    
    async trySignIn(user: TUser): Promise<boolean>;
    async trySignIn(user: TUser, transaction: IUITransaction): Promise<IUITransaction<void>>;
    async trySignIn(user: TUser, transaction?: IUITransaction): Promise<IUITransaction<void> | boolean> {
        if (!transaction) {
            return runInTransaction(async t => this.trySignIn(user, t));
        }

        await this._userSigningIn.emit(transaction, user);
        
        return transaction.append(async () => {
            return this.application.onUserSignedIn(user);
        });
    }
}

export interface IAuthenticatedApplicationContext<TUser extends IUser> {
    readonly user: TUser;
}

class AuthenticatedApplicationContext<TUser extends IUser> implements IAuthenticatedApplicationContext<TUser> {
    constructor(readonly application: Application<TUser>, readonly user: TUser) {
        user.signingOut.addListener(async transaction => {
            const b = await new Promise(resolve => resolve(confirm("Are you sure you want to sign out?")));
            if (!b) transaction.abort();
            
            transaction.append(() => {
                application.onUserSignedOut();
            })
        });
    }
}

export interface IApplication<TUser extends IUser, TShell> {
    readonly user: TUser | null;
    readonly shell: TShell;
}

export function createApplication<TUser extends IUser, TShell>(user: TUser | null, createAnonymousShell: (c : IAnonymousApplicationContext<TUser>) => TShell, createAuthenticatedShell: (c : IAuthenticatedApplicationContext<TUser>) => TShell) : IApplication<TUser, TShell> {
    return new Application(user, createAnonymousShell, createAuthenticatedShell);
}

class Application<TUser extends IUser, TShell = unknown> implements IApplication<TUser, TShell> {
    
    @observable private accessor _user : TUser | null;
    get user() : TUser | null { return this._user; }

    @observable private accessor _shell : TShell;
    get shell() : TShell { return this._shell; }
    
    constructor(user: TUser | null, private readonly createAnonymousShell: (c : IAnonymousApplicationContext<TUser>) => TShell, private readonly createAuthenticatedShell: (c : IAuthenticatedApplicationContext<TUser>) => TShell) {
        this._user = user;
        if (user) {
            this._shell = this.createAuthenticatedShell(new AuthenticatedApplicationContext(this, user));
        } else {
            this._shell = this.createAnonymousShell(new AnonymousApplicationContext(this));
        }
    }

    onUserSignedIn(user: TUser) {
        
        console.assert(!this._user);
        
        this._user = user;
        this._shell = this.createAuthenticatedShell(new AuthenticatedApplicationContext(this, user));
    }

    onUserSignedOut() {
        
        console.assert(this._user);
        
        this._user = null;
        this._shell = this.createAnonymousShell(new AnonymousApplicationContext(this));
    }
}