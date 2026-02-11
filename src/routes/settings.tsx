import { useState, useEffect, useRef, useCallback } from "react";
import { useSettingsStore, DEFAULT_SHORTCUTS } from "../stores/settings-store";
import type { ShortcutAction } from "../stores/settings-store";

type Tab = "editor" | "practice" | "shortcuts" | "license";

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
  const language = useSettingsStore((s) => s.language);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div className="flex flex-col gap-6">
      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Language
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSetting("language", "javascript")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              language === "javascript"
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setSetting("language", "python")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              language === "python"
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            Python
          </button>
        </div>
      </div>

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
  const hideDescriptionInSession = useSettingsStore((s) => s.hideDescriptionInSession);
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

      {/* Hide Problem in Sessions */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Hide Problem in Sessions
        </label>
        <button
          onClick={() => setSetting("hideDescriptionInSession", !hideDescriptionInSession)}
          className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            hideDescriptionInSession
              ? "bg-green-600 text-white"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          {hideDescriptionInSession ? "On" : "Off"}
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

function LicenseTab() {
  const isPremium = useSettingsStore((s) => s.isPremium);
  const licenseKey = useSettingsStore((s) => s.licenseKey);
  const activatedAt = useSettingsStore((s) => s.activatedAt);
  const activateLicense = useSettingsStore((s) => s.activateLicense);
  const [key, setKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!key.trim()) {
      setError("Please enter a license key");
      return;
    }
    setActivating(true);
    setError(null);
    setSuccess(false);
    const result = await activateLicense(key.trim());
    setActivating(false);
    if (result.success) {
      setSuccess(true);
      setKey("");
    } else {
      setError(result.error || "Activation failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isPremium ? (
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            License Status
          </label>
          <div className="px-4 py-3 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Premium License Active</span>
            </div>
            <div className="mt-2 text-xs opacity-75">
              Activated: {activatedAt ? new Date(activatedAt).toLocaleDateString() : "Unknown"}
            </div>
            {licenseKey && (
              <div className="mt-1 text-xs opacity-75 font-mono">
                Key: {licenseKey.slice(0, 4)}...{licenseKey.slice(-4)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Enter License Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="flex-1 px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
              />
              <button
                onClick={handleActivate}
                disabled={activating}
                className="px-4 py-1.5 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
              >
                {activating ? "Activating..." : "Activate"}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                License activated successfully!
              </div>
            )}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <p className="mb-2">Premium features include:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Create custom katas</li>
              <li>Import/export kata libraries</li>
              <li>Progressive hints system</li>
              <li>Code history browser</li>
              <li>Advanced analytics</li>
            </ul>
            <p className="mt-4 text-xs">
              Don't have a license?{" "}
              <a
                href="https://katadesktop.com/buy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 underline"
              >
                Purchase here
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function SettingsPage() {
  const loaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [tab, setTab] = useState<Tab>("editor");

  useEffect(() => {
    if (!loaded) loadSettings();
  }, [loaded, loadSettings]);

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
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
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={() => setTab("editor")} className={tabClass("editor")}>
          Editor
        </button>
        <button onClick={() => setTab("practice")} className={tabClass("practice")}>
          Practice
        </button>
        <button onClick={() => setTab("shortcuts")} className={tabClass("shortcuts")}>
          Shortcuts
        </button>
        <button onClick={() => setTab("license")} className={tabClass("license")}>
          License
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === "editor" && <EditorTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "shortcuts" && <ShortcutsTab />}
        {tab === "license" && <LicenseTab />}
      </div>
    </div>
  );
}
