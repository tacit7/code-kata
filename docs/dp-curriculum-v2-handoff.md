# DP Curriculum v2 — Handoff

**Status:** APPROVED, not started. Scope decided; implementation pending a future session.
**Date:** 2026-07-31
**Apps:** Python (`~/projects/kata-desktop`) + Ruby (`~/projects/ruby-kata`).
(C++ `~/projects/cpp-kata` has NO DP content — out of scope unless explicitly asked.)
**Target-apps caveat:** user confirmed scope but did NOT re-confirm which apps; last
DP round did Python+Ruby, so assume both. Confirm before starting if unsure.

## Decision

**Option 2: Taxonomy + metadata rework + fill early curriculum gaps.**
NOT the full 40-problem curriculum (advanced tail deferred — Matrix Chain, Strange
Printer, TSP, bitmask set, stock series, etc. wait for usage data / explicit ask).

## Why this is partly a REWORK of v1 (already shipped)

v1 (shipped 2026-07-31, commits: Python `d7895c0`+`ba06ba1`+`77737cc`; Ruby
`7bdfc8a86`+`c4d1bd5de`+`1fd079274`) delivered:
- `src/lib/dp-patterns.ts` (structured metadata module, like leetcode-numbers.ts)
- 32 DP patterns, 8 "families" via `DP_FAMILIES`
- Family View (group-by-family toggle in Problems) + Pattern Cards (editor)
- `dpFamilyFor` resolves family by NAME from DP_PATTERNS (works on existing DBs;
  do NOT revert to reading DB tags — seedMissingKatas never updates existing rows)
- 3-field cards: State / Transition / Dependencies

**v2 keeps all the infra** (module, family view, pattern cards, by-name resolution)
but CHANGES:
1. 8 families → **11 modules** (finer, correct decomposition)
2. Card fields: drop "Dependencies", add **Base cases** + **Evaluation order**
3. Fix v1 mis-classifications (see reclassification table)
4. Add ~8 foundational gap katas

## The 11 modules (+ Foundations as a separate prerequisite tier)

Foundations is a prerequisite/instructional tier, NOT a problem family — render it
at a different level, don't force Fibonacci into the same taxonomy level as bitmask.

```
Foundations
└── DP Foundations   (State/Transition/Base case/Evaluation order concept; the
                      brute-force → memoized → tabulated transformation)

Problem families
├── 1D Sequence DP
├── Grid DP
├── 0/1 Knapsack
├── Unbounded Knapsack
├── String DP
├── Subsequence DP
├── Interval DP
├── State-Machine DP
├── DFS with Memoization
└── Bitmask DP
```

## Schema change (Pass 1) — `DpPattern` in dp-patterns.ts

```ts
type EvaluationOrder =
  | "left-to-right" | "right-to-left" | "top-left-to-bottom-right"
  | "bottom-up" | "increasing-interval-length" | "top-down-memoized" | "custom";

type DpPattern = {
  primaryModule: DpModule;        // one module — the mental model we TEACH
  relatedPatterns?: DpModule[];   // secondary; NOT extra family memberships
  state: string;
  transition: string;             // keep free-form; do NOT over-structure (avoid
                                  //   accidentally inventing a recurrence DSL)
  baseCases: string[];            // ARRAY — many problems have multiple init conditions
  evaluationOrder: { kind: EvaluationOrder; explanation: string };
};
```
- Update `dpFamilyFor` → resolve `primaryModule` (keep by-NAME resolution).
- Family View sections = the 11 modules in curriculum order; Foundations rendered
  as its own tier above the families.
- Pattern Card renders: primary module badge, State, Transition, Base cases (list),
  Evaluation order (kind + explanation). Optionally show relatedPatterns subtly.
- Update `dp-patterns.test.ts` coverage checks for the new shape.

## Primary-module rule

One primary module per kata = the model/implementation we actually teach.
Overlaps go in `relatedPatterns`, NOT as additional family membership (else the
taxonomy becomes a tag cloud). Confirmed assignments to APPLY (these correct v1):

