import * as React from "react";
import * as ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { createBrowserHistory, LocationState } from "history";
import { History } from 'history';
import {
  asyncCommand,
  bindTo,
  bindToCommand,
  ContentView,
  Page,
  property,
  registerContentView,
  route
} from "react-mvvm";
import { observable } from "mobx";
import { AuthContext } from "./auth-context";
import { TextInput } from "../1 - basics/TextInput";

export class App extends Page {
  
  get currentPage() {
    return this.topMostChildPage;
  }

  readonly homePage;
  
  constructor(public authContext : AuthContext, private redirect: (path : string) => void) {
    super();
    this.homePage = new HomePage(authContext);
  }

  showHomePage() {
    return this.showChildPage(this.homePage);
  }

  showLogin(returnPath? : string) {
    return this.showChildPage(new LoginPage(this.authContext, returnPath, { 
      onSignedIn: () => returnPath ? this.redirect(returnPath) : this.showHomePage()
    }));
  }
}

export class HomePage extends Page {

  constructor(readonly authContext : AuthContext) {
    super();
  }

  showPublicPage() {
    return this.showChildPage(new PublicPage());
  }

  showPrivatePage() {
    if (!this.authContext.user)
      return "unauthorized";
    return this.showChildPage(new PrivatePage(this.authContext.user));
  }
}

class LoginPage extends Page {
  @observable
  username = "";
  
  login = asyncCommand(
    async () => {
      await this.authContext.signIn(this.username);
      this.callbacks?.onSignedIn?.();
    }, 
    () => this.username.length > 0)

  constructor(private authContext: AuthContext, readonly returnPath? : string, private callbacks? : { onSignedIn?: () => void }) {
    super();
  }
}

class PrivatePage extends Page {
  constructor(readonly user : string) {
    super();
  }
}

class PublicPage extends Page {
  constructor() {
    super();
  }
}

registerContentView(HomePage, homePage => (
  <>
    <h1>Home</h1>
    <ul>
      <li><button onClick={() => homePage.showPublicPage()}>Public page</button></li>
      { homePage.authContext.user && <li><button onClick={() => homePage.showPrivatePage()}>Private page</button></li> }
    </ul>
  </>));

registerContentView(PublicPage, content => (
  <>
    <h1>This is a public page</h1>
  </>));

registerContentView(PrivatePage, page => (
  <>
    <h1>This is a private page for {page.user}</h1>
  </>));

registerContentView(LoginPage, loginPage => (
  <>
    <h1>Login</h1>
    <TextInput {...bindTo(property(loginPage, "username"))} />
    <button {...bindToCommand(loginPage.login)}>Login</button>
  </>));

const AppView = observer(({ app }: { app : App }) => {
  return (
    <div>
      { !app.authContext.user && <button onClick={() => app.showLogin()}>Login</button> }
      <ContentView content={app.currentPage} />
    </div>);
});

const appRoute = route<App>();
appRoute.addRoute<LoginPage, { returnUrl? : string }>("/login", LoginPage, (app, params) => app.showLogin(params.returnUrl), page => ({ returnUrl: page.returnPath }));
const homeRoute = appRoute.addRoute("/", HomePage, app => app.showHomePage());
homeRoute.addRoute("public", PublicPage, home => home.showPublicPage());
homeRoute.addRoute("private", PrivatePage, home => home.showPrivatePage());

async function run() {
  const history: History<LocationState> = createBrowserHistory();

  const authContext = new AuthContext();
  const app = new App(authContext, path => history.replace(path));
  
  await appRoute.bind(app, history, { 
    unauthorized: path => app.showLogin(path)
  })
  
  ReactDOM.render(<AppView app={app}/>, document.getElementById("app"));
  
  return app;
}

// @ts-ignore
run().then(app => window.app = app);

