// Variant-owned Tauri implementation. Shared frontend code uses native-api.ts.
export { invoke } from "@tauri-apps/api/core";
export { listen } from "@tauri-apps/api/event";
export { open } from "@tauri-apps/plugin-shell";
export { writeText } from "@tauri-apps/plugin-clipboard-manager";
export { getCurrentWindow } from "@tauri-apps/api/window";
export { platform } from "@tauri-apps/plugin-os";
export { confirm, type ConfirmDialogOptions } from "@tauri-apps/plugin-dialog";
export const nativeDragRegion = false;
