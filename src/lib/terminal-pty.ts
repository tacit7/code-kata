import { invoke } from "@tauri-apps/api/core";
import type { ITheme } from "@xterm/xterm";

export type AgentTerminalKind = "shell" | "claude" | "codex";

export interface TerminalSize {
  cols: number;
  rows: number;
}

export interface TerminalOutputPayload {
  terminalId: number;
  data: number[];
}

export interface TerminalExitPayload {
  terminalId: number;
}

export interface AgentTerminalOptionInput {
  fontFamily: string;
  fontSize: number;
  theme: ITheme;
}

export interface AgentTerminalThemeTokens {
  base100: string;
  base200: string;
  base300: string;
  baseContent: string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  info: string;
  success: string;
  warning: string;
  error: string;
}

export function agentTerminalFontSize(preferredFontSize: number): number {
  return Math.max(11, Math.min(13, preferredFontSize));
}

export function agentTerminalTheme(tokens: AgentTerminalThemeTokens): ITheme {
  return {
    background: tokens.base100,
    foreground: tokens.baseContent,
    cursor: tokens.primary,
    cursorAccent: tokens.base100,
    selectionBackground: tokens.base300,
    black: tokens.base300,
    brightBlack: tokens.neutral,
    red: tokens.error,
    brightRed: tokens.error,
    green: tokens.success,
    brightGreen: tokens.success,
    yellow: tokens.warning,
    brightYellow: tokens.warning,
    blue: tokens.primary,
    brightBlue: tokens.info,
    magenta: tokens.accent,
    brightMagenta: tokens.accent,
    cyan: tokens.secondary,
    brightCyan: tokens.info,
    white: tokens.baseContent,
    brightWhite: tokens.baseContent,
  };
}

export function agentTerminalOptions({ fontFamily, fontSize, theme }: AgentTerminalOptionInput) {
  return {
    allowProposedApi: true,
    cursorBlink: true,
    cursorStyle: "block" as const,
    fontFamily,
    fontSize,
    letterSpacing: 0,
    lineHeight: 1.25,
    macOptionIsMeta: true,
    minimumContrastRatio: 4.5,
    scrollback: 5000,
    theme,
  };
}

export function spawnTerminal(
  kind: AgentTerminalKind,
  size: TerminalSize,
  cwd?: string,
): Promise<number> {
  return invoke("spawn_terminal", {
    kind,
    cols: size.cols,
    rows: size.rows,
    cwd,
  });
}

export function writeTerminal(terminalId: number, data: Uint8Array): Promise<void> {
  return invoke("write_terminal", {
    terminalId,
    data: Array.from(data),
  });
}

export function bracketedPaste(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return `\x1b[200~${normalized}\x1b[201~`;
}

export function resizeTerminal(terminalId: number, size: TerminalSize): Promise<void> {
  return invoke("resize_terminal", {
    terminalId,
    cols: size.cols,
    rows: size.rows,
  });
}

export function closeTerminal(terminalId: number): Promise<void> {
  return invoke("close_terminal", { terminalId });
}

export function retainAsyncUnlisten(
  promise: Promise<() => void>,
  setUnlisten: (unlisten: () => void) => void,
  isDisposed: () => boolean,
): void {
  void promise.then((unlisten) => {
    if (isDisposed()) {
      unlisten();
      return;
    }
    setUnlisten(unlisten);
  });
}

export function shouldForwardTerminalResize(
  previous: TerminalSize | null,
  next: TerminalSize,
): boolean {
  return next.cols > 0 && next.rows > 0 && (
    previous == null ||
    previous.cols !== next.cols ||
    previous.rows !== next.rows
  );
}
