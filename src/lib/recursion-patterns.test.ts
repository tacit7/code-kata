import { describe, expect, it } from "vitest";
import { recursionFoundations } from "./recursion-foundations";
import {
  compareRecursionCurriculumOrder,
  recursionFamilyFor,
  RECURSION_CURRICULUM_ORDER,
  RECURSION_MODULES,
} from "./recursion-patterns";

describe("recursion curriculum", () => {
  it("defines the Call Flow submodule in teaching order", () => {
    expect(RECURSION_MODULES).toEqual([
      { id: "recursion-call-flow", label: "1. Call Flow" },
      { id: "recursion-numeric", label: "2. Numeric Recursion" },
      { id: "recursion-array", label: "3. Array Recursion" },
      { id: "recursion-string", label: "4. String Recursion" },
      { id: "recursion-branching", label: "5. Branching Recursion" },
      { id: "recursion-binary-tree", label: "6. Binary Tree Recursion" },
      { id: "recursion-backtracking", label: "7. Recursive Backtracking" },
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-call-flow"]).toEqual([
      "Countdown",
      "Print Evens Down",
      "Print Stars Shrinking",
      "Print Array Forward Recursively",
      "Count Up",
      "Sum From 1 to N",
      "Factorial",
      "Power of Number",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-numeric"]).toEqual([
      "Count Digits",
      "Sum Digits",
      "Product of Digits",
      "Reverse Number",
      "Multiply Using Addition",
      "Count Halvings to One",
      "Is Power of Two",
      "Steps to Reduce to Zero",
      "Greatest Common Divisor",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-array"]).toEqual([
      "Count Items",
      "Sum Array",
      "Contains Target",
      "Count Target Occurrences",
      "Find Maximum",
      "Check If Sorted",
      "First Index of Target",
      "Last Index of Target",
      "All Indices of Target",
      "Reverse Array Recursively",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-string"]).toEqual([
      "Count Characters",
      "Count Vowels",
      "Count Character Occurrences",
      "Reverse String",
      "Palindrome Check",
      "Remove Character",
      "Replace Character",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-branching"]).toEqual([
      "Fibonacci Number (Recursive)",
      "Climbing Stairs (Recursive Choices)",
      "Count Ways to Reach N",
      "Generate Binary Strings (Recursive Choices)",
      "Generate Coin Flip Outcomes",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-binary-tree"]).toEqual([
      "Count Nodes (Recursive)",
      "Sum Tree Values",
      "Find Max in Tree",
      "Count Leaves (Recursive)",
      "Tree Height",
      "Contains Value in Tree",
      "Invert Binary Tree (Recursive)",
      "Same Tree (Recursive)",
    ]);
    expect(RECURSION_CURRICULUM_ORDER["recursion-backtracking"]).toEqual([
      "Generate Subsets",
      "Generate Binary Strings of Length N",
      "Generate Permutations",
      "Letter Case Permutation",
      "Simple Maze Paths",
    ]);
  });

  it("ships recursion modules as Python seed katas", () => {
    expect(recursionFoundations.map((kata) => kata.name)).toEqual(
      [
        ...RECURSION_CURRICULUM_ORDER["recursion-call-flow"],
        ...RECURSION_CURRICULUM_ORDER["recursion-numeric"],
        ...RECURSION_CURRICULUM_ORDER["recursion-array"],
        ...RECURSION_CURRICULUM_ORDER["recursion-string"],
        ...RECURSION_CURRICULUM_ORDER["recursion-branching"],
        ...RECURSION_CURRICULUM_ORDER["recursion-binary-tree"],
        ...RECURSION_CURRICULUM_ORDER["recursion-backtracking"],
      ],
    );
    for (const kata of recursionFoundations) {
      expect(kata.language).toBe("python");
      expect(kata.category).toBe("recursion");
      expect(kata.tags.some((tag) => tag === "recursion-call-flow" || tag === "recursion-numeric" || tag === "recursion-array" || tag === "recursion-string" || tag === "recursion-branching" || tag === "recursion-binary-tree" || tag === "recursion-backtracking")).toBe(true);
      expect(kata.solutionVariants?.[0]).toMatchObject({
        code: kata.solution,
      });
      expect(kata.solutionVariants?.[0]?.complexity).toBeTruthy();
      expect(kata.solutionVariants?.[0]?.explanation).toBeTruthy();
    }
  });

  it("does not ship malformed Python test function definitions", () => {
    const malformedTestDefs = recursionFoundations
      .filter((kata) => /^def\s+\w+\s*:/m.test(kata.testCode))
      .map((kata) => kata.name);

    expect(malformedTestDefs).toEqual([]);
  });

  it("recognizes only explicit recursion submodule tags", () => {
    expect(recursionFamilyFor({ tags: ["recursion", "trees"] })).toBeNull();
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-call-flow"] })).toBe("recursion-call-flow");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-numeric"] })).toBe("recursion-numeric");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-array"] })).toBe("recursion-array");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-string"] })).toBe("recursion-string");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-branching"] })).toBe("recursion-branching");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-binary-tree"] })).toBe("recursion-binary-tree");
    expect(recursionFamilyFor({ tags: ["recursion", "recursion-backtracking"] })).toBe("recursion-backtracking");
  });

  it("sorts katas by recursion curriculum order", () => {
    const sorted = [...recursionFoundations].reverse().sort(compareRecursionCurriculumOrder);
    expect(sorted.map((kata) => kata.name)).toEqual(
      [
        ...RECURSION_CURRICULUM_ORDER["recursion-call-flow"],
        ...RECURSION_CURRICULUM_ORDER["recursion-numeric"],
        ...RECURSION_CURRICULUM_ORDER["recursion-array"],
        ...RECURSION_CURRICULUM_ORDER["recursion-string"],
        ...RECURSION_CURRICULUM_ORDER["recursion-branching"],
        ...RECURSION_CURRICULUM_ORDER["recursion-binary-tree"],
        ...RECURSION_CURRICULUM_ORDER["recursion-backtracking"],
      ],
    );
  });
});
