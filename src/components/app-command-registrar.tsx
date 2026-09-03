import { useCallback, useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useNavigate } from "react-router";
import { DEFAULT_UI_SCALE, nextUiScale, previousUiScale } from "../lib/ui-scale";
import { NAV_ITEMS } from "../lib/nav-items";
import { resumableSessionPath } from "../lib/session-resume";
import { useCommandPaletteStore, type CommandPaletteAction } from "../stores/command-palette-store";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore } from "../stores/session-store";
import { useSettingsStore } from "../stores/settings-store";
import { useTimerStore } from "../stores/timer-store";

type MenuRunCommandPayload = {
  commandId?: string;
};

export function AppCommandRegistrar() {
  const navigate = useNavigate();
  const registerCommand = useCommandPaletteStore((s) => s.registerCommand);
  const runCommand = useCommandPaletteStore((s) => s.runCommand);
  const setCommandPaletteOpen = useCommandPaletteStore((s) => s.setOpen);
  const shortcuts = useSettingsStore((s) => s.shortcuts);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const katas = useKataStore((s) => s.katas);
  const activeSession = useSessionStore((s) => s.activeSession);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const [launching, setLaunching] = useState(false);

  const resumePath = resumableSessionPath(activeSession);
  const dailyCount = useMemo(() => {
    const kataIds = new Set(katas.map((kata) => kata.id));
    return dailyKataIds.filter((id) => kataIds.has(id)).length;
  }, [dailyKataIds, katas]);

  const handleStartPractice = useCallback(async () => {
    if (resumePath) {
      navigate(resumePath);
      return;
    }
    if (dailyCount === 0) {
      navigate("/problems");
      return;
    }
    if (launching) return;

    setLaunching(true);
    try {
      const kataMap = new Map(katas.map((kata) => [kata.id, kata]));
      const resolved = dailyKataIds.flatMap((id) => {
        const kata = kataMap.get(id);
        return kata ? [kata] : [];
      });
      resolved.sort(() => Math.random() - 0.5);

      if (resolved.length === 0) {
        navigate("/problems");
        return;
      }

      resetKataTimer();
      startSessionTimer();
      const sessionId = await startSession("daily", resolved);
      navigate(`/session/${sessionId}`);
    } finally {
      setLaunching(false);
    }
  }, [dailyKataIds, dailyCount, katas, launching, navigate, resetKataTimer, resumePath, startSession, startSessionTimer]);

  const actions = useMemo<CommandPaletteAction[]>(() => {
    const navActions: CommandPaletteAction[] = NAV_ITEMS.map((item) => ({
      id: `nav:${item.path}`,
      title: `Open ${item.label}`,
      subtitle: item.path,
      section: "Navigation",
      keywords: [item.label, item.path],
      run: () => navigate(item.path === "/practice" ? resumePath ?? item.path : item.path),
    }));
    return [
      ...navActions,
      {
        id: "nav:new-kata",
        title: "New Kata",
        subtitle: "Create a custom problem",
        section: "Navigation",
        keywords: ["create", "problem"],
        run: () => navigate("/kata/new"),
      },
      {
        id: "practice:start-or-resume",
        title: resumePath ? "Resume Practice" : "Start Daily Practice",
        subtitle: resumePath ?? (dailyCount > 0 ? `${dailyCount} daily problems` : "Choose problems first"),
        section: "Practice",
        keywords: ["practice", "session", "daily"],
        disabled: launching,
        run: () => { void handleStartPractice(); },
      },
      {
        id: "view:zoom-in",
        title: "Zoom In",
        section: "View",
        shortcut: shortcuts.zoomIn,
        run: () => { void setSetting("uiScale", nextUiScale(useSettingsStore.getState().uiScale)); },
      },
      {
        id: "view:zoom-out",
        title: "Zoom Out",
        section: "View",
        shortcut: shortcuts.zoomOut,
        run: () => { void setSetting("uiScale", previousUiScale(useSettingsStore.getState().uiScale)); },
      },
      {
        id: "view:actual-size",
        title: "Actual Size",
        section: "View",
        shortcut: shortcuts.resetZoom,
        run: () => { void setSetting("uiScale", DEFAULT_UI_SCALE); },
      },
      {
        id: "app:settings",
        title: "Open Settings",
        section: "Navigation",
        shortcut: shortcuts.openSettings,
        run: () => navigate("/settings"),
      },
      {
        id: "app:command-palette",
        title: "Open Command Palette",
        section: "View",
        shortcut: shortcuts.openCommandPalette,
        keywords: ["command", "palette", "search"],
        hidden: true,
        run: () => setCommandPaletteOpen(true),
      },
    ];
  }, [
    dailyCount,
    handleStartPractice,
    launching,
    navigate,
    resumePath,
    setCommandPaletteOpen,
    setSetting,
    shortcuts.openCommandPalette,
    shortcuts.openSettings,
    shortcuts.resetZoom,
    shortcuts.zoomIn,
    shortcuts.zoomOut,
  ]);

  useEffect(() => {
    const unregister = actions.map((action) => registerCommand(action));
    return () => unregister.forEach((fn) => fn());
  }, [actions, registerCommand]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen<MenuRunCommandPayload>("menu:run-command", (event) => {
      const commandId = event.payload.commandId;
      if (!commandId) return;
      void runCommand(commandId).then((handled) => {
        if (!handled) {
          console.warn(`[menu] Command is unavailable: ${commandId}`);
        }
      }).catch((error) => {
        console.error(`[menu] Command failed: ${commandId}`, error);
      });
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [runCommand]);

  return null;
}
