import { describe, it, expect } from "vitest";
import { extractTestCall } from "./repl-seed";

describe("extractTestCall", () => {
  it("ruby: takes the actual (second) arg of assert_equal", () => {
    const code = 'def test_add\n  assert_equal(3, add(1, 2))\nend\ndef test_other\n  assert_equal(9, add(4, 5))\nend';
    expect(extractTestCall(code, "test_add", "ruby")).toBe("add(1, 2)");
    expect(extractTestCall(code, "test_other", "ruby")).toBe("add(4, 5)");
  });
  it("python: takes the actual (first) arg", () => {
    const code = 'def test_group():\n    assert_equal(group(["a", "b"]), {"a": 1})';
    expect(extractTestCall(code, "test_group", "python")).toBe('group(["a", "b"])');
  });
  it("javascript: assertEqual actual-first", () => {
    const code = 'function test_freq() {\n  assertEqual(frequencyCount([1, 2, 2]), {"1":1,"2":2});\n}';
    expect(extractTestCall(code, "test_freq", "javascript")).toBe("frequencyCount([1, 2, 2])");
  });
  it("handles nested parens, brackets, and strings with commas", () => {
    const code = 'def test_x\n  assert_equal([[1, 2], [3]], solve("a,b", [1, [2, 3]]))\nend';
    expect(extractTestCall(code, "test_x", "ruby")).toBe('solve("a,b", [1, [2, 3]])');
  });
  it("assert_true takes the condition", () => {
    const code = "def test_ok\n  assert_true(valid?([1]))\nend";
    expect(extractTestCall(code, "test_ok", "ruby")).toBe("valid?([1])");
  });
  it("returns null for unknown test or no assertion", () => {
    expect(extractTestCall("def test_a\n  puts 1\nend", "test_a", "ruby")).toBeNull();
    expect(extractTestCall("def test_a\nend", "test_missing", "ruby")).toBeNull();
  });
});
