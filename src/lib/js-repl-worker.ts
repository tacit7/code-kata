// Persistent JS REPL scope: indirect eval runs in the worker's global scope,
// so `var`/`function` declarations survive across inputs. Top-level
// `const`/`let` in an eval script would NOT persist, so leading const/let
// declarations are rewritten to var (standard REPL affordance).
const CONST_LET_RE = /^\s*(const|let)\s/;

function format(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "function") return `[Function: ${(v as { name?: string }).name || "anonymous"}]`;
  if (v === undefined) return "undefined";
  try {
    const json = JSON.stringify(v);
    if (json !== undefined) return json;
  } catch {
    // circular etc.
  }
  return String(v);
}

self.onmessage = (e: MessageEvent<{ type: string; code?: string }>) => {
  if (e.data.type !== "repl_eval") return;
  const code = (e.data.code ?? "").replace(CONST_LET_RE, "var ");

  const captured: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => { captured.push(args.map(format).join(" ")); };

  try {
    const value = (0, eval)(code);
    self.postMessage({
      type: "repl_result",
      ok: true,
      value: format(value).slice(0, 8192),
      output: captured.length ? captured.join("\n").slice(0, 8192) : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    self.postMessage({
      type: "repl_result",
      ok: false,
      error: message.slice(0, 8192),
      output: captured.length ? captured.join("\n").slice(0, 8192) : undefined,
    });
  } finally {
    console.log = origLog;
  }
};
