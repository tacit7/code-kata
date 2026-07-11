import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { useSessionStore } from "../stores/session-store";
import { useKataStore } from "../stores/kata-store";
import { formatTime } from "../lib/format";
import { CodeDiff } from "../components/code-diff";

export function SessionResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { activeSession, sessionKatas, attempts, loadSession, clearSession } = useSessionStore();
  const allKatas = useKataStore((s) => s.katas);
  const [expandedDiffs, setExpandedDiffs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!activeSession && sessionId) {
      loadSession(Number(sessionId), allKatas);
    }
  }, [activeSession, sessionId, allKatas, loadSession]);

  if (!activeSession) {
    if (!sessionId) return <Navigate to="/problems" replace />;
    return (
      <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm text-primary" />
          Loading results
        </div>
      </div>
    );
  }

  const passRate = activeSession.kataCount > 0
    ? `${activeSession.passCount}/${activeSession.kataCount}`
    : "0/0";

  const allPassed = activeSession.passCount === activeSession.kataCount && activeSession.kataCount > 0;

  const handleBackToLibrary = () => {
    clearSession();
    navigate("/problems");
  };

  const handlePracticeAgain = () => {
    navigate("/problems");
  };

  const toggleDiff = (index: number) => {
    setExpandedDiffs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full p-5 gap-5 overflow-y-auto animate-fade-in">
      <h1 className="text-lg font-bold">Session Results</h1>

      {/* Summary cards */}
      <div className="flex gap-3 stagger">
        <div className="bg-base-100 rounded-lg p-4 border border-base-300/50 min-w-[120px]">
          <div className="text-[11px] font-medium text-base-content/35 uppercase tracking-wider mb-1">Total Time</div>
          <div className="text-lg font-mono font-bold tabular-nums">
            {activeSession.totalTimeMs != null ? formatTime(activeSession.totalTimeMs) : "--:--"}
          </div>
        </div>
        <div className={`bg-base-100 rounded-lg p-4 border min-w-[120px] ${allPassed ? "border-success/30" : "border-base-300/50"}`}>
          <div className="text-[11px] font-medium text-base-content/35 uppercase tracking-wider mb-1">Pass Rate</div>
          <div className={`text-lg font-bold ${allPassed ? "text-success" : ""}`}>{passRate}</div>
        </div>
        <div className="bg-base-100 rounded-lg p-4 border border-base-300/50 min-w-[120px]">
          <div className="text-[11px] font-medium text-base-content/35 uppercase tracking-wider mb-1">Type</div>
          <div className="text-lg font-bold capitalize">{activeSession.sessionType}</div>
        </div>
      </div>

      {/* Per-kata table */}
      <div className="bg-base-100 rounded-lg border border-base-300/50 overflow-hidden">
        <table className="table table-sm">
          <thead>
            <tr className="text-left text-[11px] text-base-content/35 uppercase tracking-wider">
              <th className="font-semibold w-8">#</th>
              <th className="font-semibold">Kata</th>
              <th className="font-semibold">Time</th>
              <th className="font-semibold">Result</th>
              <th className="font-semibold">Diff</th>
            </tr>
          </thead>
          <tbody>
            {sessionKatas.map((kata, i) => {
              const attempt = attempts.find((a) => a.kataIndex === i);
              const hasDiff = attempt?.codeSnapshot != null;
              const isExpanded = expandedDiffs.has(i);
              return (
                <Fragment key={kata.id}>
                  <tr className="border-base-300/30">
                    <td className="text-base-content/30 text-sm tabular-nums">{i + 1}</td>
                    <td className="text-sm">
                      <button
                        onClick={() => navigate(`/editor/${kata.id}`)}
                        className="font-medium text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                      >
                        {kata.name}
                      </button>
                    </td>
                    <td className="font-mono text-base-content/45 text-sm tabular-nums">
                      {attempt?.timeMs != null ? formatTime(attempt.timeMs) : "--:--"}
                    </td>
                    <td>
                      {attempt ? (
                        attempt.passed ? (
                          <span className="badge badge-success badge-xs">Pass</span>
                        ) : (
                          <span className="badge badge-error badge-xs">Fail</span>
                        )
                      ) : (
                        <span className="badge badge-ghost badge-xs">Skipped</span>
                      )}
                    </td>
                    <td>
                      {hasDiff && (
                        <button
                          onClick={() => toggleDiff(i)}
                          className="btn btn-ghost btn-xs text-xs"
                        >
                          {isExpanded ? "Hide" : "Diff"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && hasDiff && (
                    <tr key={`${kata.id}-diff`}>
                      <td colSpan={5} className="py-2 px-4">
                        <CodeDiff
                          original={kata.code}
                          modified={attempt!.codeSnapshot!}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleBackToLibrary} className="btn btn-ghost btn-sm">
          Back to Practice
        </button>
        <button onClick={handlePracticeAgain} className="btn btn-primary btn-sm">
          Practice Again
        </button>
      </div>
    </div>
  );
}
