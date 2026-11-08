---
name: code-kata-interview
description: Run coding interview practice with the Code Kata Python desktop app. Use when the user asks to look at their current Code Kata problem or editor, practice it as a mock interview, get a hint or feedback, or find an interview problem in the app's catalog.
---

# Code Kata Interview

## Get the current problem

Use the app's bundled helper from the current working directory. On macOS with
Code Kata Python installed in Applications, run:

```sh
node "/Applications/Code Kata Python.app/Contents/Resources/agent/kata-agent.mjs" context
```

For an app installed elsewhere, use the absolute path to its bundled
`agent/kata-agent.mjs`. If the user runs the app from source, use the absolute
path to that checkout's `tools/kata-agent.mjs`.

The helper returns the last editor export, including its `exportedAt` time,
problem statement, current code, selection, visible cases, and test results.
Refresh it before reviewing a new edit or test run. If the export is missing or
doesn't match the user's current problem, ask them to open the intended kata
and run **Export Agent Context** from Code Kata's command palette.

## Run the interview

If the user only wants to know which kata is open, summarize it. Match requests
for hints or feedback to the candidate's current progress.

- Start with the current kata. Ask the candidate to explain their approach, or
  pick up at the point they have reached if they already started.
- Ask one question at a time and wait for the answer. Follow their reasoning
  with questions about edge cases, correctness, or time and space complexity
  where they fit.
- If the candidate asks for help, start with one targeted hint. Use their
  selected code, a visible test case, or the latest failure when available.
  Give a full solution only if they explicitly ask for it.
- If they ask for a review or finish the interview, describe what worked, the
  most important gap, and one concrete way to improve. Distinguish observed test
  results from cases you reasoned through.
- Keep the conversation focused on the interview. Inspect context silently
  and keep hidden tests and reference solution code out of the conversation.

## Choose a practice problem

If the user wants a new kata, use the absolute path to this skill's
`scripts/search_problems.py`. It searches the local app database read-only and
prints problem metadata as JSON. It uses the standard macOS app data directory
by default. Pass `--db` if the database is elsewhere.

```sh
python3 "/absolute/path/to/code-kata-interview/scripts/search_problems.py" \
  "sliding window" --language python --difficulty medium --limit 3
```

Use the candidate's requested topic, difficulty, and language. Offer a short
list, then have them open their choice in Code Kata and continue from its editor
export.
