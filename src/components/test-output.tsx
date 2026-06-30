import type { TestResult } from "../types/editor";

interface TestOutputProps {
  results: TestResult[];
  ranAt?: string;
}

export function TestOutput({ results, ranAt }: TestOutputProps) {
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
        {results.map((r) => (
          <li key={r.name} className="py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className={r.passed ? "text-success" : "text-error"}>
                {r.passed ? "✓" : "✗"}
              </span>
              <span className="text-base-content/70">{r.name.replace(/^test_/, "").replaceAll("_", " ")}</span>
            </div>

            {!r.passed && (r.expected !== undefined || r.got !== undefined) && (
              <div className="ml-4 mt-1 flex flex-col gap-0.5">
                <div className="flex gap-2 items-baseline">
                  <span className="text-xs text-base-content/40 w-16 shrink-0">Expected</span>
                  <pre className="text-xs text-success/80 whitespace-pre-wrap">{r.expected}</pre>
                </div>
                <div className="flex gap-2 items-baseline">
                  <span className="text-xs text-base-content/40 w-16 shrink-0">Got</span>
                  <pre className="text-xs text-error/80 whitespace-pre-wrap">{r.got}</pre>
                </div>
                {r.error && r.error !== `Expected ${r.expected}, got ${r.got}` && (
                  <pre className="mt-0.5 text-xs text-base-content/40 whitespace-pre-wrap">{r.error}</pre>
                )}
              </div>
            )}

            {!r.passed && r.expected === undefined && r.error && (
              <pre className="ml-4 mt-0.5 text-xs text-error/80 whitespace-pre-wrap leading-relaxed bg-error/5 rounded px-2 py-1">{r.error}</pre>
            )}

            {r.output && (
              <pre className="ml-4 mt-0.5 text-xs text-base-content/40 whitespace-pre-wrap">{r.output}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
