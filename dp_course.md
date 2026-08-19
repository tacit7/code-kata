# Highest-priority additions

These fill the most important gaps without turning the module into a LeetCode landfill.

## 1. DP Foundations

Your foundations section teaches recurrence and iteration well, but it mostly covers **counting sequences**. Add examples where DP produces different kinds of answers.

### Add

1. **Can Reach the Final Step**

   * Some steps are blocked.
   * Return `true` or `false`.
   * Introduces boolean DP.

2. **Minimum Moves to Reach N**

   * Allowed moves might be `+1`, `+3`, and `+5`.
   * Introduces minimization.

3. **Count Ways With Blocked Positions**

   * Combines counting with invalid states.

4. **Top-Down Fibonacci With Memoization**

   * You have recursive and iterative Climbing Stairs, but memoization itself should be isolated explicitly.

5. **Return the Entire DP Table**

   * Given a recurrence, return all values from `dp[0]` through `dp[n]`.
   * This sounds trivial because it is. Trivial exercises are useful before people start staring into the abyss of state transitions.

A foundations module should demonstrate these four DP outputs:

```text
Count       -> sum
Possible?   -> boolean OR
Minimum     -> min
Maximum     -> max
```

You currently emphasize counting more than the other three.

---

# 2. 1D Sequence DP

This is your strongest module. The progression is sensible, and `Delete and Earn` provides a useful transformation problem.

The main missing concepts are:

* more than two choices
* multiple states per index
* variable-length lookback
* reconstruction

## Add

### Easy bridge problems

1. **Maximum Sum With No Three Consecutive Values**

At index `i`, the best solution may:

* skip `i`
* take `i` but skip `i - 1`
* take both `i` and `i - 1`, forcing you to skip `i - 2`

```ruby
dp[i] = [
  dp[i - 1],
  dp[i - 2] + nums[i],
  dp[i - 3] + nums[i - 1] + nums[i]
].max
```

This is an excellent step after House Robber because it breaks the simplistic idea that every 1D recurrence is:

```ruby
[skip, take].max
```

2. **Maximum Points With a Two-Position Cooldown**

Taking `i` prevents taking `i - 1` and `i - 2`.

```ruby
dp[i] = [dp[i - 1], dp[i - 3] + points[i]].max
```

This generalizes House Robber without changing the core pattern.

3. **Maximum-Sum Path With Jumps of 1, 2, or 3**

Each position has points. Reach the end with maximum total.

This introduces multiple predecessor states:

```ruby
dp[i] = points[i] + [dp[i - 1], dp[i - 2], dp[i - 3]].max
```

4. **Reconstruct the Chosen Cards**

Use your existing nonadjacent-cards problem, but return the selected indices or values.

Computing the score and reconstructing the decision are different skills.

### LeetCode additions

5. **53. Maximum Subarray**

You already have “Maximum Contiguous Sum Ending at Each Position,” so the actual LeetCode problem should follow directly. Otherwise the preparatory exercise trains for a destination that never arrives, a charming bit of curriculum bureaucracy.

6. **91. Decode Ways**

You currently place it under String DP, which is reasonable. It also belongs conceptually after Climbing Stairs because it is a conditional two-step recurrence.

7. **983. Minimum Cost For Tickets**

   * Variable-distance transitions.
   * Useful after Min Cost Climbing Stairs.

8. **1043. Partition Array for Maximum Sum**

   * Bounded backward scan.
   * Good late 1D problem.

9. **2140. Solving Questions With Brainpower**

   * Take or skip with a variable cooldown.
   * Very useful bridge between House Robber and more general sequence DP.

## Recommended order

Your current list, with additions:

1. Longest Repeated-Character Run
2. Longest Increasing Run
3. Can the End Be Reached?
4. Cheapest Walk Across Stones
5. Maximum Points Without Adjacent Cards
6. Maximum Points With a One-Position Cooldown
7. Maximum Points With a Two-Position Cooldown
8. Maximum Points With No Three Consecutive Values
9. Cheapest Route Through Checkpoints
10. Maximum Contiguous Sum Ending at Each Position
11. Maximum Subarray
12. Min Cost Climbing Stairs
13. House Robber
14. House Robber II
15. Solving Questions With Brainpower
16. Delete and Earn
17. Minimum Cost For Tickets
18. Partition Array for Maximum Sum

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

# 8. Interval DP

This module is much too abrupt.

`Longest Palindromic Subsequence` is manageable. `Burst Balloons` is a substantial conceptual jump because it requires choosing the **last** action inside an interval.

## Add

### Bridge problems

1. **Fill a Palindrome Table**

   * `dp[left][right]` tells whether the substring is a palindrome.

2. **Count Palindromic Subsequences in a Small String**

   * Use only small inputs if duplicate handling is simplified.

3. **Minimum Deletions to Make a String a Palindrome**

4. **Minimum Insertions to Make a String a Palindrome**

5. **Minimum Cost to Merge Adjacent Numbers**

   * Simplified interval splitting.

6. **Best Score From Removing One Final Item**

   * A small custom problem explicitly teaching “choose the last action.”

