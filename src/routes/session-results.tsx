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
    if (!sessionId) return <Navigate to="/library" replace />;
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading results...
      </div>
    );
  }

  const passRate = activeSession.kataCount > 0
    ? `${activeSession.passCount}/${activeSession.kataCount}`
    : "0/0";

  const handleBackToLibrary = () => {
    clearSession();
    navigate("/library");
  };

  const handlePracticeAgain = () => {
    // Re-start with same katas
    navigate("/session/setup");
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
    <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto">
      <h1 className="text-xl font-bold">Session Results</h1>

      {/* Summary cards */}
      <div className="flex gap-4">
        <div className="px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Time</p>
          <p className="text-lg font-mono font-semibold">
            {activeSession.totalTimeMs != null ? formatTime(activeSession.totalTimeMs) : "--:--"}
          </p>
        </div>
        <div className="px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pass Rate</p>
          <p className="text-lg font-semibold">{passRate}</p>
        </div>
        <div className="px-4 py-3 rounded bg-zinc-100 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Session Type</p>
          <p className="text-lg font-semibold capitalize">{activeSession.sessionType}</p>
        </div>
      </div>

      {/* Per-kata table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-2 font-medium w-8">#</th>
            <th className="pb-2 font-medium">Kata</th>
            <th className="pb-2 font-medium">Time</th>
            <th className="pb-2 font-medium">Result</th>
            <th className="pb-2 font-medium">Diff</th>
          </tr>
        </thead>
        <tbody>
          {sessionKatas.map((kata, i) => {
            const attempt = attempts.find((a) => a.kataIndex === i);
            const hasDiff = attempt?.codeSnapshot != null;
            const isExpanded = expandedDiffs.has(i);
            return (
              <Fragment key={kata.id}>
                <tr
                  className="border-b border-zinc-100 dark:border-zinc-800/50"
                >
                  <td className="py-2 text-zinc-400">{i + 1}</td>
                  <td className="py-2 font-medium">{kata.name}</td>
                  <td className="py-2 font-mono text-zinc-500 dark:text-zinc-400">
                    {attempt?.timeMs != null ? formatTime(attempt.timeMs) : "--:--"}
                  </td>
                  <td className="py-2">
                    {attempt ? (
                      attempt.passed ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-green-600/20 text-green-400 font-medium">
                          Pass
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-red-600/20 text-red-400 font-medium">
                          Fail
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 font-medium">
                        Skipped
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {hasDiff && (
                      <button
                        onClick={() => toggleDiff(i)}
                        className="px-2 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
                      >
                        {isExpanded ? "Hide diff" : "Show diff"}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && hasDiff && (
                  <tr key={`${kata.id}-diff`}>
                    <td colSpan={5} className="py-2">
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

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleBackToLibrary}
          className="px-4 py-2 text-sm font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Back to Library
        </button>
        <button
          onClick={handlePracticeAgain}
          className="px-4 py-2 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
}
