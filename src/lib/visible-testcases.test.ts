import { describe, expect, it } from "vitest";
import type { Kata } from "../types/editor";
import { extractPythonFunctionInfo, visibleTestCasesFor } from "./visible-testcases";

const baseKata: Pick<Kata, "language" | "code" | "testCode"> = {
  language: "python",
  code: "",
  testCode: "",
};

describe("extractPythonFunctionInfo", () => {
  it("extracts the first top-level Python function and parameter names", () => {
    expect(extractPythonFunctionInfo("def two_sum(nums: list[int], target: int) -> list[int]:\n    pass")).toEqual({
      name: "two_sum",
      params: ["nums", "target"],
    });
  });
});

describe("visibleTestCasesFor", () => {
  it("extracts direct assert cases", () => {
    const cases = visibleTestCasesFor({
      ...baseKata,
      code: "def max_profit(prices: list[int]) -> int:\n    pass",
      testCode: `def test_basic_case():
    assert max_profit([7, 1, 5, 3, 6, 4]) == 5

def test_descending_prices():
    assert max_profit([7, 6, 4, 3, 1]) == 0`,
    });

    expect(cases).toMatchObject([
      {
        label: "Case 1",
        testName: "basic case",
        inputs: [{ name: "prices", value: "[7, 1, 5, 3, 6, 4]" }],
        expected: "5",
      },
      {
        label: "Case 2",
        testName: "descending prices",
        inputs: [{ name: "prices", value: "[7, 6, 4, 3, 1]" }],
        expected: "0",
      },
    ]);
  });

  it("extracts assert_equal cases with multiple arguments", () => {
    const cases = visibleTestCasesFor({
      ...baseKata,
      code: "def two_sum(nums: list[int], target: int) -> list[int]:\n    pass",
      testCode: `def test_basic():
    assert_equal(two_sum([2, 7, 11, 15], 9), [0, 1], "basic")`,
    });

    expect(cases[0]).toMatchObject({
      inputs: [
        { name: "nums", value: "[2, 7, 11, 15]" },
        { name: "target", value: "9" },
      ],
      expected: "[0, 1]",
    });
  });

  it("extracts cases that assign the result before asserting", () => {
    const cases = visibleTestCasesFor({
      ...baseKata,
      code: "def solve_n_queens(n: int) -> list[list[str]]:\n    pass",
      testCode: `def test_n_queens_four():
    result = solve_n_queens(4)
    assert len(result) == 2

def test_n_queens_one():
    assert solve_n_queens(1) == [["Q"]]`,
    });

    expect(cases).toMatchObject([
      {
        inputs: [{ name: "n", value: "4" }],
        expected: "length = 2",
      },
      {
        inputs: [{ name: "n", value: "1" }],
        expected: '[["Q"]]',
      },
    ]);
  });
});
