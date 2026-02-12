import { useNavigate, useLocation } from "react-router";
import { useSettingsStore } from "../stores/settings-store";

export function TopBar() {
  const theme = useSettingsStore((s) => s.theme);
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === "/dashboard";
  const onLibrary = location.pathname === "/library";
  const onPractice = location.pathname.startsWith("/session");
  const onSettings = location.pathname === "/settings";

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      active
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
    }`;

  return (
    <header className="flex items-center px-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
      <img
        src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
        alt="CK"
        className="w-5 h-5 mr-3"
      />
      <nav className="flex">
        <button onClick={() => navigate("/dashboard")} className={tabClass(onDashboard)}>
          Dashboard
        </button>
        <button onClick={() => navigate("/library")} className={tabClass(onLibrary)}>
          Library
        </button>
        <button onClick={() => navigate("/session/setup")} className={tabClass(onPractice)}>
          Practice
        </button>
        <button onClick={() => navigate("/settings")} className={tabClass(onSettings)}>
          Settings
        </button>
      </nav>
      <button
        onClick={() => navigate("/kata/new")}
        className="ml-auto px-3 py-1.5 text-xs font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
      >
        + New Kata
      </button>
    </header>
  );
}
