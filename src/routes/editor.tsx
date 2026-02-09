import { useEffect } from "react";
import { useParams, Navigate } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { useTimerStore } from "../stores/timer-store";
import { KataEditor } from "../components/kata-editor";

export function EditorPage() {
  const { kataId } = useParams<{ kataId: string }>();
  const katas = useKataStore((s) => s.katas);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);

  const kata = katas.find((k) => k.id === kataId);

  useEffect(() => {
    resetKataTimer();
  }, [kataId, resetKataTimer]);

  if (!kata) return <Navigate to="/library" replace />;

  return <KataEditor kata={kata} />;
}
