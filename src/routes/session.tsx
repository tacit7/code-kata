import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";
import { useTimerTick } from "../hooks/use-timer-tick";
import { useKataStore } from "../stores/kata-store";
import { KataEditor } from "../components/kata-editor";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    activeSession,
    sessionKatas,
    currentIndex,
    attempts,
    nextKata,
    prevKata,
    recordAttempt,
    finishSession,
    loadSession,
  } = useSessionStore();

  const allKatas = useKataStore((s) => s.katas);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const startKataTimer = useTimerStore((s) => s.startKataTimer);
  const stopSessionTimer = useTimerStore((s) => s.stopSessionTimer);
  const { kataElapsed, sessionElapsed } = useTimerTick();

  const [attemptRecorded, setAttemptRecorded] = useState(false);
  const [lastPassed, setLastPassed] = useState(false);

  // Load session if navigating directly
  useEffect(() => {
    if (!activeSession && sessionId) {
      loadSession(Number(sessionId), allKatas);
    }
  }, [activeSession, sessionId, allKatas, loadSession]);

  // Start kata timer when kata changes (including first load)
  useEffect(() => {
    if (activeSession && sessionKatas.length > 0) {
      resetKataTimer();
      startKataTimer();
      setAttemptRecorded(false);
      setLastPassed(false);
    }
  }, [activeSession?.id, currentIndex, resetKataTimer, startKataTimer]);

  const currentKata = sessionKatas[currentIndex];
  const isLast = currentIndex === sessionKatas.length - 1;

  const handleTestComplete = useCallback(
    async (passed: boolean, codeSnapshot: string) => {
      if (!currentKata || attemptRecorded) return;
      setLastPassed(passed);
      if (passed) {
        const timerState = useTimerStore.getState();
        const elapsed =
          timerState.kataStatus === "running" && timerState.kataStartTime
            ? timerState.kataElapsed + (Date.now() - timerState.kataStartTime)
            : timerState.kataElapsed;
        await recordAttempt(currentKata.id, elapsed, true, codeSnapshot);
        setAttemptRecorded(true);
      }
    },
    [currentKata, attemptRecorded, recordAttempt],
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      const totalMs = stopSessionTimer();
      finishSession(totalMs).then(() => {
        navigate(`/session/${sessionId}/results`);
      });
    } else {
      nextKata();
    }
  }, [isLast, stopSessionTimer, finishSession, navigate, sessionId, nextKata]);

  const handlePrev = useCallback(() => {
    prevKata();
  }, [prevKata]);

  const handleQuit = useCallback(() => {
    const totalMs = stopSessionTimer();
    // Record unattempted current kata if not recorded
    finishSession(totalMs).then(() => {
      navigate(`/session/${sessionId}/results`);
    });
  }, [stopSessionTimer, finishSession, navigate, sessionId]);

  if (!activeSession || !currentKata) {
    if (!sessionId) return <Navigate to="/session/setup" replace />;
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading session...
      </div>
    );
  }

  // Check if current kata already has an attempt in this session
  const hasAttemptForCurrent = attempts.some(
    (a) => a.kataIndex === currentIndex,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Session top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {currentIndex + 1}/{sessionKatas.length}
        </span>
        <span className="text-sm font-semibold truncate flex-1">
          {currentKata.name}
        </span>

        {/* Kata timer */}
        <span className="font-mono text-sm text-green-400">
          {formatTime(kataElapsed)}
        </span>

        {/* Session timer */}
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {formatTime(sessionElapsed)}
        </span>

        {/* Navigation */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-2 py-1 text-xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Prev
        </button>

        {(attemptRecorded || hasAttemptForCurrent) && (
          <button
            onClick={handleNext}
            className="px-3 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        )}

        {!attemptRecorded && !hasAttemptForCurrent && (
          <button
            onClick={handleNext}
            className="px-3 py-1 text-xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            {isLast ? "Finish" : "Skip"}
          </button>
        )}

        <button
          onClick={handleQuit}
          className="px-2 py-1 text-xs font-medium rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Quit
        </button>
      </div>

      {/* Pass indicator */}
      {lastPassed && attemptRecorded && (
        <div className="px-4 py-1.5 bg-green-600/10 text-green-400 text-xs font-medium border-b border-green-600/20">
          All tests passed! {isLast ? "Click Finish to see results." : "Click Next to continue."}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <KataEditor
          key={`${activeSession.id}-${currentIndex}`}
          kata={currentKata}
          onTestComplete={handleTestComplete}
        />
      </div>
    </div>
  );
}
