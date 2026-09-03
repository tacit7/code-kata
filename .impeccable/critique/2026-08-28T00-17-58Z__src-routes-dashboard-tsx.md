---
target: dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-28T00-17-58Z
slug: src-routes-dashboard-tsx
---
Method: dual-agent (A: 01a045b8-643e-7f50-923b-fa8e9ed476c5 · B: 01a045b8-82f6-7013-bf4b-d2b3e3d0ea5a)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading state exists, but drill-down and dashboard refresh have weak feedback. |
| 2 | Match System / Real World | 3 | Practice language is relevant, but "pass streak + recency" and mastery percent are under-explained. |
| 3 | User Control and Freedom | 2 | Clickable rows and tab persistence exist, but table row actions lack clear affordance and keyboard path. |
| 4 | Consistency and Standards | 3 | Visual system is consistent with the app shell, but dashboard tabs duplicate global navigation conceptually. |
| 5 | Error Prevention | 2 | Dev clear action has no confirmation; dashboard load failures have no visible recovery path. |
| 6 | Recognition Rather Than Recall | 2 | Heatmap lacks legend; mastery scoring requires prior knowledge. |
| 7 | Flexibility and Efficiency | 2 | Few direct practice decisions from insights; limited filtering, sorting, or "practice this next" actions. |
| 8 | Aesthetic and Minimalist Design | 3 | Dense, quiet, scannable, but too uniformly card-based and low contrast in secondary labels. |
| 9 | Error Recovery | 1 | No user-facing database/load/error states in the dashboard surface. |
| 10 | Help and Documentation | 1 | No inline explanation for derived metrics or scoring model. |
| **Total** | | **22/40** | **Functional, but passive and under-directed.** |

## Design Specificity Verdict

The dashboard is product-aware but not yet strongly authored. The content is specific to Code Kata: LeetCode, NeetCode, Blind 75, mastery, streaks, kata history, best-time improvement, and module progress all belong to a deliberate practice tool. The composition, however, is still a familiar analytics stack: stat cards, GitHub-style heatmap, two charts, progress bars, and tables. It tells users what happened more clearly than it tells them what to practice next.

Deterministic scan: `detect.mjs --json src/routes/dashboard.tsx` returned exit code 0 with zero findings. No rule names or file locations were reported. The scan did not contradict the design assessment; the main issues are product strategy, hierarchy, affordance, and explanatory clarity rather than detector-caught visual anti-patterns.

Visual overlays: no reliable user-visible overlay is available. The evidence agent started and verified the live overlay server, but browser automation was unavailable in its tool surface, so it could not inject `detect.js` or capture `impeccable` console messages.

## Overall Impression

The dashboard is useful and coherent, but it behaves more like a report than a practice coach. Its biggest opportunity is to convert historical metrics into a confident "next best practice" decision.

## What's Working

- The metric set is product-relevant: `Problem Mastery`, `Recently Improved`, LeetCode/NeetCode/Blind 75 progress, and module progress are better than generic analytics filler.
- The visual density fits a desktop developer tool. Small labels, compact cards, restrained borders, and tabular numbers support repeated expert use.
- Persisted dashboard tabs respect returning users and make the dashboard feel like a workspace rather than a static landing page.

## Priority Issues

**[P1] The dashboard does not tell the user what to practice next**

Why it matters: A practice dashboard should turn history into a decision. Current insights are mostly passive metrics, so the user still has to infer the next move.

Fix: Add a top "Next practice focus" band using `reviewQueue`, recommended untried counts, weak modules, recent failures, or due work. Include direct actions like "Practice review queue," "Resume module," and "Open weakest kata."

Suggested command: `$impeccable shape dashboard`

**[P1] Derived metrics lack meaning and trust**

Why it matters: `Problem Mastery` shows a percent and "pass streak + recency," but users cannot tell how to improve the score or whether it reflects speed, correctness, freshness, or all three.

Fix: Add compact explanatory labels or hover/help affordances for mastery, strong/developing/review, and heatmap intensity.

Suggested command: `$impeccable clarify dashboard`

**[P2] Responsive structure is likely brittle**

Why it matters: `grid-cols-4` stat cards and the flex chart row do not define small-window fallbacks. Even in a desktop app, narrow windows happen.

Fix: Use responsive grids such as `grid-cols-2 xl:grid-cols-4`; stack charts below a breakpoint; ensure tables horizontally scroll with a visible affordance.

Suggested command: `$impeccable adapt dashboard`

**[P2] Clickable table rows are under-afforded and not keyboard-safe**

Why it matters: `RecentlyImprovedPanel` and session history rows perform navigation or drill-down on row click, but they are not semantic buttons or links and have no keyboard handling.

Fix: Use semantic buttons/links inside table cells or add row role, tabindex, keyboard handlers, and explicit chevron/open affordances.

Suggested command: `$impeccable harden dashboard`

**[P3] The page is visually consistent but too generic**

Why it matters: The product has a focused local kata trainer identity, but the dashboard could belong to many productivity apps.

Fix: Introduce kata-specific hierarchy: practice readiness, mastery state, weak pattern clusters, review timing, and code-practice language. Keep the quiet desktop style, but make the data model feel proprietary.

Suggested command: `$impeccable bolder dashboard`

## Persona Red Flags

**Alex, daily power user:** Needs fast practice selection. The dashboard provides history and progress, but no one-click "practice weakest area" or "review due" workflow. The top-bar `Start Practice` CTA exists, but it is disconnected from dashboard insights.

**Jordan, first-time learner:** Will not understand mastery, strong/developing/review, heatmap intensity, or "pass streak + recency" without explanation. Empty states say things like "No trend data yet" or "No sessions yet," but rarely offer the next step.

**Sam, interview-focused crammer:** Wants to know "Am I ready?" and "What should I drill before tomorrow?" LeetCode/NeetCode/Blind 75 progress is useful, but it does not expose weak categories, readiness thresholds, or high-impact unfinished problems.

## Minor Observations

- The dev toolbar appears at the top of Overview in development and can distort the real first impression.
- Heatmap cells use `title` only, which is weak for keyboard and touch access.
- Chart labels may truncate or compress categories because the Y axis width is fixed at `70`.
- The top-bar global nav plus centered dashboard tabs creates two competing navigation rows without a page title or dashboard-level intent statement.

## Questions to Consider

- What would this dashboard recommend if the user had only 20 minutes before an interview?
- Should "Overview" be a report, or should it be a launchpad into the next practice action?
- Which metric would the user be proud to improve tomorrow, and is that metric visually dominant today?
