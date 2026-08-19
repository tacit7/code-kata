import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { listen } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XtermTerminal } from "@xterm/xterm";
import { BotMessageSquare, Code2, Maximize2, Minimize2, Monitor, RotateCcw, X } from "lucide-react";
import {
  closeTerminal,
  bracketedPaste,
  resizeTerminal,
  shouldForwardTerminalResize,
  spawnTerminal,
  writeTerminal,
  type AgentTerminalKind,
  type TerminalExitPayload,
  type TerminalOutputPayload,
  type TerminalSize,
} from "../lib/terminal-pty";
import "@xterm/xterm/css/xterm.css";

const encoder = new TextEncoder();

interface AgentTerminalPanelProps {
  launchKind: AgentTerminalKind;
  launchNonce: number;
  maximized: boolean;
  onClose: () => void;
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
  maximized,
  onClose,
  onToggleMaximized,
}, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XtermTerminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const terminalIdRef = useRef<number | null>(null);
  const lastSizeRef = useRef<TerminalSize | null>(null);
  const outputBufferRef = useRef<Map<number, number[][]>>(new Map());
  const [ready, setReady] = useState(false);
  const [activeKind, setActiveKind] = useState<AgentTerminalKind>(launchKind);
  const [status, setStatus] = useState<"starting" | "running" | "exited" | "error">("starting");

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
    setStatus("starting");
    await closeCurrentTerminal();
    term.reset();
    term.writeln(`Starting ${labelFor(kind)}...`);

    const size = fit() ?? { cols: 80, rows: 24 };
    try {
      const terminalId = await spawnTerminal(kind, size);
      terminalIdRef.current = terminalId;
      setStatus("running");
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
      setStatus("error");
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
    const term = new XtermTerminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      scrollback: 5000,
      theme: {
        background: "#111217",
        foreground: "#d6d6d6",
        cursor: "#f8f8f0",
        black: "#272822",
        red: "#f92672",
        green: "#a6e22e",
        yellow: "#e6db74",
        blue: "#66d9ef",
        magenta: "#ae81ff",
        cyan: "#a1efe4",
        white: "#f8f8f2",
        brightBlack: "#75715e",
        brightRed: "#ff6188",
        brightGreen: "#a9dc76",
        brightYellow: "#ffd866",
        brightBlue: "#78dce8",
        brightMagenta: "#ab9df2",
        brightCyan: "#a1efe4",
        brightWhite: "#ffffff",
      },
    });
    term.loadAddon(fitAddon);
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
      const size = fit();
      const terminalId = terminalIdRef.current;
      if (!size || terminalId == null || !shouldForwardTerminalResize(lastSizeRef.current, size)) return;
      lastSizeRef.current = size;
      void resizeTerminal(terminalId, size).catch(() => undefined);
    });
    resizeObserver.observe(host);
    requestAnimationFrame(() => {
      fit();
      setReady(true);
    });

    return () => {
      void closeCurrentTerminal();
      resizeObserver.disconnect();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [closeCurrentTerminal, fit]);

  useEffect(() => {
    let unlistenOutput: (() => void) | null = null;
    let unlistenExit: (() => void) | null = null;

    void listen<TerminalOutputPayload>("terminal-output", (event) => {
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
    }).then((fn) => {
      unlistenOutput = fn;
    });

    void listen<TerminalExitPayload>("terminal-exit", (event) => {
      if (event.payload.terminalId !== terminalIdRef.current) return;
      terminalIdRef.current = null;
      lastSizeRef.current = null;
      void closeTerminal(event.payload.terminalId).catch(() => undefined);
      setStatus("exited");
      termRef.current?.writeln("");
      termRef.current?.writeln("[process exited]");
    }).then((fn) => {
      unlistenExit = fn;
    });

    return () => {
      unlistenOutput?.();
      unlistenExit?.();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void startTerminal(launchKind);
  }, [launchKind, launchNonce, ready, startTerminal]);

  const launchButton = (kind: AgentTerminalKind, icon: ReactNode) => (
    <button
      onClick={() => { void startTerminal(kind); }}
      className={`btn btn-ghost btn-xs h-7 min-h-7 gap-1.5 ${
        activeKind === kind ? "text-primary bg-primary/10" : "text-base-content/45 hover:text-base-content/75"
      }`}
      title={`Start ${labelFor(kind)}`}
    >
      {icon}
      <span>{labelFor(kind)}</span>
    </button>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-base-200">
      <div className="flex items-center border-b border-base-300/60 bg-base-200 px-3 py-1 shrink-0">
        <button
          onClick={onClose}
          className="mr-2 text-xs text-base-content/30 transition-colors hover:text-base-content/60"
          title="Close terminal"
          aria-label="Close terminal"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-base-content/45">
          <Monitor size={15} />
          <span>terminal</span>
          <span className="text-base-content/25">·</span>
          <span className={status === "running" ? "text-success/70" : status === "error" ? "text-error/75" : "text-base-content/35"}>
            {status}
          </span>
        </div>
        <div className="ml-4 flex items-center gap-1">
          {launchButton("shell", <Monitor size={14} />)}
          {launchButton("claude", <BotMessageSquare size={14} />)}
          {launchButton("codex", <Code2 size={14} />)}
          <button
            onClick={() => { void startTerminal(activeKind); }}
            className="btn btn-ghost btn-xs btn-square h-7 min-h-7 text-base-content/35 hover:text-base-content/70"
            title={`Restart ${labelFor(activeKind)}`}
            aria-label={`Restart ${labelFor(activeKind)}`}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <button
          onClick={onToggleMaximized}
          className="btn btn-ghost btn-xs btn-square ml-auto h-7 min-h-7 text-base-content/35 hover:text-base-content/70"
          title={maximized ? "Restore terminal pane" : "Maximize terminal"}
          aria-label={maximized ? "Restore terminal pane" : "Maximize terminal"}
        >
          {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      <div ref={hostRef} className="min-h-0 flex-1 p-2 [&_.xterm]:h-full" />
    </div>
  );
});
