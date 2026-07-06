import { describe, it, expect } from "vitest";
import {
  extractTestNames,
  buildRunnerScript,
  parseRunResults,
  loadErrorResult,
  runnerErrorResult,
  UI_TRUNCATE_BYTES,
} from "./ruby-exec-core";

describe("extractTestNames", () => {
  it("extracts top-level def test_* in source order", () => {
    const code = `def test_b\nend\ndef helper\nend\ndef test_a\nend`;
    expect(extractTestNames(code)).toEqual(["test_b", "test_a"]);
  });
  it("returns empty for no tests", () => {
    expect(extractTestNames("def helper\nend")).toEqual([]);
  });
});

describe("buildRunnerScript", () => {
  it("embeds each test name as a symbol", () => {
    const script = buildRunnerScript(["test_a", "test_b"]);
    expect(script).toContain(":test_a");
    expect(script).toContain(":test_b");
  });

  it("fails a test whose captured output exceeds the byte cap instead of silently truncating", () => {
    const script = buildRunnerScript(["test_a"]);
    expect(script).toContain("__kata_buf.string.bytesize >");
    expect(script).toContain("Output limit exceeded (256 KB)");
  });
});

describe("parseRunResults", () => {
  it("maps pass and structured assert failure", () => {
    const json = JSON.stringify([
      { name: "test_a", passed: true, output: "" },
      { name: "test_b", passed: false, error: "boom", expected: "1", got: "2", output: "hi\n" },
    ]);
    const results = parseRunResults(json, ["test_a", "test_b"]);
    expect(results[0]).toEqual({ name: "test_a", passed: true });
    expect(results[1]).toMatchObject({ name: "test_b", passed: false, error: "boom", expected: "1", got: "2", output: "hi" });
  });
  it("fills missing tests as did-not-run", () => {
    const results = parseRunResults("[]", ["test_a"]);
    expect(results[0]).toMatchObject({ name: "test_a", passed: false, error: "Test did not run" });
  });
  it("truncates long fields to UI cap", () => {
    const long = "x".repeat(UI_TRUNCATE_BYTES + 100);
    const json = JSON.stringify([{ name: "test_a", passed: false, error: long, output: long }]);
    const [r] = parseRunResults(json, ["test_a"]);
    expect(r.error!.length).toBeLessThanOrEqual(UI_TRUNCATE_BYTES + 12); // + "…[truncated]"
    expect(r.output!.length).toBeLessThanOrEqual(UI_TRUNCATE_BYTES + 12);
  });
  it("returns load_error on unparseable json", () => {
    const results = parseRunResults("not json", ["test_a"]);
    expect(results[0].name).toBe("load_error");
  });
});

describe("synthetic results", () => {
  it("loadErrorResult", () => {
    expect(loadErrorResult("syntax error")[0]).toMatchObject({ name: "load_error", passed: false, error: "syntax error" });
  });
  it("runnerErrorResult", () => {
    expect(runnerErrorResult()[0]).toMatchObject({ name: "runner_error", passed: false });
  });
});

describe("REPL script builders", () => {
  it("rubyStringLiteral escapes interpolation and quotes", async () => {
    const { rubyStringLiteral } = await import("./ruby-exec-core");
    expect(rubyStringLiteral('x = "#{5}"')).toBe('"x = \\"\\#{5}\\""');
  });
  it("buildReplEvalScript embeds the code and caps", async () => {
    const { buildReplEvalScript } = await import("./ruby-exec-core");
    const script = buildReplEvalScript("x = 5");
    expect(script).toContain('$__kata_repl_binding.eval("x = 5")');
    expect(script).toContain("__repl_val.inspect[0, 8192]");
  });
  it("parseReplResult maps ok, error, and garbage", async () => {
    const { parseReplResult } = await import("./ruby-exec-core");
    expect(parseReplResult('{"ok":true,"value":"10","output":""}')).toEqual({ ok: true, value: "10", error: undefined, output: undefined });
    expect(parseReplResult('{"ok":false,"error":"NameError: x","output":"hi\\n"}')).toMatchObject({ ok: false, error: "NameError: x", output: "hi" });
    expect(parseReplResult("garbage").ok).toBe(false);
  });
});
