import { invoke } from "@tauri-apps/api/core";
import type { TestResult } from "../types/editor";

export function runJavaTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  return invoke<TestResult[]>("run_java_tests", { userCode, testCode });
}
