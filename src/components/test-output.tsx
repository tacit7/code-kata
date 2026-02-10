import type { TestResult } from "../types/editor";

interface TestOutputProps {
  results: TestResult[];
  ranAt?: string;
}

export function TestOutput({ results, ranAt }: TestOutputProps) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-50 dark:bg-zinc-900 text-sm font-mono">
      <div className="px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
        <span className={passed === total ? "text-green-500" : "text-red-400"}>
          {passed}/{total} passed
        </span>
        {ranAt && (
          <span className="ml-2 text-zinc-500 dark:text-zinc-500 text-xs">{ranAt}</span>
        )}
      </div>
      <ul className="px-3 py-1">
        {results.map((r) => (
          <li key={r.name} className="py-0.5">
            <span className={r.passed ? "text-green-500" : "text-red-400"}>
              {r.passed ? "\u2713" : "\u2717"}
            </span>{" "}
            <span className="text-zinc-300">{r.name.replace(/^test_/, "").replaceAll("_", " ")}</span>
            {r.error && (
              <span className="ml-2 text-red-400/80 text-xs">{r.error}</span>
            )}
            {r.output && (
              <pre className="ml-5 mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 whitespace-pre-wrap">{r.output}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
