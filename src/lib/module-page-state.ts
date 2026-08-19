export const OPEN_MODULES_PARAM = "open";

export function parseOpenModuleIds(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function serializeOpenModuleIds(ids: Iterable<string>): string {
  return Array.from(new Set(ids))
    .map((id) => id.trim())
    .filter(Boolean)
    .join(",");
}

export function sameOpenModuleIds(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

export function withOpenModuleIds(params: URLSearchParams, ids: Iterable<string>): URLSearchParams {
  const next = new URLSearchParams(params);
  const serialized = serializeOpenModuleIds(ids);
  if (serialized) next.set(OPEN_MODULES_PARAM, serialized);
  else next.delete(OPEN_MODULES_PARAM);
  return next;
}
