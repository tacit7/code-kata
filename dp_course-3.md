
# 4. 0/1 Knapsack

This module is too small. It currently introduces the pattern through three problems, but it does not adequately separate the four common variants:

* feasibility
* counting
* maximizing value
* minimizing difference

## Add

### Non-LeetCode bridge problems

1. **Subset Sum**

   * Given numbers and a target, determine whether some subset reaches the target.
   * This should come before Partition Equal Subset Sum.

2. **Count Subsets That Sum to Target**

   * Counting version of the same state.

3. **Minimum Number of Items to Reach Target**

   * Each item may be used once.
   * Helps contrast with Coin Change.

4. **Closest Subset Sum**

   * Find the subset sum closest to a target.

5. **Choose Exactly K Items With Maximum Value**

   * Introduces a second constraint.

### LeetCode additions

6. **1049. Last Stone Weight II**

   * Excellent subset-partition transformation.

7. **474. Ones and Zeroes**

   * Two-capacity 0/1 knapsack.
   * Good advanced endpoint for this module.

8. **879. Profitable Schemes**

   * Multi-dimensional counting knapsack.
   * Mark advanced.

## Better order
1. Subset Sum
2. Partition Equal Subset Sum
3. 0/1 Knapsack
4. Count Subsets That Sum to Target
5. Target Sum
6. Last Stone Weight II
7. Ones and Zeroes
8. Profitable Schemes

`Target Sum` should not be the third exposure to 0/1 knapsack unless you explicitly teach the algebraic transformation:

```text
positive_sum - negative_sum = target
positive_sum + negative_sum = total

2 * positive_sum = total + target
```

Without that derivation, it feels like a magic trick performed by an especially smug recurrence.

---