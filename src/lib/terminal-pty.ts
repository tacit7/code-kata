import { invoke } from "@tauri-apps/api/core";

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
