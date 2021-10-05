import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

function computeApi(a : string, b : string) {
  return new Promise<string>(r => setTimeout(() => r(a + b), 2000));
}

function useCompute() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState("");
  const [isRunning, setRunning] = useState(false);

  const compute = async () => {
    setRunning(true);
    setResult(await computeApi(a, b));
    setRunning(false);
  };

  return { a, b, result, isRunning, setA, setB, compute };  
}

const App = () => {
  
  const {a, b, result, setA, setB, isRunning, compute } = useCompute();
  
  return (<div>
    <input value={a} onChange={e => setA(e.target.value)} />
    <input value={b} onChange={e => setB(e.target.value)} />
    <button onClick={compute} disabled={isRunning}>Compute</button>
    <div>{result}</div>
  </div>);
};

ReactDOM.render(<App />, document.getElementById("app"));
  