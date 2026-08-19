
# 5. Unbounded Knapsack

The problem selection is good, but the order should change.

`Combination Sum IV` is more subtle than Coin Change because order matters. It should not be first.

## Add

### Bridge problems

1. **Can Reach Target With Unlimited Numbers**

   * Boolean unbounded knapsack.

2. **Minimum Number of Tiles to Build Length N**

   * Same structure as Coin Change with simpler language.

3. **Count Ordered Ways to Reach Target**

   * Explicitly contrast with unordered combinations.

4. **Maximum Value With Reusable Items**

   * Direct unbounded knapsack before the canonical named version.

### Recommended order

1. Can Reach Target With Unlimited Numbers
2. Minimum Number of Tiles to Build Length N
3. Coin Change
4. Count Unordered Ways to Reach Target
5. Coin Change II
6. Count Ordered Ways to Reach Target
7. Combination Sum IV
8. Perfect Squares
9. Unbounded Knapsack

## Essential lesson

Teach `Coin Change II` and `Combination Sum IV` side by side.

### Coin Change II

Outer loop over coins:

```ruby
coins.each do |coin|
  coin.upto(target) do |amount|
    dp[amount] += dp[amount - coin]
  end
end
```

Counts combinations.

### Combination Sum IV

Outer loop over amounts:

```ruby
1.upto(target) do |amount|
  nums.each do |num|
    dp[amount] += dp[amount - num] if num <= amount
  end
end
```

Counts ordered sequences.

That loop-order distinction is one of the highest-value lessons in the entire module.

---

# 6. String DP

This module jumps too quickly.

You go from a custom segmentation problem to Decode Ways, then immediately to Edit Distance. That is like teaching someone to float and then placing them on a commercial fishing vessel.

The missing foundation is **two-string prefix DP**.

## Add

### Bridge problems

1. **Build a Two-String Match Table**

   * For each `i, j`, record whether `a[0...i] == b[0...j]`.
   * The final problem is not important. The table mechanics are.

2. **Longest Common Subsequence Table**

   * Before the full LeetCode version, manually fill a small table.

3. **Minimum Deletions to Make Two Strings Equal**

   * Simpler than Edit Distance.
   * Can be derived from LCS.

4. **Longest Common Substring**

   * Important contrast with Longest Common Subsequence.

5. **Reconstruct One Longest Common Subsequence**

### LeetCode additions

6. **583. Delete Operation for Two Strings**

   * Good bridge from LCS to Edit Distance.

7. **712. Minimum ASCII Delete Sum for Two Strings**

   * Weighted variation.

8. **115. Distinct Subsequences**

   * Already in Subsequence DP.
   * That placement is fine, but it relies on the same two-string table.

9. **1092. Shortest Common Supersequence**

   * Reconstruction-oriented advanced problem.

## Recommended order

1. Segment a Number String
2. Decode Ways
3. Build a Two-String Match Table
4. Longest Common Subsequence
5. Minimum Deletions to Make Two Strings Equal
6. Delete Operation for Two Strings
7. Longest Common Substring
8. Edit Distance
9. Interleaving String
10. Distinct Subsequences
11. Regular Expression Matching

I would move **Longest Common Subsequence** from Subsequence DP into this module or rename this module to:

> **String and Two-Sequence DP**

That is the more accurate category.

---

# 7. Subsequence DP

This section currently mixes three substantially different patterns:

* contiguous matching between two arrays
* LIS-style “ending at index”
* two-sequence prefix DP

That is not wrong, but the category is broad enough to become vague.

I would narrow it to **LIS and Chain DP**.

Move these elsewhere:

* Maximum Length of Repeated Subarray → String/Two-Sequence DP
* Longest Common Subsequence → String/Two-Sequence DP
* Distinct Subsequences → String/Two-Sequence DP

## Add

### Bridge problems

1. **LIS Length Ending at Each Index**

Return:

```ruby
[1, 2, 2, 3]
```

rather than just the maximum.

2. **Maximum-Sum Increasing Subsequence**

   * Replace length with sum.

3. **Longest Decreasing Subsequence**

4. **Longest Divisible Chain**

5. **Reconstruct One Increasing Subsequence**

### LeetCode additions

6. **673. Number of Longest Increasing Subsequences**

   * Track both length and count.

7. **368. Largest Divisible Subset**

   * Chain DP plus reconstruction.

8. **1027. Longest Arithmetic Subsequence**

   * State includes the difference.

9. **1218. Longest Arithmetic Subsequence of Given Difference**

   * Hash-based DP.

10. **354. Russian Doll Envelopes**

* Advanced sorting plus LIS.

## Recommended structure

1. Longest Increasing Run
2. LIS Length Ending at Each Index
3. Longest Increasing Subsequence
4. Maximum-Sum Increasing Subsequence
5. Longest Decreasing Subsequence
6. Number of Longest Increasing Subsequences
7. Largest Divisible Subset
8. Longest Arithmetic Subsequence of Given Difference
9. Longest Arithmetic Subsequence
10. Russian Doll Envelopes

This creates a coherent family rather than a filing cabinet labeled “things involving sequences.”

---