import { create } from "zustand";

interface EditorState {
  currentKataId: string;
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
  currentKataId: loadFromStorage<string>("kata-currentKataId", "two-sum"),
  setCurrentKataId: (id) => {
    saveToStorage("kata-currentKataId", id);
    set({ currentKataId: id });
  },
}));
