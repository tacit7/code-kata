// Extracts a runnable expression from a kata test so a failing test can be
// loaded into the REPL. Assertion arg order differs per language:
//   ruby   assert_equal(expected, actual)  -> actual is arg 1
//   python assert_equal(actual, expected)  -> actual is arg 0
//   js     assertEqual(actual, expected)   -> actual is arg 0
// assert_true / assertTrue / assert take the condition (arg 0) everywhere.

function testBodyBounds(testCode: string, testName: string, language: string): string | null {
  const decl = language === "javascript" ? `function ${testName}` : `def ${testName}`;
  const start = testCode.indexOf(decl);
  if (start === -1) return null;
  const nextDecl = language === "javascript" ? /function\s+test_\w+/g : /def\s+test_\w+/g;
  nextDecl.lastIndex = start + decl.length;
  const next = nextDecl.exec(testCode);
  return testCode.slice(start, next ? next.index : testCode.length);
}

function balancedArgs(src: string, openIdx: number): string[] | null {
  // src[openIdx] must be "(" — returns top-level comma-split args.
  let depth = 0;
  let inStr: string | null = null;
  const args: string[] = [];
  let cur = "";
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      cur += ch;
      if (ch === inStr && src[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      if (depth === 1 && ch === "(") continue; // skip the opening paren itself
      cur += ch;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0 && ch === ")") {
        args.push(cur.trim());
        return args;
      }
      cur += ch;
      continue;
    }
    if (ch === "," && depth === 1) {
      args.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  return null;
}

const ASSERTS: Array<{ re: RegExp; actualArg: (lang: string) => number }> = [
  { re: /assert_equal\s*\(/, actualArg: (lang) => (lang === "ruby" ? 1 : 0) },
  { re: /assertEqual\s*\(/, actualArg: () => 0 },
  { re: /assert_true\s*\(/, actualArg: () => 0 },
  { re: /assertTrue\s*\(/, actualArg: () => 0 },
  { re: /\bassert\s*\(/, actualArg: () => 0 },
];

export function extractTestCall(testCode: string, testName: string, language: string): string | null {
  const body = testBodyBounds(testCode, testName, language);
  if (!body) return null;
  for (const { re, actualArg } of ASSERTS) {
    const m = re.exec(body);
    if (!m) continue;
    const openIdx = m.index + m[0].length - 1;
    const args = balancedArgs(body, openIdx);
    if (!args) return null;
    const arg = args[actualArg(language)];
    return arg && arg.length > 0 ? arg : null;
  }
  return null;
}
