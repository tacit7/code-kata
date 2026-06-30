import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  pyodide = await loadPyodide({ indexURL: "/pyodide/" });
  return pyodide;
}

const PYTHON_ASSERT_HELPERS = `
import json as _json

def assert_equal(actual, expected, msg=None):
    if actual != expected:
        payload = _json.dumps({
            "expected": _json.dumps(expected, default=str),
            "got": _json.dumps(actual, default=str),
            "msg": msg,
        })
        raise AssertionError("__ASSERT__" + payload)

def assert_true(condition, msg=None):
    if not condition:
        raise AssertionError(msg or "Assertion failed")
`;

function parseError(raw: string): { error: string; expected?: string; got?: string } {
  const idx = raw.indexOf("__ASSERT__");
  if (idx === -1) return { error: extractUsefulTraceback(raw) };
  try {
    const data = JSON.parse(raw.slice(idx + 10)) as { expected: string; got: string; msg: string | null };
    return {
      error: data.msg ?? `Expected ${data.expected}, got ${data.got}`,
      expected: data.expected,
      got: data.got,
    };
  } catch {
    return { error: extractUsefulTraceback(raw) };
  }
}

function extractUsefulTraceback(msg: string): string {
  const lines = msg.split("\n");
  const meaningful = lines.filter((l) => {
    if (!l.trim()) return false;
    if (l.includes('File "/lib/python')) return false;
    if (l.includes("_pyodide") || l.includes("pyodide_py")) return false;
    return true;
  });
  const lastIdx = meaningful.length - 1;
  const start = Math.max(0, lastIdx - 3);
  return meaningful.slice(start).join("\n");
}

self.onmessage = async (e: MessageEvent<{ userCode: string; testCode: string }>) => {
  const { userCode, testCode } = e.data;
  const py = await getPyodide();

  const testNames = [...testCode.matchAll(/def\s+(test_\w+)\s*\(/g)].map((m) => m[1]);

  if (testNames.length === 0) {
    self.postMessage([{ name: "No tests found", passed: false, error: "No test_* functions in test code" }]);
    return;
  }

  const results: Array<{ name: string; passed: boolean; error?: string; output?: string; expected?: string; got?: string }> = [];

  for (const name of testNames) {
    let captured = "";
    py.setStdout({ batched: (line: string) => { captured += line + "\n"; } });

    try {
      const script = `${PYTHON_ASSERT_HELPERS}\n${userCode}\n${testCode}\n${name}()`;
      await py.runPythonAsync(script);
      results.push({ name, passed: true, output: captured.trim() || undefined });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const { error, expected, got } = parseError(raw);
      results.push({ name, passed: false, error, expected, got, output: captured.trim() || undefined });
    }
  }

  self.postMessage(results);
};
