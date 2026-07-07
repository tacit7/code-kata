import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import App from "./App";
import { ErrorBoundary } from "./components/error-boundary";
import "./index.css";

// Lets the Rust side detect a renderer that went silent while backgrounded
// (see HeartbeatState in src-tauri/src/lib.rs) so it can force a reload
// instead of leaving a permanently blank window.
setInterval(() => {
  void invoke("heartbeat").catch(() => {});
}, 3000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
