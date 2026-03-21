import {command} from "../src/commands";

test('Async Command', async () => {

    let resolve : (r : string) => void = () => {};
    
    const c = command(() => new Promise<string>(r => resolve = r))
        .then(r => {
            console.log(r)
            return 1234;
        }).
        then(r => {
            console.log(r)
            return "World";
        });

    expect(c.isEnabled).toBe(true);
    expect(c.isRunning).toBe(false);
    const p = c.execute();
    expect(c.isEnabled).toBe(false);
    expect(c.isRunning).toBe(true);
    resolve("Hello");
    expect(await p).toBe("World");
    expect(c.isEnabled).toBe(true);
    expect(c.isRunning).toBe(false);
});

test('Sync Command', async () => {

    const c = command(() => "Hello")
        .then(r => {
            console.log(r)
            return 1234;
        }).
        then(r => {
            console.log(r)
            return "World";
        });

    expect(c.isEnabled).toBe(true);
    expect(c.isRunning).toBe(false);
    const p = c.execute();
    expect(c.isEnabled).toBe(false);
    expect(c.isRunning).toBe(true);
    expect(await p).toBe("World");
    expect(c.isEnabled).toBe(true);
    expect(c.isRunning).toBe(false);
});