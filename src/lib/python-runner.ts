import type { TestResult } from "../types/editor";
import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = loadPyodide({
    indexURL: "/pyodide/",
  });

  pyodideInstance = await loadingPromise;
  loadingPromise = null;
  return pyodideInstance;
}

const PYTHON_ASSERT_HELPERS = `
import json

def assert_equal(actual, expected, msg=None):
    if actual != expected:
        a = json.dumps(actual, default=str)
        e = json.dumps(expected, default=str)
        raise AssertionError(msg or f"Expected {e}, got {a}")

def assert_true(condition, msg=None):
    if not condition:
        raise AssertionError(msg or "Assertion failed")
`;

function extractUsefulTraceback(msg: string): string {
  const lines = msg.split("\n");
  // Drop pyodide-internal frames (paths like /lib/python3.x/...) and blank lines
  const meaningful = lines.filter((l) => {
    if (!l.trim()) return false;
    if (l.includes('File "/lib/python')) return false;
    if (l.includes("_pyodide") || l.includes("pyodide_py")) return false;
    return true;
  });
  // Always include the final error line; include up to 4 lines of context above it
  const lastIdx = meaningful.length - 1;
  const start = Math.max(0, lastIdx - 3);
  return meaningful.slice(start).join("\n");
}

const WATCHDOG_MS = 5000;

export async function runPythonTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  const pyodide = await getPyodide();

  // Set up interrupt buffer so we can signal a KeyboardInterrupt from JS
  // when a test times out (e.g. infinite loop).
  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
  pyodide.setInterruptBuffer(interruptBuffer);

  const testNames = [
    ...testCode.matchAll(/def\s+(test_\w+)\s*\(/g),
  ].map((m) => m[1]);

  if (testNames.length === 0) {
    return [
      {
        name: "No tests found",
        passed: false,
        error: "No test_* functions in test code",
      },
    ];
  }

  const results: TestResult[] = [];

  for (const name of testNames) {
    let captured = "";
    pyodide.setStdout({
      batched: (line) => { captured += line + "\n"; },
    });

    interruptBuffer[0] = 0; // clear any prior signal
    const watchdog = setTimeout(() => {
      interruptBuffer[0] = 2; // SIGINT → Pyodide raises KeyboardInterrupt
    }, WATCHDOG_MS);

    try {
      const script = `${PYTHON_ASSERT_HELPERS}\n${userCode}\n${testCode}\n${name}()`;
      await pyodide.runPythonAsync(script);
      clearTimeout(watchdog);
      const output = captured.trim() || undefined;
      results.push({ name, passed: true, output });
    } catch (err) {
      clearTimeout(watchdog);
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = interruptBuffer[0] === 2 || msg.includes("KeyboardInterrupt");
      const error = isTimeout
        ? `Execution exceeded ${WATCHDOG_MS / 1000}s — possible infinite loop`
        : extractUsefulTraceback(msg);
      const output = captured.trim() || undefined;
      results.push({ name, passed: false, error, output });
    }
  }

  return results;
}
