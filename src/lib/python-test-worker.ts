import { loadPyodide, type PyodideInterface } from "pyodide";
import { PYTHON_REPL_HELPER_BOOTSTRAP, PYTHON_TEST_HELPER_BOOTSTRAP } from "./python-helpers";

let pyodide: PyodideInterface | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  pyodide = await loadPyodide({ indexURL: "/pyodide/" });
  return pyodide;
}

const PYTHON_ASSERT_HELPERS = `
${PYTHON_TEST_HELPER_BOOTSTRAP}

import ast as _ast
import json as _json
import linecache as _linecache
import traceback as _traceback

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

def __display_value(value):
    try:
        return _json.dumps(value, default=str)
    except Exception:
        return repr(value)

def __assert_payload_from_message(message):
    marker = "__ASSERT__"
    idx = message.find(marker)
    if idx == -1:
        return None
    try:
        data = _json.loads(message[idx + len(marker):])
        return {
            "errorKind": "assertion",
            "error": data.get("msg") or f"Expected {data.get('expected')}, got {data.get('got')}",
            "expected": data.get("expected"),
            "got": data.get("got"),
        }
    except Exception:
        return None

def __last_traceback_frame(tb):
    current = tb
    while current and current.tb_next:
        current = current.tb_next
    return current

def __assert_details(exc):
    custom = __assert_payload_from_message(str(exc))
    if custom:
        return custom

    tb = __last_traceback_frame(exc.__traceback__)
    if not tb:
        return {"errorKind": "assertion", "error": str(exc) or "Assertion failed"}

    frame = tb.tb_frame
    filename = frame.f_code.co_filename
    lineno = tb.tb_lineno
    source = _linecache.getline(filename, lineno).strip()
    message = str(exc).strip()

    if not source:
        return {"errorKind": "assertion", "error": message or "Assertion failed"}

    detail = {"errorKind": "assertion", "error": message or f"Assertion failed: {source}", "input": source}
    try:
        statement = _ast.parse(source).body[0]
        if isinstance(statement, _ast.Assert):
            test = statement.test
            if isinstance(test, _ast.Compare) and len(test.ops) == 1 and len(test.comparators) == 1:
                left_expr = _ast.Expression(test.left)
                right_expr = _ast.Expression(test.comparators[0])
                _ast.fix_missing_locations(left_expr)
                _ast.fix_missing_locations(right_expr)
                left = eval(compile(left_expr, filename, "eval"), frame.f_globals, frame.f_locals)
                right = eval(compile(right_expr, filename, "eval"), frame.f_globals, frame.f_locals)
                detail["got"] = __display_value(left)
                detail["expected"] = __display_value(right)
                detail["error"] = message or f"Expected {detail['expected']}, got {detail['got']}"
    except Exception:
        pass

    return detail

def __exception_details(exc):
    exc_name = exc.__class__.__name__
    message = str(exc).strip()
    filename = getattr(exc, "filename", None)
    lineno = getattr(exc, "lineno", None)
    source = getattr(exc, "text", None)
    tb = __last_traceback_frame(exc.__traceback__)

    if exc_name == "SyntaxError" and filename and lineno:
        if source:
            source = source.strip() or None
        if not source:
            source = _linecache.getline(filename, lineno).strip() or None
    elif tb:
        filename = tb.tb_frame.f_code.co_filename
        lineno = tb.tb_lineno
        source = _linecache.getline(filename, lineno).strip() or None
    elif source:
        source = source.strip() or None
    source_kind = "user" if filename == "<user_code>" else "tests" if filename == "<kata_tests>" else "runner"
    trace = "".join(_traceback.format_exception(type(exc), exc, exc.__traceback__))
    return {
        "errorKind": "syntax" if exc_name == "SyntaxError" else "runtime",
        "error": f"{exc_name}: {message}" if message else exc_name,
        "errorSource": source_kind,
        "lineNumber": lineno,
        "input": source,
        "traceback": trace,
    }

def __prepare_source(filename, source):
    _linecache.cache[filename] = (len(source), None, source.splitlines(True), filename)

def __run_kata_test(user_code, test_code, test_name):
    ns = globals()
    __prepare_source("<user_code>", user_code)
    __prepare_source("<kata_tests>", test_code)
    try:
        exec(compile(user_code, "<user_code>", "exec"), ns)
        exec(compile(test_code, "<kata_tests>", "exec"), ns)
        ns[test_name]()
        return _json.dumps({"passed": True})
    except AssertionError as exc:
        payload = {"passed": False, **__assert_details(exc)}
        return _json.dumps(payload)
    except BaseException as exc:
        payload = {"passed": False, **__exception_details(exc)}
        return _json.dumps(payload)
`;

