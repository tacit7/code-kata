import { useEffect } from "react";
import { useSettingsStore, type ShortcutAction } from "../stores/settings-store";
import { normalizeShortcutCombo } from "../lib/shortcut-keys";

function comboAliases(combo: string): Set<string> {
  const normalized = normalizeShortcutCombo(combo);
  const aliases = new Set([normalized]);

  if (normalized.startsWith("Ctrl+")) {
    aliases.add(normalized.replace("Ctrl+", "Meta+"));
  }

  for (const value of [...aliases]) {
    if (value.endsWith("+Shift++")) {
      aliases.add(value.replace("+Shift++", "+="));
      aliases.add(value.replace("+Shift++", "++"));
    }
    if (value.endsWith("+Shift+=")) {
      aliases.add(value.replace("+Shift+=", "+="));
    }
    if (value.endsWith("++")) {
      aliases.add(value.replace(/\+\+$/, "+="));
    }
    if (value.endsWith("+=")) {
      aliases.add(value.replace(/\+=$/, "++"));
    }
  }

  return aliases;
}

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

      const combo = normalizeShortcutCombo(parts.join("+"));

      // Check against all registered shortcuts
      // Treat Meta and Ctrl as equivalent so shortcuts work on both macOS and Windows
      const aliases = comboAliases(combo);
      for (const [action, handler] of Object.entries(handlers)) {
        const expected = shortcuts[action as ShortcutAction];
        const normalizedExpected = normalizeShortcutCombo(expected);
        if (expected && handler && (aliases.has(normalizedExpected) || comboAliases(normalizedExpected).has(combo))) {
          e.preventDefault();
          e.stopPropagation();
          handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [shortcuts, handlers]);
}
