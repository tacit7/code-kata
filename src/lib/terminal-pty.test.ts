import { describe, expect, it } from "vitest";
import { bracketedPaste, shouldForwardTerminalResize } from "./terminal-pty";

describe("shouldForwardTerminalResize", () => {
  it("forwards the first valid resize", () => {
    expect(shouldForwardTerminalResize(null, { cols: 100, rows: 30 })).toBe(true);
  });

  it("skips duplicate resize payloads", () => {
    expect(
      shouldForwardTerminalResize(
        { cols: 100, rows: 30 },
        { cols: 100, rows: 30 },
      ),
    ).toBe(false);
  });

  it("rejects invalid terminal sizes", () => {
    expect(shouldForwardTerminalResize(null, { cols: 0, rows: 30 })).toBe(false);
    expect(shouldForwardTerminalResize(null, { cols: 100, rows: 0 })).toBe(false);
  });

  it("wraps pasted text in bracketed paste mode", () => {
    expect(bracketedPaste("line 1\r\nline 2\rline 3")).toBe("\x1b[200~line 1\nline 2\nline 3\x1b[201~");
  });
});
