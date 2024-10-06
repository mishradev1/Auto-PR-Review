import { useState } from "react";
import "./App.css";
import OAuth from "./components/OAuth";
import Webhook from "./components/Webhook";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Automatic GitHub PR Review System</h1>
      <OAuth />
      <Webhook />
    </div>
  );
}

export default App;
