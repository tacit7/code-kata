import { create } from "zustand";
import type { AppTheme } from "../types/editor";

interface EditorState {
  theme: AppTheme;
  vimMode: boolean;
  fontSize: number;
  currentKataId: string;
  toggleTheme: () => void;
  toggleVimMode: () => void;
  setFontSize: (size: number) => void;
  setCurrentKataId: (id: string) => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const useEditorStore = create<EditorState>((set) => ({
  theme: loadFromStorage<AppTheme>("kata-theme", "dark"),
  vimMode: loadFromStorage<boolean>("kata-vimMode", false),
  fontSize: loadFromStorage<number>("kata-fontSize", 14),
  currentKataId: loadFromStorage<string>("kata-currentKataId", "two-sum"),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      saveToStorage("kata-theme", next);
      return { theme: next };
    }),

  toggleVimMode: () =>
    set((state) => {
      const next = !state.vimMode;
      saveToStorage("kata-vimMode", next);
      return { vimMode: next };
    }),

  setFontSize: (size) => {
    saveToStorage("kata-fontSize", size);
    set({ fontSize: size });
  },

  setCurrentKataId: (id) => {
    saveToStorage("kata-currentKataId", id);
    set({ currentKataId: id });
  },
}));
