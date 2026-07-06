import type { TestResult } from "../types/editor";

export const INIT_TIMEOUT_MS = 15_000;
export const EXEC_TIMEOUT_MS = 5_000;
export const OUTPUT_CAP_BYTES = 262_144;
export const UI_TRUNCATE_BYTES = 8_192;

export function extractTestNames(testCode: string): string[] {
  return [...testCode.matchAll(/def\s+(test_\w+)/g)].map((m) => m[1]);
}

// Helpers loaded BEFORE user code. Expected-first, matching Minitest.
// Assertion failures carry structured data via an __ASSERT__ JSON payload,
// mirroring the JS test worker's protocol.
export function buildPrelude(): string {
  return `
require "json"
require "stringio"

module KataAssertions
  def assert_equal(expected, actual, msg = nil)
    return if expected == actual
    raise "__ASSERT__" + JSON.generate({
      "expected" => expected.inspect,
      "got" => actual.inspect,
      "msg" => msg,
    })
  end

  def assert_true(condition, msg = nil)
    raise(msg || "Expected truthy, got #{condition.inspect}") unless condition
  end

  def assert_false(condition, msg = nil)
    raise(msg || "Expected falsy, got #{condition.inspect}") if condition
  end
end
include KataAssertions
`;
}

// Runs each test in source order in the same VM, capturing per-test stdout
// via a StringIO swap (capped at OUTPUT_CAP_BYTES). Rescues Exception (not
// just StandardError) so SystemExit from user "exit" fails the test instead
// of killing the VM. Final expression is the JSON results string, returned
// by vm.eval.
export function buildRunnerScript(testNames: string[]): string {
  const list = testNames.map((n) => `:${n}`).join(", ");
  return `
__kata_results = []
[${list}].each do |__kata_name|
  __kata_buf = StringIO.new
  __kata_orig = $stdout
  $stdout = __kata_buf
  begin
    send(__kata_name)
    if __kata_buf.string.bytesize > ${OUTPUT_CAP_BYTES}
      __kata_results << { "name" => __kata_name.to_s, "passed" => false, "output" => __kata_buf.string[0, ${OUTPUT_CAP_BYTES}], "error" => "Output limit exceeded (256 KB)" }
    else
      __kata_results << { "name" => __kata_name.to_s, "passed" => true, "output" => __kata_buf.string[0, ${OUTPUT_CAP_BYTES}] }
    end
  rescue Exception => __kata_e
    __kata_entry = { "name" => __kata_name.to_s, "passed" => false, "output" => __kata_buf.string[0, ${OUTPUT_CAP_BYTES}] }
    if __kata_buf.string.bytesize > ${OUTPUT_CAP_BYTES}
      __kata_entry["error"] = "Output limit exceeded (256 KB)"
      __kata_results << __kata_entry
    else
    __kata_msg = __kata_e.message.to_s
    __kata_idx = __kata_msg.index("__ASSERT__")
    if __kata_idx
      begin
        __kata_data = JSON.parse(__kata_msg[(__kata_idx + 10)..])
        __kata_entry["error"] = __kata_data["msg"] || "Expected #{__kata_data["expected"]}, got #{__kata_data["got"]}"
        __kata_entry["expected"] = __kata_data["expected"]
        __kata_entry["got"] = __kata_data["got"]
      rescue
        __kata_entry["error"] = __kata_msg
      end
    else
      __kata_entry["error"] = "#{__kata_e.class}: #{__kata_msg}"
    end
    __kata_results << __kata_entry
    end
  ensure
    $stdout = __kata_orig
  end
end
JSON.generate(__kata_results)
`;
}

interface RawResult {
  name: string;
  passed: boolean;
  error?: string;
  expected?: string;
  got?: string;
  output?: string;
}

function truncate(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  return trimmed.length > UI_TRUNCATE_BYTES
    ? trimmed.slice(0, UI_TRUNCATE_BYTES) + "…[truncated]"
    : trimmed;
}

export function parseRunResults(json: string, testNames: string[]): TestResult[] {
  let raw: RawResult[];
  try {
    raw = JSON.parse(json) as RawResult[];
    if (!Array.isArray(raw)) throw new Error("not an array");
  } catch {
    return loadErrorResult(`Runner returned unparseable output: ${json.slice(0, 200)}`);
  }
  const byName = new Map(raw.map((r) => [r.name, r]));
  return testNames.map((name) => {
    const r = byName.get(name);
    if (!r) return { name, passed: false, error: "Test did not run" };
    if (r.passed) {
      const output = truncate(r.output);
      return output ? { name, passed: true, output } : { name, passed: true };
    }
    return {
      name,
      passed: false,
      error: truncate(r.error) ?? "Test failed",
      expected: r.expected,
      got: r.got,
      output: truncate(r.output),
    };
  });
}

export function loadErrorResult(message: string): TestResult[] {
  return [{ name: "load_error", passed: false, error: truncate(message) ?? "Load error" }];
}

export function runnerErrorResult(): TestResult[] {
  return [{ name: "runner_error", passed: false, error: "No test_* methods in test code" }];
}

// ── REPL support ──────────────────────────────────────────────────────────
// A REPL session is one persistent VM holding a single Binding, so local
// variables survive across inputs (separate top-level evals would not share
// locals). Inputs are embedded as Ruby string literals and evaluated inside
// that binding.

export interface ReplResult {
  ok: boolean;
  value?: string;
  error?: string;
  output?: string;
}

// Escapes arbitrary code as a Ruby double-quoted string literal. JSON string
// escaping is valid in Ruby double-quotes except `#{` interpolation, so `#`
// is additionally escaped.
export function rubyStringLiteral(code: string): string {
  return JSON.stringify(code).replace(/#/g, "\\#");
}

export function buildReplSetupScript(): string {
  return `${buildPrelude()}\n$__kata_repl_binding = binding\nnil`;
}

export function buildReplEvalScript(code: string): string {
  return `
__repl_buf = StringIO.new
__repl_orig = $stdout
$stdout = __repl_buf
begin
  __repl_val = $__kata_repl_binding.eval(${rubyStringLiteral(code)})
  JSON.generate({ "ok" => true, "value" => __repl_val.inspect[0, ${UI_TRUNCATE_BYTES}], "output" => __repl_buf.string[0, ${OUTPUT_CAP_BYTES}] })
rescue Exception => __repl_e
  JSON.generate({ "ok" => false, "error" => "#{__repl_e.class}: #{__repl_e.message}"[0, ${UI_TRUNCATE_BYTES}], "output" => __repl_buf.string[0, ${OUTPUT_CAP_BYTES}] })
ensure
  $stdout = __repl_orig
end
`;
}

export function parseReplResult(json: string): ReplResult {
  try {
    const raw = JSON.parse(json) as ReplResult;
    return {
      ok: !!raw.ok,
      value: raw.value,
      error: raw.error,
      output: raw.output && raw.output.trim()
        ? (raw.output.trim().length > UI_TRUNCATE_BYTES
            ? raw.output.trim().slice(0, UI_TRUNCATE_BYTES) + "…[truncated]"
            : raw.output.trim())
        : undefined,
    };
  } catch {
    return { ok: false, error: `REPL returned unparseable output: ${json.slice(0, 200)}` };
  }
}
