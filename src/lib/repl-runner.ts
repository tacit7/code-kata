import { replBackends } from "./repl-backends";

// REPL sessions get their own workers, separate from the test runners, so a
// test-run timeout never destroys REPL state and vice versa. One session at
// a time (per-kata scope); resetRepl() tears everything down. JavaScript is
// handled here; other languages come from the variant's repl-backends.

export const REPL_EXEC_TIMEOUT_MS = 5_000;

export interface ReplEvalResult {
  ok: boolean;
  value?: string;
  error?: string;
  output?: string;
  /** True when the session was lost (timeout/crash) and restarted fresh. */
  reset?: boolean;
}

let jsWorker: Worker | null = null;
let inFlight: Promise<unknown> = Promise.resolve();

function discardJs() {
  jsWorker?.terminate();
  jsWorker = null;
}

export function resetRepl(): void {
  discardJs();
  for (const backend of Object.values(replBackends)) backend.discard();
}

function getJsWorker(): Worker {
  if (jsWorker) return jsWorker;
  jsWorker = new Worker(new URL("./js-repl-worker.ts", import.meta.url), {
    type: "module",
  });
  return jsWorker;
}

function evalInWorker(
  worker: Worker,
  code: string,
  onTimeout: () => void,
): Promise<ReplEvalResult> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      onTimeout();
      resolve({
        ok: false,
        error: `Evaluation exceeded ${REPL_EXEC_TIMEOUT_MS / 1000}s — session reset`,
        reset: true,
      });
    }, REPL_EXEC_TIMEOUT_MS);

    const onMessage = (e: MessageEvent<{ type: string } & ReplEvalResult>) => {
      if (e.data.type !== "repl_result") return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      const { ok, value, error, output } = e.data;
      resolve({ ok, value, error, output });
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ type: "repl_eval", code });
  });
}

async function replEvalInner(language: string, code: string): Promise<ReplEvalResult> {
  const backend = replBackends[language];
  if (backend) {
    const { worker, ready } = backend.get();
    try {
      await ready;
    } catch (err) {
      backend.discard();
      return { ok: false, error: err instanceof Error ? err.message : String(err), reset: true };
    }
    return evalInWorker(worker, code, () => backend.discard());
  }
  return evalInWorker(getJsWorker(), code, discardJs);
}

export function replEval(language: string, code: string): Promise<ReplEvalResult> {
  // Serialize evals: overlapping calls would race on the shared message
  // listener, same single-flight rule as the test runner.
  const run = inFlight.then(() => replEvalInner(language, code));
  inFlight = run.catch(() => undefined);
  return run;
}
