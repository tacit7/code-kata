// src/lib/ruby-test-worker.ts
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";
import wasmUrl from "@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm?url";
import {
  buildPrelude,
  buildRunnerScript,
  extractTestNames,
  parseRunResults,
  loadErrorResult,
  runnerErrorResult,
} from "./ruby-exec-core";

// The compiled module is cached for the worker's lifetime. A FRESH Ruby VM
// is created per run — Ruby global/class state cannot be reset reliably, so
// VM reuse is rejected by design (see spec §1).
const modulePromise: Promise<WebAssembly.Module> = WebAssembly.compileStreaming(fetch(wasmUrl));

modulePromise.then(
  () => self.postMessage({ type: "ready" }),
  (err) => self.postMessage({ type: "init_error", error: `ruby.wasm compile failed: ${String(err)} (url: ${wasmUrl})` }),
);

self.onmessage = async (e: MessageEvent<{ userCode: string; testCode: string }>) => {
  const { userCode, testCode } = e.data;

  const testNames = extractTestNames(testCode);
  if (testNames.length === 0) {
    self.postMessage({ type: "results", results: runnerErrorResult() });
    return;
  }

  const module = await modulePromise;
  const { vm } = await DefaultRubyVM(module);

  // Load order: helpers → user code → test code → runner (spec §1).
  // A raise in user/test code before the runner is a load_error.
  try {
    vm.eval(buildPrelude());
    vm.eval(userCode);
    vm.eval(testCode);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "results", results: loadErrorResult(raw) });
    return;
  }

  try {
    const json = vm.eval(buildRunnerScript(testNames)).toString();
    self.postMessage({ type: "results", results: parseRunResults(json, testNames) });
  } catch (err) {
    // Uncontained exit/abort or VM-level crash during the runner loop.
    const raw = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "results", results: loadErrorResult(`Runner crashed: ${raw}`) });
  }
};
