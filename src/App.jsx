import React, { useState } from "react";
import Quiz from "./components/Quiz";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="app">
      {!started ? (
        <div className="start-screen">
          <h1>Quiz Sistemi</h1>
          <button onClick={() => setStarted(true)}>Start</button>
        </div>
      ) : (
        <Quiz />
      )}
    </div>
  );
}

export default App;