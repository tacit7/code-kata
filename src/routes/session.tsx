import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { useSessionStore } from "../stores/session-store";
import { useTimerStore } from "../stores/timer-store";
import { useTimerTick } from "../hooks/use-timer-tick";
import { useKataStore } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";
import { KataEditor } from "../components/kata-editor";
import { formatTime } from "../lib/format";

function currentKataElapsedMs() {
  const timerState = useTimerStore.getState();
  return timerState.kataStatus === "running" && timerState.kataStartTime
    ? timerState.kataElapsed + (Date.now() - timerState.kataStartTime)
    : timerState.kataElapsed;
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
    clearSession,
  } = useSessionStore();

  const allKatas = useKataStore((s) => s.katas);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const startKataTimer = useTimerStore((s) => s.startKataTimer);
  const stopSessionTimer = useTimerStore((s) => s.stopSessionTimer);
  const sessionTimeLimitMs = useSettingsStore((s) => s.sessionTimeLimitMs);
  const { kataElapsed, sessionElapsed } = useTimerTick();

  const [attemptRecorded, setAttemptRecorded] = useState(false);
  const [lastPassed, setLastPassed] = useState(false);
  const attemptLockedRef = useRef(false);
  const timeoutHandlingRef = useRef(false);

  useEffect(() => {
    if (!activeSession && sessionId) {
      loadSession(Number(sessionId), allKatas);
    }
  }, [activeSession, sessionId, allKatas, loadSession]);

  useEffect(() => {
    if (!activeSession || sessionKatas.length > 0 || allKatas.length === 0) return;
    clearSession();
    navigate("/practice", { replace: true });
  }, [activeSession, sessionKatas.length, allKatas.length, clearSession, navigate]);

  useEffect(() => {
    if (activeSession && sessionKatas.length > 0) {
      resetKataTimer();
      startKataTimer();
      setAttemptRecorded(false);
      setLastPassed(false);
      attemptLockedRef.current = false;
      timeoutHandlingRef.current = false;
    }
  }, [activeSession?.id, currentIndex, resetKataTimer, startKataTimer]);

  const currentKata = sessionKatas[currentIndex];
  const isLast = currentIndex === sessionKatas.length - 1;
  const hasAttemptForCurrent = attempts.some(
    (a) => a.kataIndex === currentIndex,
  );

  const handleTestComplete = useCallback(
    async (passed: boolean, codeSnapshot: string) => {
      if (!currentKata || attemptRecorded || attemptLockedRef.current) return;
      setLastPassed(passed);
      if (passed) {
        attemptLockedRef.current = true;
        setAttemptRecorded(true);
        try {
          await recordAttempt(currentKata.id, currentKataElapsedMs(), true, codeSnapshot);
        } catch (error) {
          attemptLockedRef.current = false;
          setAttemptRecorded(false);
          throw error;
        }
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
    finishSession(totalMs).then(() => {
      navigate(`/session/${sessionId}/results`);
    });
  }, [stopSessionTimer, finishSession, navigate, sessionId]);

  useEffect(() => {
    const liveKataElapsed = currentKataElapsedMs();

    if (
      !activeSession ||
      !currentKata ||
      sessionTimeLimitMs <= 0 ||
      liveKataElapsed < sessionTimeLimitMs ||
      attemptLockedRef.current ||
      timeoutHandlingRef.current
    ) {
      return;
    }

    timeoutHandlingRef.current = true;
    attemptLockedRef.current = true;

    async function failAndAdvanceTimedOutKata() {
      try {
        if (!hasAttemptForCurrent && !attemptRecorded) {
          setAttemptRecorded(true);
          setLastPassed(false);
          await recordAttempt(currentKata.id, liveKataElapsed, false, "");
        }

        if (isLast) {
          const totalMs = stopSessionTimer();
          await finishSession(totalMs);
          navigate(`/session/${sessionId}/results`);
        } else {
          nextKata();
        }
      } catch (error) {
        console.error("Failed to advance after practice time limit", error);
        attemptLockedRef.current = false;
        timeoutHandlingRef.current = false;
        setAttemptRecorded(false);
      }
    }

    void failAndAdvanceTimedOutKata();
  }, [
    activeSession,
    attemptRecorded,
    currentKata,
    finishSession,
    hasAttemptForCurrent,
    isLast,
    kataElapsed,
    navigate,
    nextKata,
    recordAttempt,
    sessionId,
    sessionTimeLimitMs,
    stopSessionTimer,
  ]);

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

  const progress = ((currentIndex + 1) / sessionKatas.length) * 100;
  const hasProblemTimeLimit = sessionTimeLimitMs > 0;
  const timeLimitRemainingMs = Math.max(0, sessionTimeLimitMs - kataElapsed);
  const timeLimitExceeded = hasProblemTimeLimit && kataElapsed >= sessionTimeLimitMs;

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

        {/* Problem time limit */}
        {hasProblemTimeLimit ? (
          <span
            className={`font-mono text-xs tabular-nums ${
              timeLimitExceeded
                ? "text-error"
                : timeLimitRemainingMs <= 60_000
                ? "text-warning"
                : "text-base-content/45"
            }`}
            title={`Problem elapsed: ${formatTime(kataElapsed)} | Session elapsed: ${formatTime(sessionElapsed)}`}
          >
            {timeLimitExceeded ? `+${formatTime(kataElapsed - sessionTimeLimitMs)}` : `${formatTime(timeLimitRemainingMs)} left`}
          </span>
        ) : (
          <span className="font-mono text-xs text-base-content/30 tabular-nums">
            {formatTime(sessionElapsed)}
          </span>
        )}

        {/* Navigation */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn btn-xs kata-btn-secondary disabled:opacity-20"
        >
          Prev
        </button>

        {(attemptRecorded || hasAttemptForCurrent) && (
          <button onClick={handleNext} className="btn btn-primary btn-xs">
            {isLast ? "Finish" : "Next"}
          </button>
        )}

        {!attemptRecorded && !hasAttemptForCurrent && (
          <button onClick={handleNext} className="btn btn-xs kata-btn-secondary">
            {isLast ? "Finish" : "Skip"}
          </button>
        )}

        <button
          onClick={handleQuit}
          className="btn btn-xs kata-btn-danger-secondary"
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
          onAdvance={handleNext}
        />
      </div>
    </div>
  );
}
