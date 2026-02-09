import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSettingsStore, DEFAULT_SHORTCUTS } from "../stores/settings-store";
import type { ShortcutAction } from "../stores/settings-store";

type Tab = "editor" | "practice" | "shortcuts";

const FONT_OPTIONS = [
  "JetBrains Mono, monospace",
  "Fira Code, monospace",
  "Menlo, monospace",
  "Monaco, monospace",
  "monospace",
];

const SESSION_SIZE_OPTIONS = [5, 10, 15, 20];

const SHORTCUT_LABELS: Record<ShortcutAction, string> = {
  runTests: "Run Tests",
  nextKata: "Next Kata",
  prevKata: "Previous Kata",
  toggleSolution: "Toggle Solution",
  openSettings: "Open Settings",
  closePanel: "Close Panel",
};

function formatCombo(combo: string): string {
  return combo
    .split("+")
    .map((part) => {
      switch (part) {
        case "Meta":
          return "\u2318";
        case "ArrowRight":
          return "\u2192";
        case "ArrowLeft":
          return "\u2190";
        case "ArrowUp":
          return "\u2191";
        case "ArrowDown":
          return "\u2193";
        case "Escape":
          return "Esc";
        default:
          return part;
      }
    })
    .join(" ");
}

function EditorTab() {
  const theme = useSettingsStore((s) => s.theme);
  const vimMode = useSettingsStore((s) => s.vimMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const tabSize = useSettingsStore((s) => s.tabSize);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Theme
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSetting("theme", "dark")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              theme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setSetting("theme", "light")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              theme === "light"
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Vim Mode */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Vim Mode
        </label>
        <button
          onClick={() => setSetting("vimMode", !vimMode)}
          className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            vimMode
              ? "bg-green-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          {vimMode ? "On" : "Off"}
        </button>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Font Size
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))}
            disabled={fontSize <= 10}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-40 transition-colors"
          >
            -
          </button>
          <span className="text-sm font-mono font-medium w-6 text-center">
            {fontSize}
          </span>
          <button
            onClick={() => setSetting("fontSize", Math.min(24, fontSize + 1))}
            disabled={fontSize >= 24}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Font Family
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setSetting("fontFamily", e.target.value)}
          className="px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Size */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Tab Size
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSetting("tabSize", 2)}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              tabSize === 2
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            2
          </button>
          <button
            onClick={() => setSetting("tabSize", 4)}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              tabSize === 4
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            4
          </button>
        </div>
      </div>
    </div>
  );
}

function PracticeTab() {
  const defaultSessionSize = useSettingsStore((s) => s.defaultSessionSize);
  const targetTimeMs = useSettingsStore((s) => s.targetTimeMs);
  const autoRunTests = useSettingsStore((s) => s.autoRunTests);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const targetMinutes = Math.round(targetTimeMs / 60000);

  return (
    <div className="flex flex-col gap-6">
      {/* Default Session Size */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Default Session Size
        </label>
        <div className="flex gap-2">
          {SESSION_SIZE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSetting("defaultSessionSize", n)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                defaultSessionSize === n
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Target Time */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Target Time Per Kata (minutes){" "}
          <span className="text-zinc-500">(0 = disabled)</span>
        </label>
        <input
          type="number"
          min={0}
          value={targetMinutes}
          onChange={(e) => {
            const mins = Math.max(0, parseInt(e.target.value) || 0);
            setSetting("targetTimeMs", mins * 60000);
          }}
          className="w-24 px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* Auto-run Tests */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Auto-run Tests on Save
        </label>
        <button
          onClick={() => setSetting("autoRunTests", !autoRunTests)}
          className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            autoRunTests
              ? "bg-green-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          {autoRunTests ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}

function ShortcutsTab() {
  const shortcuts = useSettingsStore((s) => s.shortcuts);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [recording, setRecording] = useState<ShortcutAction | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!recording) return;
      e.preventDefault();
      e.stopPropagation();

      // Ignore standalone modifier keys
      if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;

      const parts: string[] = [];
      if (e.metaKey) parts.push("Meta");
      if (e.ctrlKey) parts.push("Control");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);

      const combo = parts.join("+");
      const updated = { ...shortcuts, [recording]: combo };
      setSetting("shortcuts", updated);
      setRecording(null);
    },
    [recording, shortcuts, setSetting]
  );

  useEffect(() => {
    if (!recording) return;
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [recording, handleKeyDown]);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await setSetting("shortcuts", { ...DEFAULT_SHORTCUTS });
    setConfirmReset(false);
  };

  const actions = Object.keys(SHORTCUT_LABELS) as ShortcutAction[];

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-2 font-medium">Action</th>
            <th className="pb-2 font-medium">Shortcut</th>
            <th className="pb-2 font-medium w-28">Edit</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr
              key={action}
              ref={recording === action ? rowRef : undefined}
              className="border-b border-zinc-100 dark:border-zinc-800/50"
            >
              <td className="py-2.5 font-medium">
                {SHORTCUT_LABELS[action]}
              </td>
              <td className="py-2.5 font-mono text-zinc-500 dark:text-zinc-400">
                {formatCombo(shortcuts[action])}
              </td>
              <td className="py-2.5">
                <button
                  onClick={() =>
                    setRecording(recording === action ? null : action)
                  }
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    recording === action
                      ? "bg-yellow-600 text-white animate-pulse"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  }`}
                >
                  {recording === action ? "Press keys..." : "Edit"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleReset}
        className={`self-start px-4 py-1.5 text-sm font-medium rounded transition-colors ${
          confirmReset
            ? "bg-red-600 text-white hover:bg-red-500"
            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
        }`}
      >
        {confirmReset ? "Confirm Reset Shortcuts" : "Reset to Defaults"}
      </button>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const loaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [tab, setTab] = useState<Tab>("editor");

  useEffect(() => {
    if (!loaded) loadSettings();
  }, [loaded, loadSettings]);

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t transition-colors ${
      tab === t
        ? "bg-blue-600 text-white"
        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
    }`;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Back
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button onClick={() => setTab("editor")} className={tabClass("editor")}>
          Editor
        </button>
        <button onClick={() => setTab("practice")} className={tabClass("practice")}>
          Practice
        </button>
        <button onClick={() => setTab("shortcuts")} className={tabClass("shortcuts")}>
          Shortcuts
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === "editor" && <EditorTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "shortcuts" && <ShortcutsTab />}
      </div>
    </div>
  );
}
