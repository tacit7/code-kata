import { describe, expect, it } from "vitest";
import {
  PYTHON_DEBUG_HELPERS,
  PYTHON_REPL_HELPER_BOOTSTRAP,
  PYTHON_TEST_HELPER_BOOTSTRAP,
} from "./python-helpers";

describe("python helper bootstraps", () => {
  it("exposes debug helpers in the shared debug source", () => {
    expect(PYTHON_DEBUG_HELPERS).toContain("def khelp");
    expect(PYTHON_DEBUG_HELPERS).toContain("\"khelp\"");
    expect(PYTHON_DEBUG_HELPERS).toContain("def plocals");
    expect(PYTHON_DEBUG_HELPERS).toContain("def pgrid");
    expect(PYTHON_DEBUG_HELPERS).toContain("def trace_recursion");
    expect(PYTHON_DEBUG_HELPERS).toContain("def trace_tree");
    expect(PYTHON_DEBUG_HELPERS).toContain('"trace_tree"');
    expect(PYTHON_DEBUG_HELPERS).toContain("trace_rescursion = trace_recursion");
    expect(PYTHON_DEBUG_HELPERS).toContain("def recursion_depth");
    expect(PYTHON_DEBUG_HELPERS).toContain("def recursion_indent");
    expect(PYTHON_DEBUG_HELPERS).toContain("def pindent");
  });

  it("exposes current recursion indentation helpers through khelp", () => {
    expect(PYTHON_DEBUG_HELPERS).toContain('"recursion_depth"');
    expect(PYTHON_DEBUG_HELPERS).toContain('"recursion_indent"');
    expect(PYTHON_DEBUG_HELPERS).toContain('"pindent"');
    expect(PYTHON_DEBUG_HELPERS).toContain("return max(0, _KH_TRACE_DEPTH - 1 + offset)");
  });

  it("documents tree recursion direction tracing", () => {
    expect(PYTHON_DEBUG_HELPERS).toContain("def _kh_tree_direction");
    expect(PYTHON_DEBUG_HELPERS).toContain('return "L "');
    expect(PYTHON_DEBUG_HELPERS).toContain('return "R "');
    expect(PYTHON_DEBUG_HELPERS).toContain("_KH_TREE_TRACE_STACK");
  });

  it("prints recursive return lines with their original call arguments", () => {
    expect(PYTHON_DEBUG_HELPERS).toContain("def _kh_call_text");
    expect(PYTHON_DEBUG_HELPERS).toContain("call_text = _kh_call_text(fn, args, kwargs)");
    expect(PYTHON_DEBUG_HELPERS).toContain('print(f"{indent}{call_text} -> {_kh_repr(result, 80)}")');
    expect(PYTHON_DEBUG_HELPERS).not.toContain('print(f"{indent}{fn.__name__}(...) -> {_kh_repr(result, 80)}")');
  });

  it("formats tree-node-like objects without default object addresses", () => {
    expect(PYTHON_DEBUG_HELPERS).toContain("def _kh_is_default_object_repr");
    expect(PYTHON_DEBUG_HELPERS).toContain('hasattr(value, "val")');
    expect(PYTHON_DEBUG_HELPERS).toContain("text = f\"{type(value).__name__}({node_value!r})\"");
  });

  it("keeps builder helpers out of the test-runner bootstrap", () => {
    expect(PYTHON_TEST_HELPER_BOOTSTRAP).toContain("kata_debug_helpers");
    expect(PYTHON_TEST_HELPER_BOOTSTRAP).not.toContain("kata_builder_helpers");
    expect(PYTHON_TEST_HELPER_BOOTSTRAP).not.toContain("build_tree");
  });

  it("includes builder helpers in the repl bootstrap", () => {
    expect(PYTHON_REPL_HELPER_BOOTSTRAP).toContain("kata_debug_helpers");
    expect(PYTHON_REPL_HELPER_BOOTSTRAP).toContain("kata_builder_helpers");
    expect(PYTHON_REPL_HELPER_BOOTSTRAP).toContain("build_tree");
  });
});
