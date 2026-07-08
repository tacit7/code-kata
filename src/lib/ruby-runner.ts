import type { TestResult } from "../types/editor";
import { INIT_TIMEOUT_MS, EXEC_TIMEOUT_MS } from "./ruby-exec-core";

// Warm worker: reused across runs so the compiled wasm module is cached.
// Discarded (null) after any timeout or fatal error; the next run pays the
// cold init cost again. Fresh Ruby VM per run happens INSIDE the worker.
let workerInstance: Worker | null = null;
let readyPromise: Promise<void> | null = null;

// Every run instantiates a brand-new Ruby VM inside the worker (see
// ruby-test-worker.ts) — there's no dispose/free API on RubyVM, so each
// run's WASM memory only becomes eligible for GC, not immediately reclaimed.
// Over a long session that churn adds up. Recycling the whole worker every
// so often forces the OS to actually reclaim it, at the cost of one cold
// re-init.
const RECYCLE_AFTER_RUNS = 15;
let runsSinceRecycle = 0;

// Single-flight queue: overlapping runRubyTests calls must not both listen
// for the same worker "results" message. Each call awaits the previous
// call's completion before posting its own message.
let inFlight: Promise<unknown> = Promise.resolve();

function timeoutResult(seconds: number): TestResult[] {
  return [
    {
      name: "Timeout",
      passed: false,
      error: `Execution exceeded ${seconds}s — possible infinite loop`,
    },
  ];
}

function discardWorker() {
  workerInstance?.terminate();
  workerInstance = null;
  readyPromise = null;
  runsSinceRecycle = 0;
}

function getWorker(): { worker: Worker; ready: Promise<void> } {
  if (workerInstance && readyPromise) {
    return { worker: workerInstance, ready: readyPromise };
  }
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

    // If the worker script itself fails to load/parse, neither "ready" nor
    // "init_error" will ever arrive — fail fast instead of waiting out the
    // full init timeout.
    worker.onerror = (e) => {
      clearTimeout(initTimer);
      worker.removeEventListener("message", onMessage);
      reject(new Error(`Worker failed to load: ${e.message}`));
    };
  });
  workerInstance = worker;
  readyPromise = ready;
  return { worker, ready };
}

// Eagerly create the worker — the expensive ruby.wasm compile starts at the
// worker's module top level, so creation alone warms the runtime.
export function prewarmRuby(): void {
  getWorker();
}

export async function runRubyTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  // Serialize overlapping calls: the worker's "results" listener is keyed
  // only on message type, so two concurrent runs would both resolve from
  // whichever "results" message arrives first. Chain onto the previous run.
  const previous = inFlight;
  let release: () => void;
  inFlight = new Promise<void>((r) => (release = r));
  await previous.catch(() => undefined);
  try {
    return await runRubyTestsExclusive(userCode, testCode);
  } finally {
    release!();
  }
}

async function runRubyTestsExclusive(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  const { worker, ready } = getWorker();

  try {
    await ready;
  } catch (err) {
    discardWorker();
    return [
      {
        name: "Ruby runtime error",
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      },
    ];
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      discardWorker();
      resolve(timeoutResult(EXEC_TIMEOUT_MS / 1000));
    }, EXEC_TIMEOUT_MS);

    const onMessage = (e: MessageEvent<{ type: string; results?: TestResult[] }>) => {
      if (e.data.type !== "results") return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      resolve(e.data.results ?? []);

      runsSinceRecycle += 1;
      if (runsSinceRecycle >= RECYCLE_AFTER_RUNS) {
        discardWorker();
      }
    };
    worker.addEventListener("message", onMessage);

    worker.onerror = (e) => {
      clearTimeout(timer);
      discardWorker();
      resolve([{ name: "Worker error", passed: false, error: e.message }]);
    };

    worker.postMessage({ userCode, testCode });
  });
}
