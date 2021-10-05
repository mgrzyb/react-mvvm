import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

function computeApi(a : string, b : string) {
  return new Promise<string>(r => setTimeout(() => r(a + b), 2000));
}

let renderCount = 0;

const App = () => {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const compute = async () => {
    setIsRunning(true);
    setResult(await computeApi(a, b));
    setIsRunning(false);
  };
  
  return (<div>
    <input value={a} onChange={e => setA(e.target.value)} />
    <input value={b} onChange={e => setB(e.target.value)} />
    <button onClick={compute} disabled={isRunning}>Compute</button>
    <div>{result}</div>
    Render count: {renderCount++}
  </div>);
};

ReactDOM.render(<App />, document.getElementById("app"));
  