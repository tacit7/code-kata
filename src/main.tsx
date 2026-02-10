import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import App from "./App";
import "./index.css";

// Use locally bundled monaco-editor instead of jsDelivr CDN
loader.config({ monaco });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
