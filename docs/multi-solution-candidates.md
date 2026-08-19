# Multi-solution candidate tracker

Use this as the working list for LeetCode-style problems that benefit from multiple accepted solution strategies.

## Highest-priority pass

Implemented in the Python app:

- LeetCode #215 Kth Largest Element in an Array — sort, min-heap, quickselect
- LeetCode #347 Top K Frequent Elements — bucket sort, heap, sort
- LeetCode #210 Course Schedule II — DFS topo sort, Kahn BFS topo sort
- LeetCode #684 Redundant Connection — union find, incremental DFS
- LeetCode #200 Number of Islands — recursive DFS, iterative BFS
- LeetCode #19 Remove Nth Node From End of List — one-pass two pointers, two-pass length
- LeetCode #42 Trapping Rain Water — prefix/suffix arrays, monotonic stack, two pointers
- LeetCode #78 Subsets — backtracking, iterative cascading, bitmask
- LeetCode #46 Permutations — remaining-list recursion, used flags, in-place swap
- LeetCode #94/#144/#145 Binary Tree Traversals — recursive and iterative stack variants on the recursive traversal pages
- LeetCode #206 Reverse Linked List — iterative and recursive forms
- LeetCode #141 Linked List Cycle — Floyd slow/fast pointers, hash set
- LeetCode #133 Clone Graph — DFS clone, BFS clone

Mirror the same set in the Ruby app when editing outside this repository is available.

## Still left

- LeetCode #138 Copy List with Random Pointer — hash map, interleaving clone; the current simplified array representation should be reviewed before adding linked-node variants

## Lower-priority follow-up candidates

- Course Schedule — DFS cycle detection, Kahn indegree
- Pacific Atlantic Water Flow — DFS from oceans, BFS from oceans
- Merge K Sorted Lists — heap, divide and conquer
- Meeting Rooms II — min-heap, sweep line
- Product of Array Except Self — prefix/suffix arrays, two-pass O(1) output-space