| Kata | primaryModule | relatedPatterns |
|------|---------------|-----------------|
| Longest Palindromic Subsequence | interval-dp | subsequence-dp |
| Combination Sum IV | unbounded-knapsack | dfs-memo |
| Can I Win (if added) | bitmask-dp | dfs-memo |
| Target Sum | 0-1-knapsack | dfs-memo |
| Word Break | dfs-memo | string-dp |
| Longest Increasing Path in a Matrix | dfs-memo | grid-dp |
| Best Time to Buy/Sell w/ Cooldown | state-machine-dp | — |
| Burst Balloons | interval-dp | — |
| Coin Change II | unbounded-knapsack | — |
| Coin Change | unbounded-knapsack | — |
| Palindromic Substring / Substrings | (NOT DP) expand-around-center | — |

v1 mis-tags to fix: Cooldown was `dp-multistate`→state-machine; Burst Balloons
`dp-string`→interval; Coin Change II `dp-counting`→unbounded-knapsack; Longest
Increasing Path `dp-subsequence`→dfs-memo.

## Early gap katas to ADD (Pass 3) — the only new content

1. Unique Paths II (grid)
2. Minimum Path Sum — ALREADY EXISTS (added in v1's dp-foundations); just remap
3. Triangle (grid, bottom-up)
4. Longest Palindromic Subsequence — ALREADY EXISTS; remap to interval-dp
5. A plain **0/1 Knapsack** teaching kata (non-LeetCode, custom — like tree-fundamentals)
6. A plain **Unbounded Knapsack** teaching kata (non-LeetCode, custom)
7. (Fibonacci, N-th Tribonacci, Delete and Earn already exist from v1 — remap only)
Net NEW authoring: Unique Paths II, Triangle, 0/1 Knapsack intro, Unbounded
Knapsack intro (~4 real new katas; the rest are remaps). Confirm the exact list
with user at start — they listed 8 but several already exist.

Knapsack intros: respect the CRITICAL iteration rules the curriculum calls out —
0/1 iterates capacity BACKWARD (prevents item reuse); unbounded iterates FORWARD
(allows reuse). Bake into the reference solutions + note in descriptions.

## Implementation sequence (from the reviewer, sound)

- **Pass 1** — schema + taxonomy: update DpPattern, DP_MODULES (ordered), the
  card UI, family-view sections, the test. Build both apps green.
- **Pass 2** — REMAP all 32 existing patterns to the new shape (primaryModule +
  4 fields) BEFORE adding content. This exposes whether the taxonomy holds against
  real content. Flag: dup problems, taught-solution vs assigned-module mismatches,
  anything that should leave DP, missing prereq edges.
- **Pass 3** — add the ~4 new gap katas (+ LeetCode numbers for the real ones;
  knapsack intros are non-LeetCode). Seed via dp-foundations.ts (already wired
  first in ALL_SEED_KATAS / seed-katas.ts).
- **Pass 4** — validate each module: first problem is genuinely introductory; each
  adds ONE new idea; order = increasing complexity; cards match the actual solution.

## Execution notes / traps (from this project)

- Build with parallel Sonnet subagents, ONE per app, against a shared written spec
  (keeps Python/Ruby identical). Independently re-verify every agent claim.
- `dp-patterns.ts` is language-agnostic recurrence text → nearly identical across
  apps; only kata-name keys differ (both apps happen to have both Climbing Stairs
  variants, so keys matched last time).
- Ruby verify: `pnpm verify-katas` (runs all ruby solutions through ruby.wasm).
  Python: run solutions via `python3` + `pnpm vitest run`. Both: `pnpm build`.
- seedMissingKatas INSERTS but never UPDATES existing rows → tag/category changes
  to existing katas DON'T reach existing DBs. That's WHY metadata is resolved by
  name from dp-patterns.ts, not from DB columns. Keep it that way.
- After content changes, katas reach INSTALLED apps only after rebuild+install:
  Python `pnpm tauri build`; Ruby `pnpm package` (Electron — verify it stays
  Electron, never overwrite with a Tauri build). Verify seeding at ~15s launch;
  production builds don't dup (StrictMode-only bug, already fixed via getDb promise
  memoization — don't revert).
- Minor v1 leftover to fix opportunistically: Ruby's Cooldown pattern card says
  "rest"; Python says "cooldown". Ruby's own solution uses `cooldown` — align Ruby.

## Current shipped state (baseline to build ON)

Both apps installed to /Applications with v1 DP work live: 32 DP patterns, family
view + pattern cards, 7 foundational katas seeded (Python 255 / Ruby 292 total
katas, 0 dupes). Family bucketing verified against the real installed DB.
