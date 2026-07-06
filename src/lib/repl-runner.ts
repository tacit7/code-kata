import {
  INIT_TIMEOUT_MS,
  EXEC_TIMEOUT_MS,
  type ReplResult,
} from "./ruby-exec-core";

// REPL sessions get their own workers, separate from the test runners, so a
// test-run timeout never destroys REPL state and vice versa. One session at
// a time (per-kata scope); resetRepl() tears everything down.

export interface ReplEvalResult extends ReplResult {
  /** True when the session was lost (timeout/crash) and restarted fresh. */
  reset?: boolean;
}

let rubyWorker: Worker | null = null;
let rubyReady: Promise<void> | null = null;
let jsWorker: Worker | null = null;
let inFlight: Promise<unknown> = Promise.resolve();

function discardRuby() {
  rubyWorker?.terminate();
  rubyWorker = null;
  rubyReady = null;
}

function discardJs() {
  jsWorker?.terminate();
  jsWorker = null;
}

export function resetRepl(): void {
  discardRuby();
  discardJs();
}

function getRubyWorker(): { worker: Worker; ready: Promise<void> } {
  if (rubyWorker && rubyReady) return { worker: rubyWorker, ready: rubyReady };
  const worker = new Worker(new URL("./ruby-test-worker.ts", import.meta.url), {
    type: "module",
  });
  const ready = new Promise<void>((resolve, reject) => {
    const initTimer = setTimeout(() => {
      reject(new Error(`ruby.wasm init exceeded ${INIT_TIMEOUT_MS / 1000}s`));
    }, INIT_TIMEOUT_MS);
    const onMessage = (e: MessageEvent<{ type: string; error?: string }>) => {
      if (e.data.type === "ready") {
        clearTimeout(initTimer);
        worker.removeEventListener("message", onMessage);
        resolve();
      } else if (e.data.type === "init_error") {
        clearTimeout(initTimer);
        worker.removeEventListener("message", onMessage);
        reject(new Error(e.data.error));
      }
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", (e) => {
      clearTimeout(initTimer);
      reject(new Error(`REPL worker failed to load: ${e.message}`));
    });
  });
  rubyWorker = worker;
  rubyReady = ready;
  return { worker, ready };
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
        error: `Evaluation exceeded ${EXEC_TIMEOUT_MS / 1000}s — session reset`,
        reset: true,
      });
    }, EXEC_TIMEOUT_MS);

    const onMessage = (e: MessageEvent<{ type: string } & ReplResult>) => {
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
  if (language === "ruby") {
    const { worker, ready } = getRubyWorker();
    try {
      await ready;
    } catch (err) {
      discardRuby();
      return { ok: false, error: err instanceof Error ? err.message : String(err), reset: true };
    }
    return evalInWorker(worker, code, discardRuby);
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
