import { create } from "zustand";

export type ToastType = "error" | "warning" | "success" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  add: (message: string, type?: ToastType, durationMs?: number) => void;
  remove: (id: number) => void;
}

let _nextId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (message, type = "info", durationMs = 3000) => {
    const id = ++_nextId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().remove(id), durationMs);
  },
  remove: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  error: (message: string, ms?: number) => useToastStore.getState().add(message, "error", ms),
  warning: (message: string, ms?: number) => useToastStore.getState().add(message, "warning", ms),
  success: (message: string, ms?: number) => useToastStore.getState().add(message, "success", ms),
  info: (message: string, ms?: number) => useToastStore.getState().add(message, "info", ms),
};
