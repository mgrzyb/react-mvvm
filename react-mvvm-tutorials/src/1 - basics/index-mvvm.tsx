import * as React from "react";
import * as ReactDOM from "react-dom";
import { observable } from "mobx";
import { observer } from "mobx-react";
import {asyncCommand, bindTo, bindToCommand, IProperty, property} from "react-mvvm";
import { BetterTextInput, TextInput } from "./TextInput";
import {useMemo} from "react";

function computeApi(a : string, b : string) {
  return new Promise<string>(r => setTimeout(() => r(a + b), 2000));
}

class App {
  @observable
  a = "";
  
  @observable
  b = "";

  @observable
  result = "";

  compute = asyncCommand(async () => {
    this.result = await computeApi(this.a, this.b);
  });
}

let renderCount = 0;

function useProperty<T, P extends keyof T>(model : T, key : P) : IProperty<T[P]> {
    return useMemo(() => {
        console.log("Property: ", key);
        return property(model, key);
    }, [model, key])
}

const AppView = observer(({ app }: { app : App }) => {
  const a = useProperty(app, "a");
  const b = useProperty(app, "b");
  return (
    <div>
      <TextInput {...bindTo(a)} />
      <BetterTextInput value={b} />
      <button {...bindToCommand(app.compute)}>Compute</button>
      <div>{app.result}</div>
      Render count: {renderCount++}
    </div>);
});

const app = new App();

// @ts-ignore
window.app = app;

ReactDOM.render(<AppView app={app}/>, document.getElementById("app"));
  