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
  const source = readFileSync(join(__dirname, "session.tsx"), "utf8");

  it("does not register keyboard shortcuts", () => {
    expect(source).not.toContain("useKeyboardShortcuts");
  });

  it("enforces the time limit against the live per-problem timer", () => {
    expect(source).toContain("const liveKataElapsed = currentKataElapsedMs();");
    expect(source).toContain("liveKataElapsed < sessionTimeLimitMs");
    expect(source).toContain("await recordAttempt(currentKata.id, liveKataElapsed, false, \"\");");
  });
});
