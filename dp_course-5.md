
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