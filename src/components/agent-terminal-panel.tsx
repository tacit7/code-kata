import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
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
const terminalTheme = {
  background: "#09090b",
  foreground: "#e4e4e7",
  cursor: "#a1a1aa",
  cursorAccent: "#09090b",
  selectionBackground: "#3f3f46",
  black: "#18181b",
  brightBlack: "#3f3f46",
  red: "#f87171",
  brightRed: "#fca5a5",
  green: "#4ade80",
  brightGreen: "#86efac",
  yellow: "#facc15",
  brightYellow: "#fde047",
  blue: "#60a5fa",
  brightBlue: "#93c5fd",
  magenta: "#c084fc",
  brightMagenta: "#d8b4fe",
  cyan: "#22d3ee",
  brightCyan: "#67e8f9",
  white: "#d4d4d8",
  brightWhite: "#f4f4f5",
};

interface AgentTerminalPanelProps {
  launchKind: AgentTerminalKind;
  launchNonce: number;
  fontFamily: string;
  fontSize: number;
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
  fontFamily,
  fontSize,
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
  const terminalFontSize = Math.max(12, Math.min(18, fontSize));
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
      allowProposedApi: true,
      cursorBlink: true,
      cursorStyle: "block",
      convertEol: true,
      fontFamily: terminalFontFamily,
      fontSize: terminalFontSize,
      letterSpacing: 0,
      lineHeight: 1.25,
      macOptionIsMeta: true,
      minimumContrastRatio: 4.5,
      scrollback: 5000,
      theme: terminalTheme,
    });
    term.loadAddon(fitAddon);
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
    const term = termRef.current;
    if (!term) return;
    term.options.fontFamily = terminalFontFamily;
    term.options.fontSize = terminalFontSize;
    term.options.lineHeight = 1.25;
    requestAnimationFrame(() => {
      fit();
      window.setTimeout(() => fit(), 80);
    });
  }, [fit, terminalFontFamily, terminalFontSize, maximized]);

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

  const launchButtonClass = (kind: AgentTerminalKind) =>
    `inline-flex h-6 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition-colors ${
      activeKind === kind
        ? "bg-zinc-700/55 text-zinc-100"
        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
    }`;

  const launchButton = (kind: AgentTerminalKind, icon: ReactNode) => (
    <button
      onClick={() => { void startTerminal(kind); }}
      className={launchButtonClass(kind)}
      title={`Start ${labelFor(kind)}`}
    >
      {icon}
      <span>{labelFor(kind)}</span>
    </button>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-zinc-950">
      <div className="flex items-center border-b border-zinc-800 bg-zinc-900 px-3 py-2 shrink-0">
        <button
          onClick={onClose}
          className="mr-2 flex size-3.5 items-center justify-center rounded-full bg-red-500/70 text-transparent transition-colors hover:bg-red-500 hover:text-zinc-950"
          title="Close terminal"
          aria-label="Close terminal"
        >
          <X size={10} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-2 text-xs">
          <Monitor size={14} className="text-zinc-500" />
          <span className="font-medium text-zinc-300">Terminal</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-500">{labelFor(activeKind)}</span>
          <span className={status === "running" ? "text-emerald-400/80" : status === "error" ? "text-red-400/85" : "text-zinc-600"}>
            {status}
          </span>
        </div>
        <div className="ml-4 flex items-center gap-1">
          {launchButton("shell", <Monitor size={14} />)}
          {launchButton("claude", <BotMessageSquare size={14} />)}
          {launchButton("codex", <Code2 size={14} />)}
          <button
            onClick={() => { void startTerminal(activeKind); }}
            className="inline-flex size-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            title={`Restart ${labelFor(activeKind)}`}
            aria-label={`Restart ${labelFor(activeKind)}`}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <button
          onClick={onToggleMaximized}
          className="ml-auto inline-flex size-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title={maximized ? "Restore terminal pane" : "Maximize terminal"}
          aria-label={maximized ? "Restore terminal pane" : "Maximize terminal"}
        >
          {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      <div className="kata-agent-terminal min-h-0 flex-1 overflow-hidden bg-zinc-950 p-2">
        <div ref={hostRef} className="h-full min-h-0 w-full overflow-hidden [&_.xterm]:h-full" />
      </div>
    </div>
  );
});