function parseError(raw: string): { errorKind: "runner"; error: string; expected?: string; got?: string; input?: string; errorSource: "runner" } {
  const idx = raw.indexOf("__ASSERT__");
  if (idx === -1) return { errorKind: "runner", errorSource: "runner", error: extractUsefulTraceback(raw) };
  try {
    const data = JSON.parse(raw.slice(idx + 10)) as { expected: string; got: string; msg: string | null };
    return {
      errorKind: "runner",
      errorSource: "runner",
      error: data.msg ?? `Expected ${data.expected}, got ${data.got}`,
      expected: data.expected,
      got: data.got,
    };
  } catch {
    return { errorKind: "runner", errorSource: "runner", error: extractUsefulTraceback(raw) };
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

// ── REPL support ─────────────────────────────────────────────────────────
// One persistent namespace per session so state survives across inputs.
// Statements exec, expressions eval — mirroring the real Python REPL.
// The runner discards the whole worker to reset, so no reset message.
const REPL_HELPER = `
${PYTHON_REPL_HELPER_BOOTSTRAP}

import json as __repl_json, io as __repl_io, contextlib as __repl_ctx

__repl_ns = {}
__kh_export_helpers(__repl_ns, True)

def __repl_eval(__code):
    __buf = __repl_io.StringIO()
    try:
        with __repl_ctx.redirect_stdout(__buf):
            try:
                __val = eval(compile(__code, "<repl>", "eval"), __repl_ns)
            except SyntaxError:
                exec(compile(__code, "<repl>", "exec"), __repl_ns)
                __val = None
        return __repl_json.dumps({"ok": True, "value": repr(__val)[:8192], "output": __buf.getvalue()[:262144]})
    except BaseException as __e:
        return __repl_json.dumps({"ok": False, "error": (type(__e).__name__ + ": " + str(__e))[:8192], "output": __buf.getvalue()[:262144]})
`;

let replInitialized = false;

async function handleReplMessage(msg: { type: string; code?: string }) {
  try {
    const py = await getPyodide();
    if (!replInitialized) {
      py.runPython(REPL_HELPER);
      replInitialized = true;
    }
    if (msg.type === "repl_init") {
      self.postMessage({ type: "ready" });
      return;
    }
    const json = py.runPython(`__repl_eval(${JSON.stringify(msg.code ?? "")})`) as string;
    const raw = JSON.parse(json) as { ok: boolean; value?: string; error?: string; output?: string };
    self.postMessage({
      type: "repl_result",
      ok: raw.ok,
      value: raw.value,
      error: raw.error,
      output: raw.output && raw.output.trim() ? raw.output.trim().slice(0, 8192) : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (msg.type === "repl_init") {
      self.postMessage({ type: "init_error", error: `Pyodide failed to start: ${message}` });
    } else {
      self.postMessage({ type: "repl_result", ok: false, error: `REPL session crashed: ${message}` });
    }
  }
}

type WorkerMessage =
  | { userCode: string; testCode: string; type?: undefined }
  | { type: "repl_init" }
  | { type: "repl_eval"; code: string };

type WorkerTestResult = {
  name: string;
  passed: boolean;
  errorKind?: "assertion" | "syntax" | "runtime" | "runner";
  errorSource?: "user" | "tests" | "runner";
  lineNumber?: number;
  error?: string;
  output?: string;
  expected?: string;
  got?: string;
  input?: string;
  traceback?: string;
};

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "repl_init" || e.data.type === "repl_eval") {
    await handleReplMessage(e.data);
    return;
  }
  const { userCode, testCode } = e.data;
  const py = await getPyodide();

  const testNames = [...testCode.matchAll(/def\s+(test_\w+)\s*\(/g)].map((m) => m[1]);

  if (testNames.length === 0) {
    self.postMessage([{ name: "No tests found", passed: false, error: "No test_* functions in test code" }]);
    return;
  }

  const results: WorkerTestResult[] = [];

  for (const name of testNames) {
    let captured = "";
    py.setStdout({ batched: (line: string) => { captured += line + "\n"; } });

    try {
      const script = `${PYTHON_ASSERT_HELPERS}\n__run_kata_test(${JSON.stringify(userCode)}, ${JSON.stringify(testCode)}, ${JSON.stringify(name)})`;
      const resultJson = await py.runPythonAsync(script) as string;
      const result = JSON.parse(resultJson) as Omit<WorkerTestResult, "name" | "output">;
      results.push({ name, ...result, output: captured.trim() || undefined });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const { errorKind, errorSource, error, expected, got, input } = parseError(raw);
      results.push({ name, passed: false, errorKind, errorSource, error, expected, got, input, output: captured.trim() || undefined });
    }
  }

  self.postMessage(results);
};
