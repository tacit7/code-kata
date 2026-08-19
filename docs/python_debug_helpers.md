# Python Debug Helpers

This document proposes Python helper functions for debugging kata solutions in
the Python app.

## Goal

Give users fast, ergonomic debugging tools while avoiding helper functions that
can become solution shortcuts.

The helpers should make it easier to inspect local state, grids, recursion,
trees, graphs, queues, heaps, and DP tables during practice.

## Runtime Availability

Helpers should be split into two groups.

| Group | REPL | Test Runner | Purpose |
|---|---:|---:|---|
| Debug helpers | Yes | Yes | Inspect and format existing state. |
| Builder helpers | Yes | No | Build sample data for exploration only. |

The REPL should expose both groups because it is exploratory. The test runner
should expose only debug helpers so user solutions cannot depend on builders.

## Debug Helpers

These helpers are safe in both the REPL and test runner because they only
inspect, format, or trace user code.

| Helper | Purpose |
|---|---|
| `plocals()` | Pretty-print caller local variables. |
| `pvars(*names)` | Pretty-print selected variables from the caller frame. |
| `pstep(label, **values)` | Print a labeled checkpoint with selected values. |
| `pframe()` | Print current function name, source line, and locals. |
| `pstack()` | Print compact call stack. |
| `ptrace()` | Alias for `pstack()`. |
| `pgrid(grid)` | Pretty-print a 2D grid with optional row/column labels. |
| `pmatrix(matrix)` | Alias for `pgrid()`. |
| `pdp(dp)` | Pretty-print 1D or 2D DP state. |
| `ptree(root)` | Print a binary tree in level-order or compact shape format. |
| `pgraph(graph)` | Pretty-print adjacency lists/maps. |
| `pqueue(queue)` | Print queue/deque state with indices. |
| `pheap(heap)` | Print heap array with indices. |
| `pdiff(expected, actual)` | Print compact mismatch information. |
| `trace_recursion(fn)` | Decorator that traces recursive calls and returns. |
| `trace_tree(fn)` | Decorator that traces binary-tree recursion with `L` / `R` child labels. |
| `preturn(value)` | Print a return value with recursion-aware indentation, then return it. |

## Builder Helpers

These helpers should be REPL-only. They are useful for manual exploration, but
should not be available to kata solutions during test execution.

| Helper | Purpose |
|---|---|
| `build_tree(values)` | Build a binary tree from LeetCode-style level-order values. |
| `tree_to_list(root)` | Convert a binary tree to level-order values. |
| `build_list(values)` | Build a linked list from an array. |
| `list_to_array(head)` | Convert a linked list to an array. |
| `rand_tree(...)` | Generate a random binary tree for experiments. |
| `rand_grid(...)` | Generate a random grid with optional walls/weights. |
| `rand_graph(...)` | Generate a small random graph for experiments. |

## Suggested APIs

### `plocals`

```python
plocals(exclude=None, sort=True, compact=False)
```

Examples:

```python
plocals()
plocals(exclude={"self"})
plocals(compact=True)
```

Behavior:

- Reads the caller frame.
- Omits internal helper variables.
- Supports excluding noisy names.
- Sorts variable names by default.
- Uses readable formatting instead of raw `print(locals())`.

### `pvars`

```python
pvars("left", "right", "mid")
```

Behavior:

- Reads selected names from the caller frame.
- Prints missing names as `<missing>`.
- Keeps output compact enough for binary search, pointers, and DP loops.

### `pstep`

```python
pstep("expand", row=r, col=c, value=grid[r][c])
```

Behavior:

- Prints a labeled checkpoint.
- Preserves keyword order.
- Useful inside loops where `plocals()` would be too noisy.

### `pgrid`

```python
pgrid(grid, row_labels=True, col_labels=True, width=None)
```

Example output:

```text
    0  1  2
0 | 1  0  1
1 | 0  1  0
2 | 1  1  1
```

Behavior:

- Handles rectangular and ragged grids.
- Computes cell width automatically unless `width` is provided.
- Should work for numbers, strings, booleans, and `None`.

### `pdp`

```python
pdp(dp)
```

Behavior:

- If `dp` is 1D, prints index/value pairs.
- If `dp` is 2D, delegates to `pgrid`.
- Keeps DP debugging separate from generic grid output.

### `ptree`

```python
ptree(root, mode="level")
```

Behavior:

- Defaults to level-order output.
- Should support common kata node fields: `val`, `left`, and `right`.
- Should avoid traversing forever if a malformed cyclic structure is passed.

### `pgraph`

```python
pgraph(graph)
```

Behavior:

- Supports dictionaries, adjacency lists, and sets.
- Sorts keys when possible.
- Keeps list/set values readable.

### `pstack` / `ptrace`

```python
pstack(limit=8)
ptrace(limit=8)
```

Behavior:

- Prints a compact call stack.
- Shows function name and line number.
- Omits helper-library frames.

