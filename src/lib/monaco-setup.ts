import { loader } from "@monaco-editor/react";
import { registerEditorThemes } from "./editor-themes";

// Without this, Monaco can't find its language-service workers and falls
// back to running them on the main thread (UI freezes during editing, plus
// noisy "Could not create web worker(s)" console warnings). Katas here are
// only "javascript" or "ruby" — ruby has no built-in Monaco worker (Monarch
// tokenizer only), so only the generic editor worker and the JS/TS worker
// are needed.
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (workerId: string, label: string) => Worker;
    };
  }
}

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "typescript" || label === "javascript") {
      return new Worker(
        new URL("monaco-editor/esm/vs/language/typescript/ts.worker.js", import.meta.url),
        { type: "module" },
      );
    }
    return new Worker(
      new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url),
      { type: "module" },
    );
  },
};

// Monaco is ~4 MB of JS; deferring the import keeps it out of the startup
// chunk (it loads with the lazy editor routes instead). loader.config keeps
// @monaco-editor/react on the local bundle — never the jsDelivr CDN, which
// would break the packaged app offline. Components must await monacoReady
// before rendering an <Editor>.
export const monacoReady: Promise<void> = import("monaco-editor").then((monaco) => {
  loader.config({ monaco });
  registerEditorThemes(monaco);
});
