import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore } from "../stores/session-store";
import { resolveKataNavigation } from "../lib/kata-navigation";

/**
 * Answers "where does next/prev go?" for whichever kata is on screen.
 *
 * All the decisions live in resolveKataNavigation. This hook only reads the
 * route to pick a mode, feeds the resolver, and performs the mutation.
 */
export function useKataNavigation(currentKataId: number) {
  const navigate = useNavigate();
  const location = useLocation();

  const katas = useKataStore((s) => s.katas);
  const browseOrder = useKataStore((s) => s.browseOrder);
  const sessionKatas = useSessionStore((s) => s.sessionKatas);
  const currentIndex = useSessionStore((s) => s.currentIndex);
  const setCurrentIndex = useSessionStore((s) => s.setCurrentIndex);

  // A running session lives under /session/:id. /session/:id/results renders no
  // editor, so it never reaches this hook.
  const mode = location.pathname.startsWith("/session/") ? "session" : "browse";

  const availableKataIds = useMemo(() => new Set(katas.map((k) => k.id)), [katas]);
  const sessionKataIds = useMemo(() => sessionKatas.map((k) => k.id), [sessionKatas]);

  const targets = useMemo(
    () =>
      resolveKataNavigation({
        mode,
        currentKataId,
        currentIndex,
        sessionKataIds,
        browseOrder,
        availableKataIds,
      }),
    [mode, currentKataId, currentIndex, sessionKataIds, browseOrder, availableKataIds],
  );

  const go = useCallback(
    (index: number | undefined, id: number | undefined) => {
      if (mode === "session") {
        if (index !== undefined) setCurrentIndex(index);
        return;
      }
      if (id !== undefined) navigate(`/editor/${id}`);
    },
    [mode, setCurrentIndex, navigate],
  );

  const next = useCallback(() => go(targets.nextIndex, targets.nextId), [go, targets.nextIndex, targets.nextId]);
  const prev = useCallback(() => go(targets.prevIndex, targets.prevId), [go, targets.prevIndex, targets.prevId]);

  return { next, prev, hasNext: targets.hasNext, hasPrev: targets.hasPrev };
}
