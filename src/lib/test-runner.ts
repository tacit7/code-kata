import type { TestResult } from "../types/editor";

const ASSERT_HELPERS = `
function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(message || "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
}
`;

export function runTests(userCode: string, testCode: string): TestResult[] {
  const testNames = [...testCode.matchAll(/function\s+(test_\w+)\s*\(/g)].map(
    (m) => m[1],
  );

  if (testNames.length === 0) {
    return [{ name: "No tests found", passed: false, error: "No test_* functions in test code" }];
  }

  const results: TestResult[] = [];

  for (const name of testNames) {
    try {
      const script = `${ASSERT_HELPERS}\n${userCode}\n${testCode}\n${name}();`;
      new Function(script)();
      results.push({ name, passed: true });
    } catch (err) {
      results.push({
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
