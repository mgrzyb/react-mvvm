import * as React from "react";
import * as ReactDOM from "react-dom";
import { Page, registerContentView, ContentView } from "react-mvvm";
import { observer } from "mobx-react";
import { App, HomePage, ProjectsPage, UsersPage } from "./pages";

registerContentView(HomePage, content => (
  <>
    <h1>Home</h1>
    <ul>
      <li><button onClick={() => content.showProjects()}>Projects</button></li>
      <li><button onClick={() => content.showUsers()}>Users</button></li>
    </ul>
  </>));

registerContentView(UsersPage, content => (
  <>
    <h1>Users</h1>
    <button onClick={() => content.close()}>Back</button>
  </>));

registerContentView(ProjectsPage, content => (
  <>
    <h1>Projects</h1>
    <button onClick={() => content.close()}>Back</button>
  </>));

const AppView = observer(({ app }: { app : App }) => {
  return (
    <div>
      <ContentView content={app.currentPage} />
    </div>);
});

async function run() {
  const app = new App();
  await app.showHomePage();
  await app.activate();

  ReactDOM.render(<AppView app={app}/>, document.getElementById("app"));
}

// @ts-ignore
run().then(app => window.app = app);
