import type { TestResult } from "../types/editor";
import { failureMessageFor } from "../lib/test-result-message";

interface TestOutputProps {
  results: TestResult[];
  ranAt?: string;
  /** When provided, failed tests get a button that loads them into the REPL. */
  onSendToRepl?: (testName: string) => void;
}

function shouldShowErrorCard(result: TestResult): boolean {
  return (
    !result.passed &&
    result.errorKind !== "assertion" &&
    result.expected === undefined &&
    result.got === undefined &&
    result.error != null
  );
}

export function TestOutput({ results, ranAt, onSendToRepl }: TestOutputProps) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  return (
    <div className="flex flex-col h-full overflow-auto bg-base-200 text-sm font-mono">
      <div className="px-3 py-1.5 border-b border-base-300/60 text-base-content/45">
        <span className={passed === total ? "text-success" : "text-error"}>
          {passed}/{total} passed
        </span>
        {ranAt && (
          <span className="ml-2 text-base-content/30 text-xs">{ranAt}</span>
        )}
      </div>
      <ul className="px-3 py-1">
        {results.map((r) => {
          const failure = failureMessageFor(r);
          const showErrorCard = shouldShowErrorCard(r);

          return (
          <li key={r.name} className="py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className={r.passed ? "text-success" : "text-error"}>
                {r.passed ? "✓" : "✗"}
              </span>
              <span className="text-base-content/70">{r.name.replace(/^test_/, "").replaceAll("_", " ")}</span>
              {!r.passed && onSendToRepl && r.name.startsWith("test_") && (
                <button
                  onClick={() => onSendToRepl(r.name)}
                  title="Load this test's call into the REPL"
                  className="btn btn-ghost btn-xs h-5 min-h-0 px-1.5 text-[10px] text-base-content/35 hover:text-base-content/70"
                >
                  → repl
                </button>
              )}
            </div>

            {showErrorCard && failure && (
              <div className="ml-4 mt-1 rounded border border-error/15 bg-error/5 px-2 py-1.5">
                <div className="text-xs font-semibold text-error/85">{failure.title}</div>
                {(r.lineNumber != null || r.input) && (
                  <div className="mt-1 flex gap-2 text-xs text-base-content/65">
                    {r.lineNumber != null && (
                      <span className="shrink-0 text-base-content/40">Line {r.lineNumber}:</span>
                    )}
                    {r.input && (
                      <code className="whitespace-pre-wrap text-base-content/75">{r.input}</code>
                    )}
                  </div>
                )}
                {r.error && (
                  <pre className="mt-1 text-xs text-error/85 whitespace-pre-wrap leading-relaxed">{r.error}</pre>
                )}
              </div>
            )}

            {!r.passed && (r.expected !== undefined || r.got !== undefined) && (
              <div className="ml-4 mt-1 flex flex-col gap-0.5">
                {r.input && (
                  <div className="flex gap-2 items-baseline">
                    <span className="text-xs text-base-content/40 w-16 shrink-0">Input</span>
                    <pre className="text-xs text-base-content/70 whitespace-pre-wrap">{r.input}</pre>
                  </div>
                )}
                <div className="flex gap-2 items-baseline">
                  <span className="text-xs text-base-content/40 w-16 shrink-0">Solution</span>
                  <pre className="text-xs text-success/80 whitespace-pre-wrap">{r.expected}</pre>
                </div>
                <div className="flex gap-2 items-baseline">
                  <span className="text-xs text-base-content/40 w-16 shrink-0">Yours</span>
                  <pre className="text-xs text-error/80 whitespace-pre-wrap">{r.got}</pre>
                </div>
                {r.error && r.error !== `Expected ${r.expected}, got ${r.got}` && (
                  <pre className="mt-0.5 text-xs text-base-content/40 whitespace-pre-wrap">{r.error}</pre>
                )}
                {r.traceback && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[11px] text-base-content/35 hover:text-base-content/60">
                      Traceback
                    </summary>
                    <pre className="mt-1 max-h-40 overflow-auto text-xs text-base-content/35 whitespace-pre-wrap">{r.traceback}</pre>
                  </details>
                )}
              </div>
            )}

            {!r.passed && r.expected === undefined && r.error && !showErrorCard && (
              <div className="ml-4 mt-1 flex flex-col gap-0.5">
                {/* assert_true/assert_false failures carry no expected/got, but
                    still know the call they came from. */}
                {r.input && (
                  <div className="flex gap-2 items-baseline">
                    <span className="text-xs text-base-content/40 w-16 shrink-0">Input</span>
                    <pre className="text-xs text-base-content/70 whitespace-pre-wrap">{r.input}</pre>
                  </div>
                )}
                <pre className="mt-0.5 text-xs text-error/80 whitespace-pre-wrap leading-relaxed bg-error/5 rounded px-2 py-1">{r.error}</pre>
              </div>
            )}

            {!r.passed && r.expected === undefined && r.traceback && (
              <details className="ml-4 mt-1">
                <summary className="cursor-pointer text-[11px] text-base-content/35 hover:text-base-content/60">
                  Traceback
                </summary>
                <pre className="mt-1 max-h-40 overflow-auto text-xs text-base-content/35 whitespace-pre-wrap">{r.traceback}</pre>
              </details>
            )}

            {r.output && (
              <pre className="ml-4 mt-0.5 text-xs text-base-content/40 whitespace-pre-wrap">{r.output}</pre>
            )}
          </li>
          );
        })}
      </ul>
    </div>
  );
}
