import { IRoutedPage, route } from "../src/routing";
import { observable } from "mobx";
import { createMemoryHistory } from "history";
import { tick } from "./utils";

class Page implements IRoutedPage {
    @observable childPage: IRoutedPage | undefined;

    removeChildPage(): void {
        this.childPage = undefined;
    }

    activate() {
    }
    
    show(page : IRoutedPage) {
        this.childPage = page;
        return page;
    }
}

class HomePage extends Page {
}

class ChildPage extends Page {
}

test("", async ()=> {
    const homeRoute = route(() => new HomePage());
    const childRoute = homeRoute.addRoute(
        "/child",
        ChildPage,
        home => home.show(new ChildPage()));
    
    const history = createMemoryHistory();
    const binding = await homeRoute.bind(history);
    
    expect(binding.page).toBeInstanceOf(HomePage);
    
    history.replace("/child");
    
    await tick();
    
    expect(binding.page.childPage).toBeInstanceOf(ChildPage);
});
