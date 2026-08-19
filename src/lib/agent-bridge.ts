import { invoke } from "@tauri-apps/api/core";
import type { Kata, TestResult } from "../types/editor";

export interface AgentEditorRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface AgentEditorPosition {
  lineNumber: number;
  column: number;
}

export interface AgentVisibleTestCase {
  name: string;
  inputs: Record<string, string>;
  expected?: string;
}

export interface AgentEditorContext {
  version: 1;
  app: "code-kata-python";
  source: "monaco";
  exportedAt: string;
  kata: {
    id: number;
    name: string;
    language: string;
    category: string;
    difficulty: string | null;
    tags: string[];
    isCustom: boolean;
    isSession: boolean;
    leetcodeNumber: number | null;
    leetcodeUrl: string | null;
  };
  editor: {
    code: string;
    selectedCode: string;
    selection: AgentEditorRange | null;
    cursor: AgentEditorPosition | null;
  };
  problem: {
    description: string | null;
    tests: string;
    visibleTestCases: AgentVisibleTestCase[];
    notes: string;
  };
  latestRun: {
    ranAt: string | null;
    results: TestResult[] | null;
  };
  solution: {
    hasReferenceSolution: boolean;
    activeVariantLabel: string | null;
  };
}

interface BuildAgentEditorContextArgs {
  kata: Kata;
  code: string;
  selectedCode: string;
  selection: AgentEditorRange | null;
  cursor: AgentEditorPosition | null;
  isSession: boolean;
  leetcodeNumber: number | null;
  leetcodeUrl: string | null;
  visibleTestCases: AgentVisibleTestCase[];
  notes: string;
  ranAt: string;
  results: TestResult[] | null;
  hasReferenceSolution: boolean;
  activeVariantLabel: string | null;
}

export function buildAgentEditorContext({
  kata,
  code,
  selectedCode,
  selection,
  cursor,
  isSession,
  leetcodeNumber,
  leetcodeUrl,
  visibleTestCases,
  notes,
  ranAt,
  results,
  hasReferenceSolution,
  activeVariantLabel,
}: BuildAgentEditorContextArgs): AgentEditorContext {
  return {
    version: 1,
    app: "code-kata-python",
    source: "monaco",
    exportedAt: new Date().toISOString(),
    kata: {
      id: kata.id,
      name: kata.name,
      language: kata.language,
      category: kata.category,
      difficulty: kata.difficulty,
      tags: kata.tags,
      isCustom: kata.isCustom,
      isSession,
      leetcodeNumber,
      leetcodeUrl,
    },
    editor: {
      code,
      selectedCode,
      selection,
      cursor,
    },
    problem: {
      description: kata.description,
      tests: kata.testCode,
      visibleTestCases,
      notes,
    },
    latestRun: {
      ranAt: ranAt || null,
      results,
    },
    solution: {
      hasReferenceSolution,
      activeVariantLabel,
    },
  };
}

export function agentPromptFor(context: AgentEditorContext): string {
  const failed = (context.latestRun.results ?? []).filter((result) => !result.passed);
  return `You are helping a student solve a Code Kata problem. Do not reveal the full reference solution unless the user explicitly asks. Prefer hints, diagnosis, and small targeted edits.

Problem: ${context.kata.name}
Language: ${context.kata.language}
Difficulty: ${context.kata.difficulty ?? "unknown"}
${context.kata.leetcodeUrl ? `LeetCode: ${context.kata.leetcodeUrl}\n` : ""}
Description:
${context.problem.description ?? "(none)"}

Visible Test Cases:
${JSON.stringify(context.problem.visibleTestCases, null, 2)}

Student Code:
\`\`\`${context.kata.language}
${context.editor.code}
\`\`\`

Selected Code:
\`\`\`${context.kata.language}
${context.editor.selectedCode || "(none)"}
\`\`\`

Latest Failed Results:
${failed.length ? JSON.stringify(failed, null, 2) : "(none)"}

Student Notes:
${context.problem.notes || "(none)"}
`;
}

export async function writeAgentContext(context: AgentEditorContext): Promise<string> {
  return invoke<string>("write_agent_context", {
    contextJson: JSON.stringify(context),
  });
}

export async function getAgentContextPath(): Promise<string> {
  return invoke<string>("agent_context_path");
}
