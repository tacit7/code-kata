import { describe, expect, it } from "vitest";
import { resumableSessionPath } from "./session-resume";

describe("resumableSessionPath", () => {
  it("returns the active session route for unfinished sessions", () => {
    expect(resumableSessionPath({ id: 42, finishedAt: null, kataIds: [1, 2, 3] })).toBe("/session/42");
  });

  it("returns null when there is no unfinished session", () => {
    expect(resumableSessionPath(null)).toBeNull();
    expect(resumableSessionPath({ id: 42, finishedAt: "2026-08-11T12:00:00.000Z", kataIds: [1] })).toBeNull();
  });

  it("returns null when an unfinished session has no recoverable roster", () => {
    expect(resumableSessionPath({ id: 42, finishedAt: null, kataIds: null })).toBeNull();
    expect(resumableSessionPath({ id: 42, finishedAt: null, kataIds: [] })).toBeNull();
  });
});
