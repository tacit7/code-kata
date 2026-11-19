import { describe, expect, it, vi } from "vitest";
import { disposeVimMode, syncVimMode } from "./vim-mode";

type FakeEditor = { id: string };
type FakeStatusBar = { id: string };

function createAdapter() {
  return { dispose: vi.fn() };
}

describe("syncVimMode", () => {
  it("initializes vim mode when enabled and an editor is mounted", () => {
    const editor = { id: "editor-a" };
    const statusBar = { id: "status" };
    const adapter = createAdapter();
    const init = vi.fn(() => adapter);

    const state = syncVimMode<FakeEditor, FakeStatusBar>({
      enabled: true,
      editor,
      statusBar,
      current: null,
      init,
    });

    expect(init).toHaveBeenCalledExactlyOnceWith(editor, statusBar);
    expect(state).toEqual({ editor, adapter });
  });

  it("keeps the existing adapter for the same editor", () => {
    const editor = { id: "editor-a" };
    const statusBar = { id: "status" };
    const adapter = createAdapter();
    const init = vi.fn(() => createAdapter());

    const state = syncVimMode<FakeEditor, FakeStatusBar>({
      enabled: true,
      editor,
      statusBar,
      current: { editor, adapter },
      init,
    });

    expect(init).not.toHaveBeenCalled();
    expect(adapter.dispose).not.toHaveBeenCalled();
    expect(state).toEqual({ editor, adapter });
  });

  it("reinitializes vim mode when Monaco remounts a new editor instance", () => {
    const oldEditor = { id: "editor-a" };
    const newEditor = { id: "editor-b" };
    const statusBar = { id: "status" };
    const oldAdapter = createAdapter();
    const newAdapter = createAdapter();
    const init = vi.fn(() => newAdapter);

    const state = syncVimMode<FakeEditor, FakeStatusBar>({
      enabled: true,
      editor: newEditor,
      statusBar,
      current: { editor: oldEditor, adapter: oldAdapter },
      init,
    });

    expect(oldAdapter.dispose).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledExactlyOnceWith(newEditor, statusBar);
    expect(state).toEqual({ editor: newEditor, adapter: newAdapter });
  });

  it("disposes vim mode when disabled or the editor is unavailable", () => {
    const editor = { id: "editor-a" };
    const adapter = createAdapter();
    const init = vi.fn(() => createAdapter());

    expect(syncVimMode({
      enabled: false,
      editor,
      statusBar: { id: "status" },
      current: { editor, adapter },
      init,
    })).toBeNull();

    expect(adapter.dispose).toHaveBeenCalledTimes(1);
    expect(init).not.toHaveBeenCalled();
  });
});

describe("disposeVimMode", () => {
  it("disposes the active adapter and returns empty state", () => {
    const adapter = createAdapter();

    expect(disposeVimMode({ editor: { id: "editor-a" }, adapter })).toBeNull();
    expect(adapter.dispose).toHaveBeenCalledTimes(1);
  });
});
