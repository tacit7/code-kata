import type { TestResult } from "../types/editor";

export interface FailureMessage {
  title: string;
  summary: string;
  tone: "assertion" | "syntax" | "runtime" | "timeout" | "runner";
}

function cleanError(error: string | undefined): string {
  return (error ?? "Test failed").trim() || "Test failed";
}

function firstLine(text: string): string {
  return text.split("\n").find((line) => line.trim())?.trim() ?? text.trim();
}

export function failureMessageFor(result: TestResult): FailureMessage | null {
  if (result.passed) return null;

  if (result.expected !== undefined || result.got !== undefined) {
    return {
      title: "Wrong answer",
      summary: "The function ran, but returned a different value than this test expected.",
      tone: "assertion",
    };
  }

  const error = cleanError(result.error);
  const kind = result.errorKind;

  if (kind === "timeout" || /exceeded \d+s|timeout|infinite loop/i.test(error)) {
    return {
      title: "Timed out",
      summary: "The test runner stopped this run because it took too long. Check for an infinite loop or unexpectedly slow logic.",
      tone: "timeout",
    };
  }

  if (kind === "syntax" || /^SyntaxError\b/i.test(error)) {
    return {
      title: "Syntax error",
      summary: firstLine(error),
      tone: "syntax",
    };
  }

  if (kind === "runtime" || /^[A-Za-z_][A-Za-z0-9_]*(Error|Exception)\b/.test(error)) {
    return {
      title: "Runtime error",
      summary: firstLine(error),
      tone: "runtime",
    };
  }

  return {
    title: "Test failed",
    summary: firstLine(error),
    tone: "runner",
  };
}
