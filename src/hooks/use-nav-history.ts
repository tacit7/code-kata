import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";

// Module-level so the history stack survives TopBar re-renders/remounts.
let keyStack: string[] = [];
let cursor = -1;

/**
 * VS Code-style back/forward navigation history. Tracks the router's history
 * entries by `location.key` and the navigation Action (PUSH / REPLACE / POP) so
 * the buttons know when there is nowhere left to go and can disable themselves.
 *
 * - PUSH (a new navigation) truncates any forward entries, then appends.
 * - REPLACE overwrites the current entry in place.
 * - POP (back/forward, whether from these buttons or a browser gesture) relocates
 *   the cursor to whichever stored entry we landed on.
 */
export function useNavHistory() {
  const location = useLocation();
  const action = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const navigate = useNavigate();
  const [, bump] = useState(0);

  useEffect(() => {
    const key = location.key;
    if (action === "PUSH") {
      keyStack = keyStack.slice(0, cursor + 1);
      keyStack.push(key);
      cursor = keyStack.length - 1;
    } else if (action === "REPLACE") {
      if (cursor < 0) {
        keyStack = [key];
        cursor = 0;
      } else {
        keyStack[cursor] = key;
      }
    } else {
      // POP: locate the entry we landed on; fall back to a fresh stack if it's
      // unknown (e.g. the very first render).
      const at = keyStack.indexOf(key);
      if (at !== -1) cursor = at;
      else {
        keyStack = [key];
        cursor = 0;
      }
    }
    bump((n) => n + 1);
  }, [location.key, action]);

  return {
    canBack: cursor > 0,
    canForward: cursor >= 0 && cursor < keyStack.length - 1,
    back: () => navigate(-1),
    forward: () => navigate(1),
  };
}
