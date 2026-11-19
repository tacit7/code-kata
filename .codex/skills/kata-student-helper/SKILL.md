---
name: kata-student-helper
description: Use when helping a student with the current Code Kata desktop problem in this repo, debugging their current editor code, reading current Monaco editor context, inspecting current kata tests/results, or giving hints for the active kata without revealing the full solution.
---

# Kata Student Helper

Start with the problem context supplied by Code Kata. Use `kata-agent` when you
need a fresh view of the student's editor, selected code, or latest test results.

## Commands

If Code Kata gave you the path to this `SKILL.md`, the bundled CLI is
`../../kata-agent.mjs` relative to the directory containing it. Use the CLI's
absolute path with `node` and quote the path so it works with spaces. The
terminal's working directory can differ from the app resource directory.

```bash
node "<absolute-path-to-kata-agent.mjs>" summary
node "<absolute-path-to-kata-agent.mjs>" results
```

If you loaded this skill from the source checkout's `.codex/skills` directory,
run `pnpm agent <command>` from the repository root.

Use `summary` to confirm the active problem, `prompt` for full tutoring context,
`results` for the latest test run, and `selection` for the highlighted code.
Other commands include `code`, `tests`, `context`, and `path`.

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
- Do not mention `current-context.json`, `kata.db`, `sqlite3`, `ls`, `rg`, or
  other integration plumbing unless the user asks how the agent integration
  works.
- Keep visible responses student-facing: state the diagnosis, hint, or next
  step directly instead of describing your investigation process.

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
