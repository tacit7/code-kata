// Variant-owned registry: each language variant branch registers its REPL
// backend here (ruby on js-ruby-version, python on main). app-core ships it
// empty except for the interfaces — JavaScript is handled directly by
// repl-runner and needs no entry. Keep this file variant-local; app-core
// should never change it again, so merges stay conflict-free.

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

export const replBackends: Record<string, ReplBackend> = {};
