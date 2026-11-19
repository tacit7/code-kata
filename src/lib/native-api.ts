// The implementation is variant-owned. Keep shared UI imports on this boundary.
export {
  invoke, listen, open, writeText, getCurrentWindow, platform, confirm,
  nativeDragRegion,
  type ConfirmDialogOptions,
} from "./native-api-platform";
