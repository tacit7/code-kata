---
name: kata-student-helper
description: Use when helping a student with the current Code Kata desktop problem in this repo, debugging their current editor code, reading current Monaco editor context, inspecting current kata tests/results, or giving hints for the active kata without revealing the full solution.
---

# Kata Student Helper

Use the bundled/project-local `kata-agent` CLI before answering questions about
the active Code Kata problem. The CLI reads the app-exported Monaco context.

## Commands

From the source repo, run:

```bash
pnpm agent summary
pnpm agent prompt
pnpm agent code
pnpm agent selection
pnpm agent tests
pnpm agent results
pnpm agent context
pnpm agent path
```

From a packaged app, use the bundled CLI under the app resource directory:

```bash
node <app-resources>/agent/kata-agent.mjs summary
node <app-resources>/agent/kata-agent.mjs prompt
```

On macOS the app resources directory is:

```text
Code Kata Python.app/Contents/Resources
```

Default workflow:

1. Run `pnpm agent summary` to confirm the active problem.
2. Run `pnpm agent prompt` for tutoring context.
3. If debugging a failure, run `pnpm agent results`.
4. If the user selected code, run `pnpm agent selection` and focus there first.

If the CLI says no context exists, ask the user to open a problem page and run
`Export Agent Context` from the command palette.

If the user is working in the app and wants a prompt to paste into an agent,
tell them to run `Ask Agent` from the command palette. It exports fresh context
and copies a tutoring prompt to the clipboard.

## Tutoring Rules

- Do not reveal the full reference solution unless the user explicitly asks.
- Prefer hints, questions, and small targeted edits.
- Explain bugs using the visible testcase or latest failed result.
- If giving code, keep it limited to the relevant line/block when possible.
- Use the student's current code as the source of truth.

## Context Contract

The context includes:

- problem metadata and LeetCode link
- problem description
- visible testcases and raw tests
- student code
- selected code
- cursor/selection
- notes
- latest test results

Reference solution code is intentionally not exported.
