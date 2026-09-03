import { describe, expect, it } from "vitest";
import { blind75Part1 } from "./blind75-additions-part1";
import { blind75Part2 } from "./blind75-additions-part2";
import { blind75Part3 } from "./blind75-additions-part3";
import { blind75Part4 } from "./blind75-additions-part4";
import { blind75Part5 } from "./blind75-additions-part5";
import { blind75Part6 } from "./blind75-additions-part6";
import { blind75Part7 } from "./blind75-additions-part7";
import { blind75Part8 } from "./blind75-additions-part8";
import { dpFoundations } from "./dp-foundations";
import { dpFoundationsJs } from "./dp-foundations-js";
import { dpProblemsJs } from "./dp-problems-js";
import { languageParityKatas } from "./language-parity-katas";
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
import { recursionFoundations } from "./recursion-foundations";
import { sampleKatas } from "./sample-katas";
import { sampleKatasPython } from "./sample-katas-python";
import { treeFundamentals } from "./tree-fundamentals";

const allSeedKatas = [
  ...sampleKatas,
  ...sampleKatasPython,
  ...recursionFoundations,
  ...treeFundamentals,
  ...dpFoundations,
  ...dpFoundationsJs,
  ...dpProblemsJs,
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
  ...languageParityKatas,
];

describe("JavaScript sample katas", () => {
  it("keeps JavaScript and Python seed problem names at parity", () => {
    const jsNames = new Set(
      allSeedKatas
        .filter((kata) => kata.language === "javascript")
        .map((kata) => kata.name),
    );
    const pythonNames = new Set(
      allSeedKatas
        .filter((kata) => kata.language === "python")
        .map((kata) => kata.name),
    );
    const missingJavascript = [...pythonNames].filter((name) => !jsNames.has(name));
    const missingPython = [...jsNames].filter((name) => !pythonNames.has(name));
    const javascriptCount = allSeedKatas.filter((kata) => kata.language === "javascript").length;
    const pythonCount = allSeedKatas.filter((kata) => kata.language === "python").length;
    const duplicateKeys = allSeedKatas
      .map((kata) => `${kata.language}:${kata.name}`)
      .filter((key, index, keys) => keys.indexOf(key) !== index);

    expect(missingJavascript).toEqual([]);
    expect(missingPython).toEqual([]);
    expect(javascriptCount).toBe(pythonCount);
    expect(duplicateKeys).toEqual([]);
  });

  it("has a JavaScript problem for every Python sample kata", () => {
    const jsNames = new Set(
      allSeedKatas
        .filter((kata) => kata.language === "javascript")
        .map((kata) => kata.name),
    );
    const missing = sampleKatasPython
      .filter((kata) => !jsNames.has(kata.name))
      .map((kata) => kata.name);

    expect(missing).toEqual([]);
  });

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
