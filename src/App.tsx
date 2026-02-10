import { useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { useSettingsStore } from "./stores/settings-store";
import { useKataStore } from "./stores/kata-store";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { TopBar } from "./components/top-bar";
import { EditorPage } from "./routes/editor";
import { LibraryPage } from "./routes/library";
import { SessionSetupPage } from "./routes/session-setup";
import { SessionPage } from "./routes/session";
import { SessionResultsPage } from "./routes/session-results";
import { DashboardPage } from "./routes/dashboard";
import { SettingsPage } from "./routes/settings";

function App() {
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const { loading, error, loadKatas } = useKataStore();
  const navigate = useNavigate();

  const handleOpenSettings = useCallback(() => navigate("/settings"), [navigate]);
  useKeyboardShortcuts({
    openSettings: handleOpenSettings,
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Load katas when settings are ready or language changes
  useEffect(() => {
    if (settingsLoaded) {
      loadKatas(language);
    }
  }, [settingsLoaded, language, loadKatas]);

  if (loading || !settingsLoaded) {
    return (
      <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`}>
        <div className="flex items-center justify-center h-full bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-sm">
          Loading...
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
      <div className="flex flex-col h-full p-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TopBar />
        <main className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/editor/:kataId" element={<EditorPage />} />
            <Route path="/session/setup" element={<SessionSetupPage />} />
            <Route path="/session/:sessionId" element={<SessionPage />} />
            <Route path="/session/:sessionId/results" element={<SessionResultsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
