import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, BotMessageSquare, CheckCircle2, Code2, Database, Dumbbell, Keyboard, Plus, RotateCcw } from "lucide-react";
import { useSettingsStore, DEFAULT_SHORTCUTS } from "../stores/settings-store";
import type { ShortcutAction } from "../stores/settings-store";
import { reseedKatas, resetAllProgress } from "../lib/database";
import { confirmAction } from "../lib/confirm-action";
import { APP_THEMES } from "../lib/editor-themes";
import { EDITOR_TOGGLES } from "../lib/editor-settings";
import { formatUiScale, UI_SCALE_OPTIONS } from "../lib/ui-scale";
import { DEFAULT_AGENT_SYSTEM_PROMPT } from "../lib/agent-bridge";
import { useKataStore } from "../stores/kata-store";
import { toast } from "../stores/toast-store";

type Tab = "editor" | "agent" | "practice" | "library" | "shortcuts";

const FONT_OPTIONS = [
  "JetBrains Mono, monospace",
  "Fira Code, monospace",
  "Menlo, monospace",
  "Monaco, monospace",
  "monospace",
];

const SESSION_SIZE_OPTIONS = [5, 10, 15, 20];
const SEGMENTED_INACTIVE_CLASS = "kata-btn-secondary";

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
    <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
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

