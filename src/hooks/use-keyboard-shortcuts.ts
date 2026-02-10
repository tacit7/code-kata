import { useEffect } from "react";
import { useSettingsStore, type ShortcutAction } from "../stores/settings-store";

export function useKeyboardShortcuts(
  handlers: Partial<Record<ShortcutAction, () => void>>
) {
  const shortcuts = useSettingsStore((s) => s.shortcuts);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Build combo string from the event
      const parts: string[] = [];
      if (e.metaKey) parts.push("Meta");
      if (e.ctrlKey) parts.push("Ctrl");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");

      // Don't add modifier keys themselves as the key part
      if (!["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        parts.push(e.key);
      }

      const combo = parts.join("+");

      // Check against all registered shortcuts
      // Treat Meta and Ctrl as equivalent so shortcuts work on both macOS and Windows
      const comboAlt = combo.replace("Ctrl+", "Meta+");
      for (const [action, handler] of Object.entries(handlers)) {
        const expected = shortcuts[action as ShortcutAction];
        if (expected && (combo === expected || comboAlt === expected) && handler) {
          e.preventDefault();
          e.stopPropagation();
          handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, handlers]);
}
