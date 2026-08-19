import { describe, expect, it } from "vitest";
import type { SeedKata } from "../types/editor";
import { blind75Part1 } from "./blind75-additions-part1";
import { blind75Part2 } from "./blind75-additions-part2";
import { blind75Part3 } from "./blind75-additions-part3";
import { blind75Part4 } from "./blind75-additions-part4";
import { blind75Part5 } from "./blind75-additions-part5";
import { blind75Part6 } from "./blind75-additions-part6";
import { blind75Part7 } from "./blind75-additions-part7";
import { blind75Part8 } from "./blind75-additions-part8";
import { dpFoundations } from "./dp-foundations";
import { neetcode2dDp } from "./neetcode-2d-dp";
import { neetcodeAdvancedGraphs } from "./neetcode-advanced-graphs";
import { neetcodeBacktracking } from "./neetcode-backtracking";
import { neetcodeBinarySearch } from "./neetcode-binary-search";
import { neetcodeGraphs } from "./neetcode-graphs";
import { neetcodeGreedy } from "./neetcode-greedy";
import { neetcodeHeap } from "./neetcode-heap";
import { neetcodeMathBit } from "./neetcode-math-bit";
import { neetcodeStack } from "./neetcode-stack";
import { neetcodeTrees } from "./neetcode-trees";
import { sampleKatasPython } from "./sample-katas-python";

const PYTHON_SEED_KATAS: SeedKata[] = [
  ...sampleKatasPython,
  ...dpFoundations,
  ...blind75Part1,
  ...blind75Part2,
  ...blind75Part3,
  ...blind75Part4,
  ...blind75Part5,
  ...blind75Part6,
  ...blind75Part7,
  ...blind75Part8,
  ...neetcodeStack,
  ...neetcodeBinarySearch,
  ...neetcodeTrees,
  ...neetcodeBacktracking,
  ...neetcodeHeap,
  ...neetcodeGraphs,
  ...neetcodeGreedy,
  ...neetcodeAdvancedGraphs,
  ...neetcode2dDp,
  ...neetcodeMathBit,
];

const kataKey = (kata: SeedKata) => `${kata.language} ${kata.name}`;

describe("Python solution variants", () => {
  it("gives every Python seed solution at least one structured variant", () => {
    const missingVariants = PYTHON_SEED_KATAS
      .filter((kata) => kata.language === "python" && kata.solution?.trim())
      .filter((kata) => !kata.solutionVariants?.length)
      .map(kataKey);

    expect(missingVariants).toEqual([]);
  });

  it("fills complexity and explanation for every Python solution variant", () => {
    const incompleteMetadata = PYTHON_SEED_KATAS.flatMap((kata) => {
      if (kata.language !== "python" || !kata.solutionVariants?.length) return [];

      return kata.solutionVariants.flatMap((variant) => (
        /\btime\b/i.test(variant.complexity ?? "")
          && /\bspace\b/i.test(variant.complexity ?? "")
          && variant.explanation?.trim()
          ? []
          : [`${kataKey(kata)} :: ${variant.label}`]
      ));
    });

    expect(incompleteMetadata).toEqual([]);
  });

  it("uses the raw seed solution for generated reference variants", () => {
    const mismatchedReferenceVariants = PYTHON_SEED_KATAS
      .filter((kata) => kata.language === "python" && kata.solution?.trim())
      .flatMap((kata) => {
        const reference = kata.solutionVariants?.find((variant) => variant.label === "Reference solution");
        return reference && reference.code !== kata.solution ? [kataKey(kata)] : [];
      });

    expect(mismatchedReferenceVariants).toEqual([]);
  });
});
