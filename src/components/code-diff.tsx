/**
 * Simple unified diff viewer. Compares two strings line-by-line using a
 * longest-common-subsequence algorithm and renders removed / added / unchanged
 * lines with colour coding.
 */

interface CodeDiffProps {
  original: string;
  modified: string;
}

interface DiffLine {
  type: "unchanged" | "removed" | "added";
  text: string;
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split("\n");
  const b = modified.split("\n");
  const dp = lcs(a, b);

  const result: DiffLine[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: "unchanged", text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", text: b[j - 1] });
      j--;
    } else {
      result.push({ type: "removed", text: a[i - 1] });
      i--;
    }
  }

  return result.reverse();
}

const lineStyles: Record<DiffLine["type"], string> = {
  removed: "bg-red-900/30 text-red-400",
  added: "bg-green-900/30 text-green-400",
  unchanged: "text-zinc-500",
};

const prefixes: Record<DiffLine["type"], string> = {
  removed: "-",
  added: "+",
  unchanged: " ",
};

export function CodeDiff({ original, modified }: CodeDiffProps) {
  const lines = computeDiff(original, modified);

  return (
    <pre className="text-xs font-mono bg-zinc-900 rounded p-3 overflow-x-auto leading-5">
      {lines.map((line, idx) => (
        <div key={idx} className={lineStyles[line.type]}>
          <span className="select-none opacity-60 mr-2">
            {prefixes[line.type]}
          </span>
          {line.text}
        </div>
      ))}
    </pre>
  );
}
