import { confirm as nativeConfirm, type ConfirmDialogOptions } from "@tauri-apps/plugin-dialog";

export interface ConfirmActionOptions extends ConfirmDialogOptions {
  message: string;
}

export type NativeConfirm = (
  message: string,
  options?: string | ConfirmDialogOptions,
) => Promise<boolean>;

function browserConfirm(message: string): boolean | null {
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(message);
  }
  if (typeof globalThis.confirm === "function") {
    return globalThis.confirm(message);
  }
  return null;
}

export async function confirmAction(
  { message, ...options }: ConfirmActionOptions,
  confirmImpl: NativeConfirm = nativeConfirm,
): Promise<boolean> {
  try {
    return await confirmImpl(message, options);
  } catch {
    return browserConfirm(message) ?? false;
  }
}
