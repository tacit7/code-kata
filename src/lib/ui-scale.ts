export const UI_SCALE_OPTIONS = [0.9, 1, 1.1, 1.25, 1.5] as const;

export type UiScale = (typeof UI_SCALE_OPTIONS)[number];

export const DEFAULT_UI_SCALE: UiScale = 1;

export function normalizeUiScale(value: unknown): UiScale {
  return typeof value === "number" && UI_SCALE_OPTIONS.includes(value as UiScale)
    ? (value as UiScale)
    : DEFAULT_UI_SCALE;
}

export function nextUiScale(current: unknown): UiScale {
  const normalized = normalizeUiScale(current);
  const index = UI_SCALE_OPTIONS.indexOf(normalized);
  return UI_SCALE_OPTIONS[Math.min(UI_SCALE_OPTIONS.length - 1, index + 1)];
}

export function previousUiScale(current: unknown): UiScale {
  const normalized = normalizeUiScale(current);
  const index = UI_SCALE_OPTIONS.indexOf(normalized);
  return UI_SCALE_OPTIONS[Math.max(0, index - 1)];
}

export function formatUiScale(scale: UiScale): string {
  return `${Math.round(scale * 100)}%`;
}
