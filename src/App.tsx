import { useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { listen } from "@tauri-apps/api/event";
import { useSettingsStore } from "./stores/settings-store";
import { useKataStore } from "./stores/kata-store";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { DEFAULT_UI_SCALE, nextUiScale, previousUiScale } from "./lib/ui-scale";
import { TopBar } from "./components/top-bar";
import { Toaster } from "./components/toaster";
import { CommandPalette } from "./components/command-palette";
import { AppCommandRegistrar } from "./components/app-command-registrar";
import { useCommandPaletteStore } from "./stores/command-palette-store";
import { ModulesPage, PracticePage } from "./routes/library";
import { PracticeQueuePage } from "./routes/practice";
import { SettingsPage } from "./routes/settings";
import { ResultsPage } from "./routes/results";

// Heavy routes load lazily: Monaco rides with the editor chunks, Recharts
// with the dashboard — keeps the startup bundle small.
const EditorPage = lazy(() => import("./routes/editor").then((m) => ({ default: m.EditorPage })));
const SessionPage = lazy(() => import("./routes/session").then((m) => ({ default: m.SessionPage })));
const SessionResultsPage = lazy(() => import("./routes/session-results").then((m) => ({ default: m.SessionResultsPage })));
const DashboardPage = lazy(() => import("./routes/dashboard").then((m) => ({ default: m.DashboardPage })));
const KataFormPage = lazy(() => import("./routes/kata-form").then((m) => ({ default: m.KataFormPage })));

function App() {
  const theme = useSettingsStore((s) => s.theme);
  const uiScale = useSettingsStore((s) => s.uiScale);
  const language = useSettingsStore((s) => s.language);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const toggleCommandPalette = useCommandPaletteStore((s) => s.toggle);
  const { loading, error, loadKatas } = useKataStore();
  const navigate = useNavigate();

  const handleOpenSettings = useCallback(() => navigate("/settings"), [navigate]);
  const handleZoomIn = useCallback(() => {
    setSetting("uiScale", nextUiScale(useSettingsStore.getState().uiScale));
  }, [setSetting]);
  const handleZoomOut = useCallback(() => {
    setSetting("uiScale", previousUiScale(useSettingsStore.getState().uiScale));
  }, [setSetting]);
  const handleResetZoom = useCallback(() => {
    setSetting("uiScale", DEFAULT_UI_SCALE);
  }, [setSetting]);
  useKeyboardShortcuts({
    openSettings: handleOpenSettings,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    resetZoom: handleResetZoom,
    openCommandPalette: toggleCommandPalette,
  });

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("menu:open-settings", () => {
      navigate("/settings");
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [navigate]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    document.documentElement.style.setProperty("--kata-ui-scale", String(uiScale));
  }, [uiScale]);

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
          <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-sm text-primary" /></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticeQueuePage />} />
            <Route path="/problems" element={<PracticePage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/kata/new" element={<KataFormPage />} />
            <Route path="/kata/:kataId/edit" element={<KataFormPage />} />
            <Route path="/editor/:kataId" element={<EditorPage />} />
            <Route path="/session/:sessionId" element={<SessionPage />} />
            <Route path="/session/:sessionId/results" element={<SessionResultsPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          </Suspense>
        </main>
      </div>
      <AppCommandRegistrar />
      <CommandPalette />
      <Toaster />
    </div>
  );
}

export default App;
