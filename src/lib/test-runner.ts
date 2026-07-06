import type { TestResult } from "../types/editor";
import { runRubyTests } from "./ruby-runner";

const WATCHDOG_MS = 5000;

const TIMEOUT_RESULT: TestResult[] = [
  {
    name: "Timeout",
    passed: false,
    error: `Execution exceeded ${WATCHDOG_MS / 1000}s — possible infinite loop`,
  },
];

function runJsTests(userCode: string, testCode: string): Promise<TestResult[]> {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL("./js-test-worker.ts", import.meta.url),
      { type: "module" },
    );

    const timer = setTimeout(() => {
      worker.terminate();
      resolve(TIMEOUT_RESULT);
    }, WATCHDOG_MS);

    worker.onmessage = (e: MessageEvent<TestResult[]>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve([{ name: "Worker error", passed: false, error: e.message }]);
    };

    worker.postMessage({ userCode, testCode });
  });
}

export async function runTests(
  userCode: string,
  testCode: string,
  language: string,
): Promise<TestResult[]> {
  if (language === "ruby") {
    return runRubyTests(userCode, testCode);
  }
  return runJsTests(userCode, testCode);
}

// No-op on app-core — language runners don't expose a warm-up entry point
// that is reachable without touching their files. Variant branches override
// this to eagerly spin up their language worker (e.g. Pyodide on main).
export function prewarmRunner(_language: string): void {
  // intentional no-op
}
