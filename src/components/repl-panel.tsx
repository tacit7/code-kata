import { useEffect, useRef, useState } from "react";
import { replEval, resetRepl, type ReplEvalResult } from "../lib/repl-runner";

interface Entry {
  input?: string;
  result?: ReplEvalResult;
  info?: string;
}

interface ReplPanelProps {
  language: string;
  getEditorCode: () => string | null;
}

// Per-kata REPL: the parent keys this component by kata id, so switching
// katas unmounts it — the unmount effect tears the session down.
export function ReplPanel({ language, getEditorCode }: ReplPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => resetRepl, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  async function submit(code: string, label?: string) {
    if (!code.trim() || busy) return;
    setBusy(true);
    const result = await replEval(language, code);
    setEntries((prev) => [...prev, { input: label ?? code, result }]);
    setBusy(false);
    inputRef.current?.focus();
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
    void submit(code, "(editor code loaded)");
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
          <div key={i}>
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
      </div>
    </div>
  );
}
