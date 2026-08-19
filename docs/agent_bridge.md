# Agent Helper Bridge

The Python app exports the current Monaco problem context for local agents.
This is intentionally read-only in the first version: agents can inspect the
student's current problem, code, tests, notes, and latest test failures, but
cannot modify the editor.

## Context File

The app writes:

```text
~/Library/Application Support/com.code-kata.app/agent/current-context.json
```

Other platforms use the app data directory for `com.code-kata.app`.

The app updates the file when:

- A problem page loads.
- The student edits code.
- The cursor or selection changes.
- Notes, visible tests, or test results change.
- The student runs `Export Agent Context` from the command palette.

The problem page also exposes `Ask Agent` in the command palette. That command
exports fresh context and copies a tutoring prompt to the clipboard.

## CLI

From the repo:

```bash
pnpm agent summary
pnpm agent context
pnpm agent code
pnpm agent selection
pnpm agent tests
pnpm agent results
pnpm agent prompt
pnpm agent path
```

The CLI reads `KATA_AGENT_CONTEXT_PATH` if set; otherwise it resolves the
standard app data path for the current platform.

Packaged builds also include the helper assets under the app resource directory:

```text
agent/skills/kata-student-helper/SKILL.md
agent/kata-agent.mjs
agent/agent_bridge.md
```

On macOS, that is inside the `.app` bundle's `Contents/Resources` directory.
The bundled CLI still reads the same app data context file.

## Schema

Top-level shape:

```ts
{
  version: 1,
  app: "code-kata-python",
  source: "monaco",
  exportedAt: string,
  kata: {
    id: number,
    name: string,
    language: string,
    category: string,
    difficulty: string | null,
    tags: string[],
    isCustom: boolean,
    isSession: boolean,
    leetcodeNumber: number | null,
    leetcodeUrl: string | null
  },
  editor: {
    code: string,
    selectedCode: string,
    selection: {
      startLineNumber: number,
      startColumn: number,
      endLineNumber: number,
      endColumn: number
    } | null,
    cursor: { lineNumber: number, column: number } | null
  },
  problem: {
    description: string | null,
    tests: string,
    visibleTestCases: Array<{
      name: string,
      inputs: Record<string, string>,
      expected?: string
    }>,
    notes: string
  },
  latestRun: {
    ranAt: string | null,
    results: TestResult[] | null
  },
  solution: {
    hasReferenceSolution: boolean,
    activeVariantLabel: string | null
  }
}
```

Reference solution code is not exported. The bridge exposes only whether a
reference solution exists and which variant is active, so helper agents can
avoid accidentally spoiling the problem.

## Agent Guidance

Use the in-app `Ask Agent` command or `pnpm agent prompt` as the default context
for tutoring. The prompt includes the problem, student code, selected code,
visible cases, latest failed results, and notes.

When helping a student:

- Start with the failing behavior or selected code.
- Explain the issue in terms of the current test case.
- Prefer hints and small targeted fixes.
- Do not provide the full solution unless the student asks for it.
- Use latest test output before making assumptions.
