import { describe, expect, it } from "vitest";
import { shouldForwardTerminalResize } from "./terminal-pty";

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
});
