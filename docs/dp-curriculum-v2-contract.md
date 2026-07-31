# DP Curriculum v2 — Shared Implementation Contract

This contract is the common source of truth for the Python `kata-desktop` and
Ruby `ruby-kata` implementations. It refines the approved handoff in
`docs/dp-curriculum-v2-handoff.md`; when the two documents differ in naming or
interface detail, use this contract.

## Scope

- Implement the taxonomy/metadata rework and the four early-gap katas only.
- Preserve the existing metadata-at-render-time infrastructure.
- Do not add the deferred advanced curriculum.
- Do not use DB tags as the source of truth for existing kata membership.
- Do not change app frameworks: Python remains Tauri; Ruby remains Electron.

## Curriculum taxonomy

There are eleven curriculum modules: one prerequisite module plus ten
problem-family modules. `Foundations` is part of the module type so every
pattern has one `primaryModule`, but the Problems UI must render it as a
separate prerequisite tier above the numbered problem-family modules.

Use these exact stable IDs and this exact order:

| Order | ID | Label | UI tier |
|---:|---|---|---|
| 0 | `dp-foundations` | DP Foundations | prerequisite |
| 1 | `1d-sequence-dp` | 1D Sequence DP | problem family |
| 2 | `grid-dp` | Grid DP | problem family |
| 3 | `0-1-knapsack` | 0/1 Knapsack | problem family |
| 4 | `unbounded-knapsack` | Unbounded Knapsack | problem family |
| 5 | `string-dp` | String DP | problem family |
| 6 | `subsequence-dp` | Subsequence DP | problem family |
| 7 | `interval-dp` | Interval DP | problem family |
| 8 | `state-machine-dp` | State-Machine DP | problem family |
| 9 | `dfs-memo` | DFS with Memoization | problem family |
| 10 | `bitmask-dp` | Bitmask DP | problem family |

`expand-around-center` is a special non-DP classification retained for the two
palindrome-substring katas. It is not one of the eleven curriculum modules and
must render after curriculum modules under a `Not DP · expand-around-center`
heading when it is present.

The Bitmask DP module may be empty in v2. Do not add `Can I Win` or another
advanced kata merely to populate it; the advanced tail is explicitly deferred.

## TypeScript interface

Both apps must export compatible shapes:

```ts
export type EvaluationOrder =
  | "left-to-right"
  | "right-to-left"
  | "top-left-to-bottom-right"
  | "bottom-up"
  | "increasing-interval-length"
  | "top-down-memoized"
  | "custom";

export type DpModule =
  | "dp-foundations"
  | "1d-sequence-dp"
  | "grid-dp"
  | "0-1-knapsack"
  | "unbounded-knapsack"
  | "string-dp"
  | "subsequence-dp"
  | "interval-dp"
  | "state-machine-dp"
  | "dfs-memo"
  | "bitmask-dp";

export type PatternModule = DpModule | "expand-around-center";

export interface DpPattern {
  primaryModule: PatternModule;
  relatedPatterns?: DpModule[];
  state: string;
  transition: string;
  baseCases: string[];
  evaluationOrder: {
    kind: EvaluationOrder;
    explanation: string;
  };
}
```

Export an ordered `DP_MODULES` collection for the eleven curriculum modules.
It may include a `tier` field or the UI may distinguish
`id === "dp-foundations"`, but the rendered result must match the contract.
Export the non-DP label separately or handle the special ID explicitly.

Keep `dpFamilyFor` as a compatibility export unless all call sites and tests are
renamed together. Its behavior changes to return `primaryModule` by kata name
first, then fall back to a recognized new module tag. It must never prefer
stale DB tags over `DP_PATTERNS[kata.name]`.

## Existing-kata primary assignments

Use the implementation that the kata actually teaches as the primary module.
Apply these assignments in both apps:

