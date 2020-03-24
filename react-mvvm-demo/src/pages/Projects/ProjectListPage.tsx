import { Page } from "react-mvvm";
import { ProjectDetailsPage } from "./ProjectDetailsPage";
import * as React from "react";
import { observer } from "mobx-react";
import { ContentView } from "react-mvvm";

export class ProjectListPage extends Page {
    
    async showProject(projectId: string) {
        const projectPage = new ProjectDetailsPage(projectId);
        await this.showChildPage(projectPage);
        return projectPage;
    }
}

export const ProjectListPageView = observer(({ model } : { model : ProjectListPage }) => (
    <div>
        <ul>
            <li><button onClick={e=>model.showProject("project-1")}>Project 1</button></li>
            <li><button onClick={e=>model.showProject("project-2")}>Project 2</button></li>
        </ul>
        <ContentView content={model.childPage} />
    </div>));
