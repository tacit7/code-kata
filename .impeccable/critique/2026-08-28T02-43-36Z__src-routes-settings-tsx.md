---
target: config page
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-28T02-43-36Z
slug: src-routes-settings-tsx
---
Method: dual-agent (A: 01a0463e-03c3-75a0-9a78-ed9329384a0f · B: 01a0463e-04c2-7f42-8fcf-1ba19be9a64f)

**Design Health Score**
| # | Heuristic | Score | Key Issue |
|---|---:|---:|---|
| 1 | Visibility of System Status | 2 | Most settings update immediately, but there is no persistent saved state or user-facing failure state if saving fails. |
| 2 | Match System / Real World | 2 | The Language control exposes Java as a first-class option, while this Tauri product variant is documented as JavaScript + Python. |
| 3 | User Control and Freedom | 2 | Settings tabs are local component state, so Agent/Data/Shortcuts cannot be deep-linked, restored, or reached through browser history. |
| 4 | Consistency and Standards | 3 | Preference rows are consistent, but Data mixes library maintenance, destructive progress reset, and custom kata creation. |
| 5 | Error Prevention | 1 | Shortcut recording accepts collisions and accidental bindings without warning or inline recovery. |
| 6 | Recognition Rather Than Recall | 3 | Most rows are readable, but Agent settings assume users know the problem-page assistant flow. |
| 7 | Flexibility and Efficiency | 3 | Power settings exist, but there is no settings search or quick jump for users who know exactly what they need. |
| 8 | Aesthetic and Minimalist Design | 3 | The page is calm and compact, but all rows have nearly equal weight, so high-risk and high-impact choices do not stand out enough. |
| 9 | Error Recovery | 2 | Reset all progress has confirmation, but ordinary setting-save failures and shortcut mistakes lack recovery paths. |
| 10 | Help and Documentation | 2 | Hints exist, but several consequential settings do not explain scope, side effects, or next-step impact. |
| **Total** |  | **23/40** | Functional and compact, but not yet confidence-building. |

**Design Specificity Verdict**
The settings page is moderately specific to Code Kata, but it is still under-authored. The left rail, compact preference rows, editor controls, practice timing, assistant prompt, and shortcut editor fit a local coding-practice tool. The page does not yet turn those controls into a strong product experience: users do not get much confidence that their environment is saved, that practice settings affect session pressure, or that data actions preserve their learning record.

**LLM assessment**: The structure is useful, but category-level. The page could belong to many developer tools if the labels were swapped. The clearest missed opportunities are a live editor preview, stronger practice-flow copy, safer shortcut editing, and more explicit local-save feedback.

**Deterministic scan**: The detector returned `[]`, with `0` findings for `src/routes/settings.tsx`. There were no detector false positives and no mechanical design flags.

**Visual overlays**: Browser overlay was not available. Tool discovery did not expose mutable in-app browser control, and local Playwright was unavailable from the project, so no reliable user-visible overlay was injected. Fallback signal: an existing dev server responded at `http://127.0.0.1:1420/settings` with `HTTP/1.1 200 OK`.

**Overall Impression**
This is a good utilitarian settings page, not a great practice-configuration page yet. Its biggest opportunity is trust: users should leave knowing exactly what changed, what is saved locally, and how those settings affect the next kata.

**What's Working**
The left sidebar gives the page a durable desktop-app shape and keeps all major categories visible.

The reusable preference-row structure creates a compact, predictable rhythm that suits repeated expert use.

The destructive progress reset uses an explicit confirmation flow, which is the right baseline for protecting learning history.

**Priority Issues**
**[P1] Product-language mismatch**
Why it matters: Settings offers Java as a normal language option, but the repo guidance says this product variant supports JavaScript and Python. That creates mistrust before practice starts.
Fix: Remove Java from the current product variant, or make it disabled with honest availability copy only if Java support is actually planned and wired.
Suggested command: `$impeccable clarify`

**[P1] Silent setting persistence weakens confidence**
Why it matters: This app is local-first and stateful. If settings save instantly but failures are invisible, users cannot tell whether their practice environment is durable.
Fix: Add a lightweight global or per-section saved indicator, such as “Saved locally” with a timestamp. Surface save failures with a toast and restore or mark the unsaved value.
Suggested command: `$impeccable harden`

**[P2] Shortcut editing needs safety rails**
Why it matters: Keyboard shortcuts are a power-user feature, but the current recording flow can create conflicts or accidental single-key bindings without clear cancellation.
Fix: Show “Press Esc to cancel” while recording, detect duplicate combos, require replacement confirmation, and add a per-row reset action.
Suggested command: `$impeccable harden`

**[P2] Data is a weak category for risky actions**
Why it matters: “Data” hides several very different jobs: reload bundled content, create a custom kata, and reset progress. Users should not have to inspect each row to understand the stakes.
Fix: Rename the tab to `Library & Progress`, rename “New Kata” to `Create Custom Kata`, and visually separate maintenance from destructive progress actions.
Suggested command: `$impeccable distill`

**[P3] Editor preferences lack a preview**
Why it matters: Font, theme, line numbers, ligatures, tab size, and UI scale are experiential settings. Users currently have to leave Settings to validate them.
Fix: Add a compact editor preview strip in the Editor tab that reflects current font, size, theme, line-number, and tab-size choices.
Suggested command: `$impeccable polish`

**Persona Red Flags**
**Alex, power user**: The Shortcuts tab exposes editing, but conflict detection and per-row reset are missing. Alex can break a core workflow and discover it during a timed kata.

**Jordan, first-time interview prep user**: “Default Agent,” “System Prompt,” and “problem-page robot button” assume product fluency. Jordan may not know whether this affects hints, grading, or an external terminal.

**Sam, progress-sensitive learner**: The reset action is confirmed, but the Data tab does not strongly communicate that progress records are the learning artifact. Sam may not distinguish “Reload” from “Reset” quickly enough.

**Minor Observations**
The left-nav active state should expose `aria-current` or `aria-selected`, not just a visual active style.

Section titles use very faint text, which makes repeated scanning harder than it needs to be.

The Agent system-prompt reset has no confirmation even though it can discard a custom prompt.

The Language hint says “Default language for new practice work,” but changing it also reloads the kata universe elsewhere in the app.

**Questions to Consider**
- What should the Settings page promise: tune the editor, tune the practice session, or protect the learning record?
- Should Language be a global app mode instead of a quiet setting row?
- What setting would a user most likely change five minutes before a timed practice session?
