import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("react-router", () => ({ useParams: () => ({ sessionId: "82" }), useNavigate: () => vi.fn(), Navigate: () => null,
  Link: ({ children }: { children: unknown }) => children }));
vi.mock("../stores/session-store", () => ({ useSessionStore: () => ({
  activeSession: { id: 99, kataCount: 1, passCount: 0, sessionType: "daily", totalTimeMs: 1000 },
  sessionKatas: [{ id: 10, name: "Unrelated active practice problem" }], attempts: [],
  loadSession: vi.fn(), startSession: vi.fn(),
}) }));
vi.mock("../stores/kata-store", () => ({ useKataStore: (selector: (state: unknown) => unknown) => selector({ katas: [] }) }));
vi.mock("../stores/timer-store", () => ({ useTimerStore: (selector: (state: unknown) => unknown) => selector({ resetKataTimer: vi.fn(), startSessionTimer: vi.fn() }) }));
vi.mock("../components/code-diff", () => ({ CodeDiff: () => null }));
import { SessionResultsPage } from "./session-results";

describe("session results route", () => {
  it("does not show an unrelated active session when opening a historical detail URL", () => {
    const html = renderToStaticMarkup(createElement(SessionResultsPage));
    expect(html).not.toContain("Unrelated active practice problem");
  });
});
