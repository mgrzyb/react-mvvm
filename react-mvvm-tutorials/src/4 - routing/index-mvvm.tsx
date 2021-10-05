import * as React from "react";
import * as ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { createBrowserHistory } from "history";
import { registerContentView, ContentView, route } from "react-mvvm";
import { App, HomePage, ProjectDetailsPage, ProjectsPage, UsersPage } from "../3 - pages/pages";

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

registerContentView(ProjectsPage, page => (
  <>
    <h1>Projects</h1>
    <button onClick={() => page.close()}>Back</button>
    <ul>
      <li><button onClick={() => page.showProject("MyFirstProject")}>My First Project</button></li>
      <li><button onClick={() => page.showProject("MySecondProject")}>My Second Project</button></li>
    </ul>
  </>));

registerContentView(ProjectDetailsPage, content => (
  <>
    <h1>Project {content.projectId}</h1>
    <button onClick={() => content.close()}>Back</button>
  </>));

const AppView = observer(({ app }: { app : App }) => {
  return (
    <div>
      <ContentView content={app.currentPage} />
    </div>);
});

const appRoute = route<App>();
const homeRoute = appRoute.addRoute("/", HomePage, app => app.showHomePage());
const usersRoute = homeRoute.addRoute("users", UsersPage, home => home.showUsers());
const projectsRoute = homeRoute.addRoute("projects", ProjectsPage, home => home.showProjects());
const projectDetailsRoute = projectsRoute.addRoute<ProjectDetailsPage, { projectId : string }>(
  "/:projectId", ProjectDetailsPage, 
  (projects, params) => projects.showProject(params.projectId),
  page => ({ projectId: page.projectId }));

async function run() {
  const app = new App();

  await appRoute.bind(app, createBrowserHistory(), {
    notFound: path => alert(`NotFound: ${path}`)
  });
  
  ReactDOM.render(<AppView app={app}/>, document.getElementById("app"));
  
  return app;
}

// @ts-ignore
run().then(app => window.app = app);

