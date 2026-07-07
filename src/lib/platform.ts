import { platform } from "@tauri-apps/plugin-os";

export const currentPlatform = platform();
export const isMacOS = currentPlatform === "macos";

// macOS lets web content overlay/inset into the title bar (see tauri.conf.json
// titleBarStyle: Overlay); Windows and Linux have no equivalent, so there's
// nothing for our header to visually integrate with — the native title bar
// stays, and our TopBar sits below it like any other app.
export const usesOverlayTitlebar = isMacOS;
