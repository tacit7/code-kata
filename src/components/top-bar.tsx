import { useNavigate, useLocation } from "react-router";
import { useNavHistory } from "../hooks/use-nav-history";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "../stores/settings-store";
import { isDarkScheme } from "../lib/editor-themes";
import { usesOverlayTitlebar } from "../lib/platform";
import { useSessionStore } from "../stores/session-store";
import { NAV_ITEMS, activeNavPath, type NavItem } from "../lib/nav-items";
import { resumableSessionPath } from "../lib/session-resume";

export function TopBar() {
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const activeSession = useSessionStore((s) => s.activeSession);
  const navigate = useNavigate();
  const location = useLocation();
  const { canBack, canForward, back, forward } = useNavHistory();

  const activePath = activeNavPath(location.pathname);
  const isActive = (item: NavItem) => item.path === activePath;
  const resumePath = resumableSessionPath(activeSession);

  // Only macOS overlays web content into the title bar (titleBarStyle:
  // Overlay in tauri.conf.json), so only there does our header need to act
  // as the drag region — on Windows/Linux the native title bar already
  // handles dragging, and -webkit-app-region isn't reliable here anyway
  // since it operates below Tauri's window layer.
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (!usesOverlayTitlebar) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, a, [role='button']")) return;
    e.preventDefault(); // otherwise the drag gesture selects header text
    void getCurrentWindow().startDragging();
  };

  return (
    <header
      onMouseDown={handleHeaderMouseDown}
      className={`flex items-center h-11 pr-4 border-b border-base-300/60 bg-base-100 shrink-0 ${
        usesOverlayTitlebar ? "pl-20" : "pl-4"
      }`}
    >
      {/* Brand — pl-20 clears the macOS traffic-light overlay; other platforms
          keep their native title bar above this header, so no inset is needed. */}
      <div className="flex items-center gap-2.5 mr-8 select-none">
        <img
          src={isDarkScheme(theme) ? "/logo-dark.png" : "/logo-light.png"}
          alt="CK"
          className="w-5 h-5"
        />
        <img
          src={`/devicons/${language}.svg`}
          alt={language}
          title={language}
          className="w-5 h-5"
        />
      </div>

      {/* Back / forward — VS Code style */}
      <div className="flex items-center gap-0.5 mr-4">
        <button
          onClick={back}
          disabled={!canBack}
          title="Back"
          aria-label="Go back"
          className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content/80 disabled:opacity-25 disabled:hover:text-base-content/50 disabled:cursor-default"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={forward}
          disabled={!canForward}
          title="Forward"
          aria-label="Go forward"
          className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content/80 disabled:opacity-25 disabled:hover:text-base-content/50 disabled:cursor-default"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex items-center h-full gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path === "/practice" ? resumePath ?? item.path : item.path)}
              className={`relative px-3 h-full text-[13px] font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-base-content/40 hover:text-base-content/70"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="ml-auto" />
    </header>
  );
}
