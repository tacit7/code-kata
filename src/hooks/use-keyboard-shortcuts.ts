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
      for (const [action, handler] of Object.entries(handlers)) {
        const expected = shortcuts[action as ShortcutAction];
        if (expected && combo === expected && handler) {
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
