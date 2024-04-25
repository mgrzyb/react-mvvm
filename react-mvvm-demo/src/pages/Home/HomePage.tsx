import * as React from "react";
import { observable } from "mobx";
import {navigation, asyncCommand, command, Command, IPage, Page, withModal} from "react-mvvm";
import { UserListPage } from "../Users/UserListPage";
import { ProjectListPage } from "../Projects/ProjectListPage";

export class HomePage extends withModal<CustomDialog>()(Page) {

    showCustomDialog : Command<void>;

    navigation = navigation(this, {
        home: undefined,
        users : UserListPage,
        projects : ProjectListPage
    });
    
    constructor(){
        super();

        this.showCustomDialog = asyncCommand(async () => {
            const count = await this.showModal(close => new CustomDialog(close));
            if (count !== undefined)
                alert(count);
        });
    }

    async show<T extends Page>(model: T) {
        await this.showChildPage(model);
        return model;
    }
}

class CustomDialog {
    type: "Custom" = "Custom";
    @observable count: number = 0;
    inc = command(() => this.count++, () => this.count<10);
    dec = command(() => this.count--, () => this.count > 0);
    done : Command;
    cancel: () => void;

    constructor(close : (result : number | undefined) => void) {
        this.done = asyncCommand(
            () => new Promise(r => setTimeout(() => close(this.count), 2000)),
            () => this.count > 5);
        this.cancel = () => close(undefined);
    }
}
