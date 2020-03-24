import "antd/dist/antd.less";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { ContentView, registerContentView } from "react-mvvm";
import { homeRoute } from "./routes";
import { HomePage } from "./pages/Home/HomePage";
import { ProjectListPageView } from "./pages/Projects/ProjectListPage";
import { UserListPage } from "./pages/Users/UserListPage";
import { ProjectDetailsPage, ProjectDetailsPageView } from "./pages/Projects/ProjectDetailsPage";
import { UserDetailsPage } from "./pages/Users/UserDetailsPage";
import { UserDetailsPageView } from "./pages/Users/UserDetailsPageView";
import { HomePageView } from "./pages/Home/HomePageView";
import { UsersPageView } from "./pages/Users/UserListPageView";
import { ProjectListPage } from "./pages/Projects/ProjectListPage";

registerContentView(HomePage, p => <HomePageView model={p}/>);
registerContentView(ProjectListPage, p => <ProjectListPageView model={p}/>);
registerContentView(ProjectDetailsPage, p => <ProjectDetailsPageView model={p}/>);
registerContentView(UserListPage, p => <UsersPageView model={p}/>);
registerContentView(UserDetailsPage, p => <UserDetailsPageView model={p}/>);

(async function () {
    const history = createBrowserHistory();
    const {page} = await homeRoute.bind(history);
    ReactDOM.render(<ContentView content={page}/>, document.getElementById("app"));
})();