import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSettingsStore, DEFAULT_SHORTCUTS } from "../stores/settings-store";
import type { ShortcutAction } from "../stores/settings-store";
import { reseedKatas } from "../lib/database";
import { APP_THEMES } from "../lib/editor-themes";
import { useKataStore } from "../stores/kata-store";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-base-content/35 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

function EditorTab() {
  const theme = useSettingsStore((s) => s.theme);
  const vimMode = useSettingsStore((s) => s.vimMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const tabSize = useSettingsStore((s) => s.tabSize);
  const language = useSettingsStore((s) => s.language);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const editorAutocomplete = useSettingsStore((s) => s.editorAutocomplete);
  const lineNumbersMode = useSettingsStore((s) => s.lineNumbersMode);
  const wordWrap = useSettingsStore((s) => s.wordWrap);
  const autoClosingBrackets = useSettingsStore((s) => s.autoClosingBrackets);
  const fontLigatures = useSettingsStore((s) => s.fontLigatures);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel>Language</SectionLabel>
        <div className="join">
          <button
            onClick={() => setSetting("language", "javascript")}
            className={`btn btn-sm join-item ${language === "javascript" ? "btn-primary" : "btn-ghost"}`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setSetting("language", "ruby")}
            className={`btn btn-sm join-item ${language === "ruby" ? "btn-primary" : "btn-ghost"}`}
          >
            Ruby
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Theme</SectionLabel>
        <select
          value={theme}
          onChange={(e) => setSetting("theme", e.target.value)}
          className="select select-bordered select-sm bg-base-100"
        >
          {APP_THEMES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <SectionLabel>Vim Mode</SectionLabel>
        <button
          onClick={() => setSetting("vimMode", !vimMode)}
          className={`btn btn-sm ${vimMode ? "btn-success" : "btn-ghost"}`}
        >
          {vimMode ? "On" : "Off"}
        </button>
      </div>

      <div>
        <SectionLabel>Font Size</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))}
            disabled={fontSize <= 10}
            className="btn btn-sm btn-square btn-ghost"
          >
            -
          </button>
          <span className="text-sm font-mono font-semibold w-6 text-center tabular-nums">
            {fontSize}
          </span>
          <button
            onClick={() => setSetting("fontSize", Math.min(24, fontSize + 1))}
            disabled={fontSize >= 24}
            className="btn btn-sm btn-square btn-ghost"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Font Family</SectionLabel>
        <select
          value={fontFamily}
          onChange={(e) => setSetting("fontFamily", e.target.value)}
          className="select select-bordered select-sm bg-base-100"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <SectionLabel>Tab Size</SectionLabel>
        <div className="join">
          <button
            onClick={() => setSetting("tabSize", 2)}
            className={`btn btn-sm join-item ${tabSize === 2 ? "btn-primary" : "btn-ghost"}`}
          >
            2
          </button>
          <button
            onClick={() => setSetting("tabSize", 4)}
            className={`btn btn-sm join-item ${tabSize === 4 ? "btn-primary" : "btn-ghost"}`}
          >
            4
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Line Numbers</SectionLabel>
        <div className="join">
          {(["on", "off", "relative"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSetting("lineNumbersMode", mode)}
              className={`btn btn-sm join-item ${lineNumbersMode === mode ? "btn-primary" : "btn-ghost"}`}
            >
              {mode === "relative" ? "Relative (vim)" : mode === "on" ? "On" : "Off"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Autocomplete</SectionLabel>
        <button
          onClick={() => setSetting("editorAutocomplete", !editorAutocomplete)}
          className={`btn btn-sm ${editorAutocomplete ? "btn-success" : "btn-ghost"}`}
        >
          {editorAutocomplete ? "On" : "Off"}
        </button>
        <p className="text-[11px] text-base-content/40 mt-1.5">
          Turn off to practice API recall without suggestions.
        </p>
      </div>

      <div>
        <SectionLabel>Word Wrap</SectionLabel>
        <button
          onClick={() => setSetting("wordWrap", !wordWrap)}
          className={`btn btn-sm ${wordWrap ? "btn-success" : "btn-ghost"}`}
        >
          {wordWrap ? "On" : "Off"}
        </button>
      </div>

      <div>
        <SectionLabel>Auto-Closing Brackets</SectionLabel>
        <button
          onClick={() => setSetting("autoClosingBrackets", !autoClosingBrackets)}
          className={`btn btn-sm ${autoClosingBrackets ? "btn-success" : "btn-ghost"}`}
        >
          {autoClosingBrackets ? "On" : "Off"}
        </button>
      </div>

      <div>
        <SectionLabel>Font Ligatures</SectionLabel>
        <button
          onClick={() => setSetting("fontLigatures", !fontLigatures)}
          className={`btn btn-sm ${fontLigatures ? "btn-success" : "btn-ghost"}`}
        >
          {fontLigatures ? "On" : "Off"}
        </button>
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
  const language = useSettingsStore((s) => s.language);
  const navigate = useNavigate();
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<string | null>(null);

  async function handleReseed() {
    setReseeding(true);
    setReseedMsg(null);
    try {
      const msg = await reseedKatas();
      await useKataStore.getState().loadKatas(language);
      setReseedMsg(msg);
    } catch (e) {
      setReseedMsg(String(e));
    } finally {
      setReseeding(false);
    }
  }

  const targetMinutes = Math.round(targetTimeMs / 60000);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel>Kata Library</SectionLabel>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="btn btn-ghost btn-sm text-xs gap-1 self-start"
          >
            {reseeding ? "Reseeding..." : "Reload Problem Statements"}
          </button>
          {reseedMsg && (
            <p className="text-[11px] text-base-content/50">{reseedMsg}</p>
          )}
        </div>
      </div>

      <div>
        <SectionLabel>Custom Katas</SectionLabel>
        <button
          onClick={() => navigate("/kata/new")}
          className="btn btn-ghost btn-sm text-xs gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          New Kata
        </button>
      </div>

      <div>
        <SectionLabel>Default Session Size</SectionLabel>
        <div className="join">
          {SESSION_SIZE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSetting("defaultSessionSize", n)}
              className={`btn btn-sm join-item ${defaultSessionSize === n ? "btn-primary" : "btn-ghost"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>
          Target Time Per Kata (min)
          <span className="text-base-content/20 ml-1 normal-case">(0 = disabled)</span>
        </SectionLabel>
        <input
          type="number"
          min={0}
          value={targetMinutes}
          onChange={(e) => {
            const mins = Math.max(0, parseInt(e.target.value) || 0);
            setSetting("targetTimeMs", mins * 60000);
          }}
          className="input input-bordered input-sm w-24 bg-base-100"
        />
      </div>

      <div>
        <SectionLabel>Auto-run Tests on Save</SectionLabel>
        <button
          onClick={() => setSetting("autoRunTests", !autoRunTests)}
          className={`btn btn-sm ${autoRunTests ? "btn-success" : "btn-ghost"}`}
        >
          {autoRunTests ? "On" : "Off"}
        </button>
      </div>

      <div>
        <SectionLabel>Hide Problem in Sessions</SectionLabel>
        <button
          onClick={() => setSetting("hideDescriptionInSession", !hideDescriptionInSession)}
          className={`btn btn-sm ${hideDescriptionInSession ? "btn-success" : "btn-ghost"}`}
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
      <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden">
        <table className="table table-sm">
          <thead>
            <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
              <th className="font-semibold">Action</th>
              <th className="font-semibold">Shortcut</th>
              <th className="font-semibold w-28">Edit</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr
                key={action}
                ref={recording === action ? rowRef : undefined}
                className="border-base-300/30"
              >
                <td className="font-medium text-sm">{SHORTCUT_LABELS[action]}</td>
                <td className="font-mono text-base-content/50 text-sm">
                  {formatCombo(shortcuts[action])}
                </td>
                <td>
                  <button
                    onClick={() => setRecording(recording === action ? null : action)}
                    className={`btn btn-xs ${
                      recording === action
                        ? "btn-warning animate-pulse"
                        : "btn-ghost"
                    }`}
                  >
                    {recording === action ? "Press keys..." : "Edit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleReset}
        className={`btn btn-sm self-start ${confirmReset ? "btn-error" : "btn-ghost"}`}
      >
        {confirmReset ? "Confirm Reset" : "Reset to Defaults"}
      </button>
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

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
        Loading settings...
      </div>
    );
  }

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
      tab === t
        ? "bg-base-100 text-base-content shadow-sm"
        : "text-base-content/35 hover:text-base-content/60"
    }`;

  return (
    <div className="flex flex-col h-full p-5 gap-5 overflow-y-auto animate-fade-in">
      <h1 className="text-lg font-bold">Settings</h1>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-base-300/40 rounded-lg p-1 self-start">
        <button onClick={() => setTab("editor")} className={tabClass("editor")}>Editor</button>
        <button onClick={() => setTab("practice")} className={tabClass("practice")}>Practice</button>
        <button onClick={() => setTab("shortcuts")} className={tabClass("shortcuts")}>Shortcuts</button>
      </div>

      <div className="flex-1 min-h-0">
        {tab === "editor" && <EditorTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "shortcuts" && <ShortcutsTab />}
      </div>
    </div>
  );
}
