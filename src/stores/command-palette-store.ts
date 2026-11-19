import { create } from "zustand";

export interface CommandPaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  section?: string;
  shortcut?: string;
  keywords?: string[];
  disabled?: boolean;
  hidden?: boolean;
  run: () => void | Promise<void>;
}

interface CommandPaletteState {
  open: boolean;
  registeredActions: Record<string, CommandPaletteAction>;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  registerCommand: (action: CommandPaletteAction) => () => void;
  runCommand: (id: string) => Promise<boolean>;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set, get) => ({
  open: false,
  registeredActions: {},
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
  registerCommand: (action) => {
    set((state) => ({
      registeredActions: {
        ...state.registeredActions,
        [action.id]: action,
      },
    }));
    return () => {
      set((state) => {
        const { [action.id]: _removed, ...registeredActions } = state.registeredActions;
        return { registeredActions };
      });
    };
  },
  runCommand: async (id) => {
    const action = get().registeredActions[id];
    if (!action || action.disabled) return false;
    await action.run();
    return true;
  },
}));
