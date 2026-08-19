import { describe, expect, it } from "vitest";
import { agentPromptFor, buildAgentEditorContext } from "./agent-bridge";
import type { Kata } from "../types/editor";

const kata: Kata = {
  id: 7,
  name: "Two Sum",
  category: "arrays",
  language: "python",
  difficulty: "easy",
  description: "Return the indices of two numbers that add to target.",
  code: "def two_sum(nums, target):\n    pass",
  testCode: "def test_example():\n    assert two_sum([2, 7], 9) == [0, 1]",
  solution: "def two_sum(nums, target):\n    return [0, 1]",
  solutionVariants: [
    {
      label: "Hash map",
      code: "def two_sum(nums, target):\n    return [0, 1]",
    },
  ],
  usage: null,
  tags: ["neetcode", "blind75"],
  isCustom: false,
  leetcodeNumber: 1,
};

describe("buildAgentEditorContext", () => {
  it("exports student-facing problem context without solution code", () => {
    const context = buildAgentEditorContext({
      kata,
      code: "def two_sum(nums, target):\n    return []",
      selectedCode: "return []",
      selection: { startLineNumber: 2, startColumn: 5, endLineNumber: 2, endColumn: 14 },
      cursor: { lineNumber: 2, column: 14 },
      isSession: true,
      leetcodeNumber: 1,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      visibleTestCases: [{ name: "example", inputs: { nums: "[2, 7]", target: "9" }, expected: "[0, 1]" }],
      notes: "Use a map.",
      ranAt: "10:42:00 AM",
      results: [{ name: "example", passed: false, expected: "[0, 1]", got: "[]" }],
      hasReferenceSolution: true,
      activeVariantLabel: "Hash map",
    });

    expect(context.version).toBe(1);
    expect(context.kata.name).toBe("Two Sum");
    expect(context.editor.selectedCode).toBe("return []");
    expect(context.problem.visibleTestCases[0].inputs).toEqual({ nums: "[2, 7]", target: "9" });
    expect(context.solution).toEqual({ hasReferenceSolution: true, activeVariantLabel: "Hash map" });
    expect(JSON.stringify(context)).not.toContain("return [0, 1]");
  });

  it("builds a tutoring prompt from student context without solution code", () => {
    const context = buildAgentEditorContext({
      kata,
      code: "def two_sum(nums, target):\n    return []",
      selectedCode: "",
      selection: null,
      cursor: null,
      isSession: false,
      leetcodeNumber: 1,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      visibleTestCases: [],
      notes: "",
      ranAt: "",
      results: [{ name: "example", passed: false, expected: "[0, 1]", got: "[]" }],
      hasReferenceSolution: true,
      activeVariantLabel: "Hash map",
    });

    const prompt = agentPromptFor(context);

    expect(prompt).toContain(".codex/skills/kata-student-helper/SKILL.md");
    expect(prompt).toContain("Do not reveal the full reference solution");
    expect(prompt).toContain("Problem: Two Sum");
    expect(prompt).toContain("Student Code:");
    expect(prompt).toContain("Latest Failed Results:");
    expect(prompt).not.toContain("return [0, 1]");
  });
});
