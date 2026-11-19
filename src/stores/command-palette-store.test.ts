import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommandPaletteStore } from "./command-palette-store";

describe("command palette store", () => {
  beforeEach(() => {
    useCommandPaletteStore.setState({
      open: false,
      registeredActions: {},
    });
  });

  it("runs a registered command by id", async () => {
    const run = vi.fn();
    const unregister = useCommandPaletteStore.getState().registerCommand({
      id: "test:run",
      title: "Run Test Command",
      run,
    });

    await expect(useCommandPaletteStore.getState().runCommand("test:run")).resolves.toBe(true);
    expect(run).toHaveBeenCalledOnce();

    unregister();
    await expect(useCommandPaletteStore.getState().runCommand("test:run")).resolves.toBe(false);
  });

  it("does not run disabled commands", async () => {
    const run = vi.fn();
    useCommandPaletteStore.getState().registerCommand({
      id: "test:disabled",
      title: "Disabled Test Command",
      disabled: true,
      run,
    });

    await expect(useCommandPaletteStore.getState().runCommand("test:disabled")).resolves.toBe(false);
    expect(run).not.toHaveBeenCalled();
  });
});
