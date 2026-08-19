import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Code2, Database, Dumbbell, Keyboard, Plus } from "lucide-react";
import { useSettingsStore, DEFAULT_SHORTCUTS } from "../stores/settings-store";
import type { ShortcutAction } from "../stores/settings-store";
import { confirm } from "@tauri-apps/plugin-dialog";
import { reseedKatas, resetAllProgress } from "../lib/database";
import { APP_THEMES } from "../lib/editor-themes";
import { EDITOR_TOGGLES } from "../lib/editor-settings";
import { formatUiScale, UI_SCALE_OPTIONS } from "../lib/ui-scale";
import { useKataStore } from "../stores/kata-store";
import { toast } from "../stores/toast-store";

type Tab = "editor" | "practice" | "data" | "shortcuts";

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
  toggleRepl: "Open REPL",
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  resetZoom: "Actual Size",
  openSettings: "Open Settings",
  openCommandPalette: "Open Command Palette",
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
        case "=":
          return "+";
        default:
          return part;
      }
    })
    .join(" ");
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/35">
      {children}
    </h2>
  );
}

function PreferenceGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-base-300/50 bg-base-100/70">
      {children}
    </div>
  );
}

interface PreferenceRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function PreferenceRow({ label, hint, children }: PreferenceRowProps) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-5 border-b border-base-300/40 px-4 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-base-content/85">{label}</div>
        {hint && <div className="mt-0.5 text-xs leading-snug text-base-content/40">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center justify-end">{children}</div>
    </div>
  );
}

interface SettingsToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingsToggle({ label, hint, checked, onChange }: SettingsToggleProps) {
  return (
    <PreferenceRow label={label} hint={hint}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="toggle toggle-primary toggle-sm"
      />
    </PreferenceRow>
  );
}

