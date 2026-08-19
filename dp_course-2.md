
---

# 3. Grid DP

Your grid section has a very good gradual introduction. The missing ideas are:

* maximum instead of minimum
* more than two incoming directions
* reconstruction
* shape-based state
* reverse-direction DP

## Add

### Easy bridge problems

1. **Build a Maximum-Cost Table**

Use the same structure as Minimum Path Sum but replace `min` with `max`.

This reinforces that the state shape can stay identical while the objective changes.

2. **Reconstruct One Minimum-Cost Path**

Return coordinates such as:

```ruby
[[0, 0], [0, 1], [1, 1], [2, 1]]
```

3. **Count Paths With Diagonal Movement**

Allow movement:

* right
* down
* diagonal down-right

```ruby
dp[row][col] =
  dp[row - 1][col] +
  dp[row][col - 1] +
  dp[row - 1][col - 1]
```

4. **Minimum Falling Path in a Small Grid**

This introduces three possible parents:

```text
upper-left
upper
upper-right
```

### LeetCode additions

5. **931. Minimum Falling Path Sum**

   * Natural next problem after Triangle.

6. **221. Maximal Square**

   * Important because the state describes the largest shape ending at a cell, not a path.

7. **1277. Count Square Submatrices With All Ones**

   * Reinforces the same state as Maximal Square but asks for a count.

8. **174. Dungeon Game**

   * Teaches working backward.
   * Mark it advanced.

9. **120. Triangle**

   * Already included and appropriately placed.

## Recommended order after Triangle

9. Minimum Falling Path Sum
10. Maximal Square
11. Count Square Submatrices With All Ones
12. Dungeon Game

I would not add Cherry Pickup yet. Two-agent grid DP is useful, but only after learners stop treating a two-dimensional array like an unexploded device.

---
