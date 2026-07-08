import { Fragment, useEffect } from "react";
import { useDashboardStore } from "../stores/dashboard-store";
import type { DrillDownRow } from "../stores/dashboard-store";
import { formatTime } from "../lib/format";

function DrillDown({ rows }: { rows: DrillDownRow[] }) {
  return (
    <tr>
      <td colSpan={5} className="p-0">
        <div className="bg-base-200 px-6 py-3">
          <table className="table table-sm">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-base-300/30 last:border-0"
                >
                  <td className="font-medium text-sm">{row.kataName}</td>
                  <td className="text-base-content/45 text-sm">{row.category}</td>
                  <td className="font-mono text-base-content/45 text-sm tabular-nums">
                    {row.timeMs != null ? formatTime(row.timeMs) : "--:--"}
                  </td>
                  <td>
                    {row.passed ? (
                      <span className="badge badge-success badge-xs">Pass</span>
                    ) : (
                      <span className="badge badge-error badge-xs">Fail</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

export function ResultsPage() {
  const sessionHistory = useDashboardStore((s) => s.sessionHistory);
  const sessionHistoryHasMore = useDashboardStore((s) => s.sessionHistoryHasMore);
  const selectedSessionId = useDashboardStore((s) => s.selectedSessionId);
  const drillDown = useDashboardStore((s) => s.drillDown);
  const loadDrillDown = useDashboardStore((s) => s.loadDrillDown);
  const clearDrillDown = useDashboardStore((s) => s.clearDrillDown);
  const loadMoreSessions = useDashboardStore((s) => s.loadMoreSessions);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);
  const loading = useDashboardStore((s) => s.loading);

  // Always refresh on mount — the cache goes stale when a session finishes
  // (dashboard.tsx does the same).
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRowClick = (sessionId: number) => {
    if (selectedSessionId === sessionId) {
      clearDrillDown();
    } else {
      loadDrillDown(sessionId);
    }
  };

  return (
    <div className="flex flex-col h-full p-5 gap-4 animate-fade-in">
      <h1 className="text-lg font-bold">Results</h1>

      {loading ? (
        <div className="flex items-center justify-center flex-1 gap-2 text-base-content/30 text-sm">
          <span className="loading loading-spinner loading-sm text-primary" />
          Loading...
        </div>
      ) : sessionHistory.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-base-content/30 text-sm">
          No sessions yet. Start practicing to build your history.
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-lg border border-base-300/50 scrollbar-hidden">
          <table className="table table-sm">
            <thead>
              <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
                <th className="font-semibold">Date</th>
                <th className="font-semibold">Type</th>
                <th className="font-semibold">Katas</th>
                <th className="font-semibold">Time</th>
                <th className="font-semibold">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((session) => {
                const allPassed = session.pass_count === session.kata_count && session.kata_count > 0;
                const isSelected = selectedSessionId === session.id;
                return (
                  <Fragment key={session.id}>
                    <tr
                      className={`cursor-pointer transition-colors border-base-300/30 ${
                        isSelected ? "bg-base-200" : "hover:bg-base-300/20"
                      }`}
                      onClick={() => handleRowClick(session.id)}
                    >
                      <td className="text-base-content/45 text-sm">
                        {new Date(session.started_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <span className="ml-2 text-base-content/25 text-[11px]">
                          {new Date(session.started_at).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="capitalize text-sm">{session.session_type}</td>
                      <td className="text-base-content/45 text-sm tabular-nums">{session.kata_count}</td>
                      <td className="font-mono text-base-content/45 text-sm tabular-nums">
                        {session.total_time_ms != null ? formatTime(session.total_time_ms) : "--:--"}
                      </td>
                      <td className={`text-sm tabular-nums font-medium ${allPassed ? "text-success" : "text-base-content/45"}`}>
                        {session.pass_count}/{session.kata_count}
                      </td>
                    </tr>
                    {isSelected && drillDown && (
                      <DrillDown key={`drill-${session.id}`} rows={drillDown} />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {sessionHistoryHasMore && (
            <div className="px-4 py-3 border-t border-base-300/30">
              <button onClick={loadMoreSessions} className="btn btn-ghost btn-sm text-xs">
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
