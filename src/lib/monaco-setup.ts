import { loader } from "@monaco-editor/react";
import { registerEditorThemes } from "./editor-themes";

// Monaco is ~4 MB of JS; deferring the import keeps it out of the startup
// chunk (it loads with the lazy editor routes instead). loader.config keeps
// @monaco-editor/react on the local bundle — never the jsDelivr CDN, which
// would break the packaged app offline. Components must await monacoReady
// before rendering an <Editor>.
export const monacoReady: Promise<void> = import("monaco-editor").then((monaco) => {
  loader.config({ monaco });
  registerEditorThemes(monaco);
});
