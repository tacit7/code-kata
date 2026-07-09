// Every next/prev decision lives here, as a pure function: no React, no stores,
// no router. The hook that wraps this owns mutation only.

export interface NavigationInput {
  mode: "session" | "browse";
  currentKataId: number;
  /** Session mode only. Ignored in browse mode. */
  currentIndex: number;
  sessionKataIds: number[];
  /** The Problems list as last rendered. A snapshot; may contain stale ids. */
  browseOrder: number[];
  /** Ids currently in the kata store. browseOrder is filtered against this. */
  availableKataIds: ReadonlySet<number>;
}

export interface NavigationTargets {
  /** Browse mode only. */
  prevId?: number;
  /** Browse mode only. */
  nextId?: number;
  /** Session mode only. */
  prevIndex?: number;
  /** Session mode only. */
  nextIndex?: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const NOWHERE: NavigationTargets = { hasPrev: false, hasNext: false };

export function resolveKataNavigation(input: NavigationInput): NavigationTargets {
  return input.mode === "session" ? resolveSession(input) : resolveBrowse(input);
}

// The queue governs, not the route. Position comes from currentIndex, never from
// currentKataId, so route/store drift cannot move the session.
function resolveSession({ currentIndex, sessionKataIds }: NavigationInput): NavigationTargets {
  if (currentIndex < 0 || currentIndex >= sessionKataIds.length) return NOWHERE;

  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;
  const hasPrev = prevIndex >= 0;
  const hasNext = nextIndex < sessionKataIds.length;

  return {
    hasPrev,
    hasNext,
    ...(hasPrev ? { prevIndex } : {}),
    ...(hasNext ? { nextIndex } : {}),
  };
}

function resolveBrowse({ currentKataId, browseOrder, availableKataIds }: NavigationInput): NavigationTargets {
  // Stale ids are dropped before neighbours are computed, so we never hand back
  // an id that would 404 into <Navigate to="/problems">.
  const live = browseOrder.filter((id) => availableKataIds.has(id));
  const at = live.indexOf(currentKataId);
  if (at === -1) return NOWHERE;

  const prevId = at > 0 ? live[at - 1] : undefined;
  const nextId = at < live.length - 1 ? live[at + 1] : undefined;

  return {
    hasPrev: prevId !== undefined,
    hasNext: nextId !== undefined,
    ...(prevId !== undefined ? { prevId } : {}),
    ...(nextId !== undefined ? { nextId } : {}),
  };
}
