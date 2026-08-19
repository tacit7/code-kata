import { useEffect, useRef, useState } from "react";
import { replEval, resetRepl, type ReplEvalResult } from "../lib/repl-runner";

interface Entry {
  input?: string;
  result?: ReplEvalResult;
  info?: string;
  /** Dimmed rendering for bookkeeping entries like "(editor code loaded)". */
  muted?: boolean;
}

export interface ReplSeed {
  /** Expression to pre-fill (not auto-run) after loading the editor code. */
  expression: string;
  /** Changes on every send so repeated clicks re-trigger the effect. */
  nonce: number;
}

interface ReplPanelProps {
  language: string;
  getEditorCode: () => string | null;
  seed?: ReplSeed | null;
  focusNonce?: number;
}

// Per-kata REPL: the parent keys this component by kata id, so switching
// katas unmounts it — the unmount effect tears the session down.
export function ReplPanel({ language, getEditorCode, seed, focusNonce = 0 }: ReplPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => resetRepl, []);

  function focusInput() {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  useEffect(() => {
    focusInput();
  }, [focusNonce]);

  useEffect(() => {
    if (!busy) focusInput();
  }, [busy]);

  // Seeded from a failing test: load the editor code into the session, then
  // pre-fill (don't run) the extracted call so the user can tweak args.
  useEffect(() => {
    if (!seed) return;
    void (async () => {
      const code = getEditorCode();
      if (code) await submit(code, "(editor code loaded)", true);
      setInput(seed.expression);
      focusInput();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.nonce]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  async function submit(code: string, label?: string, muted = false) {
    if (!code.trim() || busy) return;
    setBusy(true);
    const result = await replEval(language, code);
    setEntries((prev) => [...prev, { input: label ?? code, result, muted }]);
    setBusy(false);
  }

  function onSubmit() {
    const code = input;
    if (!code.trim()) return;
    setHistory((h) => [...h, code]);
    setHistIdx(-1);
    setInput("");
    void submit(code);
  }

  function onLoadCode() {
    const code = getEditorCode();
    if (!code) return;
    void submit(code, "(editor code loaded)", true);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      return;
    }
    // History recall must not fight multiline editing: Up only fires with
    // the caret on the first line, Down only on the last.
    if (e.key === "ArrowUp") {
      if (el.value.slice(0, el.selectionStart).includes("\n")) return;
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      if (el.value.slice(el.selectionEnd).includes("\n")) return;
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col font-mono text-xs">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {entries.length === 0 && (
          <span className="text-base-content/25">
            {language} session — scoped to this kata. Load code to call your solution.
          </span>
        )}
        {entries.map((entry, i) => (
          <div key={i} className={entry.muted ? "opacity-40" : undefined}>
            {entry.input != null && (
              <div className="whitespace-pre-wrap text-base-content/50">
                <span className="text-primary/60 select-none">&gt; </span>
                {entry.input}
              </div>
            )}
            {entry.result?.output && (
              <div className="whitespace-pre-wrap text-base-content/60">{entry.result.output}</div>
            )}
            {entry.result?.ok && (
              <div className="whitespace-pre-wrap text-success/80">=&gt; {entry.result.value}</div>
            )}
            {entry.result && !entry.result.ok && (
              <div className="whitespace-pre-wrap text-error/80">{entry.result.error}</div>
            )}
            {entry.result?.reset && (
              <div className="text-warning/70">— session reset —</div>
            )}
            {entry.info && <div className="text-base-content/40">{entry.info}</div>}
          </div>
        ))}
        {busy && <span className="loading loading-dots loading-xs text-primary/60" />}
      </div>
      <div className="flex items-start gap-2 px-3 py-1.5 border-t border-base-300/60 shrink-0">
        <span className="text-primary/60 select-none">&gt;</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
          rows={Math.min(input.split("\n").length, 8)}
          placeholder={busy ? "evaluating..." : "expression — shift+enter for newline"}
          className="flex-1 bg-transparent outline-none resize-none text-base-content/80 placeholder:text-base-content/20 leading-relaxed"
          spellCheck={false}
        />
        <button
          onClick={onLoadCode}
          disabled={busy}
          className="btn btn-ghost btn-xs text-base-content/40 hover:text-base-content/70"
          title="Evaluate the editor's current code in this session"
        >
          load code
        </button>
        <button
          onClick={() => setEntries([])}
          disabled={busy || entries.length === 0}
          className="btn btn-ghost btn-xs text-base-content/40 hover:text-base-content/70"
          title="Clear the scrollback (session state is kept)"
        >
          clear
        </button>
      </div>
    </div>
  );
}
