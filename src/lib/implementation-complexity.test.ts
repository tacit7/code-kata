import { describe, expect, it } from "vitest";
import { IMPLEMENTATION_SIZES, implementationComplexityFor, implementationSizeRank } from "./implementation-complexity";

describe("implementationComplexityFor", () => {
  it("classifies implementation size from executable LOC", () => {
    const complexity = implementationComplexityFor({
      solutionVariants: null,
      solution: [
        "def add(a, b):",
        "    total = a + b",
        "    return total",
      ].join("\n"),
    });

    expect(complexity.size).toBe("Tiny");
    expect(complexity.label).toBe("Tiny");
    expect(complexity.codeLines).toBe(3);
    expect(complexity.normalizedCharacters).toBeGreaterThan(0);
  });

  it("uses the first solution variant when variants exist", () => {
    const complexity = implementationComplexityFor({
      solution: "fallback()",
      solutionVariants: [
        { label: "Preferred", code: "x = 1\nreturn x" },
        { label: "Longer", code: "this_should_not_be_used()\n".repeat(100) },
      ],
    });

    expect(complexity.codeLines).toBe(2);
    expect(complexity.label).toBe("Tiny");
  });

  it("ignores blank and comment-only lines", () => {
    const complexity = implementationComplexityFor({
      solutionVariants: null,
      solution: [
        "# explain",
        "",
        "def solve():",
        "    return 42",
        "// alternate comment style",
      ].join("\n"),
    });

    expect(complexity.codeLines).toBe(2);
  });

  it("returns a placeholder when no reference implementation exists", () => {
    const complexity = implementationComplexityFor({ solution: null, solutionVariants: null });

    expect(complexity.size).toBeNull();
    expect(complexity.label).toBe("-");
    expect(complexity.badgeClass).toBe("badge-ghost");
  });

  it("uses the requested implementation size buckets", () => {
    expect(implementationComplexityFor({ solution: "x\n".repeat(5), solutionVariants: null }).size).toBe("Tiny");
    expect(implementationComplexityFor({ solution: "x\n".repeat(6), solutionVariants: null }).size).toBe("Short");
    expect(implementationComplexityFor({ solution: "x\n".repeat(11), solutionVariants: null }).size).toBe("Medium");
    expect(implementationComplexityFor({ solution: "x\n".repeat(21), solutionVariants: null }).size).toBe("Long");
    expect(implementationComplexityFor({ solution: "x\n".repeat(36), solutionVariants: null }).size).toBe("Heavy");
  });

  it("orders implementation sizes from smallest to largest", () => {
    expect(IMPLEMENTATION_SIZES).toEqual(["Tiny", "Short", "Medium", "Long", "Heavy"]);
    expect(implementationSizeRank("Tiny")).toBeLessThan(implementationSizeRank("Heavy"));
    expect(implementationSizeRank(null)).toBe(Number.POSITIVE_INFINITY);
  });
});
