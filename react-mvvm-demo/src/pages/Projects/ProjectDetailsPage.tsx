import { Page } from "react-mvvm";
import * as React from "react";
import { observer } from "mobx-react";
import { ContentView } from "react-mvvm";

export class ProjectDetailsPage extends Page {
    constructor(public projectId: string) {
        super();
    }
}

export const ProjectDetailsPageView = observer(({ model } : { model : ProjectDetailsPage }) => (
    <div>
        Project details
        <ContentView content={model.childPage} />
    </div>));
