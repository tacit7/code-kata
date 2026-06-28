import { Command } from "@tauri-apps/plugin-shell";
import type { TestResult } from "../types/editor";

const RUBY_HELPERS = `
def assert_equal(expected, actual, msg = nil)
  raise (msg || "Expected #{expected.inspect}, got #{actual.inspect}") unless expected == actual
end

def assert_true(condition, msg = nil)
  raise (msg || "Expected truthy, got #{condition.inspect}") unless condition
end

def assert_false(condition, msg = nil)
  raise (msg || "Expected falsy, got #{condition.inspect}") if condition
end
`;

export async function runRubyTests(
  userCode: string,
  testCode: string,
): Promise<TestResult[]> {
  const testNames = [...testCode.matchAll(/def\s+(test_\w+)/g)].map(
    (m) => m[1],
  );

  if (testNames.length === 0) {
    return [
      {
        name: "No tests found",
        passed: false,
        error: "No test_* methods in test code",
      },
    ];
  }

  const testList = testNames.map((n) => `:${n}`).join(", ");
  // Note: #{m} here is Ruby interpolation, not TypeScript — TS only interpolates ${}
  const runner = `
[${testList}].each do |m|
  begin
    send(m)
    $stdout.puts "PASS: \#{m}"
  rescue => e
    $stdout.puts "FAIL: \#{m}: \#{e.message.lines.first&.strip}"
  end
end
`;

  const script = [RUBY_HELPERS, userCode, testCode, runner].join("\n");

  let output: { stdout: string; stderr: string; code: number | null };
  try {
    output = await Command.create("ruby", ["-e", script]).execute();
  } catch {
    return [
      {
        name: "Ruby not found",
        passed: false,
        error: "Ruby is not installed or not in PATH",
      },
    ];
  }

  const stdout = output.stdout ?? "";
  const stderr = output.stderr ?? "";

  // Fatal error (syntax error, etc.) before any tests ran
  if (!stdout.trim() && output.code !== 0) {
    const errMsg = stderr.split("\n").slice(0, 3).join("\n");
    return testNames.map((name) => ({ name, passed: false, error: errMsg }));
  }

  const resultMap = new Map<string, TestResult>();
  for (const line of stdout.split("\n")) {
    if (line.startsWith("PASS: ")) {
      const name = line.slice(6).trim();
      resultMap.set(name, { name, passed: true });
    } else if (line.startsWith("FAIL: ")) {
      const rest = line.slice(6);
      const sep = rest.indexOf(": ");
      const name = sep >= 0 ? rest.slice(0, sep) : rest;
      const error = sep >= 0 ? rest.slice(sep + 2) : "Test failed";
      resultMap.set(name, { name, passed: false, error });
    }
  }

  return testNames.map(
    (name) =>
      resultMap.get(name) ?? { name, passed: false, error: "Test did not run" },
  );
}