| Kata | Primary | Related |
|---|---|---|
| Fibonacci Number | `dp-foundations` | — |
| Climbing Stairs (Recursive) | `dp-foundations` | `dfs-memo` |
| Climbing Stairs (Iterative) | `dp-foundations` | `1d-sequence-dp` |
| N-th Tribonacci Number | `1d-sequence-dp` | — |
| Min Cost Climbing Stairs | `1d-sequence-dp` | — |
| House Robber | `1d-sequence-dp` | `0-1-knapsack` |
| House Robber II | `1d-sequence-dp` | — |
| Delete and Earn | `1d-sequence-dp` | — |
| Unique Paths | `grid-dp` | — |
| Minimum Path Sum | `grid-dp` | — |
| Partition Equal Subset Sum | `0-1-knapsack` | — |
| Target Sum | `0-1-knapsack` | `dfs-memo` |
| Combination Sum IV | `unbounded-knapsack` | `dfs-memo` |
| Coin Change II | `unbounded-knapsack` | — |
| Coin Change | `unbounded-knapsack` | — |
| Perfect Squares | `unbounded-knapsack` | — |
| Decode Ways | `string-dp` | — |
| Edit Distance | `string-dp` | — |
| Interleaving String | `string-dp` | — |
| Regular Expression Matching | `string-dp` | — |
| Maximum Length of Repeated Subarray | `subsequence-dp` | — |
| Longest Increasing Subsequence | `subsequence-dp` | — |
| Longest Common Subsequence | `subsequence-dp` | — |
| Distinct Subsequences | `subsequence-dp` | `string-dp` |
| Longest Palindromic Subsequence | `interval-dp` | `subsequence-dp` |
| Burst Balloons | `interval-dp` | — |
| Maximum Product Subarray | `state-machine-dp` | — |
| Best Time to Buy and Sell Stock With Cooldown | `state-machine-dp` | — |
| Word Break | `dfs-memo` | `string-dp` |
| Longest Increasing Path In a Matrix | `dfs-memo` | `grid-dp` |
| Longest Palindromic Substring | `expand-around-center` | — |
| Palindromic Substrings | `expand-around-center` | — |

If an app uses a capitalization variant of an existing name, key the map by the
exact seeded name in that app. Do not rename existing katas.

## Pattern metadata rules

- `state` and `transition` must describe the checked-in reference solution.
- `transition` remains free-form; do not create a recurrence DSL.
- `baseCases` is always a non-empty array. Include every distinct initialization
  or early-return condition required to make the recurrence correct.
- `evaluationOrder.explanation` must say why the declared order makes
  dependencies available, not merely restate the enum.
- `relatedPatterns` is secondary metadata only. It must not create extra rows or
  extra module membership in the Problems UI.
- Ruby Cooldown metadata must use the state name `cooldown`, matching its
  solution and the Python app.

## Problems UI

- Replace “Family View” user-facing copy with “Module View”.
- Group each kata exactly once using its resolved `primaryModule`.
- Render `DP Foundations` as a prerequisite tier above numbered problem-family
  sections.
- Render non-DP `expand-around-center` after curriculum modules.
- Preserve the existing search, filters, sort within sections, selection,
  keyboard navigation, and flat browse order.
- Empty modules do not need empty headings.

Reference mockup:
`/Users/urielmaldonado/projects/kata-desktop/public/dp-curriculum-v2-mockup.html`.

## Pattern card UI

Render, in order:

1. Primary-module badge.
2. Optional subtle `Related: …` badges.
3. State.
4. Transition.
5. Base cases as a list.
6. Evaluation order kind plus explanation.

Remove Dependencies entirely.

## New katas

Add exactly these four entries through each app's `dp-foundations.ts`:

| Name | Module | LeetCode | Required teaching point |
|---|---|---:|---|
| Unique Paths II | `grid-dp` | 63 | Obstacles zero out a state before paths are accumulated |
| Triangle | `grid-dp` | 120 | Bottom-up row compression from the last row |
| 0/1 Knapsack | `0-1-knapsack` | custom | Iterate capacity **backward** so an item cannot be reused |
| Unbounded Knapsack | `unbounded-knapsack` | custom | Iterate capacity **forward** so an item can be reused |

The two custom intros must be marked custom/non-LeetCode and must not get fake
LeetCode numbers. Add LeetCode-number mappings for Unique Paths II and Triangle.
Use idiomatic snake_case function/method names consistent with each app.

Each new kata needs executable tests covering the ordinary case, a boundary or
empty/zero-capacity case where allowed, and the iteration-direction trap.

## Required verification

Python:

```sh
pnpm vitest run
pnpm build
```

Also execute the four new reference solutions with `python3` or through an
existing focused verifier.

Ruby:

```sh
pnpm vitest run
pnpm verify-katas
pnpm build
```

Both apps:

- Assert every `DP_PATTERNS` key resolves to a real seed kata.
- Assert every pattern has a recognized primary classification, non-empty
  `baseCases`, and a complete evaluation order.
- Assert related patterns are recognized DP curriculum modules and do not equal
  the primary module.
- Assert all four new katas are present exactly once.
- Check the curriculum order manually against the actual solutions.

Packaging/install happens only after both implementations have been reviewed
and the test/build gates pass.
