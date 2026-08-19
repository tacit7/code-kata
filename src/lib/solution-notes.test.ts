import { describe, expect, it } from "vitest";
import {
  DEFAULT_SOLUTION_APPROACH,
  DEFAULT_SOLUTION_COMPLEXITY,
  solutionNotesFor,
} from "./solution-notes";

describe("solutionNotesFor", () => {
  it("uses authored approach and complexity when present", () => {
    expect(solutionNotesFor({
      explanation: "Use two pointers.",
      complexity: "Time O(n), Space O(1)",
    })).toEqual({
      approach: "Use two pointers.",
      complexity: "Time O(n), Space O(1)",
    });
  });

  it("provides fallback notes when metadata is missing", () => {
    expect(solutionNotesFor({})).toEqual({
      approach: DEFAULT_SOLUTION_APPROACH,
      complexity: DEFAULT_SOLUTION_COMPLEXITY,
    });
  });
});
