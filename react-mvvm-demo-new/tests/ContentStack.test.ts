import {contentStack, IContent, IIntent, IContentStackEntry} from "my-objects/navigation";
import {runInTransaction, runInTransactionAndGetResult} from "my-objects/UITransaction";

class FooPage implements IContent {
    constructor(private readonly e: IContentStackEntry<FooPage>, public readonly title : string) {
        e.discarding.addListener(async (t) => {
            console.log("Closing " + title);
/*            if (title == "Child 1") {
                await new Promise(r => setTimeout(r, 1000));
                t.abort();
            }*/
            t.append(() => console.log("Closed " + title));
        });
    }
    public tryShowChild(title: string) {
        return runInTransactionAndGetResult(t => this.e.tryOpenChild<FooPage>(e => new FooPage(e, title), t));
    }

    getIntentHandler<T extends IContent>(intent: IIntent<T>): ((intent: IIntent<T>) => Promise<any>) | undefined {
        return undefined;
    }
}


test('Foo', async () => {

    const stack = contentStack();
    
    const e1 = stack.push<FooPage>(e => new FooPage(e, "Root"));
    
    const e2 = await e1.content.tryShowChild("Child 1");
    const e3 = await e1.content.tryShowChild("Child 2");
    if (e3) {
        await e3.content.tryShowChild(`${e3.content.title} - Child 3`);
    }
    
    const isClosed = await runInTransaction(t => e1.tryClose(t));
});