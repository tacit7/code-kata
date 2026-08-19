import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { FitAddon } from "@xterm/addon-fit";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal as XtermTerminal } from "@xterm/xterm";
import { Maximize2, Minimize2, RotateCcw, SquareSplitHorizontal, SquareSplitVertical, X } from "lucide-react";
import {
  closeTerminal,
  agentTerminalOptions,
  agentTerminalFontSize,
  agentTerminalTheme,
  bracketedPaste,
  retainAsyncUnlisten,
  resizeTerminal,
  shouldForwardTerminalResize,
  spawnTerminal,
  writeTerminal,
  type AgentTerminalKind,
  type TerminalExitPayload,
  type TerminalOutputPayload,
  type TerminalSize,
} from "../lib/terminal-pty";
import type { AppTheme } from "../types/editor";
import "@xterm/xterm/css/xterm.css";

const encoder = new TextEncoder();

function cssThemeColor(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  return styles.getPropertyValue(name).trim() || fallback;
}

function terminalThemeFromElement(element: HTMLElement) {
  const styles = getComputedStyle(element);
  return agentTerminalTheme({
    base100: cssThemeColor(styles, "--color-base-100", "#09090b"),
    base200: cssThemeColor(styles, "--color-base-200", "#18181b"),
    base300: cssThemeColor(styles, "--color-base-300", "#3f3f46"),
    baseContent: cssThemeColor(styles, "--color-base-content", "#e4e4e7"),
    primary: cssThemeColor(styles, "--color-primary", "#4ade80"),
    secondary: cssThemeColor(styles, "--color-secondary", "#a1a1aa"),
    accent: cssThemeColor(styles, "--color-accent", "#c084fc"),
    neutral: cssThemeColor(styles, "--color-neutral", "#3f3f46"),
    info: cssThemeColor(styles, "--color-info", "#60a5fa"),
    success: cssThemeColor(styles, "--color-success", "#4ade80"),
    warning: cssThemeColor(styles, "--color-warning", "#facc15"),
    error: cssThemeColor(styles, "--color-error", "#f87171"),
  });
}

interface AgentTerminalPanelProps {
  launchKind: AgentTerminalKind;
  launchNonce: number;
  theme: AppTheme;
  fontFamily: string;
  fontSize: number;
  layout: "horizontal" | "vertical";
  maximized: boolean;
  onClose: () => void;
  onLayoutChange: (layout: "horizontal" | "vertical") => void;
  onToggleMaximized: () => void;
}

export interface AgentTerminalPanelHandle {
  pasteText: (text: string) => Promise<boolean>;
}

function labelFor(kind: AgentTerminalKind): string {
  if (kind === "claude") return "Claude";
  if (kind === "codex") return "Codex";
  return "Shell";
}

