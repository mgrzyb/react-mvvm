import { route } from "react-mvvm";
import { HomePage } from "./pages/Home/HomePage";
import { UserListPage } from "./pages/Users/UserListPage";
import { UserDetailsPage } from "./pages/Users/UserDetailsPage";
import { ProjectDetailsPage } from "./pages/Projects/ProjectDetailsPage";
import { ProjectListPage } from "./pages/Projects/ProjectListPage";

export const homeRoute = route(() => new HomePage());

/*
interface IRouteBuilder<TParent, T> {
    withModel<TParams ={}>(paramsToModel : (parent : TParent, params : TParams) => T, modelToParams : (model : T) => TParams) : IRouteBuilder<TParent, T>;
    withState(setState : (model : T, state : string) => void, getState : (model : T) => string) : IRouteBuilder<TParent, T>;
}

function addRoute<T>(path : string, c : ConstructorOf<T>) : IRouteBuilder<{}, T> {
    return {} as IRouteBuilder<{}, T>;
}

addRoute("/users", UsersPage)
    .withModel(parent => new UsersPage(), model => {});
*/

export const usersRoute = homeRoute.addRoute<UserListPage, {}>(
    "/users",
    UserListPage,
    homePage => homePage.show(new UserListPage()),
    page => ({}),
    {
        get: page => page.filter.nameLike,
        set: (page, state) => page.filter.nameLike = state
    });

export const userDetailsRoute = usersRoute.addRoute<UserDetailsPage, { userId : string }>(
    "/:userId",
    UserDetailsPage,
    (usersPage, p) => usersPage.showUser(p.userId),
    page => ({ userId: page.userId }));

export const projectsRoute = homeRoute.addRoute<ProjectListPage, { organizationId : string }>(
    "/projects/:organizationId",
    ProjectListPage,
    homePage => homePage.show(new ProjectListPage()),
    p => ({ organizationId: "1"}));

export const projectDetailsRoute = projectsRoute.addRoute<ProjectDetailsPage, { projectId : string }>(
    "/:projectId",
    ProjectDetailsPage,
    (projectsPage, p) => projectsPage.showProject(p.projectId),
    page => ({ projectId: page.projectId }));
