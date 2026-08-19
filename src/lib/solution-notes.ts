import type { SolutionVariant } from "../types/editor";

export const DEFAULT_SOLUTION_COMPLEXITY = "Not documented yet.";
export const DEFAULT_SOLUTION_APPROACH = "No approach notes yet.";

export interface SolutionNotes {
  complexity: string;
  approach: string;
}

export function solutionNotesFor(
  solution: Pick<SolutionVariant, "complexity" | "explanation">,
): SolutionNotes {
  return {
    complexity: solution.complexity?.trim() || DEFAULT_SOLUTION_COMPLEXITY,
    approach: solution.explanation?.trim() || DEFAULT_SOLUTION_APPROACH,
  };
}
