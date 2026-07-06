// Variant-owned registry (see app-core for the base version): main registers
// the Python backend. JavaScript is handled directly by repl-runner.

export interface ReplBackendHandle {
  worker: Worker;
  ready: Promise<void>;
}

export interface ReplBackend {
  /** Return the (possibly cached) session worker and its init handshake. */
  get(): ReplBackendHandle;
  /** Tear down the session worker; next get() starts fresh. */
  discard(): void;
}

const REPL_INIT_TIMEOUT_MS = 15_000;

// Python REPL: its own worker instance (separate from the test runner's, so
// test runs never clobber REPL state) with one persistent namespace.
let pyWorker: Worker | null = null;
let pyReady: Promise<void> | null = null;

const pythonBackend: ReplBackend = {
  get() {
    if (pyWorker && pyReady) return { worker: pyWorker, ready: pyReady };
    const worker = new Worker(new URL("./python-test-worker.ts", import.meta.url), {
      type: "module",
    });
    const ready = new Promise<void>((resolve, reject) => {
      const initTimer = setTimeout(() => {
        reject(new Error(`Pyodide init exceeded ${REPL_INIT_TIMEOUT_MS / 1000}s`));
      }, REPL_INIT_TIMEOUT_MS);
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
      worker.postMessage({ type: "repl_init" });
    });
    pyWorker = worker;
    pyReady = ready;
    return { worker, ready };
  },
  discard() {
    pyWorker?.terminate();
    pyWorker = null;
    pyReady = null;
  },
};

export const replBackends: Record<string, ReplBackend> = {
  python: pythonBackend,
};
