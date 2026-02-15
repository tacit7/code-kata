import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSettingsStore } from "../stores/settings-store";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/practice", label: "Practice", matchPrefix: "/session" },
  { path: "/settings", label: "Settings" },
];

export function TopBar() {
  const theme = useSettingsStore((s) => s.theme);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const katas = useKataStore((s) => s.katas);
  const startSession = useSessionStore((s) => s.startSession);
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const navigate = useNavigate();
  const location = useLocation();
  const [launching, setLaunching] = useState(false);

  const kataIdSet = new Set(katas.map((k) => k.id));
  const dailyCount = dailyKataIds.filter((id) => kataIdSet.has(id)).length;

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.matchPrefix) return location.pathname.startsWith(item.matchPrefix);
    return location.pathname === item.path;
  };

  const handleStartPractice = useCallback(async () => {
    if (dailyCount === 0) {
      navigate("/practice");
      return;
    }
    if (launching) return;
    setLaunching(true);
    const kataMap = new Map(katas.map((k) => [k.id, k]));
    const resolved = dailyKataIds.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    if (resolved.length === 0) {
      setLaunching(false);
      navigate("/practice");
      return;
    }
    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession("daily", resolved);
    navigate(`/session/${sessionId}`);
  }, [dailyKataIds, dailyCount, launching, katas, resetKataTimer, startSessionTimer, startSession, navigate]);

  return (
    <header className="flex items-center h-11 px-4 border-b border-base-300/60 bg-base-100 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-8 select-none">
        <img
          src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
          alt="CK"
          className="w-5 h-5"
        />
        <span className="text-sm font-semibold tracking-tight text-base-content/80">
          Code Kata
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center h-full gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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

      {/* Start Practice CTA */}
      <button
        onClick={handleStartPractice}
        disabled={launching}
        className="btn btn-primary btn-sm btn-soft ml-auto gap-1.5 text-xs font-semibold"
      >
        {launching ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
          </svg>
        )}
        {launching ? "Launching..." : "Start Practice"}
      </button>
    </header>
  );
}