### LeetCode additions

7. **1312. Minimum Insertion Steps to Make a String Palindrome**

   * Natural after LPS.

8. **1039. Minimum Score Triangulation of Polygon**

   * Cleaner interval partitioning than Burst Balloons for some learners.

9. **1547. Minimum Cost to Cut a Stick**

   * Canonical interval split.

## Recommended order

1. Fill a Palindrome Table
2. Longest Palindromic Subsequence
3. Minimum Insertions to Make a String a Palindrome
4. Minimum Cost to Merge Adjacent Numbers
5. Minimum Score Triangulation of Polygon
6. Minimum Cost to Cut a Stick
7. Burst Balloons

This gives Burst Balloons the runway it requires instead of dropping it from orbit.

---

# 9. State-Machine DP

This module is significantly underdeveloped.

`Maximum Product Subarray` can be interpreted as multi-state DP, but it is not the clearest introduction to a state machine. The stock family provides a much better progression.

## Add

### Bridge problems

1. **Maximum Alternating Sum**

   * States:

     * next chosen element occupies an odd position
     * next chosen element occupies an even position

2. **Hold or Do Not Hold a Stock**

   * One transaction or unlimited transactions.

3. **Stock With a Transaction Fee**

4. **Stock With a Cooldown**

   * You already have the LeetCode version.

5. **Choose Activities Without Repeating Yesterday's Activity**

   * State is the activity chosen today.

### LeetCode additions

6. **122. Best Time to Buy and Sell Stock II**

   * Best introductory stock state machine.

7. **714. Best Time to Buy and Sell Stock With Transaction Fee**

   * Adds transition cost.

8. **1911. Maximum Alternating Subsequence Sum**

   * Clean two-state recurrence.

9. **123. Best Time to Buy and Sell Stock III**

   * Adds transaction count.

10. **188. Best Time to Buy and Sell Stock IV**

* Generalized advanced form.

11. **552. Student Attendance Record II**

* Finite-state counting DP.

## Recommended order

1. Hold or Do Not Hold a Stock
2. Best Time to Buy and Sell Stock II
3. Maximum Alternating Sum
4. Maximum Alternating Subsequence Sum
5. Stock With Transaction Fee
6. Best Time to Buy and Sell Stock With Cooldown
7. Maximum Product Subarray
8. Best Time to Buy and Sell Stock III
9. Student Attendance Record II
10. Best Time to Buy and Sell Stock IV

Also teach the learner to draw the transition graph before writing code:

```text
REST --buy--> HOLD
HOLD --sell--> SOLD
SOLD --wait--> REST
REST --wait--> REST
HOLD --hold--> HOLD
```

That picture is the state machine. The array is merely how humans appease the computer afterward.

---

# 10. DFS With Memoization

Two problems are not enough to establish the pattern.

The module should demonstrate that memoized DFS works when the state graph is not naturally processed from left to right.

## Add

### Bridge problems

1. **Count Paths in a DAG**

```ruby
ways(node) = ways(neighbor_1) + ways(neighbor_2) + ...
```

2. **Minimum Cost to Reach the Final DAG Node**

3. **Longest Path in a DAG**

4. **Grid Paths With Arbitrary Legal Moves**

5. **Can a Word Be Segmented?**

   * Custom version before Word Break.

### LeetCode additions

6. **576. Out of Boundary Paths**

   * State: row, column, moves remaining.

7. **688. Knight Probability in Chessboard**

   * Same general state shape with probabilities.

8. **935. Knight Dialer**

   * Graph-based counting.

9. **787. Cheapest Flights Within K Stops**

   * Node plus remaining edge budget.
   * Be careful because implementation details can overlap with Bellman-Ford.

10. **140. Word Break II**

* Memoize generated result lists.

## Recommended order

1. Count Paths in a DAG
2. Minimum Cost Through a DAG
3. Word Break
4. Out of Boundary Paths
5. Knight Dialer
6. Longest Increasing Path in a Matrix
7. Knight Probability in Chessboard
8. Word Break II

---

# 11. Bitmask DP

This should begin with bitmask representation, not immediately with a traveling-salesman-style problem. Otherwise learners must understand both subset DP and bit operations at the same time, because apparently one abstraction was not sufficiently discouraging.

## Bitmask prerequisites

Before DP, add tiny exercises:

1. **Check Whether Item i Is Selected**
2. **Add Item i to a Set**
3. **Remove Item i From a Set**
4. **Count Selected Items**
5. **Enumerate All Subsets**
6. **Convert a Mask to Selected Values**

Ruby operations:

```ruby
# Is bit i set?
(mask & (1 << i)) != 0

# Add bit i
mask | (1 << i)

# Remove bit i
mask & ~(1 << i)

# Toggle bit i
mask ^ (1 << i)
```

## Actual DP progression

### 1. Count Ways to Visit Every Item

Given `n <= 5`, count orders in which all items may be selected.

State:

```text
dp[mask] = number of ways to select exactly the items in mask
```

### 2. Minimum Assignment Cost

Assign each worker to one job.

State:

