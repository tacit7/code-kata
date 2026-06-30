const ASSERT_HELPERS = `
function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const payload = JSON.stringify({
      expected: JSON.stringify(expected),
      got: JSON.stringify(actual),
      msg: message || null,
    });
    throw new Error("__ASSERT__" + payload);
  }
}
`;

function parseError(raw: string): { error: string; expected?: string; got?: string } {
  const idx = raw.indexOf("__ASSERT__");
  if (idx === -1) return { error: raw };
  try {
    const data = JSON.parse(raw.slice(idx + 10)) as { expected: string; got: string; msg: string | null };
    return {
      error: data.msg ?? `Expected ${data.expected}, got ${data.got}`,
      expected: data.expected,
      got: data.got,
    };
  } catch {
    return { error: raw };
  }
}

self.onmessage = (e: MessageEvent<{ userCode: string; testCode: string }>) => {
  const { userCode, testCode } = e.data;

  const testNames = [...testCode.matchAll(/function\s+(test_\w+)\s*\(/g)].map((m) => m[1]);

  if (testNames.length === 0) {
    self.postMessage([{ name: "No tests found", passed: false, error: "No test_* functions in test code" }]);
    return;
  }

  const results: Array<{ name: string; passed: boolean; error?: string; expected?: string; got?: string }> = [];

  for (const name of testNames) {
    try {
      const script = `${ASSERT_HELPERS}\n${userCode}\n${testCode}\n${name}();`;
      new Function(script)();
      results.push({ name, passed: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const { error, expected, got } = parseError(raw);
      results.push({ name, passed: false, error, expected, got });
    }
  }

  self.postMessage(results);
};
