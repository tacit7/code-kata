import { composeScript, extractTestNames, parseError } from "./js-exec-core";
import type { TestResult } from "../types/editor";

self.onmessage = (e: MessageEvent<{ userCode: string; testCode: string }>) => {
  const { userCode, testCode } = e.data;

  const testNames = extractTestNames(testCode);

  if (testNames.length === 0) {
    self.postMessage([{ name: "No tests found", passed: false, error: "No test_* functions in test code" }]);
    return;
  }

  const results: TestResult[] = [];

  for (const name of testNames) {
    const script = composeScript(userCode, testCode, name);
    try {
      new Function(script)();
      results.push({ name, passed: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const { error, expected, got, input } = parseError(raw, script);
      results.push({ name, passed: false, error, expected, got, input });
    }
  }

  self.postMessage(results);
};
