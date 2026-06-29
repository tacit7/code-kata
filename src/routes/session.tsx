import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";
import { useTimerTick } from "../hooks/use-timer-tick";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { useKataStore } from "../stores/kata-store";
import { KataEditor } from "../components/kata-editor";
import { formatTime } from "../lib/format";

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

  useEffect(() => {
    if (!activeSession && sessionId) {
      loadSession(Number(sessionId), allKatas);
    }
  }, [activeSession, sessionId, allKatas, loadSession]);

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

  useKeyboardShortcuts({
    nextKata: handleNext,
    prevKata: handlePrev,
  });

  const handleQuit = useCallback(() => {
    const totalMs = stopSessionTimer();
    finishSession(totalMs).then(() => {
      navigate(`/session/${sessionId}/results`);
    });
  }, [stopSessionTimer, finishSession, navigate, sessionId]);

  if (!activeSession || !currentKata) {
    if (!sessionId) return <Navigate to="/problems" replace />;
    return (
      <div className="flex items-center justify-center h-full text-base-content/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm text-primary" />
          Loading session
        </div>
      </div>
    );
  }

  const hasAttemptForCurrent = attempts.some(
    (a) => a.kataIndex === currentIndex,
  );

  const progress = ((currentIndex + 1) / sessionKatas.length) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Session bar */}
      <div className="flex items-center gap-3 px-4 h-10 border-b border-base-300/60 bg-base-100 shrink-0 relative">
        {/* Progress track */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-base-300/30">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs font-semibold text-primary tabular-nums">
          {currentIndex + 1}/{sessionKatas.length}
        </span>
        <span className="text-sm font-medium truncate flex-1">
          {currentKata.name}
        </span>

        {/* Kata timer */}
        <span className="font-mono text-sm text-success tabular-nums">
          {formatTime(kataElapsed)}
        </span>

        {/* Session timer */}
        <span className="font-mono text-xs text-base-content/30 tabular-nums">
          {formatTime(sessionElapsed)}
        </span>

        {/* Navigation */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn btn-ghost btn-xs disabled:opacity-20"
        >
          Prev
        </button>

        {(attemptRecorded || hasAttemptForCurrent) && (
          <button onClick={handleNext} className="btn btn-primary btn-xs">
            {isLast ? "Finish" : "Next"}
          </button>
        )}

        {!attemptRecorded && !hasAttemptForCurrent && (
          <button onClick={handleNext} className="btn btn-ghost btn-xs">
            {isLast ? "Finish" : "Skip"}
          </button>
        )}

        <button
          onClick={handleQuit}
          className="btn btn-ghost btn-xs text-error/60 hover:text-error"
        >
          Quit
        </button>
      </div>

      {/* Pass indicator */}
      {lastPassed && attemptRecorded && (
        <div className="px-4 py-1.5 bg-success/10 text-success text-xs font-medium border-b border-success/15">
          All tests passed! {isLast ? "Click Finish to see results." : "Click Next to continue."}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <KataEditor
          key={`${activeSession.id}-${currentIndex}`}
          kata={currentKata}
          isSession={true}
          onTestComplete={handleTestComplete}
        />
      </div>
    </div>
  );
}
