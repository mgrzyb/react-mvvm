import { Page } from "react-mvvm";

export class HomePage extends Page {
  showProjects() {
    return this.showChildPage(new ProjectsPage(this.tryRemoveChildPage.bind(this)));
  }

  showUsers() {
    return this.showChildPage(new UsersPage(this.tryRemoveChildPage.bind(this)));
  }

  protected async onActivated() {
    console.log("HomePage activated")
  }
}

export class UsersPage extends Page {
  constructor(readonly close : ()=>void) {
    super();
  }
  protected async onActivated() {
    console.log("UsersPage activated")
  }
  protected async onDeactivated() {
    console.log("UsersPage deactivated")
  }
}

export class ProjectsPage extends Page {
  constructor(readonly close : ()=>void) {
    super();
  }
  showProject(projectId : string) {
    return this.showChildPage(new ProjectDetailsPage(projectId, this.tryRemoveChildPage.bind(this)));
  }
  protected async onActivated() {
    console.log("ProjectsPage activated")
  }
  protected async onDeactivated() {
    console.log("ProjectsPage deactivated")
  }
}

export class ProjectDetailsPage extends Page {
  constructor(readonly projectId : string, readonly close : ()=>void) {
    super();
  }
  protected async onActivated() {
    console.log(`ProjectDetailsPage activated. ProjectId: ${this.projectId}`)
  }
  protected async onDeactivated() {
    console.log(`ProjectDetailsPage deactivated`)
  }
}

export class App extends Page {

  homePage = new HomePage();

  get currentPage() {
    return this.topMostChildPage;
  }

  constructor() {
    super();
  }

  showHomePage() {
    return this.showChildPage(this.homePage);
  }
}
