import { describe, expect, it } from "vitest";
import {
  AGENT_TERMINAL_SCROLLBACK,
  agentTerminalFontSize,
  agentTerminalOptions,
  agentTerminalTheme,
  bracketedPaste,
  retainAsyncUnlisten,
  shouldForwardTerminalResize,
} from "./terminal-pty";

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

  it("keeps PTY output line endings raw for full-screen TUIs", () => {
    expect(agentTerminalOptions({
      fontFamily: "monospace",
      fontSize: 13,
      theme: {},
    })).not.toHaveProperty("convertEol");
  });

  it("keeps agent terminal scrollback small enough for responsive split changes", () => {
    expect(agentTerminalOptions({
      fontFamily: "monospace",
      fontSize: 13,
      theme: {},
    }).scrollback).toBe(AGENT_TERMINAL_SCROLLBACK);
    expect(AGENT_TERMINAL_SCROLLBACK).toBeLessThanOrEqual(1000);
  });

  it("keeps agent terminal fonts in a TUI-friendly range", () => {
    expect(agentTerminalFontSize(10)).toBe(11);
    expect(agentTerminalFontSize(13)).toBe(13);
    expect(agentTerminalFontSize(18)).toBe(13);
  });

  it("maps terminal colors from app theme tokens", () => {
    const theme = agentTerminalTheme({
      base100: "#111111",
      base200: "#222222",
      base300: "#333333",
      baseContent: "#eeeeee",
      primary: "#00aa88",
      secondary: "#667788",
      accent: "#cc66dd",
      neutral: "#444444",
      info: "#4488ff",
      success: "#22aa66",
      warning: "#ddaa22",
      error: "#dd3344",
    });

    expect(theme.background).toBe("#111111");
    expect(theme.foreground).toBe("#eeeeee");
    expect(theme.cursor).toBe("#00aa88");
    expect(theme.red).toBe("#dd3344");
    expect(theme.green).toBe("#22aa66");
    expect(theme.blue).toBe("#00aa88");
    expect(theme.magenta).toBe("#cc66dd");
  });

  it("unlistens when async listener registration resolves after disposal", async () => {
    let disposed = true;
    let unlistenCalled = 0;
    let retained: (() => void) | null = null;

    retainAsyncUnlisten(
      Promise.resolve(() => { unlistenCalled += 1; }),
      (unlisten) => { retained = unlisten; },
      () => disposed,
    );
    await Promise.resolve();

    expect(unlistenCalled).toBe(1);
    expect(retained).toBeNull();

    disposed = false;
    retainAsyncUnlisten(
      Promise.resolve(() => { unlistenCalled += 1; }),
      (unlisten) => { retained = unlisten; },
      () => disposed,
    );
    await Promise.resolve();

    expect(unlistenCalled).toBe(1);
    expect(retained).not.toBeNull();
  });
});