### `trace_recursion`

```python
@trace_recursion
def dfs(node, total):
    ...
```

Example output:

```text
dfs(node=TreeNode(3), total=0)
  dfs(node=TreeNode(1), total=3)
    dfs(node=None, total=4) -> 0
  dfs(node=TreeNode(1), total=3) -> 1
dfs(node=TreeNode(3), total=0) -> 2
```

Behavior:

- Prints function calls with indentation based on recursion depth.
- Prints return values.
- Truncates long argument representations.
- Displays tree-node-like objects with a `val` field as `Node(value)` when the
  class does not define its own `__repr__`.
- Works without changing the function body.

### `recursion_depth` / `recursion_indent` / `pindent`

```python
@trace_recursion
def countdown(n):
    pindent("current n=", n, sep="")
    if n == 0:
        return None
    return countdown(n - 1)
```

Behavior:

- `recursion_depth(offset=0)` returns the current traced call-frame depth.
- `recursion_indent(offset=0)` returns two spaces per traced call-frame depth.
- `pindent(*values, offset=0, **kwargs)` behaves like `print`, prefixed with
  the current recursion indentation.
- `offset=1` prints one level deeper than the current frame for child-detail
  notes.

### `trace_tree`

```python
@trace_tree
def dfs(node):
    if not node:
        return 0
    return 1 + max(dfs(node.left), dfs(node.right))
```

Example output:

```text
dfs(Node(3))
  L dfs(Node(9))
    dfs(None)
    dfs(...) -> 0
    dfs(None)
    dfs(...) -> 0
  L dfs(...) -> 1
  R dfs(Node(20))
  R dfs(...) -> 1
dfs(...) -> 2
```

Behavior:

- Uses the same call/return indentation model as `trace_recursion`.
- Prefixes a call with `L` or `R` when the first tree-like argument is the
  current parent node's `left` or `right` child.
- Leaves `None` calls unlabeled when direction cannot be inferred reliably.
- Uses the shared readable formatter for `Node(value)` output.
- Works for common kata node fields: `val`, `left`, and `right`.

## Planned Readable Object Formatting

The current formatter handles the worst binary-tree case by replacing Python's
default object-address repr with `Node(value)` for objects that expose `val`.
Future formatter tasks should cover the other common kata object shapes:

| EITS Task | Object Shape | Target Output |
|---:|---|---|
| 9103 | Linked-list nodes with `val` / `next` | `ListNode(1) -> ListNode(2)` |
| 9104 | Interval-like objects with `start` / `end` | `Interval(1, 4)` |
| 9105 | Binary tree nodes with `val` / `left` / `right` | `TreeNode(3, left=9, right=20)` |
| 9106 | Stack, queue, and heap wrappers with `items`, `stack`, `queue`, or `heap` | `Queue([1, 2, 3])` |
| 9107 | Trie nodes with `children`, `end`, `is_word`, or `word` | `TrieNode(keys=['a', 'b'], end=False)` |
| 9108 | Graph nodes with `val` / `neighbors` | `GraphNode(1, neighbors=[2, 4])` |

Collection and graph-like formatters must include truncation and cycle
protection. These helpers should only format state; they must not add traversal
or algorithm helpers that solve parts of a kata.

### `preturn`

```python
return preturn(best)
```

Behavior:

- Prints the value being returned.
- Uses stack depth or active recursion trace depth for indentation.
- Returns the original value unchanged.

## Implementation Plan

Create two injected Python helper modules:

| Module | Included In | Contents |
|---|---|---|
| `kata_debug_helpers` | REPL and test runner | Debug helpers only. |
| `kata_builder_helpers` | REPL only | Builders and random generators. |

The Python test worker should inject only `kata_debug_helpers`.

The Python REPL worker should inject both modules.

The global namespace can expose the helpers directly for convenience:

```python
pgrid(grid)
plocals()
```

The explicit import form should also work:

```python
from kata_debug_helpers import pgrid, plocals
from kata_builder_helpers import build_tree
```

## Guardrails

Do not add algorithm helpers. These should not exist globally:

- `bfs`
- `dfs`
- `binary_search`
- `topo_sort`
- `dijkstra`
- `two_sum`
- `sliding_window`

Helpers should not solve, search, optimize, or make decisions for the user.
They should only display state, trace execution, or construct sample REPL data.

## Failure Behavior

If a user calls a builder in a test-run kata solution, it should fail normally:

```text
NameError: name 'build_tree' is not defined
```

That boundary is intentional. Builders are for REPL exploration only.

## Suggested First Slice

Implement the smallest useful set first:

- `plocals`
- `pvars`
- `pstep`
- `pgrid`
- `pdp`
- `pstack`
- `trace_recursion`
- `preturn`
- `build_tree` in REPL only
- `tree_to_list` in REPL only

This gives immediate value for arrays, grids, DP, recursion, and tree problems
without introducing solution shortcuts.
