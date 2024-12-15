import { useRef, useState } from "react";
import "./App.css";
import { CanvasBoard } from "./Canvas";

function App() {
  return (
    <div className="w-full relative   h-full">
      <CanvasBoard />
    </div>
  );
}

export default App;
