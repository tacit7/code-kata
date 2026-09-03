import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("library navigation", () => {
  const source = readFileSync(new URL("./library.tsx", import.meta.url), "utf8");

  it("opens the selected problem in the editor from keyboard activation", () => {
    expect(source).toContain('navigate(`/editor/${kata.id}`)');
    expect(source).toContain('if (kata) openKata(kata);');
  });

  it("opens problem rows in the editor when clicked", () => {
    expect(source).toContain('onClick={() => openKata(kata)}');
  });
});
