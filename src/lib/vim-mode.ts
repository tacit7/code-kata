export type VimModeAdapter = {
  dispose: () => void;
};

export type VimModeState<EditorInstance, Adapter extends VimModeAdapter = VimModeAdapter> = {
  editor: EditorInstance;
  adapter: Adapter;
};

export function syncVimMode<EditorInstance, StatusBar, Adapter extends VimModeAdapter = VimModeAdapter>({
  enabled,
  editor,
  statusBar,
  current,
  init,
}: {
  enabled: boolean;
  editor: EditorInstance | null;
  statusBar: StatusBar | null;
  current: VimModeState<EditorInstance, Adapter> | null;
  init: (editor: EditorInstance, statusBar: StatusBar) => Adapter;
}): VimModeState<EditorInstance, Adapter> | null {
  if (!enabled || !editor || !statusBar) {
    return disposeVimMode(current);
  }

  if (current?.editor === editor) {
    return current;
  }

  disposeVimMode(current);
  return { editor, adapter: init(editor, statusBar) };
}

export function disposeVimMode<EditorInstance, Adapter extends VimModeAdapter>(
  current: VimModeState<EditorInstance, Adapter> | null,
): null {
  current?.adapter.dispose();
  return null;
}