function formatSavedAt(timestamp: number | null): string {
  if (!timestamp) return "Not saved yet";
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function SettingsSaveIndicator() {
  const saveStatus = useSettingsStore((s) => s.saveStatus);
  const lastSavedAt = useSettingsStore((s) => s.lastSavedAt);
  const saveError = useSettingsStore((s) => s.saveError);

  if (saveStatus === "error") {
    return (
      <div className="flex max-w-sm items-center gap-2 rounded-md border border-error/35 bg-error/10 px-2.5 py-1.5 text-xs text-error">
        <AlertTriangle size={14} />
        <span className="truncate" title={saveError ?? undefined}>
          Settings could not be saved
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-base-300/50 bg-base-100/70 px-2.5 py-1.5 text-xs text-base-content/45">
      <CheckCircle2 size={14} className={saveStatus === "saving" ? "text-warning" : "text-success"} />
      <span>
        {saveStatus === "saving" ? "Saving locally..." : `Saved locally ${formatSavedAt(lastSavedAt)}`}
      </span>
    </div>
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
          <PreferenceRow label="Language" hint="Chooses the kata library used across practice, problems, and progress.">
            <div className="join">
              <button
                onClick={() => setSetting("language", "javascript")}
                className={`btn btn-xs join-item ${language === "javascript" ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setSetting("language", "python")}
                className={`btn btn-xs join-item ${language === "python" ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
              >
                Python
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
                  className={`btn btn-xs join-item ${uiScale === scale ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
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
                className="btn btn-xs btn-square join-item kata-btn-secondary"
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
                className="btn btn-xs btn-square join-item kata-btn-secondary"
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
                  className={`btn btn-xs join-item ${tabSize === size ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
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
                  className={`btn btn-xs join-item ${lineNumbersMode === mode ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
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

function AgentTab() {
  const agentProvider = useSettingsStore((s) => s.agentProvider);
  const agentSystemPrompt = useSettingsStore((s) => s.agentSystemPrompt);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const isDefaultPrompt = agentSystemPrompt === DEFAULT_AGENT_SYSTEM_PROMPT;
  const handleResetPrompt = async () => {
    if (isDefaultPrompt) return;
    const ok = await confirmAction({
      message: "Reset your assistant instructions to the default prompt? Your custom prompt text will be replaced.",
      title: "Reset Assistant Prompt",
      kind: "warning",
      okLabel: "Reset",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    await setSetting("agentSystemPrompt", DEFAULT_AGENT_SYSTEM_PROMPT);
    toast.success("Assistant prompt reset");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <section className="space-y-2">
        <SectionTitle>Assistant</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Default Assistant" hint="The editor Assist tab launches this helper for the current kata.">
            <div className="join">
              <button
                onClick={() => setSetting("agentProvider", "codex")}
                className={`btn btn-xs join-item ${agentProvider === "codex" ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
              >
                Codex
              </button>
              <button
                onClick={() => setSetting("agentProvider", "claude")}
                className={`btn btn-xs join-item ${agentProvider === "claude" ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
              >
                Claude
              </button>
            </div>
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3 px-1">
          <SectionTitle>System Prompt</SectionTitle>
          <button
            onClick={() => { void handleResetPrompt(); }}
            disabled={isDefaultPrompt}
            className="btn btn-xs kata-btn-secondary gap-1.5"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
        <div className="rounded-md border border-base-300/50 bg-base-100/70 p-3">
          <textarea
            value={agentSystemPrompt}
            onChange={(event) => setSetting("agentSystemPrompt", event.currentTarget.value)}
            className="textarea textarea-bordered min-h-72 w-full resize-y bg-base-100 font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
          <p className="mt-2 text-xs leading-snug text-base-content/40">
            This instruction is prepended when the assistant receives the current problem, editor code, visible cases, latest failures, and notes.
          </p>
        </div>
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
                  className={`btn btn-xs join-item ${defaultSessionSize === n ? "btn-primary" : SEGMENTED_INACTIVE_CLASS}`}
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
    const ok = await confirmAction({
      message: "Reset progress for every kata? This clears all best times and streaks.",
      title: "Reset All Progress",
      kind: "warning",
      okLabel: "Reset",
      cancelLabel: "Cancel",
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
        <SectionTitle>Library Maintenance</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Reload Problem Statements" hint={reseedMsg ?? "Refresh seeded kata content for the selected language."}>
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="btn btn-xs kata-btn-secondary"
            >
              {reseeding ? "Reloading..." : "Reload"}
            </button>
          </PreferenceRow>
          <PreferenceRow label="Create Custom Kata" hint="Add your own problem, tests, and reference solution.">
            <button
              onClick={() => navigate("/kata/new")}
              className="btn btn-xs kata-btn-secondary gap-1.5"
            >
              <Plus size={14} />
              Create
            </button>
          </PreferenceRow>
        </PreferenceGroup>
      </section>

      <section className="space-y-2">
        <SectionTitle>Progress Records</SectionTitle>
        <PreferenceGroup>
          <PreferenceRow label="Reset All Progress" hint={resetAllMsg ?? "Clears best times, streaks, and completion history."}>
            <button
              onClick={handleResetAllProgress}
              disabled={resettingAll}
              className="btn btn-xs kata-btn-danger-secondary"
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
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!recording) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setRecording(null);
        setShortcutError(null);
        return;
      }
      if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;
      const parts: string[] = [];
      if (e.metaKey) parts.push("Meta");
      if (e.ctrlKey) parts.push("Control");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      if (parts.length === 0 && e.key.length === 1) {
        setShortcutError("Use at least one modifier key for letter and number shortcuts.");
        return;
      }
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
      const combo = parts.join("+");
      const duplicate = (Object.entries(shortcuts) as [ShortcutAction, string][])
        .find(([action, currentCombo]) => action !== recording && currentCombo === combo);
      if (duplicate) {
        const ok = await confirmAction({
          message: `${formatCombo(combo)} is already assigned to ${SHORTCUT_LABELS[duplicate[0]]}. Replace it?`,
          title: "Replace Shortcut",
          kind: "warning",
          okLabel: "Replace",
          cancelLabel: "Cancel",
        });
        if (!ok) return;
      }
      const updated = duplicate
        ? { ...shortcuts, [duplicate[0]]: shortcuts[recording], [recording]: combo }
        : { ...shortcuts, [recording]: combo };
      await setSetting("shortcuts", updated);
      setRecording(null);
      setShortcutError(null);
      toast.success(`${SHORTCUT_LABELS[recording]} shortcut updated`);
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
    setShortcutError(null);
    toast.success("Shortcuts reset to defaults");
  };

  const resetShortcut = async (action: ShortcutAction) => {
    await setSetting("shortcuts", { ...shortcuts, [action]: DEFAULT_SHORTCUTS[action] });
    if (recording === action) setRecording(null);
    setShortcutError(null);
    toast.success(`${SHORTCUT_LABELS[action]} reset`);
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
              className="flex min-h-12 flex-wrap items-center justify-between gap-x-5 gap-y-1 border-b border-base-300/40 px-4 py-2.5 last:border-b-0"
            >
              <div className="text-sm font-medium text-base-content/85">
                {SHORTCUT_LABELS[action]}
              </div>
              <div className="flex items-center gap-3">
                <kbd className="kbd kbd-sm min-w-20 justify-center bg-base-200 font-mono text-xs text-base-content/60">
                  {formatCombo(shortcuts[action])}
                </kbd>
                <button
                  onClick={() => { void resetShortcut(action); }}
                  disabled={shortcuts[action] === DEFAULT_SHORTCUTS[action]}
                  className="btn btn-xs btn-square kata-btn-secondary"
                  title={`Reset ${SHORTCUT_LABELS[action]} to ${formatCombo(DEFAULT_SHORTCUTS[action])}`}
                  aria-label={`Reset ${SHORTCUT_LABELS[action]} shortcut`}
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => {
                    setShortcutError(null);
                    setRecording(recording === action ? null : action);
                  }}
                  className={`btn btn-xs ${
                    recording === action
                      ? "btn-warning animate-pulse"
                      : "kata-btn-secondary"
                  }`}
                >
                  {recording === action ? "Press keys" : "Edit"}
                </button>
              </div>
              {recording === action && (
                <div className="basis-full text-xs text-base-content/40">
                  Press a shortcut with a modifier, or Esc to cancel.
                </div>
              )}
            </div>
          ))}
        </PreferenceGroup>
        {shortcutError && (
          <div className="px-1 text-xs text-warning">
            {shortcutError}
          </div>
        )}
      </section>

      <button
        onClick={handleReset}
        className={`btn btn-xs self-start ${confirmReset ? "btn-error" : "kata-btn-secondary"}`}
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
    { key: "agent" as const, label: "Assistant", icon: BotMessageSquare },
    { key: "practice" as const, label: "Practice Flow", icon: Dumbbell },
    { key: "library" as const, label: "Library & Progress", icon: Database },
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
              aria-current={tab === key ? "page" : undefined}
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
        <div className="mx-auto mb-5 flex w-full max-w-3xl items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-base-content/40">Configuration</div>
            <h2 className="text-lg font-semibold text-base-content/90">
              {navItems.find((item) => item.key === tab)?.label}
            </h2>
          </div>
          <SettingsSaveIndicator />
        </div>
        {tab === "editor" && <EditorTab />}
        {tab === "agent" && <AgentTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "library" && <DataTab />}
        {tab === "shortcuts" && <ShortcutsTab />}
      </main>
    </div>
  );
}
