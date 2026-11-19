import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
vi.mock("../stores/dashboard-store", () => ({ useDashboardStore: (selector: (state: unknown) => unknown) => selector({
  sessionHistory: [{ id: 82, started_at: "2026-11-19T09:00:00Z", session_type: "daily", kata_count: 1, pass_count: 0, total_time_ms: 1000 }],
  selectedSessionId: 82, drillDown: [{ id: 1, kataId: 10, kataName: "Two Sum", language: "javascript", category: "arrays", passed: 0, timeMs: 1000 }],
  loadDashboard: vi.fn(), loadDrillDown: vi.fn(), clearDrillDown: vi.fn(),
}) }));
vi.mock("../stores/settings-store", () => ({ useSettingsStore: (selector: (state: unknown) => unknown) => selector({ language: "javascript", setSetting: vi.fn() }) }));
vi.mock("../stores/kata-store", () => ({ useKataStore: (selector: (state: unknown) => unknown) => selector({ loadKatas: vi.fn() }) }));
import { ResultsPage } from "./results";

describe("Results overview links", () => {
  it("keeps expandable rows and links to session details and individual problems", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ResultsPage)));
    expect(html).toContain('href="/session/82/results"');
    expect(html).toContain('href="/editor/10"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Collapse session 82"');
  });
});
