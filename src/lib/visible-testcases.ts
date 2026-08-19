import type { Kata } from "../types/editor";

export interface VisibleTestInput {
  name: string;
  value: string;
}

export interface VisibleTestCase {
  label: string;
  testName: string;
  inputs: VisibleTestInput[];
  expected?: string;
  assertion?: string;
}

interface PythonFunctionInfo {
  name: string;
  params: string[];
}

interface TestBlock {
  name: string;
  body: string;
}

function cleanParam(param: string): string | null {
  const noDefault = param.split("=")[0]?.trim() ?? "";
  const noType = noDefault.split(":")[0]?.trim() ?? "";
  if (!noType || noType === "self" || noType.startsWith("*")) return null;
  return noType;
}

export function extractPythonFunctionInfo(code: string): PythonFunctionInfo | null {
  const match = /^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:->[^:]+)?:/m.exec(code);
  if (!match) return null;
  const params = match[2]
    .split(",")
    .map(cleanParam)
    .filter((param): param is string => Boolean(param));
  return { name: match[1], params };
}

function extractPythonTestBlocks(testCode: string): TestBlock[] {
  const matches = [...testCode.matchAll(/^def\s+(test_\w+)\s*\([^)]*\):/gm)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? testCode.length : testCode.length;
    return {
      name: match[1],
      body: testCode.slice(start, end),
    };
  });
}

function stripOuterCallExpression(expression: string, wrapper: string): string | null {
  const trimmed = expression.trim();
  const prefix = `${wrapper}(`;
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(")")) return null;
  return trimmed.slice(prefix.length, -1).trim();
}

function splitTopLevel(text: string, delimiter = ","): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === delimiter && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }

  const last = text.slice(start).trim();
  if (last) parts.push(last);
  return parts;
}

function findMatchingParen(text: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionCallArgs(expression: string, functionName: string): string[] | null {
  const callStart = expression.indexOf(`${functionName}(`);
  if (callStart === -1) return null;
  const openIndex = callStart + functionName.length;
  const closeIndex = findMatchingParen(expression, openIndex);
  if (closeIndex === -1) return null;
  return splitTopLevel(expression.slice(openIndex + 1, closeIndex));
}

function topLevelEqualsIndex(expression: string): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < expression.length - 1; i++) {
    const ch = expression[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "=" && expression[i + 1] === "=" && depth === 0) return i;
  }

  return -1;
}

function normalizeExpected(expression: string, assignments: Map<string, string>): string {
  let expected = expression.trim();
  const sorted = stripOuterCallExpression(expected, "sorted");
  if (sorted) expected = sorted;
  return assignments.get(expected) ?? expected;
}

function inputRows(args: string[], params: string[]): VisibleTestInput[] {
  return args.map((value, index) => ({
    name: params[index] ?? `arg${index + 1}`,
    value,
  }));
}

function caseLabel(index: number): string {
  return `Case ${index + 1}`;
}

function readableTestName(name: string): string {
  return name.replace(/^test_/, "").replaceAll("_", " ");
}

function parsePythonTestCase(block: TestBlock, fn: PythonFunctionInfo, index: number): VisibleTestCase | null {
  const assignments = new Map<string, string>();
  let resultArgs: string[] | null = null;
  let expected: string | undefined;
  let assertion: string | undefined;

  for (const rawLine of block.body.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const assignment = /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(line);
    if (assignment) {
      assignments.set(assignment[1], assignment[2].trim());
      const args = findFunctionCallArgs(assignment[2], fn.name);
      if (args) resultArgs = args;
      continue;
    }

    if (line.startsWith("assert_equal(")) {
      const inner = stripOuterCallExpression(line, "assert_equal");
      if (!inner) continue;
      const [actual, expectedExpr] = splitTopLevel(inner);
      const args = findFunctionCallArgs(actual ?? "", fn.name) ?? resultArgs;
      if (!args) continue;
      return {
        label: caseLabel(index),
        testName: readableTestName(block.name),
        inputs: inputRows(args, fn.params),
        expected: normalizeExpected(expectedExpr ?? "", assignments),
        assertion: line,
      };
    }

    if (line.startsWith("assert ")) {
      const expression = line.slice("assert ".length).trim();
      const equalsIndex = topLevelEqualsIndex(expression);
      if (equalsIndex === -1) {
        const args = findFunctionCallArgs(expression, fn.name) ?? resultArgs;
        if (!args) continue;
        return {
          label: caseLabel(index),
          testName: readableTestName(block.name),
          inputs: inputRows(args, fn.params),
          assertion: line,
        };
      }

      const left = expression.slice(0, equalsIndex).trim();
      const right = expression.slice(equalsIndex + 2).trim();
      const args = findFunctionCallArgs(left, fn.name) ?? resultArgs;
      if (!args) continue;

      const lenInner = stripOuterCallExpression(left, "len");
      expected = lenInner ? `length = ${normalizeExpected(right, assignments)}` : normalizeExpected(right, assignments);
      assertion = line;
      return {
        label: caseLabel(index),
        testName: readableTestName(block.name),
        inputs: inputRows(args, fn.params),
        expected,
        assertion,
      };
    }
  }

  return null;
}

export function visibleTestCasesFor(kata: Pick<Kata, "language" | "code" | "testCode">): VisibleTestCase[] {
  if (kata.language !== "python") return [];
  const fn = extractPythonFunctionInfo(kata.code);
  if (!fn) return [];

  return extractPythonTestBlocks(kata.testCode)
    .map((block, index) => parsePythonTestCase(block, fn, index))
    .filter((testCase): testCase is VisibleTestCase => Boolean(testCase))
    .slice(0, 6);
}
