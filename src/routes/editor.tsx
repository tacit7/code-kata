import { useEditorStore } from "../stores/editor-store";
import { KataEditor } from "../components/kata-editor";

export function EditorPage() {
  const currentKataId = useEditorStore((s) => s.currentKataId);

  return <KataEditor kataId={currentKataId} />;
}
