import { describe, expect, it } from "vitest";
import { sampleKatas } from "./sample-katas";

describe("JavaScript sample katas", () => {
  it("ships solution variant metadata for every seed with a solution", () => {
    const missing = sampleKatas.flatMap((kata) => {
      if (kata.language !== "javascript" || !kata.solution) return [];

      const variants = kata.solutionVariants ?? [];
      const hasMatchingSolutionVariant = variants.some((variant) => variant.code === kata.solution);
      const incomplete = variants.some((variant) => (
        !variant.label.trim()
        || !variant.code.trim()
        || !variant.complexity?.trim()
        || !variant.explanation?.trim()
      ));

      return variants.length > 0 && hasMatchingSolutionVariant && !incomplete ? [] : [kata.name];
    });

    expect(missing).toEqual([]);
  });
});