```text
dp[mask] = minimum cost after assigning jobs in mask
worker_index = number of set bits in mask
```

This is probably the best first real bitmask DP problem.

### 3. LeetCode 526. Beautiful Arrangement

* Used-set mask.
* Good first LeetCode bitmask problem.

### 4. LeetCode 1799. Maximize Score After N Operations

* Pairing items using a mask.

### 5. LeetCode 1125. Smallest Sufficient Team

* Mask represents covered skills.

### 6. LeetCode 847. Shortest Path Visiting All Nodes

* Graph state plus visited mask.
* Technically BFS over bitmask state, but highly educational.

### 7. LeetCode 943. Find the Shortest Superstring

* Subset plus final item.
* Advanced.

### 8. LeetCode 1349. Maximum Students Taking Exam

* Row-mask DP.
* Advanced.

## Recommended Bitmask DP list

1. Represent a Set With Bits
2. Enumerate Every Subset
3. Count Ways to Select Every Item
4. Minimum Worker-Job Assignment Cost
5. Beautiful Arrangement
6. Maximize Score After N Operations
7. Smallest Sufficient Team
8. Shortest Path Visiting All Nodes
9. Find the Shortest Superstring
10. Maximum Students Taking Exam

---

# 12. Tree DP is missing

This is the largest missing family in the module.

You already study trees separately, but tree DP deserves an explicit section because it teaches a crucial idea:

> Each subtree returns a compressed summary that its parent can use.

## Add a Tree DP module

### Bridge problems

1. **Subtree Size**

   * Return number of nodes in each subtree.

2. **Subtree Sum**

   * Return total value under each node.

3. **Maximum Root-to-Leaf Sum**

4. **Maximum Downward Path Starting at Each Node**

5. **Choose Nonadjacent Tree Nodes**

   * Tree version of House Robber.

### LeetCode progression

6. **104. Maximum Depth of Binary Tree**

   * Not usually labeled DP, but it establishes returned subtree state.

7. **110. Balanced Binary Tree**

   * Return height or an invalid sentinel.

8. **543. Diameter of Binary Tree**

   * Return one value and update a different answer.

9. **337. House Robber III**

   * Two states per node:

     * rob node
     * skip node

10. **124. Binary Tree Maximum Path Sum**

* Local returned value versus global result.

11. **1372. Longest ZigZag Path in a Binary Tree**

* Directional state.

12. **968. Binary Tree Cameras**

* Multi-state tree DP.

13. **834. Sum of Distances in Tree**

* Rerooting DP.
* Advanced enough to have its own warning label.

---

# Palindrome grouping

Your separation is correct:

## Not DP, expand around center

* Longest Palindromic Substring
* Palindromic Substrings

Both can be solved with DP, but expand-around-center is generally cleaner and uses constant extra space.

I would retain them in the module because they provide an important lesson:

> A problem having a DP solution does not mean DP is the best solution.

You could add an explicit comparison exercise:

## Compare Two Approaches

**Palindromic Substrings**

Implement:

1. interval DP
2. expand around center

Then compare:

| Approach             |    Time |   Space |
| -------------------- | ------: | ------: |
| Interval DP          | `O(n²)` | `O(n²)` |
| Expand around center | `O(n²)` |  `O(1)` |

That teaches algorithm selection instead of encouraging DP worship, a condition from which many interview-prep repositories suffer.

# My recommended immediate additions

To improve the module without making it enormous, add these first:

1. Can Reach the Final Step
2. Minimum Moves to Reach N
3. Maximum Sum With No Three Consecutive Values
4. Solving Questions With Brainpower
5. Maximum Subarray
6. Reconstruct One Minimum-Cost Grid Path
7. Minimum Falling Path Sum
8. Subset Sum
9. Count Subsets That Sum to Target
10. Last Stone Weight II
11. Longest Common Substring
12. Delete Operation for Two Strings
13. LIS Length Ending at Each Index
14. Number of Longest Increasing Subsequences
15. Minimum Insertions to Make a String a Palindrome
16. Minimum Cost to Cut a Stick
17. Best Time to Buy and Sell Stock II
18. Maximum Alternating Subsequence Sum
19. Count Paths in a DAG
20. Out of Boundary Paths
21. Minimum Worker-Job Assignment Cost
22. Beautiful Arrangement
23. House Robber III
24. Binary Tree Maximum Path Sum

# Suggested final module taxonomy

I would use:

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

The main classification change is moving LCS-style problems out of generic Subsequence DP and into **String and Two-Sequence DP**. That gives each section a more recognizable state shape:

```text
1D Sequence:
dp[i]

Grid:
dp[row][col]

Knapsack:
dp[item][capacity] or dp[capacity]

LIS:
dp[i] = best chain ending at i

Two-Sequence:
dp[i][j] = answer for two prefixes

Interval:
dp[left][right]

State Machine:
dp[position][state]

Memoized DFS:
memo[complete_recursive_state]

Tree:
state returned by each subtree

Bitmask:
dp[selected_set]
```

That state-shape taxonomy will make the module much easier to navigate and, more importantly, easier to recognize during unfamiliar problems.
