import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useEditorStore } from "./stores/editor-store";
import { useKataStore } from "./stores/kata-store";
import { TopBar } from "./components/top-bar";
import { EditorPage } from "./routes/editor";
import { LibraryPage } from "./routes/library";
import { SessionSetupPage } from "./routes/session-setup";
import { SessionPage } from "./routes/session";
import { SessionResultsPage } from "./routes/session-results";

function App() {
  const theme = useEditorStore((s) => s.theme);
  const { loading, error, loadKatas } = useKataStore();

  useEffect(() => {
    loadKatas();
  }, [loadKatas]);

  if (loading) {
    return (
      <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`}>
        <div className="flex items-center justify-center h-full bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-sm">
          Loading katas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`}>
        <div className="flex items-center justify-center h-full bg-white dark:bg-zinc-950 text-red-500 text-sm">
          Failed to load katas: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`}>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TopBar />
        <main className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/editor/:kataId" element={<EditorPage />} />
            <Route path="/session/setup" element={<SessionSetupPage />} />
            <Route path="/session/:sessionId" element={<SessionPage />} />
            <Route path="/session/:sessionId/results" element={<SessionResultsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
