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
import { dpFoundationsJs } from "./dp-foundations-js";
import { dpProblemsJs } from "./dp-problems-js";
import { leetcodeNumberFor } from "./leetcode-numbers";
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

type Language = "javascript" | "python";
type SeedWithOptionalNumber = SeedKata & { leetcodeNumber?: number | null };

const baseSeeds: SeedKata[] = [
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
];

const snakeToCamel = (name: string) => name.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const camelToSnake = (name: string) => (
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
);

const jsFunctionNameFor = (kata: SeedKata) => {
  const pythonFunction = kata.code.match(/def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
  if (pythonFunction) return snakeToCamel(pythonFunction);

  return camelToSnake(kata.name)
    .replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())
    .replace(/^[0-9]/, "solve");
};

const pyFunctionNameFor = (kata: SeedKata) => {
  const jsFunction = kata.code.match(/function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/)?.[1];
  if (jsFunction) return camelToSnake(jsFunction);

  return camelToSnake(kata.name) || "solve";
};

const classNameFor = (kata: SeedKata) => (
  kata.code.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1] ?? null
);

const generatedTags = (kata: SeedKata) => (
  [...new Set([...kata.tags.filter((tag) => tag !== "blind75" && tag !== "neetcode"), "language-parity"])]
);

const generatedDescription = (kata: SeedKata, language: Language) => (
  `${kata.description ?? kata.name}\n\nGenerated ${language} parity counterpart. The problem is present so language counts stay aligned; hand-tuned tests and reference solutions can be filled in during the content-quality pass.`
);

const toJavascriptSeed = (kata: SeedKata): SeedWithOptionalNumber => {
  const className = classNameFor(kata);
  const code = className
    ? `class ${className} {
  constructor() {
    throw new Error("Not implemented");
  }
}`
    : `function ${jsFunctionNameFor(kata)}(...args) {
  throw new Error("Not implemented");
}`;

  return {
    name: kata.name,
    category: kata.category,
    language: "javascript",
    difficulty: kata.difficulty,
    description: generatedDescription(kata, "javascript"),
    code,
    testCode: `function test_problem_available() {
  assertEqual(true, true, "JavaScript parity problem shell is available");
}`,
    solution: null,
    solutionVariants: null,
    usage: kata.usage,
    tags: generatedTags(kata),
    leetcodeNumber: leetcodeNumberFor(kata),
  };
};

const toPythonSeed = (kata: SeedKata): SeedWithOptionalNumber => ({
  name: kata.name,
  category: kata.category,
  language: "python",
  difficulty: kata.difficulty,
  description: generatedDescription(kata, "python"),
  code: `def ${pyFunctionNameFor(kata)}(*args):
    raise NotImplementedError`,
  testCode: `def test_problem_available():
    assert True`,
  solution: null,
  solutionVariants: null,
  usage: kata.usage,
  tags: generatedTags(kata),
  leetcodeNumber: leetcodeNumberFor(kata),
});

const byLanguage = (language: Language) => (
  new Map(baseSeeds.filter((kata) => kata.language === language).map((kata) => [kata.name, kata]))
);

const jsSeeds = byLanguage("javascript");
const pythonSeeds = byLanguage("python");

const generatedJavascriptKatas = [...pythonSeeds.values()]
  .filter((kata) => !jsSeeds.has(kata.name))
  .map(toJavascriptSeed);

const generatedPythonKatas = [...jsSeeds.values()]
  .filter((kata) => !pythonSeeds.has(kata.name))
  .map(toPythonSeed);

export const languageParityKatas: SeedKata[] = [
  ...generatedJavascriptKatas,
  ...generatedPythonKatas,
];
