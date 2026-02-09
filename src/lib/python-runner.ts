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

export async function runPythonTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  const pyodide = await getPyodide();

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
    try {
      const script = `${PYTHON_ASSERT_HELPERS}\n${userCode}\n${testCode}\n${name}()`;
      await pyodide.runPythonAsync(script);
      results.push({ name, passed: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : String(err);
      // Extract the last line of the Python traceback (the actual error)
      const lines = msg.split("\n").filter((l) => l.trim());
      const errorLine = lines[lines.length - 1] || msg;
      results.push({ name, passed: false, error: errorLine });
    }
  }

  return results;
}
