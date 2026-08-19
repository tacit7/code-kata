// Pure nav matching, kept out of top-bar.tsx so it can be unit tested — that
// module reads `navigator` at import time and cannot load under vitest.

export interface NavItem {
  path: string;
  label: string;
  /** Defaults to an exact path match. */
  match?: (pathname: string) => boolean;
}

const SESSION_RESULTS = /^\/session\/[^/]+\/results$/;

export const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/practice", label: "Practice" },
  // A running session lives under /session/:id and belongs to Problems, but the
  // page it ends on — /session/:id/results — is a results page, so it lights up
  // Results instead.
  {
    path: "/problems",
    label: "Problems",
    match: (p) => p === "/problems" || (p.startsWith("/session") && !SESSION_RESULTS.test(p)),
  },
  { path: "/modules", label: "Modules" },
  { path: "/results", label: "Results", match: (p) => p === "/results" || SESSION_RESULTS.test(p) },
  { path: "/settings", label: "Settings" },
];

/** Path of the nav item that should be highlighted, or null. */
export function activeNavPath(pathname: string): string | null {
  const hit = NAV_ITEMS.find((item) =>
    item.match ? item.match(pathname) : pathname === item.path,
  );
  return hit ? hit.path : null;
}
