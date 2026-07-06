// Variant-owned registry (see app-core for the base version): js-ruby-version
// registers the Ruby backend. JavaScript is handled directly by repl-runner.

import { INIT_TIMEOUT_MS } from "./ruby-exec-core";

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

// Ruby REPL: its own worker instance (separate from the test runner's, so
// test runs never clobber REPL state) with one persistent VM per session.
// The worker posts ready/init_error on its own after compiling the module.
let rubyWorker: Worker | null = null;
let rubyReady: Promise<void> | null = null;

const rubyBackend: ReplBackend = {
  get() {
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
  },
  discard() {
    rubyWorker?.terminate();
    rubyWorker = null;
    rubyReady = null;
  },
};

export const replBackends: Record<string, ReplBackend> = {
  ruby: rubyBackend,
};
