# DP Module Update Contract

## Source Notes
- Follow `dp_course.md`, `dp_course-2.md`, `dp_course-3.md`, `dp_course-4.md`, and `dp_course-5.md`.
- `dp_course.md` is the combined source of truth; the numbered follow-up files are supporting excerpts.

## Taxonomy
- Use this display order:
  1. DP Foundations
  2. 1D Sequence DP
  3. Grid DP
  4. 0/1 Knapsack
  5. Unbounded Knapsack
  6. LIS and Chain DP
  7. String and Two-Sequence DP
  8. Interval DP
  9. State-Machine DP
  10. DFS With Memoization
  11. Tree DP
  12. Bitmask DP
  13. Alternative Techniques for DP-Looking Problems

## Stable Identifiers
- Prefer existing IDs when possible to reduce UI and seeded-DB churn.
- If introducing new IDs, keep legacy tag resolution for `string-dp` and `subsequence-dp`.
- Existing DP pattern entries remain the source of truth for seeded kata classification.

## Immediate Addition Names
- Use exact names from `dp_course.md` unless an equivalent kata already exists:
  - Can Reach the Final Step
  - Minimum Moves to Reach N
  - Maximum Sum With No Three Consecutive Values
  - Solving Questions With Brainpower
  - Maximum Subarray
  - Reconstruct One Minimum-Cost Grid Path
  - Minimum Falling Path Sum
  - Subset Sum
  - Count Subsets That Sum to Target
  - Last Stone Weight II
  - Longest Common Substring
  - Delete Operation for Two Strings
  - LIS Length Ending at Each Index
  - Number of Longest Increasing Subsequences
  - Minimum Insertions to Make a String a Palindrome
  - Minimum Cost to Cut a Stick
  - Best Time to Buy and Sell Stock II
  - Maximum Alternating Subsequence Sum
  - Count Paths in a DAG
  - Out of Boundary Paths
  - Minimum Worker-Job Assignment Cost
  - Beautiful Arrangement
  - House Robber III
  - Binary Tree Maximum Path Sum

## Cross-Language Rules
- Python app changes live in this repo.
- JavaScript kata changes in this repo should mirror Python names and problem intent.
- Ruby parity lives in `/Users/urielmaldonado/projects/ruby-kata` and requires `kind` on solution variants.
- Do not paste LeetCode statements verbatim; descriptions must be original/paraphrased.

## Verification
- Run `pnpm test` and `pnpm build` in `/Users/urielmaldonado/projects/kata-desktop`.
- If Ruby files are touched, run that app's TypeScript build too.
