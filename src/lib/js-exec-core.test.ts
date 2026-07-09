import { describe, it, expect } from "vitest";
import { ASSERT_HELPERS, composeScript, parseError, resolveLine, extractTestNames } from "./js-exec-core";

const USER_CODE = `function addOne(x) {\n  return x + 1;\n}`;

/** Runs one test the way the worker does and returns what the UI would render. */
function runTest(
  userCode: string,
  testCode: string,
  name: string,
): { passed: boolean; error?: string; expected?: string; got?: string; input?: string } {
  const script = composeScript(userCode, testCode, name);
  try {
    new Function(script)();
    return { passed: true };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return { passed: false, ...parseError(raw, script) };
  }
}

describe("composeScript", () => {
  // The stack-line calibration in ASSERT_HELPERS assumes a line's index within
  // the helper block equals its index within the script. Prepending anything
  // to the helpers silently shifts every reported input line.
  it("places the assert helpers at the very start of the script", () => {
    const script = composeScript(USER_CODE, "function test_a() {}", "test_a");
    expect(script.startsWith(ASSERT_HELPERS)).toBe(true);
  });
});

describe("failing assertions report the source line that failed", () => {
  it("captures the assertion call, which is where the inputs live", () => {
    const testCode = `function test_adds() {\n  assertEqual(addOne(41), 99);\n}`;
    const r = runTest(USER_CODE, testCode, "test_adds");
    expect(r.passed).toBe(false);
    expect(r.input).toBe("assertEqual(addOne(41), 99);");
    expect(r.got).toBe("42");
    expect(r.expected).toBe("99");
  });

  it("picks the failing assertion, not the first one in the test", () => {
    const testCode = [
      "function test_many() {",
      "  assertEqual(addOne(1), 2);",
      "  assertEqual(addOne(2), 3);",
      "  assertEqual(addOne([9, 9].length), 7);",
      "}",
    ].join("\n");
    const r = runTest(USER_CODE, testCode, "test_many");
    expect(r.input).toBe("assertEqual(addOne([9, 9].length), 7);");
  });

  // The line number indexes the composed script, so the offset must survive a
  // user solution of any length. This is the regression that a hard-coded
  // calibration constant would produce.
  it("stays correct as the user's code grows", () => {
    const testCode = `function test_adds() {\n  assertEqual(addOne(41), 99);\n}`;
    for (const pad of [0, 1, 40]) {
      const padded = "// filler\n".repeat(pad) + USER_CODE;
      expect(runTest(padded, testCode, "test_adds").input).toBe("assertEqual(addOne(41), 99);");
    }
  });

  it("omits input when the failure is not an assertEqual", () => {
    const testCode = `function test_throws() {\n  throw new Error("boom");\n}`;
    const r = runTest(USER_CODE, testCode, "test_throws");
    expect(r.passed).toBe(false);
    expect(r.error).toBe("boom");
    expect(r.input).toBeUndefined();
  });

  it("reports nothing for a passing test", () => {
    const testCode = `function test_ok() {\n  assertEqual(addOne(1), 2);\n}`;
    expect(runTest(USER_CODE, testCode, "test_ok").passed).toBe(true);
  });
});

describe("resolveLine", () => {
  const script = "alpha\n  beta  \n\ndelta";
  it("returns the trimmed line", () => {
    expect(resolveLine(script, 2)).toBe("beta");
  });
  it("returns undefined for a null, out-of-range, or blank line", () => {
    expect(resolveLine(script, null)).toBeUndefined();
    expect(resolveLine(script, 0)).toBeUndefined();
    expect(resolveLine(script, 99)).toBeUndefined();
    expect(resolveLine(script, 3)).toBeUndefined();
  });
});

describe("parseError", () => {
  it("passes a non-assertion message through untouched", () => {
    expect(parseError("ReferenceError: foo is not defined", "")).toEqual({
      error: "ReferenceError: foo is not defined",
    });
  });
  it("prefers a caller-supplied message over the generated one", () => {
    const raw = '__ASSERT__{"expected":"1","got":"2","msg":"custom","line":null}';
    expect(parseError(raw, "").error).toBe("custom");
  });
  it("falls back to the raw message when the payload is not JSON", () => {
    expect(parseError("__ASSERT__{oops", "").error).toBe("__ASSERT__{oops");
  });
});

describe("extractTestNames", () => {
  it("finds every test_ function", () => {
    expect(extractTestNames("function test_a(){}\nfunction test_b (){}\nfunction helper(){}")).toEqual([
      "test_a",
      "test_b",
    ]);
  });
});
