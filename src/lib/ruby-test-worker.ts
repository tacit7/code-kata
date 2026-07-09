// src/lib/ruby-test-worker.ts
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";
import wasmUrl from "@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm?url";
import {
  buildPrelude,
  buildRunnerScript,
  buildReplSetupScript,
  buildReplEvalScript,
  extractTestNames,
  parseRunResults,
  parseReplResult,
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

// REPL: one persistent VM per session so locals/methods survive across
// inputs (test runs keep their fresh-VM isolation — separate code path).
type ReplVm = { eval: (code: string) => { toString(): string } };
let replVm: ReplVm | null = null;

async function handleReplMessage(msg: { type: string; code?: string }) {
  if (msg.type === "repl_reset") {
    replVm = null;
    return;
  }
  try {
    if (!replVm) {
      const module = await modulePromise;
      const { vm } = await DefaultRubyVM(module);
      vm.eval(buildReplSetupScript());
      replVm = vm;
    }
    const json = replVm.eval(buildReplEvalScript(msg.code ?? "")).toString();
    self.postMessage({ type: "repl_result", ...parseReplResult(json) });
  } catch (err) {
    // VM-level crash (uncontained exit, boot failure): drop the session so
    // the next input starts fresh.
    replVm = null;
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "repl_result", ok: false, error: `REPL session crashed: ${message}` });
  }
}

type WorkerMessage =
  | { userCode: string; testCode: string; type?: undefined }
  | { type: "profile"; userCode: string; testCode: string }
  | { type: "repl_eval"; code: string }
  | { type: "repl_reset" };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "repl_eval" || e.data.type === "repl_reset") {
    await handleReplMessage(e.data);
    return;
  }

  if (e.data.type === "profile") {
    const mark = (phase: string) => {
      self.postMessage({ type: "profile_step", phase, at: performance.now() });
    };
    const { userCode, testCode } = e.data;
    const testNames = extractTestNames(testCode);
    mark("received");
    if (testNames.length === 0) {
      self.postMessage({ type: "profile_done", results: runnerErrorResult() });
      return;
    }

    let vm;
    try {
      mark("before_module");
      const module = await modulePromise;
      mark("after_module_before_vm");
      ({ vm } = await DefaultRubyVM(module));
      mark("after_vm");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: "profile_done", results: loadErrorResult(`Ruby VM failed to start: ${message}`) });
      return;
    }

    try {
      mark("before_prelude");
      vm.eval(buildPrelude());
      mark("after_prelude_before_user_code");
      vm.eval(userCode);
      mark("after_user_code_before_test_code");
      vm.eval(testCode);
      mark("after_test_code_before_runner");
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: "profile_done", results: loadErrorResult(raw) });
      return;
    }

    try {
      const json = vm.eval(buildRunnerScript(testNames)).toString();
      mark("after_runner");
      self.postMessage({ type: "profile_done", results: parseRunResults(json, testNames) });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: "profile_done", results: loadErrorResult(`Runner crashed: ${raw}`) });
    }
    return;
  }

  const { userCode, testCode } = e.data;

  const testNames = extractTestNames(testCode);
  if (testNames.length === 0) {
    self.postMessage({ type: "results", results: runnerErrorResult() });
    return;
  }

  let vm;
  try {
    const module = await modulePromise;
    ({ vm } = await DefaultRubyVM(module));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "results", results: loadErrorResult(`Ruby VM failed to start: ${message}`) });
    return;
  }

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
