import type { VisibleTestCase } from "../lib/visible-testcases";

interface TestcasePanelProps {
  cases: VisibleTestCase[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function TestcasePanel({ cases, activeIndex, onActiveIndexChange }: TestcasePanelProps) {
  if (cases.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-base-200 px-6 text-center text-sm text-base-content/35">
        No visible testcases are available for this problem yet.
      </div>
    );
  }

  const activeCase = cases[Math.min(activeIndex, cases.length - 1)] ?? cases[0];

  return (
    <div className="flex h-full flex-col overflow-auto bg-base-200 text-sm">
      <div className="shrink-0 border-b border-base-300/60 px-3 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {cases.map((testCase, index) => (
            <button
              key={`${testCase.label}-${testCase.testName}`}
              onClick={() => onActiveIndexChange(index)}
              className={`btn btn-xs min-h-0 h-7 rounded-md border-0 px-3 ${
                activeIndex === index
                  ? "bg-base-content/10 text-base-content"
                  : "bg-transparent text-base-content/45 hover:bg-base-content/5 hover:text-base-content/70"
              }`}
              title={testCase.testName}
            >
              {testCase.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {activeCase.inputs.map((input) => (
          <div key={input.name} className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-base-content/45">{input.name} =</div>
            <pre className="min-h-11 whitespace-pre-wrap rounded-md bg-base-100 px-3 py-2 font-mono text-sm leading-relaxed text-base-content/85">
              {input.value}
            </pre>
          </div>
        ))}

        {activeCase.expected && (
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-base-content/45">expected =</div>
            <pre className="min-h-11 whitespace-pre-wrap rounded-md bg-base-100 px-3 py-2 font-mono text-sm leading-relaxed text-success/85">
              {activeCase.expected}
            </pre>
          </div>
        )}

        {activeCase.assertion && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-base-content/35 transition-colors hover:text-base-content/60">
              Assertion
            </summary>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-base-100 px-3 py-2 font-mono text-xs leading-relaxed text-base-content/55">
              {activeCase.assertion}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
