import { useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { useSettingsStore } from "./stores/settings-store";
import { useKataStore } from "./stores/kata-store";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { TopBar } from "./components/top-bar";
import { Toaster } from "./components/toaster";
import { EditorPage } from "./routes/editor";
import { PracticePage } from "./routes/library";
import { PracticeQueuePage } from "./routes/practice";
import { SessionPage } from "./routes/session";
import { SessionResultsPage } from "./routes/session-results";
import { DashboardPage } from "./routes/dashboard";
import { SettingsPage } from "./routes/settings";
import { KataFormPage } from "./routes/kata-form";
import { ResultsPage } from "./routes/results";

if (import.meta.env.DEV) {
  import("./lib/ruby-stress").then((m) => {
    (window as unknown as { __rubyStress: typeof m.rubyStress }).__rubyStress = m.rubyStress;
  });
}

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

  useEffect(() => {
    if (settingsLoaded) {
      loadKatas(language);
    }
  }, [settingsLoaded, language, loadKatas]);

  if (loading || !settingsLoaded) {
    return (
      <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`} data-theme={theme}>
        <div className="flex items-center justify-center h-full bg-base-200">
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary animate-pulse" />
            </div>
            <span className="text-sm text-base-content/40 font-medium tracking-wide">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`} data-theme={theme}>
        <div className="flex items-center justify-center h-full bg-base-200">
          <div className="flex flex-col items-center gap-3 text-error animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 opacity-60">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Failed to load katas: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`} data-theme={theme}>
      <div className="flex flex-col h-full bg-base-200 text-base-content">
        <TopBar />
        <main className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticeQueuePage />} />
            <Route path="/problems" element={<PracticePage />} />
            <Route path="/kata/new" element={<KataFormPage />} />
            <Route path="/kata/:kataId/edit" element={<KataFormPage />} />
            <Route path="/editor/:kataId" element={<EditorPage />} />
            <Route path="/session/:sessionId" element={<SessionPage />} />
            <Route path="/session/:sessionId/results" element={<SessionResultsPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
