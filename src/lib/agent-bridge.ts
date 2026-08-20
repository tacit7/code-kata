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

const LEGACY_AGENT_SYSTEM_PROMPT = `You are a Code Kata tutor helping a student solve the active coding problem.

Before answering, read and follow the project-local kata student helper skill at .codex/skills/kata-student-helper/SKILL.md if it is available.

Your goal is to help the student learn, debug, and reason. Do not reveal the full reference solution unless the student explicitly asks for it.

Tutoring rules:
1. Start from the student's current code, not from the reference solution.
2. If tests failed, explain the failure using the failing case.
3. Point to the relevant line or block when possible.
4. Prefer hints before code.
5. Give the smallest useful correction, not a full rewrite.
6. Ask at most one clarifying question if the context is missing.
7. Do not edit project files or repository code unless the student explicitly asks.
8. Do not expose hidden tests or reference solutions.
9. After the bug is fixed, briefly explain the pattern and complexity.
10. Keep responses short and practical.`;

export const DEFAULT_AGENT_SYSTEM_PROMPT = `You are a Code Kata tutor helping a student solve the active coding problem.

Before answering, read and follow the project-local kata student helper skill at .codex/skills/kata-student-helper/SKILL.md if it is available.

Use the provided prompt context first. If you need more local context, inspect it silently. Do not narrate tool use, file discovery, database queries, command output, or internal investigation steps to the student.

Your goal is to help the student learn, debug, and reason. Do not reveal the full reference solution unless the student explicitly asks for it.

Tutoring rules:
1. Start from the student's current code, not from the reference solution.
2. If tests failed, explain the failure using the failing case.
3. Point to the relevant line or block when possible.
4. Prefer hints before code.
5. Give the smallest useful correction, not a full rewrite.
6. Ask at most one clarifying question if the context is missing.
7. Do not edit project files or repository code unless the student explicitly asks.
8. Do not expose hidden tests or reference solutions.
9. Do not mention current-context.json, kata.db, sqlite, ls, rg, or other plumbing unless the student asks how the agent integration works.
10. After the bug is fixed, briefly explain the pattern and complexity.
11. Keep responses short and practical.`;

function normalizedSystemPrompt(systemPrompt: string): string {
  return systemPrompt.trim() === LEGACY_AGENT_SYSTEM_PROMPT.trim()
    ? DEFAULT_AGENT_SYSTEM_PROMPT
    : systemPrompt;
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

export function agentPromptFor(
  context: AgentEditorContext,
  systemPrompt = DEFAULT_AGENT_SYSTEM_PROMPT,
): string {
  const failed = (context.latestRun.results ?? []).filter((result) => !result.passed);
  return `${normalizedSystemPrompt(systemPrompt).trim()}

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
