import { describe, expect, it, vi } from "vitest";

const values = new Map<string, string>();
vi.mock("./database", () => ({
  getDb: async () => ({
    select: async (_sql: string, [key]: string[]) => values.has(key) ? [{ value: values.get(key) }] : [],
    execute: async (_sql: string, [key, code]: string[]) => { values.set(key, code); },
  }),
}));

import { loadScratchpad, saveScratchpad } from "./scratchpad";

describe("scratchpad persistence", () => {
  it("keeps Python and JavaScript drafts separate, including an empty draft", async () => {
    await saveScratchpad("python", "print(42)");
    await saveScratchpad("javascript", "console.log(7)");
    expect(await loadScratchpad("python")).toBe("print(42)");
    expect(await loadScratchpad("javascript")).toBe("console.log(7)");
    await saveScratchpad("python", "");
    expect(await loadScratchpad("python")).toBe("");
    expect(await loadScratchpad("javascript")).toBe("console.log(7)");
  });

  it("loads the last queued edit when returning to a language during autosave", async () => {
    const first = saveScratchpad("python", "old");
    const latest = saveScratchpad("python", "new");
    expect(await loadScratchpad("python")).toBe("new");
    await Promise.all([first, latest]);
  });
});
