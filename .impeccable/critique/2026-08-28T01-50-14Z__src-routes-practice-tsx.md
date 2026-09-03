---
target: /practice
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-28T01-50-14Z
slug: src-routes-practice-tsx
---
Method: dual-agent (A: 01a0460c-cdc2-7a52-a775-b280141cfe03 · B: 01a0460c-e752-77a1-ba5b-eccb2d27eeb1)

**Design Health Score**
| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Counts, launch loading, statuses, and queue sections are visible, but stats/history loading has no interim state and empty queues do not explain the active blockers. |
| 2 | Match System / Real World | 3 | Practice terminology fits experienced users, but “SR Queue” and “Score = SR weight” expose internal scheduling language. |
| 3 | User Control and Freedom | 3 | Settings can be closed and launch is guarded, but users who over-filter get weak recovery paths. |
| 4 | Consistency and Standards | 3 | Compact app styling is coherent, but mode selection is duplicated in the sidebar and inside settings. |
| 5 | Error Prevention | 2 | Empty launch is disabled, but the UI allows impossible filter combinations without previewing consequences early enough. |
| 6 | Recognition Rather Than Recall | 2 | Mode descriptions help, but key controls live behind a gear and selected state is mostly visual-only. |
| 7 | Flexibility and Efficiency | 3 | Presets, filters, sizes, and editor toggles support expert workflows, but common changes require modal navigation. |
| 8 | Aesthetic and Minimalist Design | 2 | Dense and orderly, but too many small elements compete and the main launch decision is visually modest. |
| 9 | Error Recovery | 2 | Preset failures have feedback, but empty queue recovery is generic and not constraint-aware. |
| 10 | Help and Documentation | 2 | Some hints exist, but SR score, urgency, and status meanings are pushed to a footer legend. |
| **Total** | | **25/40** | **Acceptable: powerful, but the launch surface feels like configuration before practice.** |

**Design Specificity Verdict**

The surface is moderately specific to Code Kata because it uses spaced-review ranking, due states, kata levels, streaks, attempts, editor behavior, and saved practice presets. The data model is not generic.

The composition is less specific. A fixed left mode rail, right list, small header CTA, and large settings modal make it feel like a dense admin queue. For a product whose promise is deliberate practice, `/practice` should feel more like a confident “next drill” cockpit than a filter builder.

**Deterministic Scan**

The Impeccable CLI detector returned `[]` with exit status `0` for `src/routes/practice.tsx`. It found no mechanical layout/token violations.

Source evidence still shows issues the detector does not catch: selection buttons lack `aria-pressed`, the preset name input relies on placeholder text without a visible label, and the route has no responsive breakpoint classes while using a fixed `w-[300px]` sidebar.

**Visual Overlays**

No reliable user-visible overlay is available. Browser automation package lookup through the repo failed, and the bundled Playwright package then failed because the Chromium executable is not installed locally. The fallback signal is source inspection plus the clean CLI detector result.

**Overall Impression**

This is a smart practice engine wearing a generic settings-heavy shell. The biggest opportunity is to move from “configure a queue” to “start the right session now,” with configuration summarized and progressively disclosed.

**What's Working**

The queue has real practice intelligence: it separates due items from stable items, ranks by spaced-review urgency, and carries status, streak, level, and best-time signals.

The page is appropriately compact for a desktop coding tool. It avoids marketing treatment and respects repeated-use density.

Practice presets are a strong feature. They turn repeated drill setups into a reusable workflow, which matches the product’s goal of keeping practice faster than setup.

**Priority Issues**

**[P1] The primary launch decision is underpowered**
Why it matters: `/practice` should answer “what should I do next?” quickly. Today, `Start N` is a small header button competing with mode copy, queue metadata, and settings.
Fix: Add a stronger launch command area that includes `Start practice`, session size, time limit, active filters, and why this queue was selected. Let the list support confidence rather than carrying the whole decision.
Suggested command: `$impeccable layout`

**[P1] Configuration is too modal-heavy for a practice launcher**
Why it matters: Filters, limits, presets, and editor behavior are all hidden behind a gear, then split behind another side nav. That interrupts the practice moment.
Fix: Pull common session-shaping controls inline: mode, size, time limit, and a compact filter button/summary. Leave preset management and editor behavior in settings.
Suggested command: `$impeccable distill`

**[P1] The fixed two-column layout is likely brittle on smaller windows**
Why it matters: The route has no breakpoint classes and uses a fixed `w-[300px] shrink-0` left rail. A narrow desktop/Tauri window will squeeze the actual queue, which is the working surface.
Fix: Add responsive behavior: collapse the mode rail into top segmented controls or a drawer below a threshold, and keep the launch CTA visible.
Suggested command: `$impeccable adapt`

**[P2] Empty queue recovery is too weak**
Why it matters: “No katas match this filter” tells users they are stuck but not which constraint caused it or how to recover.
Fix: Show active blockers and one-click repairs: clear difficulty, clear modules, clear categories, switch to SR Queue, or show all katas. Explain why `Start` is disabled.
Suggested command: `$impeccable harden`

**[P2] SR score and status language leak implementation**
Why it matters: “Score = SR weight” asks users to understand the scheduling model rather than trust the app’s recommendation.
Fix: Rename score to “Urgency,” hide the raw score behind detail, or replace it with reason-first copy like “failed yesterday,” “idle 9 days,” “due soon.”
Suggested command: `$impeccable clarify`

**Persona Red Flags**

**Alex (Power User)**: Presets help, but changing session shape still requires opening settings, selecting a settings section, and adjusting controls. There is no visible keyboard path for launch, mode switching, or opening practice setup.

**Sam (Accessibility-Dependent User)**: Native buttons and dialog roles are good, but stateful mode/filter buttons rely mainly on visual styling instead of `aria-pressed`. The preset name field has no visible label or `aria-label`.

**Jordan (First-Timer)**: “SR Queue,” “SR weight,” “due this week,” and color-coded status dots assume spaced-repetition literacy. The interface explains modes, but it does not make the first practice choice feel obvious within five seconds.

**Minor Observations**

The settings modal title “Preferences” is generic; “Practice setup” or “Session setup” would fit the surface better.

The legend appears after the queue, but it explains symbols users need before scanning rows.

The flame emoji for streaks feels visually off-system next to the otherwise lucide/daisyUI language.

The queue rows expose rank, dot, title, meta, level, status badge, score, and streak in one line. It is efficient, but not calm.

**Questions to Consider**

- What if `/practice` opened with one opinionated recommendation: “Do these 5 now”?
- Should users ever see SR score, or should the interface translate it into plain practice reasons?
- Is “mode” the right top-level concept, or should the page organize around intent: review overdue, build weakness, race solved problems, drill a level?
- Which controls are used every session, and which belong behind setup?
