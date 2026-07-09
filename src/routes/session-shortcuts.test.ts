import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// KataEditor registers nextKata/prevKata. If session.tsx registers them too,
// both handlers run on one keypress and the kata advances twice. Nothing else
// in the suite would catch that: neither registration throws.
//
// The assertion is on useKeyboardShortcuts, not on the identifiers nextKata /
// prevKata — session.tsx legitimately calls the session store's nextKata() and
// prevKata() actions from its on-screen Next/Prev buttons, and must keep doing so.
//
// Crude on purpose, same reasoning as electron/safeguards.test.ts.
describe("session.tsx", () => {
  it("does not register keyboard shortcuts", () => {
    const src = readFileSync(join(__dirname, "session.tsx"), "utf8");
    expect(src).not.toContain("useKeyboardShortcuts");
  });
});
