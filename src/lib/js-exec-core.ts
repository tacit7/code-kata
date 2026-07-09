// Pure logic for the JS test worker, split out so it can be unit tested —
// a worker module cannot be imported under vitest (`self` is undefined).
// Mirrors the shape of ruby-exec-core.ts.

// `assertEqual` reports the source line it was called from so the UI can show
// the failing inputs. Stack line numbers are relative to the whole script that
// `new Function` compiled, and V8 prepends its own wrapper lines. Rather than
// hard-coding that offset, the helpers calibrate at runtime: `__CALIB` measures
// where a known line of THIS block actually lands, and every later reading is
// corrected by the difference.
//
// The calibration holds only because the helper block is the first thing in the
// composed script, so a line's index within the block equals its index within
// the script. composeScript() guarantees that; a test pins it.
const HELPER_SRC = `
function __stackLine(err, frame) {
  const m = /:(\\d+):\\d+\\)?$/.exec(String(err.stack).split("\\n")[frame] || "");
  return m ? Number(m[1]) : null;
}
const __CALIB = __stackLine(new Error(), 1) - __CALIB_AT__;
function __srcLine(err) {
  const l = __stackLine(err, 2);
  return l === null || __CALIB === null ? null : l - __CALIB;
}
function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const payload = JSON.stringify({
      expected: JSON.stringify(expected),
      got: JSON.stringify(actual),
      msg: message || null,
      line: __srcLine(new Error()),
    });
    throw new Error("__ASSERT__" + payload);
  }
}
`;

function buildAssertHelpers(): string {
  const lines = HELPER_SRC.split("\n");
  const idx = lines.findIndex((l) => l.includes("__CALIB_AT__"));
  if (idx === -1) throw new Error("calibration marker missing from HELPER_SRC");
  return HELPER_SRC.replace("__CALIB_AT__", String(idx + 1));
}

export const ASSERT_HELPERS = buildAssertHelpers();

export function composeScript(userCode: string, testCode: string, testName: string): string {
  return `${ASSERT_HELPERS}\n${userCode}\n${testCode}\n${testName}();`;
}

/** The 1-based `line` is an index into the composed script, not into testCode. */
export function resolveLine(script: string, line: number | null): string | undefined {
  if (line === null || line < 1) return undefined;
  const text = (script.split("\n")[line - 1] ?? "").trim();
  return text || undefined;
}

export interface ParsedError {
  error: string;
  expected?: string;
  got?: string;
  input?: string;
}

export function parseError(raw: string, script: string): ParsedError {
  const idx = raw.indexOf("__ASSERT__");
  if (idx === -1) return { error: raw };
  try {
    const data = JSON.parse(raw.slice(idx + 10)) as {
      expected: string;
      got: string;
      msg: string | null;
      line: number | null;
    };
    return {
      error: data.msg ?? `Expected ${data.expected}, got ${data.got}`,
      expected: data.expected,
      got: data.got,
      input: resolveLine(script, data.line ?? null),
    };
  } catch {
    return { error: raw };
  }
}

export function extractTestNames(testCode: string): string[] {
  return [...testCode.matchAll(/function\s+(test_\w+)\s*\(/g)].map((m) => m[1]);
}
