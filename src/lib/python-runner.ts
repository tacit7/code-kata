import type { TestResult } from "../types/editor";

const WATCHDOG_MS = 5000;

// Reuse the worker so Pyodide stays loaded between runs.
// Set to null after a timeout-triggered terminate so the next run recreates it.
let workerInstance: Worker | null = null;

function getPythonWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("./python-test-worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return workerInstance;
}

export function runPythonTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  return new Promise((resolve) => {
    const worker = getPythonWorker();

    const timer = setTimeout(() => {
      worker.terminate();
      workerInstance = null;
      resolve([
        {
          name: "Timeout",
          passed: false,
          error: `Execution exceeded ${WATCHDOG_MS / 1000}s — possible infinite loop`,
        },
      ]);
    }, WATCHDOG_MS);

    worker.onmessage = (e: MessageEvent<TestResult[]>) => {
      clearTimeout(timer);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      workerInstance = null;
      resolve([{ name: "Worker error", passed: false, error: e.message }]);
    };

    worker.postMessage({ userCode, testCode });
  });
}
