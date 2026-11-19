import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("kata editor error markers", () => {
  const src = () => readFileSync(join(__dirname, "kata-editor.tsx"), "utf8");
  const css = () => readFileSync(join(__dirname, "../index.css"), "utf8");

  it("sets Monaco model markers for user-code test failures", () => {
    expect(src()).toContain("const PYTHON_TEST_MARKER_OWNER = \"kata-python-test-runner\"");
    expect(src()).toContain("setModelMarkers(model, PYTHON_TEST_MARKER_OWNER");
    expect(src()).toContain("monaco.MarkerSeverity.Error");
    expect(src()).toContain("result.errorSource === \"user\"");
    expect(src()).toContain("result.lineNumber != null");
  });

  it("adds and clears line highlight decorations", () => {
    expect(src()).toContain("createDecorationsCollection");
    expect(src()).toContain("kata-error-line");
    expect(src()).toContain("kata-error-glyph");
    expect(src()).toContain("errorDecorationsRef.current.clear()");
  });

  it("defines marker styles for Monaco decorations", () => {
    expect(css()).toContain(".kata-error-line");
    expect(css()).toContain(".kata-error-line-decoration");
    expect(css()).toContain(".kata-error-glyph");
  });
});
