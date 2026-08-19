import { describe, expect, it } from "vitest";
import { failureMessageFor } from "./test-result-message";

describe("failureMessageFor", () => {
  it("summarizes expected/got failures as wrong answers", () => {
    expect(failureMessageFor({
      name: "test_case",
      passed: false,
      expected: "[1,2]",
      got: "[2,1]",
    })).toMatchObject({
      title: "Wrong answer",
      tone: "assertion",
    });
  });

  it("keeps syntax errors specific", () => {
    expect(failureMessageFor({
      name: "test_case",
      passed: false,
      errorKind: "syntax",
      error: "SyntaxError: invalid syntax\n  File \"<user_code>\", line 3",
    })).toEqual({
      title: "Syntax error",
      summary: "SyntaxError: invalid syntax",
      tone: "syntax",
    });
  });

  it("identifies timeouts", () => {
    expect(failureMessageFor({
      name: "Timeout",
      passed: false,
      error: "Execution exceeded 5s — possible infinite loop",
    })).toMatchObject({
      title: "Timed out",
      tone: "timeout",
    });
  });
});
