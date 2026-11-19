import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/native-api", () => ({ nativeDragRegion: true, getCurrentWindow: vi.fn() }));
vi.mock("../lib/platform", () => ({ usesOverlayTitlebar: true }));
vi.mock("../hooks/use-nav-history", () => ({ useNavHistory: () => ({ canBack: true, canForward: true, back: vi.fn(), forward: vi.fn() }) }));
vi.mock("react-router", () => ({ useNavigate: () => vi.fn(), useLocation: () => ({ pathname: "/editor/10" }) }));
vi.mock("../stores/settings-store", () => ({ useSettingsStore: (selector: (state: unknown) => unknown) => selector({ theme: "dark", language: "ruby" }) }));
vi.mock("../stores/session-store", () => ({ useSessionStore: (selector: (state: unknown) => unknown) => selector({ activeSession: null }) }));
import { TopBar } from "./top-bar";

describe("native history controls", () => {
  it("keeps the Back and Forward buttons outside the Electron window drag region", () => {
    const html = renderToStaticMarkup(createElement(TopBar));
    const controls = html.match(/<div([^>]*)><button[^>]*aria-label="Go back"/);
    expect(controls).not.toBeNull();
    expect(controls![1]).toContain("-webkit-app-region:no-drag");
  });
});