function EditorTab() {
  const theme = useSettingsStore((s) => s.theme);
  const vimMode = useSettingsStore((s) => s.vimMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const uiScale = useSettingsStore((s) => s.uiScale);
  const tabSize = useSettingsStore((s) => s.tabSize);
  const language = useSettingsStore((s) => s.language);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const settings = useSettingsStore();
  const lineNumbersMode = useSettingsStore((s) => s.lineNumbersMode);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <section className="space-y-2">
        <SectionTitle>General</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Language" hint="Default language for new practice work.">
            <div className="join">
              <button
                onClick={() => setSetting("language", "javascript")}
                className={`btn btn-xs join-item ${language === "javascript" ? "btn-primary" : "btn-ghost"}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setSetting("language", "python")}
                className={`btn btn-xs join-item ${language === "python" ? "btn-primary" : "btn-ghost"}`}
              >
                Python
              </button>
              <button
                onClick={() => setSetting("language", "java")}
                className={`btn btn-xs join-item ${language === "java" ? "btn-primary" : "btn-ghost"}`}
              >
                Java
              </button>
            </div>
          </PreferenceRow>
          <PreferenceRow label="Theme">
            <select
              value={theme}
              onChange={(e) => setSetting("theme", e.target.value)}
              className="select select-bordered select-xs w-44 bg-base-100"
            >
              {APP_THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </PreferenceRow>
          <PreferenceRow label="Interface Size" hint="Scales the app chrome without changing editor font size.">
            <div className="join">
              {UI_SCALE_OPTIONS.map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSetting("uiScale", scale)}
                  className={`btn btn-xs join-item ${uiScale === scale ? "btn-primary" : "btn-ghost"}`}
                >
                  {formatUiScale(scale)}
                </button>
              ))}
            </div>
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <SectionTitle>Editor</SectionTitle>
        <PreferenceGroup>
          <SettingsToggle
            label="Vim Mode"
            hint="Use Vim keybindings in Monaco."
            checked={vimMode}
            onChange={(checked) => setSetting("vimMode", checked)}
          />
          <PreferenceRow label="Font Size">
            <div className="join">
              <button
                onClick={() => setSetting("fontSize", Math.max(10, fontSize - 1))}
                disabled={fontSize <= 10}
                className="btn btn-xs btn-square join-item btn-ghost"
                aria-label="Decrease font size"
              >
                -
              </button>
              <div className="flex h-6 w-9 items-center justify-center border-y border-base-300/60 bg-base-200 font-mono text-xs tabular-nums">
                {fontSize}
              </div>
              <button
                onClick={() => setSetting("fontSize", Math.min(24, fontSize + 1))}
                disabled={fontSize >= 24}
                className="btn btn-xs btn-square join-item btn-ghost"
                aria-label="Increase font size"
              >
                +
              </button>
            </div>
          </PreferenceRow>
          <PreferenceRow label="Font Family">
            <select
              value={fontFamily}
              onChange={(e) => setSetting("fontFamily", e.target.value)}
              className="select select-bordered select-xs w-52 bg-base-100"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </PreferenceRow>
          <PreferenceRow label="Tab Size">
            <div className="join">
              {[2, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => setSetting("tabSize", size)}
                  className={`btn btn-xs join-item ${tabSize === size ? "btn-primary" : "btn-ghost"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </PreferenceRow>
          <PreferenceRow label="Line Numbers">
            <div className="join">
              {(["on", "off", "relative"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSetting("lineNumbersMode", mode)}
                  className={`btn btn-xs join-item ${lineNumbersMode === mode ? "btn-primary" : "btn-ghost"}`}
                >
                  {mode === "relative" ? "Relative" : mode === "on" ? "On" : "Off"}
                </button>
              ))}
            </div>
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <SectionTitle>Behavior</SectionTitle>
        <PreferenceGroup>
          {EDITOR_TOGGLES.map(({ key, label, hint }) => (
            <SettingsToggle
              key={key}
              label={label}
              hint={hint}
              checked={settings[key]}
              onChange={(checked) => setSetting(key, checked)}
            />
          ))}
        </PreferenceGroup>
      </section>
    </div>
  );
}

function PracticeTab() {
  const defaultSessionSize = useSettingsStore((s) => s.defaultSessionSize);
  const targetTimeMs = useSettingsStore((s) => s.targetTimeMs);
  const sessionTimeLimitMs = useSettingsStore((s) => s.sessionTimeLimitMs);
  const autoRunTests = useSettingsStore((s) => s.autoRunTests);
  const hideDescriptionInSession = useSettingsStore((s) => s.hideDescriptionInSession);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const targetMinutes = Math.round(targetTimeMs / 60000);
  const timeLimitMinutes = Math.round(sessionTimeLimitMs / 60000);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <section className="space-y-2">
        <SectionTitle>Queue Defaults</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Default Session Size">
            <div className="join">
              {SESSION_SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSetting("defaultSessionSize", n)}
                  className={`btn btn-xs join-item ${defaultSessionSize === n ? "btn-primary" : "btn-ghost"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </PreferenceRow>
          <PreferenceRow label="Problem Time Limit" hint="Minutes per problem. Use 0 for no limit.">
            <input
              type="number"
              min={0}
              value={timeLimitMinutes}
              onChange={(e) => {
                const mins = Math.max(0, parseInt(e.target.value) || 0);
                setSetting("sessionTimeLimitMs", mins * 60000);
              }}
              className="input input-bordered input-xs w-20 bg-base-100 text-right"
            />
          </PreferenceRow>
          <PreferenceRow label="Target Time Per Kata" hint="Used for pacing and progress feedback.">
            <input
              type="number"
              min={0}
              value={targetMinutes}
              onChange={(e) => {
                const mins = Math.max(0, parseInt(e.target.value) || 0);
                setSetting("targetTimeMs", mins * 60000);
              }}
              className="input input-bordered input-xs w-20 bg-base-100 text-right"
            />
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <SectionTitle>Session Behavior</SectionTitle>
        <PreferenceGroup>
          <SettingsToggle
            label="Auto-run Tests on Save"
            checked={autoRunTests}
            onChange={(checked) => setSetting("autoRunTests", checked)}
          />
          <SettingsToggle
            label="Hide Problem in Sessions"
            hint="Practice from memory by hiding the prompt during sessions."
            checked={hideDescriptionInSession}
            onChange={(checked) => setSetting("hideDescriptionInSession", checked)}
          />
        </PreferenceGroup>
      </section>
    </div>
  );
}

function DataTab() {
  const language = useSettingsStore((s) => s.language);
  const navigate = useNavigate();
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<string | null>(null);
  const [resettingAll, setResettingAll] = useState(false);
  const [resetAllMsg, setResetAllMsg] = useState<string | null>(null);

  async function handleReseed() {
    setReseeding(true);
    setReseedMsg(null);
    try {
      const msg = await reseedKatas();
      await useKataStore.getState().loadKatas(language);
      setReseedMsg(msg);
      toast.success(msg || "Problem statements reloaded");
    } catch (e) {
      setReseedMsg(String(e));
      toast.error("Could not reload problem statements");
    } finally {
      setReseeding(false);
    }
  }

  async function handleResetAllProgress() {
    const ok = await confirm("Reset progress for every kata? This clears all best times and streaks.", {
      title: "Reset All Progress",
      kind: "warning",
    });
    if (!ok) return;
    setResettingAll(true);
    setResetAllMsg(null);
    try {
      await resetAllProgress();
      await useKataStore.getState().loadKatas(language);
      setResetAllMsg("All progress reset.");
      toast.success("All progress reset");
    } catch (e) {
      setResetAllMsg(String(e));
      toast.error("Could not reset progress");
    } finally {
      setResettingAll(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <section className="space-y-2">
        <SectionTitle>Kata Library</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Reload Problem Statements" hint={reseedMsg ?? "Refresh seeded kata content for the selected language."}>
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="btn btn-xs btn-ghost"
            >
              {reseeding ? "Reloading..." : "Reload"}
            </button>
          </PreferenceRow>
          <PreferenceRow label="New Kata">
            <button
              onClick={() => navigate("/kata/new")}
              className="btn btn-xs btn-ghost gap-1.5"
            >
              <Plus size={14} />
              New
            </button>
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <SectionTitle>Danger Zone</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Reset All Progress" hint={resetAllMsg ?? "Clears best times, streaks, and completion history."}>
            <button
              onClick={handleResetAllProgress}
              disabled={resettingAll}
              className="btn btn-xs btn-ghost text-error hover:bg-error/10"
            >
              {resettingAll ? "Resetting..." : "Reset"}
            </button>
          </PreferenceRow>
        </PreferenceGroup>
      </section>
    </div>
  );
}

function ShortcutsTab() {
  const shortcuts = useSettingsStore((s) => s.shortcuts);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [recording, setRecording] = useState<ShortcutAction | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <section className="space-y-2">
        <SectionTitle>Keyboard Shortcuts</SectionTitle>
        <PreferenceGroup>
          {actions.map((action) => (
            <div
              key={action}
              ref={recording === action ? rowRef : undefined}
              className="flex min-h-12 items-center justify-between gap-5 border-b border-base-300/40 px-4 py-2.5 last:border-b-0"
            >
              <div className="text-sm font-medium text-base-content/85">
                {SHORTCUT_LABELS[action]}
              </div>
              <div className="flex items-center gap-3">
                <kbd className="kbd kbd-sm min-w-20 justify-center bg-base-200 font-mono text-xs text-base-content/60">
                  {formatCombo(shortcuts[action])}
                </kbd>
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
              </div>
            </div>
          ))}
        </PreferenceGroup>
      </section>

      <button
        onClick={handleReset}
        className={`btn btn-xs self-start ${confirmReset ? "btn-error" : "btn-ghost"}`}
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
      <div className="flex h-full items-center justify-center text-sm text-base-content/30">
        Loading settings...
      </div>
    );
  }

  const navItems = [
    { key: "editor" as const, label: "Editor", icon: Code2 },
    { key: "practice" as const, label: "Practice", icon: Dumbbell },
    { key: "data" as const, label: "Data", icon: Database },
    { key: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
  ];

  return (
    <div className="flex h-full animate-fade-in overflow-hidden bg-base-200">
      <aside className="w-56 shrink-0 border-r border-base-300/60 bg-base-300/25 px-3 py-4">
        <h1 className="mb-4 px-2 text-base font-semibold text-base-content/85">Settings</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors ${
                tab === key
                  ? "bg-primary text-primary-content"
                  : "text-base-content/60 hover:bg-base-100/70 hover:text-base-content"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
        {tab === "editor" && <EditorTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "data" && <DataTab />}
        {tab === "shortcuts" && <ShortcutsTab />}
      </main>
    </div>
  );
}
