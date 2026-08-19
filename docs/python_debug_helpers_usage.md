# Python Debug Helper Usage

Python kata helpers are convenience functions for inspecting code while solving
problems. They are injected by the app; users do not need to paste helper code
into a solution.

## Availability

| Helper Type | Practice/Test Runs | REPL |
|---|---:|---:|
| Debug helpers | Yes | Yes |
| Builder helpers | No | Yes |

Debug helpers are available while running tests because they only print or trace
state. Builder helpers are REPL-only so submitted solutions cannot depend on
sample-data constructors.

## Debug Helpers

These are available in both test runs and the REPL.

| Helper | Use |
|---|---|
| `khelp()` | List helpers or show detailed help for one helper. |
| `plocals()` | Pretty-print caller local variables. |
| `pvars(*names)` | Print selected variables from the caller scope. |
| `pstep(label, **values)` | Print a labeled checkpoint. |
| `pgrid(grid)` | Pretty-print a grid or matrix. |
| `pmatrix(matrix)` | Alias for `pgrid`. |
| `pdp(dp)` | Print 1D or 2D DP state. |
| `pstack(limit=8)` | Print a compact stack trace. |
| `ptrace(limit=8)` | Alias for `pstack`. |
| `trace_recursion(fn)` | Decorator that prints recursive calls and returns. |
| `trace_tree(fn)` | Decorator that traces binary-tree recursion with child direction labels. |
| `trace_rescursion(fn)` | Alias for `trace_recursion`; kept for typo compatibility. |
| `recursion_depth(offset=0)` | Return the current traced recursion depth. |
| `recursion_indent(offset=0)` | Return indentation spaces for the current traced recursion frame. |
| `pindent(*values, offset=0)` | Print with the current traced recursion indentation. |
| `preturn(value)` | Print and return a value, useful inside recursive returns. |

Helpers are also importable:

```python
from kata_debug_helpers import pgrid, plocals
```

Direct use is shorter and also works:

```python
pgrid(grid)
plocals()
```

## Help

List all helpers:

```python
khelp()
```

Show detailed help for one helper:

```python
khelp("pgrid")
khelp(pgrid)
```

In practice/test runs, `khelp()` lists debug helpers only. In the REPL, it also
lists REPL-only builders such as `build_tree`.

## Examples

### Print Locals

```python
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        plocals()
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

Use `compact=True` for one-line output:

```python
plocals(compact=True)
```

Exclude noisy names:

```python
plocals(exclude={"self", "root"})
```

### Print Selected Variables

```python
pvars("left", "right", "mid")
```

Output shape:

```text
left=0, right=5, mid=2
```

### Print A Checkpoint

```python
pstep("expand", row=r, col=c, value=grid[r][c])
```

Output shape:

```text
[expand] row=2, col=1, value=0
```

### Print A Grid

```python
grid = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 1, 1],
]

pgrid(grid)
```

Output shape:

```text
    0 1 2
0 | 1 0 1
1 | 0 1 0
2 | 1 1 1
```

### Print DP State

```python
dp = [0, 1, 1, 2, 3, 5]
pdp(dp)
```

For 2D DP tables, `pdp` formats the value like a grid:

```python
pdp([[1, 0], [1, 1]])
```

### Trace Recursion

```python
@trace_recursion
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

fib(4)
```

Output shape:

```text
fib(4)
  fib(3)
    fib(2)
      fib(1)
      fib(1) -> 1
      fib(0)
      fib(0) -> 0
    fib(2) -> 1
  fib(3) -> 2
fib(4) -> 3
```

Tree-node-like objects that do not define `__repr__` are displayed as
`Node(value)` instead of Python's default object address, as long as they expose
a `val` attribute.

Use `recursion_indent()` or `pindent()` inside traced functions when your own
debug prints should line up with the current call frame:

```python
@trace_recursion
def countdown(n):
    pindent("work n=", n, sep="")
    if n == 0:
        return None
    return countdown(n - 1)
```

`offset=1` prints one level deeper than the current frame, which is useful for
child-detail notes.

Use `trace_tree` for binary-tree DFS when left/right direction matters:

```python
@trace_tree
def dfs(node):
    if not node:
        return 0
    return 1 + max(dfs(node.left), dfs(node.right))
```

Output shape:

```text
dfs(Node(3))
  L dfs(Node(9))
  L dfs(...) -> 1
  R dfs(Node(20))
  R dfs(...) -> 1
dfs(...) -> 2
```

`trace_tree` labels calls with `L` or `R` when the recursive node argument is
the current parent node's `left` or `right` child. Calls with `None` are left
unlabeled when the direction cannot be inferred reliably.

Planned formatter improvements will make linked lists, graph nodes, trie nodes,
intervals, and stack/queue/heap wrappers readable in the same way. Until those
tasks are implemented, those objects may still fall back to Python's default
object-address output unless the class defines `__repr__`.

Use `preturn` when you want to print a return value without decorating the whole
function:

```python
def dfs(node):
    if not node:
        return preturn(0)
    return preturn(1 + max(dfs(node.left), dfs(node.right)))
```

## REPL-Only Builders

These work in the REPL but not inside kata test runs.

| Helper | Use |
|---|---|
| `build_tree(values)` | Build a binary tree from LeetCode-style level-order values. |
| `tree_to_list(root)` | Convert a binary tree back to level-order values. |

Import form:

```python
from kata_builder_helpers import build_tree, tree_to_list
```

Direct use:

```python
root = build_tree([3, 9, 20, None, None, 15, 7])
tree_to_list(root)
```

If no `TreeNode` class exists in the REPL yet, `build_tree` creates a small
compatible `TreeNode` class with `val`, `left`, and `right`.

If the current problem code already defines `TreeNode`, `build_tree` uses that
class instead.

## Intentional Boundary

This should fail in a kata test run:

```python
root = build_tree([1, 2, 3])
```

Expected failure:

```text
NameError: name 'build_tree' is not defined
```

Builders are for exploration in the REPL only. Debug helpers are safe during
tests because they only print or trace existing state.
