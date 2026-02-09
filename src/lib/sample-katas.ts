import type { Kata } from "../types/editor";

export const sampleKatas: Kata[] = [
  {
    id: "two-sum",
    name: "Two Sum",
    category: "arrays",
    language: "javascript",
    difficulty: "easy",
    description:
      "Given an array of integers and a target, return indices of the two numbers that add up to target.",
    code: `// Given an array of integers and a target,
// return indices of the two numbers that add up to target.
// Each input has exactly one solution; don't reuse the same element.

function twoSum(nums, target) {
  // your code here
}
`,
    testCode: `function test_basic_case() {
  const result = twoSum([2, 7, 11, 15], 9);
  assertEqual(result.sort(), [0, 1], "twoSum([2,7,11,15], 9) should return [0,1]");
}

function test_middle_elements() {
  const result = twoSum([3, 2, 4], 6);
  assertEqual(result.sort(), [1, 2], "twoSum([3,2,4], 6) should return [1,2]");
}

function test_negative_numbers() {
  const result = twoSum([-1, -2, -3, -4, -5], -8);
  assertEqual(result.sort(), [2, 4], "twoSum([-1,-2,-3,-4,-5], -8) should return [2,4]");
}

function test_first_and_last() {
  const result = twoSum([1, 5, 3, 7], 8);
  assertEqual(result.sort(), [0, 3], "twoSum([1,5,3,7], 8) should return [0,3]");
}
`,
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`,
  },
  {
    id: "fizzbuzz",
    name: "FizzBuzz",
    category: "strings",
    language: "javascript",
    difficulty: "easy",
    description:
      "Return an array of strings from 1 to n with Fizz, Buzz, and FizzBuzz substitutions.",
    code: `// Return an array of strings from 1 to n:
// - "Fizz" for multiples of 3
// - "Buzz" for multiples of 5
// - "FizzBuzz" for multiples of both 3 and 5
// - The number as a string otherwise

function fizzBuzz(n) {
  // your code here
}
`,
    testCode: `function test_returns_array() {
  const result = fizzBuzz(1);
  assert(Array.isArray(result), "fizzBuzz should return an array");
}

function test_simple_numbers() {
  const result = fizzBuzz(2);
  assertEqual(result, ["1", "2"], "fizzBuzz(2) should return ['1','2']");
}

function test_fizz() {
  const result = fizzBuzz(3);
  assertEqual(result[2], "Fizz", "Third element should be 'Fizz'");
}

function test_buzz() {
  const result = fizzBuzz(5);
  assertEqual(result[4], "Buzz", "Fifth element should be 'Buzz'");
}

function test_fizzbuzz() {
  const result = fizzBuzz(15);
  assertEqual(result[14], "FizzBuzz", "15th element should be 'FizzBuzz'");
}

function test_full_sequence() {
  const result = fizzBuzz(5);
  assertEqual(result, ["1", "2", "Fizz", "4", "Buzz"], "fizzBuzz(5) should match expected sequence");
}
`,
    solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`,
  },
];
