import { createElement, type ReactNode, type MouseEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(), setSetting: vi.fn(), loadKatas: vi.fn(), error: vi.fn(),
  onClick: null as unknown as (event: MouseEvent<HTMLAnchorElement>) => Promise<void>,
}));
vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigate,
  Link: ({ to, onClick, children, ...props }: { to: string; onClick: typeof mocks.onClick; children: ReactNode }) => {
    mocks.onClick = onClick;
    return createElement("a", { ...props, href: to }, children);
  },
}));
vi.mock("../stores/settings-store", () => ({ useSettingsStore: (selector: (state: unknown) => unknown) => selector({ language: "javascript", setSetting: mocks.setSetting }) }));
vi.mock("../stores/kata-store", () => ({ useKataStore: (selector: (state: unknown) => unknown) => selector({ loadKatas: mocks.loadKatas }) }));
vi.mock("../stores/toast-store", () => ({ toast: { error: mocks.error } }));
import { ResultProblemLink } from "../components/result-problem-link";

beforeEach(() => { vi.clearAllMocks(); mocks.setSetting.mockResolvedValue(undefined); mocks.loadKatas.mockResolvedValue(undefined); });
const event = () => ({ preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as MouseEvent<HTMLAnchorElement>;
describe("result problem links", () => {
  it("links directly to a problem without toggling its parent session row", async () => {
    const html = renderToStaticMarkup(createElement(ResultProblemLink, { kataId: 10, language: "javascript", children: "Two Sum" }));
    expect(html).toContain('href="/editor/10"');
    const click = event();
    await mocks.onClick(click);
    expect(click.stopPropagation).toHaveBeenCalled();
    expect(click.preventDefault).not.toHaveBeenCalled();
  });
  it("loads a historical problem's language before navigating to its editor", async () => {
    renderToStaticMarkup(createElement(ResultProblemLink, { kataId: 10, language: "python", children: "Two Sum" }));
    const click = event();
    await mocks.onClick(click);
    expect(click.preventDefault).toHaveBeenCalled();
    expect(mocks.setSetting).toHaveBeenCalledWith("language", "python", { throwOnError: true });
    expect(mocks.loadKatas).toHaveBeenCalledWith("python");
    expect(mocks.loadKatas.mock.invocationCallOrder[0]).toBeLessThan(mocks.navigate.mock.invocationCallOrder[0]);
    expect(mocks.navigate).toHaveBeenCalledWith("/editor/10");
  });
});
