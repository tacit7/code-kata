import { describe, expect, it } from "vitest";
import type { Kata } from "../types/editor";
import { uniqueLeetcodeProblemKatas } from "./problem-list-filter";

const kata = (overrides: Partial<Kata>): Kata => ({
  id: 0,
  name: "Test Kata",
  category: "arrays",
  language: "python",
  difficulty: "easy",
  description: null,
  code: "",
  testCode: "",
  solution: null,
  usage: null,
  tags: [],
  isCustom: false,
  leetcodeNumber: null,
  ...overrides,
});

describe("uniqueLeetcodeProblemKatas", () => {
  it("collapses alternate kata rows for the same LeetCode problem", () => {
    const rows = [
      kata({ id: 1, name: "Climbing Stairs", leetcodeNumber: 70 }),
      kata({ id: 2, name: "Climbing Stairs (Recursive)", leetcodeNumber: 70 }),
      kata({ id: 3, name: "House Robber", leetcodeNumber: 198 }),
    ];

    expect(uniqueLeetcodeProblemKatas(rows).map((row) => row.name)).toEqual([
      "Climbing Stairs",
      "House Robber",
    ]);
  });

  it("preserves unmapped rows by id", () => {
    const rows = [
      kata({ id: 1, name: "Custom Drill" }),
      kata({ id: 1, name: "Custom Drill" }),
      kata({ id: 2, name: "Another Custom Drill" }),
    ];

    expect(uniqueLeetcodeProblemKatas(rows).map((row) => row.id)).toEqual([1, 2]);
  });
});