export const AgentTerminalPanel = forwardRef<AgentTerminalPanelHandle, AgentTerminalPanelProps>(function AgentTerminalPanel({
  launchKind,
  launchNonce,
  theme,
  fontFamily,
  fontSize,
  layout,
  maximized,
  onClose,
  onLayoutChange,
  onToggleMaximized,
}, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XtermTerminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const terminalIdRef = useRef<number | null>(null);
  const lastSizeRef = useRef<TerminalSize | null>(null);
  const outputBufferRef = useRef<Map<number, number[][]>>(new Map());
  const fitFrameRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [activeKind, setActiveKind] = useState<AgentTerminalKind>(launchKind);
  const terminalFontSize = agentTerminalFontSize(fontSize);
  const terminalFontFamily = `${fontFamily}, "Fira Code", "Cascadia Code", monospace`;

  const fit = useCallback(() => {
    const term = termRef.current;
    const fitAddon = fitRef.current;
    if (!term || !fitAddon) return null;
    try {
      fitAddon.fit();
      return { cols: term.cols, rows: term.rows };
    } catch {
      return null;
    }
  }, []);

  const fitAndForwardResize = useCallback(() => {
    const size = fit();
    const terminalId = terminalIdRef.current;
    if (!size || terminalId == null || !shouldForwardTerminalResize(lastSizeRef.current, size)) return;
    lastSizeRef.current = size;
    void resizeTerminal(terminalId, size).catch(() => undefined);
  }, [fit]);

  const scheduleFit = useCallback(() => {
    if (fitFrameRef.current != null) {
      cancelAnimationFrame(fitFrameRef.current);
    }
    fitFrameRef.current = requestAnimationFrame(() => {
      fitFrameRef.current = null;
      fitAndForwardResize();
    });
  }, [fitAndForwardResize]);

  const closeCurrentTerminal = useCallback(async () => {
    const terminalId = terminalIdRef.current;
    terminalIdRef.current = null;
    lastSizeRef.current = null;
    if (terminalId == null) return;
    await closeTerminal(terminalId).catch(() => undefined);
  }, []);

  const startTerminal = useCallback(async (kind: AgentTerminalKind) => {
    const term = termRef.current;
    if (!term) return;

    setActiveKind(kind);
    await closeCurrentTerminal();
    term.reset();
    term.writeln(`Starting ${labelFor(kind)}...`);

    const size = fit() ?? { cols: 80, rows: 24 };
    try {
      const terminalId = await spawnTerminal(kind, size);
      terminalIdRef.current = terminalId;
      term.reset();

      const buffered = outputBufferRef.current.get(terminalId);
      outputBufferRef.current.delete(terminalId);
      buffered?.forEach((chunk) => term.write(new Uint8Array(chunk)));

      if (shouldForwardTerminalResize(lastSizeRef.current, size)) {
        lastSizeRef.current = size;
        await resizeTerminal(terminalId, size).catch(() => undefined);
      }
      term.focus();
    } catch (error) {
      term.writeln("");
      term.writeln(error instanceof Error ? error.message : String(error));
    }
  }, [closeCurrentTerminal, fit]);

  const pasteText = useCallback(async (text: string) => {
    const terminalId = terminalIdRef.current;
    const term = termRef.current;
    if (terminalId == null || !term) return false;
    await writeTerminal(terminalId, encoder.encode(bracketedPaste(text)));
    term.focus();
    return true;
  }, []);

  useImperativeHandle(ref, () => ({ pasteText }), [pasteText]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const fitAddon = new FitAddon();
    const term = new XtermTerminal(agentTerminalOptions({
      fontFamily: terminalFontFamily,
      fontSize: terminalFontSize,
      theme: terminalThemeFromElement(host),
    }));
    term.loadAddon(fitAddon);
    term.loadAddon(new Unicode11Addon());
    term.unicode.activeVersion = "11";
    term.loadAddon(new WebLinksAddon((_event, url) => {
      void open(url).catch(() => undefined);
    }));
    term.open(host);
    termRef.current = term;
    fitRef.current = fitAddon;

    const dataDisposable = term.onData((data) => {
      const terminalId = terminalIdRef.current;
      if (terminalId == null) return;
      void writeTerminal(terminalId, encoder.encode(data));
    });
    const resizeDisposable = term.onResize((size) => {
      const terminalId = terminalIdRef.current;
      if (terminalId == null || !shouldForwardTerminalResize(lastSizeRef.current, size)) return;
      lastSizeRef.current = size;
      void resizeTerminal(terminalId, size).catch(() => undefined);
    });
    const resizeObserver = new ResizeObserver(() => {
      scheduleFit();
    });
    resizeObserver.observe(host);
    requestAnimationFrame(() => {
      fit();
      setReady(true);
    });

    return () => {
      void closeCurrentTerminal();
      resizeObserver.disconnect();
      if (fitFrameRef.current != null) {
        cancelAnimationFrame(fitFrameRef.current);
        fitFrameRef.current = null;
      }
      dataDisposable.dispose();
      resizeDisposable.dispose();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [closeCurrentTerminal, fit, scheduleFit]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.fontFamily = terminalFontFamily;
    term.options.fontSize = terminalFontSize;
    term.options.lineHeight = 1.25;
    scheduleFit();
  }, [scheduleFit, terminalFontFamily, terminalFontSize, layout, maximized]);

  useEffect(() => {
    const term = termRef.current;
    const host = hostRef.current;
    if (!term || !host) return;
    requestAnimationFrame(() => {
      term.options.theme = terminalThemeFromElement(host);
    });
  }, [theme]);

  useEffect(() => {
    let disposed = false;
    let unlistenOutput: (() => void) | null = null;
    let unlistenExit: (() => void) | null = null;

    retainAsyncUnlisten(listen<TerminalOutputPayload>("terminal-output", (event) => {
      const terminalId = terminalIdRef.current;
      if (terminalId == null) {
        const chunks = outputBufferRef.current.get(event.payload.terminalId) ?? [];
        chunks.push(event.payload.data);
        outputBufferRef.current.set(event.payload.terminalId, chunks.slice(-64));
        return;
      }
      if (event.payload.terminalId === terminalId) {
        termRef.current?.write(new Uint8Array(event.payload.data));
      }
    }), (fn) => { unlistenOutput = fn; }, () => disposed);

    retainAsyncUnlisten(listen<TerminalExitPayload>("terminal-exit", (event) => {
      if (event.payload.terminalId !== terminalIdRef.current) return;
      terminalIdRef.current = null;
      lastSizeRef.current = null;
      void closeTerminal(event.payload.terminalId).catch(() => undefined);
      termRef.current?.writeln("");
      termRef.current?.writeln("[process exited]");
    }), (fn) => { unlistenExit = fn; }, () => disposed);

    return () => {
      disposed = true;
      unlistenOutput?.();
      unlistenExit?.();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void startTerminal(launchKind);
  }, [launchKind, launchNonce, ready, startTerminal]);

  const splitButtonClass = (active: boolean) =>
    `btn btn-ghost btn-sm btn-square h-7 min-h-7 ${
      active ? "text-primary bg-primary/10" : "text-base-content/35 hover:text-base-content/70"
    }`;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-base-100">
      <div className="flex items-center border-b border-base-300/60 bg-base-200 px-3 py-1 shrink-0">
        <button
          onClick={onClose}
          className="text-xs text-base-content/30 hover:text-base-content/60 transition-colors mr-2"
          title="Close terminal"
          aria-label="Close terminal"
        >
          <X size={16} />
        </button>
        <div className="flex items-center text-xs">
          <span className="text-base-content/45">{labelFor(activeKind)}</span>
        </div>
        <div className="ml-4 flex items-center gap-1">
          <button
            onClick={() => { void startTerminal(activeKind); }}
            className="inline-flex size-6 items-center justify-center rounded text-base-content/45 transition-colors hover:bg-base-300 hover:text-base-content/75"
            title={`Restart ${labelFor(activeKind)}`}
            aria-label={`Restart ${labelFor(activeKind)}`}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="join">
            <button
              onClick={() => onLayoutChange("vertical")}
              className={`${splitButtonClass(layout === "vertical" && !maximized)} join-item`}
              title="Split problem and agent side by side"
              aria-label="Split problem and agent side by side"
            >
              <SquareSplitHorizontal size={16} />
            </button>
            <button
              onClick={() => onLayoutChange("horizontal")}
              className={`${splitButtonClass(layout === "horizontal" && !maximized)} join-item`}
              title="Split problem and agent stacked"
              aria-label="Split problem and agent stacked"
            >
              <SquareSplitVertical size={16} />
            </button>
          </div>
          <button
            onClick={onToggleMaximized}
            className="inline-flex size-6 items-center justify-center rounded text-base-content/45 transition-colors hover:bg-base-300 hover:text-base-content/75"
            title={maximized ? "Restore terminal pane" : "Maximize terminal"}
            aria-label={maximized ? "Restore terminal pane" : "Maximize terminal"}
          >
            {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div className="kata-agent-terminal min-h-0 flex-1 overflow-hidden bg-base-100 p-2">
        <div ref={hostRef} className="h-full min-h-0 w-full overflow-hidden [&_.xterm]:h-full" />
      </div>
    </div>
  );
});
