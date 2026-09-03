---
target: editor page
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-28T02-19-54Z
slug: src-components-kata-editor-tsx
---
Method: dual-agent (A: 01a04628-169c-7902-ba8c-f13f655f38c0 · B: 01a04628-39d5-7792-a3c5-b42b6594636e)

**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Save state is a tiny dot/circle, running state becomes `...`, and attempt counters are unlabeled under pressure. |
| 2 | Match System / Real World | 3 | IDE conventions mostly work, but `Testcase`, `Send`, and dot save states are product-internal shorthand. |
| 3 | User Control and Freedom | 3 | Pane toggles, resizing, maximizing, shortcuts, and route navigation are strong. |
| 4 | Consistency and Standards | 3 | Compact controls are consistent, but top tabs, bottom tabs, icon buttons, and text buttons mix semantics. |
| 5 | Error Prevention | 2 | Reset is protected, but copying a solution into the editor is too casual for a high-consequence learning action. |
| 6 | Recognition Rather Than Recall | 2 | Many icon-only controls and terse labels require hover memory instead of immediate recognition. |
| 7 | Flexibility and Efficiency | 4 | Command palette integration, shortcuts, REPL, agent support, persisted layout, and resizable panes are excellent for repeat users. |
| 8 | Aesthetic and Minimalist Design | 2 | Dense and functional, but hierarchy is flat across title, tabs, toolbar, status, and utility controls. |
| 9 | Error Recovery | 3 | Test output supports recovery with expected/yours, traceback, and REPL handoff. |
| 10 | Help and Documentation | 2 | Tooltips and agent prompt help, but the basic practice loop is not visible enough for first-time users. |
| **Total** | | **26/40** | **Powerful editor, under-prioritized workflow hierarchy** |

**Design Specificity Verdict**

**LLM assessment**: The editor is clearly product-specific at the capability level: Monaco-first coding, problem/solution/notes/viz tabs, in-app tests, REPL, agent terminal, LeetCode link, saved-code state, and session attempt limits all belong to Code Kata Python. The visual composition is less authored. It reads as a capable dark IDE assembled from compact controls rather than a deliberate timed-practice environment with an obvious read-code-run-debug rhythm.

**Deterministic scan**: The bundled detector returned `[]` for `src/components/kata-editor.tsx` with exit code `0`. No rule names, file locations, or false positives were reported. The problems are not mechanical detector violations; they are prioritization, labeling, and workflow hierarchy issues.

**Visual overlays**: No reliable user-visible overlay is available. Assessment B confirmed the local app responds over HTTP and selected `http://localhost:1420/editor/1` as a representative URL, but no mutable browser automation surface or Playwright fallback was available, so `detect.js` could not be injected and no `impeccable` console messages were collected.

**Overall Impression**

The editor is a strong operating surface with real depth, but it asks the user to understand too many peer controls at once. Its biggest opportunity is to present a visible practice loop: read the problem, write code, run tests, debug, compare or advance. The current UI supports that loop, but does not visually sequence it.

**What's Working**

- The pane model is genuinely useful: problem, solution, notes, visualization, editor, test cases, results, REPL, and agent support can coexist without leaving the route.
- Test failure recovery is practical. Expected/yours output, traceback, and REPL handoff support fast debugging.
- Layout persistence, resizing, shortcuts, and command palette integration respect repeat desktop practice.

**Priority Issues**

**[P1] Primary Workflow Hierarchy Is Too Flat**
Why it matters: `Run tests` is the main action, but it sits in a dense cluster with reset, settings, REPL, agent, send, output-pane toggle, saved state, and attempt count. The basic loop is present but not visually staged.
Fix: Group the toolbar into state, editor utilities, assist/debug, and primary run zones. Give Run a stronger fixed-width label and demote low-frequency actions into a compact menu.
Suggested command: `$impeccable layout editor page`

**[P1] System Status Is Under-Communicated**
Why it matters: A tiny dot/circle is not enough for saved/dirty state in a local trainer where losing practice work is emotionally expensive. During test runs, `...` is too terse.
Fix: Replace the dot with explicit `Saved`, `Saving`, or `Unsaved` status near the title or toolbar. Show a spinner plus `Running` or `Running tests` in the run button.
Suggested command: `$impeccable clarify editor page`

**[P2] Problem Reading Lacks Structure**
Why it matters: Long descriptions are rendered as text, so examples, constraints, prompt, and pattern hints do not scan cleanly during practice.
Fix: Structure known sections into compact blocks such as Prompt, Examples, Constraints, and Pattern. Keep the DP pattern card, but make deeper guidance collapsible after first read.
Suggested command: `$impeccable distill editor page`

**[P2] Bottom Panel Mixes Phases**
Why it matters: REPL, Testcase, Test Result, and Agent are presented as peers, but users experience them as different phases: inspect, execute, debug, assist.
Fix: Group Test Case and Results under Tests, and REPL and Agent under Debug/Assist, or add subtle separators and clearer naming.
Suggested command: `$impeccable shape editor page`

**[P2] Solution Copy Is Too Casual**
Why it matters: `copy` can overwrite the user's editor content from the solution panel, which is a high-consequence learning action.
Fix: Rename it to `Replace editor`, require confirmation when the editor is dirty, or offer safer actions such as `Open diff` first.
Suggested command: `$impeccable harden editor page`

**Persona Red Flags**

**Alex, Power User**: Shortcuts, panes, and command palette support are strong, but toolbar density slows visual targeting. The save dot and icon-only controls require learned meaning.

**Jordan, First-Time Kata User**: They may not know whether to start with Problem, Testcase, Run, REPL, or Agent. The editor exposes expert affordances before it clearly teaches the basic practice loop.

**Sam, Interview Prep Under Time Pressure**: Test failures are useful, but an unlabeled `0/3` attempt counter can read as unexplained pressure during a timed session.

**Minor Observations**

- `Testcase` should be `Test Case`.
- Lowercase labels such as `run`, `copy`, and `show agent` feel inconsistent with top-level tabs.
- The title bar is compact, but it misses difficulty/category/time context that would help practice orientation.
- Native `title` tooltips help mouse users, but they are not enough for first-time discoverability.

**Questions to Consider**

- What would change if the editor were designed around a visible practice loop instead of a generic IDE toolbar?
- Should the problem panel teach less by default and reveal depth progressively?
- Is the agent a core tutor or a power-user escape hatch? The current placement suggests both.
