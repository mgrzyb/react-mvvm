import {observable} from "mobx";
import {r} from "../src/newer-routing";

export function property<T, K extends keyof T>(model: T, propertyName: K) {
    return {
        get: () => model[propertyName],
        set: (value: T[K]) => (model[propertyName] = value)
    };
}

class FooModal {
    readonly type = "foo-modal";

    constructor(readonly id: string = "default") {
        this.id = id;
    }
}

class FooPage {
    readonly type = "foo";

    @observable accessor id: string = "default";
    @observable.ref accessor modal: FooModal | undefined;

    constructor(id: string = "default") {
        this.id = id;
    }
    showModal(id: string) {
        this.modal = new FooModal(id);
        return this.modal;
    }
}

class BarPage {
    readonly type = "bar";
    
    constructor(readonly id: string) {}
}

class App {
    @observable.ref accessor activePage: FooPage | BarPage = new FooPage();

    changePage<T extends FooPage | BarPage>(page: T) {
        this.activePage = page;
        return page;
    }
}


test("Never routing", async () => {
    const application = new App();

    const rootRoute = r<App>("");

    rootRoute.add("bar",
        app => app.changePage(new BarPage("bar")),
        app => app.activePage.type === "bar" ? app.activePage : undefined);

    const fooRoute = rootRoute.add("foo/{id}",
        (app, params) => app.changePage(new FooPage(params.id)),
        app => app.activePage.type === "foo" ? app.activePage : undefined,
        foo => ({ id: foo.id }));

    fooRoute.add("modal/{foo}",
        (page, params) => page.showModal(params.foo),
        page => page.modal,
        modal => ({ foo: modal.id }));

    
    const o = observable({
        currentPath: "/foo/23/modal/special",
    });
    
    await rootRoute.bindTo(application, property(o, "currentPath"));
    
    expect(application.activePage).toBeInstanceOf(FooPage);
    expect((application.activePage as FooPage).id).toBe("23");
    expect((application.activePage as FooPage).modal).toBeInstanceOf(FooModal);
    expect((application.activePage as FooPage).modal!.id).toBe("special");

    (application.activePage as FooPage).id = "Hello"
    expect(o.currentPath).toBe("/foo/Hello/modal/special");

    application.activePage = new BarPage("17");
    
    expect(o.currentPath).toBe("/bar");
});