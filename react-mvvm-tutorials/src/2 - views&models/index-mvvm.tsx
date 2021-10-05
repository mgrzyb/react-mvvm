import * as React from "react";
import * as ReactDOM from "react-dom";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { ContentView, bindToCommand, command, registerContentView } from "react-mvvm";

class App {
  @observable
  activeTab : FooTab | BarTab
  
  readonly fooTab = new FooTab();
  readonly barTab = new BarTab();
  
  constructor() {
    this.activeTab = this.fooTab;
  }
}

class FooTab {
  @observable
  count = 0;
  
  inc = command(() => this.count++, () => this.count < 10)
}

class BarTab {
  // ...
}

const FooTabView = observer(({ tab } : { tab : FooTab}) => (
  <>
    <h1>Foo</h1>
    <span>{tab.count}</span>
    <button {...bindToCommand(tab.inc)}>Inc</button>
  </>));

const BarTabView = () => (<h1>Bar</h1>);

const AppView = observer(({ app }: { app : App }) => {
  return (
    <div>
      <button onClick={() => app.activeTab = app.fooTab} disabled={app.activeTab === app.fooTab}>Foo</button>
      <button onClick={() => app.activeTab = app.barTab} disabled={app.activeTab === app.barTab}>Bar</button>
      <ContentView content={app.activeTab} />
    </div>);
});

registerContentView(FooTab, tab => <FooTabView tab={tab}/>)
registerContentView(BarTab, tab => <BarTabView />)

const app = new App();

// @ts-ignore
window.app = app;

ReactDOM.render(<AppView app={app}/>, document.getElementById("app"));
  