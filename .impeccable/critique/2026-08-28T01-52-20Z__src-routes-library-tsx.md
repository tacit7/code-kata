---
target: /modules
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-28T01-52-20Z
slug: src-routes-library-tsx
---
Method: dual-agent (A: 01a0460e-4eff-7410-b604-dee1d5d8f6a2 · B: 01a0460e-6e41-7af2-bcd6-772ad02a328b)

**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Module completion is visible, but collapsed sections do not reveal the next useful action. |
| 2 | Match System / Real World | 3 | Curriculum language fits the product; “Daily” and “Complexity” still rely on learned app vocabulary. |
| 3 | User Control and Freedom | 3 | Search, sort, filters, clear states, keyboard navigation, and accordions give strong control. |
| 4 | Consistency and Standards | 3 | Consistent with `/problems`, but the reuse is so literal that Modules does not get its own roadmap behavior. |
| 5 | Error Prevention | 2 | Star and done buttons sit inside clickable rows, making accidental state changes plausible. |
| 6 | Recognition Rather Than Recall | 2 | Users must infer module sequence, next problem, and curriculum intent from labels and progress alone. |
| 7 | Flexibility and Efficiency | 3 | Dense tables and keyboard row navigation suit repeated desktop use. |
| 8 | Aesthetic and Minimalist Design | 2 | Competent but flat; table metadata competes with the roadmap job. |
| 9 | Error Recovery | 2 | Filter clearing exists, but accidental daily/done mutations have no obvious undo beyond toggling again. |
| 10 | Help and Documentation | 2 | Tooltips exist for some controls, but module logic and practice guidance remain under-explained. |
| **Total** | | **25/40** | **Functional, but not yet a decisive curriculum surface** |

**Design Specificity Verdict**

**LLM assessment**: `/modules` is moderately product-specific because it exposes kata curriculum sections, completion ratios, LeetCode metadata, best time, streak, and daily-practice controls. The weakness is authorship: it still reads as “Problems grouped into accordions,” not as a deliberate-practice roadmap. The product’s strongest idea on this route should be progression, but the page gives equal visual weight to freeform library mechanics.

**Deterministic scan**: The bundled detector returned `[]` for `src/routes/library.tsx` with exit code `0`. No rule names, file locations, or false positives were reported. This means the issues are not mechanical detector violations; they are hierarchy, workflow, and product-model issues.

**Visual overlays**: No reliable user-visible overlay is available. Assessment B confirmed `http://localhost:1420/modules` responded `HTTP 200`, started the Impeccable live server, verified `detect.js`, then stopped it. Browser mutation/injection was unavailable, so no overlay or `impeccable` console messages were collected.

**Overall Impression**

The surface is solid as a compact kata browser, but not yet sharp as a curriculum surface. The biggest opportunity is to make the module itself the unit of action: “where am I, what is next, and how do I continue?” Right now the answer is buried inside tables.

**What's Working**

- Module headers give useful completion status with `completed/total` and progress bars, so returning users can scan broad progress quickly.
- The row density is appropriate for developer-practitioners who want difficulty, implementation size, best time, streak, and LeetCode links without opening each problem.
- URL-backed expanded modules and keyboard row navigation are strong foundations for dashboard drill-ins and fast repeated use.

**Priority Issues**

**[P1] Roadmap Intent Is Visually Underpowered**
Why it matters: `/modules` should help users move through a curriculum, but the current page mostly repackages the Problems table under accordion headings. Users still have to decide what to practice by manual inspection.
Fix: Enrich module headers with “next unsolved,” weak/due count, difficulty mix, and a primary “Practice next” action. Keep the table as the expanded detail view.
Suggested command: `$impeccable layout /modules`

**[P1] Too Many Equal-Weight Decisions Compete With Problem Selection**
Why it matters: Search, sort, collection pills, filter modal, accordion expansion, row navigation, daily toggles, done toggles, and LeetCode links all compete before the user starts practice.
Fix: Make “continue this module” or “practice next” dominant. Demote advanced filters and bulk daily actions into secondary controls that do not sit at the same visual level as selection.
Suggested command: `$impeccable distill /modules`

**[P2] Module Sequence Is Not Explicit Enough**
Why it matters: DP and recursion submodules are ordered learning paths, but the interface only shows labels and completion. A user cannot see prerequisite flow or recommended sequence at a glance.
Fix: Add sequence numbers, “recommended next” markers, and a compact current-position treatment for nested modules.
Suggested command: `$impeccable clarify /modules`

**[P2] Row-Level State Controls Are Easy To Mutate Accidentally**
Why it matters: Star and done icon buttons are placed at the left edge of a clickable row. Fast row scanning or imprecise clicks can change daily/done state instead of opening the problem.
Fix: Move these into a right-side actions cluster, add stronger hover separation, or add undo-capable toast actions for state changes.
Suggested command: `$impeccable harden /modules`

**[P3] Filter Vocabulary Needs Product-Level Clarity**
Why it matters: “Daily,” “Complexity,” collection names, and implementation-size filters are efficient for known users but ambiguous for first-time users.
Fix: Add concise tooltips or modal helper copy for product-specific terms without adding visible instructional text to the main surface.
Suggested command: `$impeccable clarify /modules`

**Persona Red Flags**

**Returning Interview Prep User**: Wants the fastest path to useful practice. They can see progress, but they do not get a direct per-module recommendation, so they still inspect rows and compare metadata manually.

**First-Time Developer-Practitioner**: Encounters Modules, LeetCode, Blind 75, NeetCode, Daily, Complexity, Best, and Streak in one pass. The page is operable, but the intended curriculum model is not self-evident.

**Keyboard-Centric Power User**: Arrow/Enter row navigation is strong, but context-menu actions and icon-only state controls are less discoverable. The route supports speed better than it communicates available power.

**Minor Observations**

- `src/lib/module-accordion.ts` uses fixed progress columns (`24rem` top-level, `16rem` nested), which may become rigid on narrower windows.
- `/modules` hides category and tags compared with `/problems`; that keeps the table tighter, but removes pattern cues unless the module headings become more informative.
- The global sort menu includes options that are less meaningful in a curated roadmap context, especially category sorting.
- The hidden scrollbar treatment keeps the page clean but can reduce scroll affordance when long module lists are expanded.

**Questions to Consider**

- Should `/modules` be optimized for roadmap progression while `/problems` owns freeform search and sorting?
- What should a user know within five seconds: what they completed, what is weak, or what to practice next?
- Is “Daily” the right destination from a module, or should modules launch a focused session directly?
