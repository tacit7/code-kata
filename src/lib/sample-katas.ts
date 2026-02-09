export interface SampleKata {
  id: string;
  name: string;
  language: "javascript";
  code: string;
  testCode: string;
}

export const sampleKatas: Record<string, SampleKata> = {
  "two-sum": {
    id: "two-sum",
    name: "Two Sum",
    language: "javascript",
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
  },
  fizzbuzz: {
    id: "fizzbuzz",
    name: "FizzBuzz",
    language: "javascript",
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
  },
};
