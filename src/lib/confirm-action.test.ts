import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmAction, type NativeConfirm } from "./confirm-action";

describe("confirmAction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the native confirm implementation", async () => {
    const native = vi.fn<NativeConfirm>().mockResolvedValue(true);

    await expect(confirmAction({
      message: "Delete this?",
      title: "Delete",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    }, native)).resolves.toBe(true);

    expect(native).toHaveBeenCalledWith("Delete this?", {
      title: "Delete",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });
  });

  it("falls back to browser confirm when native confirm is unavailable", async () => {
    const native = vi.fn<NativeConfirm>().mockRejectedValue(new Error("not in tauri"));
    const fallback = vi.fn(() => true);
    vi.stubGlobal("window", { confirm: fallback });

    await expect(confirmAction({ message: "Fallback?" }, native)).resolves.toBe(true);
    expect(fallback).toHaveBeenCalledWith("Fallback?");
  });

  it("returns false when no confirm implementation is available", async () => {
    const native = vi.fn<NativeConfirm>().mockRejectedValue(new Error("not in tauri"));
    vi.stubGlobal("window", undefined);

    await expect(confirmAction({ message: "Fallback?" }, native)).resolves.toBe(false);
  });
});
