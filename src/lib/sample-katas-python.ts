import type { Kata } from "../types/editor";

export const sampleKatasPython: Kata[] = [
  {
    id: "py-01_binary_tree_bfs",
    name: "Binary Tree BFS",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Kata: Binary Tree BFS
Function: bfs(root)

Given the root of a binary tree, return a list of values
in breadth-first (level-order) traversal order.\\n\\nRef: LeetCode #102 Binary Tree Level Order Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
from collections import deque

def bfs(root):
    q = deque([root])
    list = []

    while q :
        curr = q.popleft()

        list.append(curr.val)

        if curr.left:
            q.append(curr.left)

        if curr.right:
            q.append(curr.right)

    return list`,
    testCode: `from importlib import import_module

mod = import_module("kata.01_binary_tree_bfs.01_binary_tree_bfs_problem")
bfs = mod.bfs
Node = mod.Node


def test_bfs_single_node():
    a = Node(1)
    assert bfs(a) == [1]


def test_bfs_complete_tree():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    assert bfs(a) == [1, 2, 3, 4, 5]


def test_bfs_left_skewed():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.left = b
    b.left = c
    assert bfs(a) == [1, 2, 3]


def test_bfs_empty():
    assert bfs(None) == []`,
    solution: `"""Reference solution for Binary Tree BFS."""

from collections import deque
from importlib import import_module

Node = import_module("kata.01_binary_tree_bfs.01_binary_tree_bfs_problem").Node


def bfs(root):
    if root is None:
        return []

    queue = deque([root])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node.val)

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

    return result`,
    usage: null,
  },
  {
    id: "py-02_matrix_bfs",
    name: "Matrix BFS",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Matrix BFS
Function: matrix_bfs(grid, start)

Given a 2D grid and a starting position (row, col), return a list of
positions visited in breadth-first order. Only traverse cells with value 0
(passable). Cells with value 1 are walls.\\n\\nRef: LeetCode #1091 Shortest Path in Binary Matrix`,
    code: `from collections import deque

def matrix_bfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    visited={start}
    list = [start]
    q = deque([start])

    def in_range(r, c):
        return 0 <= r < rows and 0 <= c < cols

    def is_path(r ,c):
        return grid[r][c] == 0

    dirs = [ (1, 0), (-1, 0), (0, 1), (0, -1) ]

    while q:
        r, c = q.popleft()

        for rd, cd in dirs:
            rc, cc = rd + r, c + cd

            if in_range(rc, cc) and  (rc, cc) not in visited and is_path(rc, cc):
                q.append((rc,cc))
                visited.add((rc,cc))
                list.append((rc,cc))

    return list`,
    testCode: `from importlib import import_module

matrix_bfs = import_module("kata.02_matrix_bfs.02_matrix_bfs_problem").matrix_bfs


def test_matrix_bfs_simple():
    grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    result = matrix_bfs(grid, (0, 0))
    assert result[0] == (0, 0)
    assert len(result) == 8  # all passable cells


def test_matrix_bfs_blocked():
    grid = [
        [0, 1],
        [1, 0],
    ]
    result = matrix_bfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_matrix_bfs_single_cell():
    grid = [[0]]
    result = matrix_bfs(grid, (0, 0))
    assert result == [(0, 0)]`,
    solution: `"""Reference solution for Matrix BFS."""

from collections import deque


def matrix_bfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = {start}
    result = []

    while queue:
        r, c = queue.popleft()
        result.append((r, c))

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in visited and grid[nr][nc] == 0:
                visited.add((nr, nc))
                queue.append((nr, nc))

    return result`,
    usage: null,
  },
  {
    id: "py-03_linked_list_traversal",
    name: "Linked List Traversal",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Kata: Linked List Traversal
Function: traverse(head)

Given the head of a singly linked list, return a list of all node values
in order.\\n\\nRef: LeetCode #234 Palindrome Linked List (closest match)`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None



def traverse(head):
    list = []
    curr = head
    while curr:
        list.append(curr.val)
        curr = curr.next


    return list`,
    testCode: `from importlib import import_module

mod = import_module("kata.03_linked_list_traversal.03_linked_list_traversal_problem")
traverse = mod.traverse
Node = mod.Node


def test_traverse_multiple():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    assert traverse(a) == [1, 2, 3]


def test_traverse_single():
    a = Node(42)
    assert traverse(a) == [42]


def test_traverse_empty():
    assert traverse(None) == []`,
    solution: `"""Reference solution for Linked List Traversal."""

from importlib import import_module

Node = import_module("kata.03_linked_list_traversal.03_linked_list_traversal_problem").Node


def traverse(head):
    result = []
    current = head

    while current is not None:
        result.append(current.val)
        current = current.next

    return result`,
    usage: null,
  },
  {
    id: "py-04_binary_search",
    name: "Binary Search",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Kata: Binary Search
Function: binary_search(nums, target)

Given a sorted list of integers and a target value, return the index
of the target. Return -1 if not found.\\n\\nRef: LeetCode #704 Binary Search`,
    code: `def binary_search(nums, target):
    tail, head = 0, len(nums)-1

    while tail >= head:
        guess = (tail + head) // 2

        if nums[guess] == target:
            return guess
        elif nums[guess] < target:
            tail = guess + 1
        else:
            head = guess -1

    return -1`,
    testCode: `from importlib import import_module

binary_search = import_module("kata.04_binary_search.04_binary_search_problem").binary_search


def test_found_middle():
    assert binary_search([1, 3, 5, 7, 9], 5) == 2


def test_found_first():
    assert binary_search([1, 3, 5, 7, 9], 1) == 0


def test_found_last():
    assert binary_search([1, 3, 5, 7, 9], 9) == 4


def test_not_found():
    assert binary_search([1, 3, 5, 7, 9], 4) == -1


def test_empty_list():
    assert binary_search([], 1) == -1


def test_single_element_found():
    assert binary_search([5], 5) == 0


def test_single_element_not_found():
    assert binary_search([5], 3) == -1`,
    solution: `"""Reference solution for Binary Search."""


def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1

    while lo <= hi:
        mid = (lo + hi) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return -1`,
    usage: null,
  },
  {
    id: "py-05_binary_tree_dfs",
    name: "Binary Tree DFS",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Kata: Binary Tree DFS
Functions: preorder(root), inorder(root), postorder(root)

Given the root of a binary tree, return a list of values in
preorder, inorder, or postorder traversal. Implement both
iterative and recursive versions.\\n\\nRef: LeetCode #144 Binary Tree Preorder Traversal`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def preorder(root):
    if root is None:
        return []
    stack = [root]
    result = []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return result


def inorder(root):
    result = []
    stack = []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result


def postorder(root):
    if root is None:
        return []
    stack = [root]
    result = []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return result[::-1]`,
    testCode: `from importlib import import_module

mod = import_module("kata.05_binary_tree_dfs.05_binary_tree_dfs_problem")
preorder = mod.preorder
inorder = mod.inorder
postorder = mod.postorder
Node = mod.Node


def _build_tree():
    #       1
    #      / \\
    #     2   3
    #    / \\
    #   4   5
    a = Node(1)
    b = Node(2)
    c = Node(3)
    d = Node(4)
    e = Node(5)
    a.left = b
    a.right = c
    b.left = d
    b.right = e
    return a


def test_preorder():
    assert preorder(_build_tree()) == [1, 2, 4, 5, 3]


def test_preorder_empty():
    assert preorder(None) == []


def test_inorder():
    assert inorder(_build_tree()) == [4, 2, 5, 1, 3]


def test_inorder_empty():
    assert inorder(None) == []


def test_postorder():
    assert postorder(_build_tree()) == [4, 5, 2, 3, 1]


def test_postorder_empty():
    assert postorder(None) == []


def test_single_node():
    n = Node(42)
    assert preorder(n) == [42]
    assert inorder(n) == [42]
    assert postorder(n) == [42]`,
    solution: `"""Reference solution for Binary Tree DFS."""

from importlib import import_module

Node = import_module("kata.05_binary_tree_dfs.05_binary_tree_dfs_problem").Node


def preorder(root):
    if root is None:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)


def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)


def postorder(root):
    if root is None:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]`,
    usage: null,
  },
  {
    id: "py-06_graph_dfs",
    name: "Graph DFS",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Graph DFS
Function: graph_dfs(graph, start)

Given an adjacency list (dict) and a start node, return a list of
all reachable nodes visited in depth-first order.\\n\\nRef: LeetCode #323 Number of Connected Components (closest match)`,
    code: `def graph_dfs(graph, start):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

graph_dfs = import_module("kata.06_graph_dfs.06_graph_dfs_problem").graph_dfs


def test_simple_graph():
    graph = {
        "a": ["b", "c"],
        "b": ["d"],
        "c": [],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert result[0] == "a"
    assert set(result) == {"a", "b", "c", "d"}


def test_single_node():
    graph = {"a": []}
    assert graph_dfs(graph, "a") == ["a"]


def test_disconnected():
    graph = {
        "a": ["b"],
        "b": [],
        "c": ["d"],
        "d": [],
    }
    result = graph_dfs(graph, "a")
    assert set(result) == {"a", "b"}`,
    solution: `"""Reference solution for Graph DFS."""


def graph_dfs(graph, start):
    visited = set()
    result = []
    stack = [start]

    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        result.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)

    return result`,
    usage: null,
  },
  {
    id: "py-07_build_adjacency_list",
    name: "Build Adjacency List",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Build Adjacency List
Function: build_adjacency_list(edges, directed=False)

Given a list of edges (tuples of two nodes), return an adjacency list
as a dict. If directed is False, add edges in both directions.\\n\\nRef: LeetCode #133 Clone Graph (closest match)`,
    code: `def build_adjacency_list(edges, directed=False):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

build_adjacency_list = import_module("kata.07_build_adjacency_list.07_build_adjacency_list_problem").build_adjacency_list


def test_undirected():
    edges = [("a", "b"), ("b", "c")]
    result = build_adjacency_list(edges)
    assert "b" in result["a"]
    assert "a" in result["b"]
    assert "c" in result["b"]
    assert "b" in result["c"]


def test_directed():
    edges = [("a", "b"), ("b", "c")]
    result = build_adjacency_list(edges, directed=True)
    assert result["a"] == ["b"]
    assert result["b"] == ["c"]
    assert "a" not in result.get("b", []) or result["b"] == ["c"]
    assert "c" not in result


def test_empty():
    result = build_adjacency_list([])
    assert result == {}`,
    solution: `"""Reference solution for Build Adjacency List."""

from collections import defaultdict


def build_adjacency_list(edges, directed=False):
    graph = defaultdict(list)

    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)

    return dict(graph)`,
    usage: null,
  },
  {
    id: "py-08_matrix_dfs",
    name: "Matrix DFS",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Matrix DFS
Function: matrix_dfs(grid, start)

Given a 2D grid and a starting position (row, col), return a list of
positions visited in depth-first order. Only traverse cells with value 0
(passable). Cells with value 1 are walls.\\n\\nRef: LeetCode #200 Number of Islands`,
    code: `def matrix_dfs(grid, start):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

matrix_dfs = import_module("kata.08_matrix_dfs.08_matrix_dfs_problem").matrix_dfs


def test_simple():
    grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result[0] == (0, 0)
    assert len(result) == 8


def test_blocked():
    grid = [
        [0, 1],
        [1, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_single_cell():
    grid = [[0]]
    result = matrix_dfs(grid, (0, 0))
    assert result == [(0, 0)]


def test_all_open():
    grid = [
        [0, 0],
        [0, 0],
    ]
    result = matrix_dfs(grid, (0, 0))
    assert len(result) == 4
    assert result[0] == (0, 0)`,
    solution: `"""Reference solution for Matrix DFS."""


def matrix_dfs(grid, start):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    result = []

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if (r, c) in visited or grid[r][c] == 1:
            return

        visited.add((r, c))
        result.append((r, c))

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            dfs(r + dr, c + dc)

    dfs(*start)
    return result`,
    usage: null,
  },
  {
    id: "py-09_topological_sort",
    name: "Topological Sort",
    category: "advanced-graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Topological Sort
Function: topological_sort(graph)

Given a directed acyclic graph as an adjacency list (dict mapping node
to list of dependencies it points to), return a valid topological
ordering as a list.\\n\\nRef: LeetCode #210 Course Schedule II`,
    code: `def topological_sort(graph):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

topological_sort = import_module("kata.09_topological_sort.09_topological_sort_problem").topological_sort


def test_simple_dag():
    graph = {
        "a": ["b", "c"],
        "b": ["d"],
        "c": ["d"],
        "d": [],
    }
    result = topological_sort(graph)
    assert len(result) == 4
    assert result.index("a") < result.index("b")
    assert result.index("a") < result.index("c")
    assert result.index("b") < result.index("d")
    assert result.index("c") < result.index("d")


def test_linear():
    graph = {"a": ["b"], "b": ["c"], "c": []}
    result = topological_sort(graph)
    assert result == ["a", "b", "c"]


def test_no_edges():
    graph = {"a": [], "b": [], "c": []}
    result = topological_sort(graph)
    assert set(result) == {"a", "b", "c"}`,
    solution: `"""Reference solution for Topological Sort."""


def topological_sort(graph):
    visited = set()
    order = []

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph.get(node, []):
            dfs(neighbor)
        order.append(node)

    for node in graph:
        dfs(node)

    order.reverse()
    return order`,
    usage: null,
  },
  {
    id: "py-10_reverse_linked_list",
    name: "Reverse Linked List",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Kata: Reverse Linked List
Functions: reverse_iterative(head), reverse_recursive(head)

Given the head of a singly linked list, reverse it and return the
new head. Implement both iterative and recursive versions.\\n\\nRef: LeetCode #206 Reverse Linked List`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def reverse_iterative(head):
    raise NotImplementedError


def reverse_recursive(head):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.10_reverse_linked_list.10_reverse_linked_list_problem")
reverse_iterative = mod.reverse_iterative
reverse_recursive = mod.reverse_recursive
Node = mod.Node


def _build(values):
    head = None
    for v in reversed(values):
        n = Node(v)
        n.next = head
        head = n
    return head


def _to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


def test_reverse_iterative():
    head = _build([1, 2, 3, 4])
    result = reverse_iterative(head)
    assert _to_list(result) == [4, 3, 2, 1]


def test_reverse_iterative_single():
    head = _build([1])
    result = reverse_iterative(head)
    assert _to_list(result) == [1]


def test_reverse_iterative_empty():
    assert reverse_iterative(None) is None


def test_reverse_recursive():
    head = _build([1, 2, 3, 4])
    result = reverse_recursive(head)
    assert _to_list(result) == [4, 3, 2, 1]


def test_reverse_recursive_single():
    head = _build([1])
    result = reverse_recursive(head)
    assert _to_list(result) == [1]


def test_reverse_recursive_empty():
    assert reverse_recursive(None) is None`,
    solution: `"""Reference solution for Reverse Linked List."""

from importlib import import_module

Node = import_module("kata.10_reverse_linked_list.10_reverse_linked_list_problem").Node


def reverse_iterative(head):
    prev = None
    current = head

    while current is not None:
        nxt = current.next
        current.next = prev
        prev = current
        current = nxt

    return prev


def reverse_recursive(head):
    if head is None or head.next is None:
        return head

    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
    usage: null,
  },
  {
    id: "py-11_linked_list_cycle",
    name: "Linked List Cycle Detection",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Kata: Linked List Cycle Detection
Function: has_cycle(head)

Given the head of a singly linked list, return True if there is a
cycle, False otherwise. Use Floyd's tortoise and hare algorithm.\\n\\nRef: LeetCode #141 Linked List Cycle`,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None


def has_cycle(head):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.11_linked_list_cycle.11_linked_list_cycle_problem")
has_cycle = mod.has_cycle
Node = mod.Node


def test_no_cycle():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    assert has_cycle(a) is False


def test_has_cycle():
    a = Node(1)
    b = Node(2)
    c = Node(3)
    a.next = b
    b.next = c
    c.next = a
    assert has_cycle(a) is True


def test_self_cycle():
    a = Node(1)
    a.next = a
    assert has_cycle(a) is True


def test_empty():
    assert has_cycle(None) is False


def test_single_no_cycle():
    a = Node(1)
    assert has_cycle(a) is False`,
    solution: `"""Reference solution for Linked List Cycle Detection."""


def has_cycle(head):
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True

    return False`,
    usage: null,
  },
  {
    id: "py-12_two_pointer_remove_dupes",
    name: "Two Pointer Remove Duplicates",
    category: "two-pointers",
    language: "python",
    difficulty: "medium",
    description: `Kata: Two Pointer Remove Duplicates
Function: remove_duplicates(nums)

Given a sorted list of integers, remove duplicates in-place and return
the number of unique elements. The first k elements of the list should
contain the unique values.\\n\\nRef: LeetCode #26 Remove Duplicates from Sorted Array`,
    code: `def remove_duplicates(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

remove_duplicates = import_module("kata.12_two_pointer_remove_dupes.12_two_pointer_remove_dupes_problem").remove_duplicates


def test_basic():
    nums = [1, 1, 2, 3, 3]
    k = remove_duplicates(nums)
    assert k == 3
    assert nums[:k] == [1, 2, 3]


def test_no_dupes():
    nums = [1, 2, 3]
    k = remove_duplicates(nums)
    assert k == 3
    assert nums[:k] == [1, 2, 3]


def test_all_same():
    nums = [5, 5, 5, 5]
    k = remove_duplicates(nums)
    assert k == 1
    assert nums[:k] == [5]


def test_empty():
    nums = []
    k = remove_duplicates(nums)
    assert k == 0


def test_single():
    nums = [7]
    k = remove_duplicates(nums)
    assert k == 1
    assert nums[:k] == [7]`,
    solution: `"""Reference solution for Two Pointer Remove Duplicates."""


def remove_duplicates(nums):
    if not nums:
        return 0

    write = 0

    for read in range(1, len(nums)):
        if nums[read] != nums[write]:
            write += 1
            nums[write] = nums[read]

    return write + 1`,
    usage: null,
  },
  {
    id: "py-13_sliding_window_max_sum",
    name: "Sliding Window Max Sum",
    category: "sliding-window",
    language: "python",
    difficulty: "medium",
    description: `Kata: Sliding Window Max Sum
Function: max_subarray_sum(nums, k)

Given a list of integers and a window size k, return the maximum sum
of any contiguous subarray of length k.\\n\\nRef: LeetCode #2461 Maximum Sum of Distinct Subarrays With Length K`,
    code: `def max_subarray_sum(nums, k):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

max_subarray_sum = import_module("kata.13_sliding_window_max_sum.13_sliding_window_max_sum_problem").max_subarray_sum


def test_basic():
    assert max_subarray_sum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4) == 24


def test_window_is_full_array():
    assert max_subarray_sum([1, 2, 3], 3) == 6


def test_window_of_one():
    assert max_subarray_sum([5, 1, 8, 3], 1) == 8


def test_negative_values():
    assert max_subarray_sum([-1, -2, -3, -4], 2) == -3


def test_mixed():
    assert max_subarray_sum([2, -1, 5, -3, 4], 3) == 6`,
    solution: `"""Reference solution for Sliding Window Max Sum."""


def max_subarray_sum(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum`,
    usage: null,
  },
  {
    id: "py-14_frequency_count",
    name: "Frequency Count",
    category: "arrays-and-hashing",
    language: "python",
    difficulty: "medium",
    description: `Kata: Frequency Count
Functions: frequency_count(items), most_frequent(items)

Given a list of items, return a dict mapping each item to its count.
Also implement most_frequent which returns the item with the highest count.\\n\\nRef: LeetCode #1207 Unique Number of Occurrences (closest match)`,
    code: `def frequency_count(items):
    raise NotImplementedError


def most_frequent(items):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.14_frequency_count.14_frequency_count_problem")
frequency_count = mod.frequency_count
most_frequent = mod.most_frequent


def test_frequency_count():
    assert frequency_count(["a", "b", "a", "c", "a", "b"]) == {"a": 3, "b": 2, "c": 1}


def test_frequency_count_single():
    assert frequency_count(["x"]) == {"x": 1}


def test_frequency_count_numbers():
    assert frequency_count([1, 2, 2, 3, 3, 3]) == {1: 1, 2: 2, 3: 3}


def test_most_frequent():
    assert most_frequent(["a", "b", "a", "c", "a", "b"]) == "a"


def test_most_frequent_numbers():
    assert most_frequent([1, 2, 2, 3, 3, 3]) == 3`,
    solution: `"""Reference solution for Frequency Count."""


def frequency_count(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts


def most_frequent(items):
    counts = frequency_count(items)
    return max(counts, key=counts.get)`,
    usage: null,
  },
  {
    id: "py-15_merge_sorted_arrays",
    name: "Merge Two Sorted Arrays",
    category: "two-pointers",
    language: "python",
    difficulty: "medium",
    description: `Kata: Merge Two Sorted Arrays
Function: merge_sorted(a, b)

Given two sorted lists of integers, return a single sorted list
containing all elements from both. Do not use built-in sort.\\n\\nRef: LeetCode #88 Merge Sorted Array`,
    code: `def merge_sorted(a, b):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

merge_sorted = import_module("kata.15_merge_sorted_arrays.15_merge_sorted_arrays_problem").merge_sorted


def test_basic():
    assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]


def test_different_lengths():
    assert merge_sorted([1, 2], [3, 4, 5, 6]) == [1, 2, 3, 4, 5, 6]


def test_one_empty():
    assert merge_sorted([], [1, 2, 3]) == [1, 2, 3]
    assert merge_sorted([1, 2, 3], []) == [1, 2, 3]


def test_both_empty():
    assert merge_sorted([], []) == []


def test_duplicates():
    assert merge_sorted([1, 3, 3], [2, 3, 4]) == [1, 2, 3, 3, 3, 4]


def test_negatives():
    assert merge_sorted([-5, -1, 3], [-3, 0, 2]) == [-5, -3, -1, 0, 2, 3]`,
    solution: `"""Reference solution for Merge Two Sorted Arrays."""


def merge_sorted(a, b):
    result = []
    i, j = 0, 0

    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1

    result.extend(a[i:])
    result.extend(b[j:])
    return result`,
    usage: null,
  },
  {
    id: "py-16_min_heap",
    name: "Min Heap",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Kata: Min Heap
Class: MinHeap with insert(val) and extract_min()

Implement a min heap from scratch. Do not use heapq.
- insert(val): add a value and bubble up
- extract_min(): remove and return the smallest value, then bubble down
- peek(): return the smallest value without removing\\n\\nRef: LeetCode #703 Kth Largest Element in a Stream (closest match)`,
    code: `class MinHeap:
    def __init__(self):
        self.data = []

    def insert(self, val):
        raise NotImplementedError

    def extract_min(self):
        raise NotImplementedError

    def peek(self):
        raise NotImplementedError

    def __len__(self):
        return len(self.data)`,
    testCode: `from importlib import import_module

import pytest

MinHeap = import_module("kata.16_min_heap.16_min_heap_problem").MinHeap


def test_insert_and_peek():
    h = MinHeap()
    h.insert(5)
    h.insert(3)
    h.insert(7)
    assert h.peek() == 3


def test_extract_min():
    h = MinHeap()
    for val in [5, 3, 7, 1, 4]:
        h.insert(val)

    assert h.extract_min() == 1
    assert h.extract_min() == 3
    assert h.extract_min() == 4
    assert h.extract_min() == 5
    assert h.extract_min() == 7


def test_extract_from_empty():
    h = MinHeap()
    with pytest.raises(IndexError):
        h.extract_min()


def test_peek_empty():
    h = MinHeap()
    with pytest.raises(IndexError):
        h.peek()


def test_len():
    h = MinHeap()
    assert len(h) == 0
    h.insert(1)
    h.insert(2)
    assert len(h) == 2
    h.extract_min()
    assert len(h) == 1


def test_insert_duplicates():
    h = MinHeap()
    h.insert(3)
    h.insert(3)
    h.insert(3)
    assert h.extract_min() == 3
    assert h.extract_min() == 3
    assert h.extract_min() == 3`,
    solution: `"""Reference solution for Min Heap."""


class MinHeap:
    def __init__(self):
        self.data = []

    def insert(self, val):
        self.data.append(val)
        self._bubble_up(len(self.data) - 1)

    def extract_min(self):
        if not self.data:
            raise IndexError("extract from empty heap")

        self._swap(0, len(self.data) - 1)
        val = self.data.pop()
        if self.data:
            self._bubble_down(0)
        return val

    def peek(self):
        if not self.data:
            raise IndexError("peek at empty heap")
        return self.data[0]

    def __len__(self):
        return len(self.data)

    def _bubble_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.data[i] < self.data[parent]:
                self._swap(i, parent)
                i = parent
            else:
                break

    def _bubble_down(self, i):
        size = len(self.data)
        while True:
            smallest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < size and self.data[left] < self.data[smallest]:
                smallest = left
            if right < size and self.data[right] < self.data[smallest]:
                smallest = right

            if smallest == i:
                break

            self._swap(i, smallest)
            i = smallest

    def _swap(self, i, j):
        self.data[i], self.data[j] = self.data[j], self.data[i]`,
    usage: null,
  },
  {
    id: "py-17_balanced_parentheses",
    name: "Balanced Parentheses",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Kata: Balanced Parentheses
Function: is_balanced(s)

Given a string containing only '(', ')', '{', '}', '[', ']',
return True if the brackets are balanced, False otherwise.\\n\\nRef: LeetCode #20 Valid Parentheses`,
    code: `def is_balanced(s):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

is_balanced = import_module("kata.17_balanced_parentheses.17_balanced_parentheses_problem").is_balanced


def test_balanced_simple():
    assert is_balanced("()") is True


def test_balanced_nested():
    assert is_balanced("({[]})") is True


def test_balanced_multiple():
    assert is_balanced("()[]{}") is True


def test_unbalanced_close():
    assert is_balanced("(]") is False


def test_unbalanced_open():
    assert is_balanced("(") is False


def test_unbalanced_extra_close():
    assert is_balanced("())") is False


def test_empty():
    assert is_balanced("") is True


def test_complex():
    assert is_balanced("{[()]}[{}]") is True`,
    solution: `def is_balanced(s):
    stack = []
    pairs = {")": "(", "}": "{", "]": "["}
    for ch in s:
        if ch in "({[":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0`,
    usage: null,
  },
  {
    id: "py-18_queue_from_stacks",
    name: "Queue from Two Stacks",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Kata: Queue from Two Stacks
Class: Queue

Implement a FIFO queue using two stacks (Python lists).
Methods: enqueue(val), dequeue(), peek(), is_empty().\\n\\nRef: LeetCode #232 Implement Queue using Stacks`,
    code: `class Queue:
    def __init__(self):
        raise NotImplementedError

    def enqueue(self, val):
        raise NotImplementedError

    def dequeue(self):
        raise NotImplementedError

    def peek(self):
        raise NotImplementedError

    def is_empty(self):
        raise NotImplementedError`,
    testCode: `from importlib import import_module

Queue = import_module("kata.18_queue_from_stacks.18_queue_from_stacks_problem").Queue


def test_enqueue_dequeue():
    q = Queue()
    q.enqueue(1)
    q.enqueue(2)
    assert q.dequeue() == 1
    assert q.dequeue() == 2


def test_fifo_order():
    q = Queue()
    q.enqueue(10)
    q.enqueue(20)
    q.enqueue(30)
    assert q.dequeue() == 10
    assert q.dequeue() == 20
    assert q.dequeue() == 30


def test_peek():
    q = Queue()
    q.enqueue(5)
    q.enqueue(10)
    assert q.peek() == 5
    q.dequeue()
    assert q.peek() == 10


def test_is_empty():
    q = Queue()
    assert q.is_empty() is True
    q.enqueue(1)
    assert q.is_empty() is False
    q.dequeue()
    assert q.is_empty() is True


def test_interleaved():
    q = Queue()
    q.enqueue(1)
    q.enqueue(2)
    assert q.dequeue() == 1
    q.enqueue(3)
    assert q.dequeue() == 2
    assert q.dequeue() == 3`,
    solution: `class Queue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, val):
        self.in_stack.append(val)

    def _transfer(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def dequeue(self):
        self._transfer()
        return self.out_stack.pop()

    def peek(self):
        self._transfer()
        return self.out_stack[-1]

    def is_empty(self):
        return not self.in_stack and not self.out_stack`,
    usage: null,
  },
  {
    id: "py-19_trie",
    name: "Trie",
    category: "tries",
    language: "python",
    difficulty: "medium",
    description: `Kata: Trie
Class: Trie

Implement a trie with insert(word), search(word), and starts_with(prefix).
search returns True if exact word exists. starts_with returns True if any
word starts with the prefix.\\n\\nRef: LeetCode #208 Implement Trie (Prefix Tree)`,
    code: `class Trie:
    def __init__(self):
        raise NotImplementedError

    def insert(self, word):
        raise NotImplementedError

    def search(self, word):
        raise NotImplementedError

    def starts_with(self, prefix):
        raise NotImplementedError`,
    testCode: `from importlib import import_module

Trie = import_module("kata.19_trie.19_trie_problem").Trie


def test_insert_search():
    t = Trie()
    t.insert("apple")
    assert t.search("apple") is True


def test_search_missing():
    t = Trie()
    t.insert("apple")
    assert t.search("app") is False


def test_starts_with():
    t = Trie()
    t.insert("apple")
    assert t.starts_with("app") is True


def test_starts_with_missing():
    t = Trie()
    t.insert("apple")
    assert t.starts_with("ban") is False


def test_multiple_words():
    t = Trie()
    t.insert("apple")
    t.insert("app")
    assert t.search("app") is True
    assert t.search("apple") is True


def test_empty_search():
    t = Trie()
    assert t.search("anything") is False`,
    solution: `class Trie:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def insert(self, word):
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._find(prefix) is not None

    def _find(self, prefix):
        node = self
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node`,
    usage: null,
  },
  {
    id: "py-20_union_find",
    name: "Union Find",
    category: "advanced-graphs",
    language: "python",
    difficulty: "medium",
    description: `Kata: Union Find
Class: UnionFind

Implement union-find (disjoint set) with path compression and union by rank.
Methods: find(x), union(x, y), connected(x, y).
Initialize with n elements (0 to n-1).\\n\\nRef: LeetCode #684 Redundant Connection (closest match)`,
    code: `class UnionFind:
    def __init__(self, n):
        raise NotImplementedError

    def find(self, x):
        raise NotImplementedError

    def union(self, x, y):
        raise NotImplementedError

    def connected(self, x, y):
        raise NotImplementedError`,
    testCode: `from importlib import import_module

UnionFind = import_module("kata.20_union_find.20_union_find_problem").UnionFind


def test_initially_disconnected():
    uf = UnionFind(5)
    assert uf.connected(0, 1) is False


def test_union_connects():
    uf = UnionFind(5)
    uf.union(0, 1)
    assert uf.connected(0, 1) is True


def test_transitive():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(1, 2)
    assert uf.connected(0, 2) is True


def test_separate_components():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(3, 4)
    assert uf.connected(0, 4) is False


def test_merge_components():
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(3, 4)
    uf.union(1, 3)
    assert uf.connected(0, 4) is True


def test_self_connected():
    uf = UnionFind(3)
    assert uf.connected(0, 0) is True`,
    solution: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1

    def connected(self, x, y):
        return self.find(x) == self.find(y)`,
    usage: null,
  },
  {
    id: "py-21_merge_sort",
    name: "Merge Sort",
    category: "arrays-and-hashing",
    language: "python",
    difficulty: "medium",
    description: `Kata: Merge Sort
Function: merge_sort(arr)

Sort an array using merge sort. Return a new sorted list.\\n\\nRef: LeetCode #912 Sort an Array`,
    code: `def merge_sort(arr):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

merge_sort = import_module("kata.21_merge_sort.21_merge_sort_problem").merge_sort


def test_basic():
    assert merge_sort([3, 1, 2]) == [1, 2, 3]


def test_already_sorted():
    assert merge_sort([1, 2, 3, 4]) == [1, 2, 3, 4]


def test_reversed():
    assert merge_sort([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]


def test_duplicates():
    assert merge_sort([3, 1, 3, 1, 2]) == [1, 1, 2, 3, 3]


def test_single():
    assert merge_sort([1]) == [1]


def test_empty():
    assert merge_sort([]) == []


def test_negatives():
    assert merge_sort([-3, 0, 2, -1]) == [-3, -1, 0, 2]`,
    solution: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)


def _merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    usage: null,
  },
  {
    id: "py-22_quick_sort_partition",
    name: "Quick Sort Partition",
    category: "arrays-and-hashing",
    language: "python",
    difficulty: "medium",
    description: `Kata: Quick Sort Partition
Functions: partition(arr, lo, hi), quick_sort(arr)

Implement Lomuto partition and quicksort. Sort in-place.
partition returns the final pivot index.
quick_sort sorts the array in-place and returns it.\\n\\nRef: LeetCode #912 Sort an Array`,
    code: `def partition(arr, lo, hi):
    raise NotImplementedError


def quick_sort(arr):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.22_quick_sort_partition.22_quick_sort_partition_problem")
partition = mod.partition
quick_sort = mod.quick_sort


def test_partition():
    arr = [3, 6, 8, 10, 1, 2, 1]
    p = partition(arr, 0, len(arr) - 1)
    pivot_val = arr[p]
    assert all(arr[i] <= pivot_val for i in range(p))
    assert all(arr[i] >= pivot_val for i in range(p, len(arr)))


def test_quick_sort_basic():
    assert quick_sort([3, 1, 2]) == [1, 2, 3]


def test_quick_sort_reversed():
    assert quick_sort([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]


def test_quick_sort_duplicates():
    assert quick_sort([3, 1, 3, 1, 2]) == [1, 1, 2, 3, 3]


def test_quick_sort_single():
    assert quick_sort([1]) == [1]


def test_quick_sort_empty():
    assert quick_sort([]) == []`,
    solution: `def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i


def quick_sort(arr):
    _qs(arr, 0, len(arr) - 1)
    return arr


def _qs(arr, lo, hi):
    if lo < hi:
        p = partition(arr, lo, hi)
        _qs(arr, lo, p - 1)
        _qs(arr, p + 1, hi)`,
    usage: null,
  },
  {
    id: "py-23_permutations",
    name: "Permutations",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Kata: Permutations
Function: permutations(nums)

Given a list of distinct integers, return all possible permutations.\\n\\nRef: LeetCode #46 Permutations`,
    code: `def permutations(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

permutations = import_module("kata.23_permutations.23_permutations_problem").permutations


def test_three_elements():
    result = permutations([1, 2, 3])
    assert sorted(result) == sorted([
        [1, 2, 3], [1, 3, 2], [2, 1, 3],
        [2, 3, 1], [3, 1, 2], [3, 2, 1],
    ])


def test_two_elements():
    result = permutations([1, 2])
    assert sorted(result) == sorted([[1, 2], [2, 1]])


def test_single():
    assert permutations([1]) == [[1]]


def test_empty():
    assert permutations([]) == [[]]


def test_count():
    result = permutations([1, 2, 3, 4])
    assert len(result) == 24`,
    solution: `def permutations(nums):
    result = []

    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i + 1:])
            path.pop()

    backtrack([], nums)
    return result`,
    usage: null,
  },
  {
    id: "py-24_subsets",
    name: "Subsets",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Kata: Subsets
Function: subsets(nums)

Given a list of distinct integers, return all possible subsets (power set).\\n\\nRef: LeetCode #78 Subsets`,
    code: `def subsets(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

subsets = import_module("kata.24_subsets.24_subsets_problem").subsets


def test_three_elements():
    result = subsets([1, 2, 3])
    assert sorted(result) == sorted([
        [], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3],
    ])


def test_two_elements():
    result = subsets([1, 2])
    assert sorted(result) == sorted([[], [1], [2], [1, 2]])


def test_single():
    result = subsets([1])
    assert sorted(result) == sorted([[], [1]])


def test_empty():
    assert subsets([]) == [[]]


def test_count():
    result = subsets([1, 2, 3, 4])
    assert len(result) == 16`,
    solution: `def subsets(nums):
    result = []

    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result`,
    usage: null,
  },
  {
    id: "py-25_two_sum",
    name: "Two Sum",
    category: "arrays-and-hashing",
    language: "python",
    difficulty: "medium",
    description: `Kata: Two Sum
Function: two_sum(nums, target)

Given a list of integers and a target, return the indices of the two
numbers that add up to target. Assume exactly one solution exists.\\n\\nRef: LeetCode #1 Two Sum`,
    code: `def two_sum(nums, target):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

two_sum = import_module("kata.25_two_sum.25_two_sum_problem").two_sum


def test_basic():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]


def test_middle():
    result = two_sum([3, 2, 4], 6)
    assert sorted(result) == [1, 2]


def test_duplicates():
    assert two_sum([3, 3], 6) == [0, 1]


def test_negative():
    result = two_sum([-1, -2, -3, -4, -5], -8)
    assert sorted(result) == [2, 4]`,
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
    usage: null,
  },
  {
    id: "py-26_kadanes_algorithm",
    name: "Kadane's Algorithm",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Kata: Kadane's Algorithm
Function: max_subarray_sum(nums)

Given an integer array, find the contiguous subarray with the largest sum
and return that sum. Array has at least one element.\\n\\nRef: LeetCode #53 Maximum Subarray`,
    code: `def max_subarray_sum(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

max_subarray_sum = import_module("kata.26_kadanes_algorithm.26_kadanes_algorithm_problem").max_subarray_sum


def test_mixed():
    assert max_subarray_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6


def test_all_negative():
    assert max_subarray_sum([-3, -1, -2]) == -1


def test_all_positive():
    assert max_subarray_sum([1, 2, 3]) == 6


def test_single():
    assert max_subarray_sum([5]) == 5


def test_single_negative():
    assert max_subarray_sum([-5]) == -5


def test_zero_crossing():
    assert max_subarray_sum([-1, 2, 3, -4, 5]) == 6`,
    solution: `def max_subarray_sum(nums):
    max_sum = nums[0]
    current = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
    usage: null,
  },
  {
    id: "py-27_prefix_sum",
    name: "Prefix Sum",
    category: "arrays-and-hashing",
    language: "python",
    difficulty: "medium",
    description: `Kata: Prefix Sum
Functions: build_prefix(nums), range_sum(prefix, left, right)

build_prefix returns a prefix sum array where prefix[i] = sum of nums[0..i-1].
prefix[0] = 0, so prefix has length len(nums) + 1.
range_sum returns sum of nums[left..right] inclusive using the prefix array.\\n\\nRef: LeetCode #1480 Running Sum of 1d Array`,
    code: `def build_prefix(nums):
    raise NotImplementedError


def range_sum(prefix, left, right):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.27_prefix_sum.27_prefix_sum_problem")
build_prefix = mod.build_prefix
range_sum = mod.range_sum


def test_build_prefix():
    assert build_prefix([1, 2, 3, 4]) == [0, 1, 3, 6, 10]


def test_build_prefix_empty():
    assert build_prefix([]) == [0]


def test_range_sum_full():
    prefix = build_prefix([1, 2, 3, 4])
    assert range_sum(prefix, 0, 3) == 10


def test_range_sum_middle():
    prefix = build_prefix([1, 2, 3, 4])
    assert range_sum(prefix, 1, 2) == 5


def test_range_sum_single():
    prefix = build_prefix([1, 2, 3, 4])
    assert range_sum(prefix, 2, 2) == 3


def test_range_sum_first():
    prefix = build_prefix([5, 3, 7])
    assert range_sum(prefix, 0, 0) == 5`,
    solution: `def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    return prefix


def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]`,
    usage: null,
  },
  {
    id: "py-28_merge_intervals",
    name: "Merge Intervals",
    category: "intervals",
    language: "python",
    difficulty: "medium",
    description: `Kata: Merge Intervals
Function: merge(intervals)

Given a list of intervals [start, end], merge all overlapping intervals
and return the result sorted by start.\\n\\nRef: LeetCode #56 Merge Intervals`,
    code: `def merge(intervals):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

merge = import_module("kata.28_merge_intervals.28_merge_intervals_problem").merge


def test_overlapping():
    assert merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]


def test_adjacent():
    assert merge([[1, 4], [4, 5]]) == [[1, 5]]


def test_no_overlap():
    assert merge([[1, 2], [4, 5]]) == [[1, 2], [4, 5]]


def test_single():
    assert merge([[1, 5]]) == [[1, 5]]


def test_empty():
    assert merge([]) == []


def test_all_overlapping():
    assert merge([[1, 4], [2, 3], [3, 6]]) == [[1, 6]]


def test_unsorted():
    assert merge([[3, 4], [1, 2], [2, 3]]) == [[1, 4]]`,
    solution: `def merge(intervals):
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    usage: null,
  },
  {
    id: "py-29_monotonic_stack",
    name: "Monotonic Stack",
    category: "stack",
    language: "python",
    difficulty: "medium",
    description: `Kata: Monotonic Stack
Function: next_greater_element(nums)

Given a list of integers, return a list where each element is the next
greater element to the right. If none exists, use -1.
Example: [2, 1, 2, 4, 3] -> [4, 2, 4, -1, -1]\\n\\nRef: LeetCode #496 Next Greater Element I`,
    code: `def next_greater_element(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

next_greater_element = import_module("kata.29_monotonic_stack.29_monotonic_stack_problem").next_greater_element


def test_basic():
    assert next_greater_element([2, 1, 2, 4, 3]) == [4, 2, 4, -1, -1]


def test_descending():
    assert next_greater_element([5, 4, 3, 2, 1]) == [-1, -1, -1, -1, -1]


def test_ascending():
    assert next_greater_element([1, 2, 3, 4, 5]) == [2, 3, 4, 5, -1]


def test_single():
    assert next_greater_element([1]) == [-1]


def test_duplicates():
    assert next_greater_element([1, 1, 1, 2]) == [2, 2, 2, -1]`,
    solution: `def next_greater_element(nums):
    result = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[i] > nums[stack[-1]]:
            result[stack.pop()] = nums[i]
        stack.append(i)
    return result`,
    usage: null,
  },
  {
    id: "py-30_binary_search_first_last",
    name: "Binary Search First/Last",
    category: "binary-search",
    language: "python",
    difficulty: "medium",
    description: `Kata: Binary Search First/Last
Functions: find_first(nums, target), find_last(nums, target)

Given a sorted array and a target, find the first and last index of target.
Return -1 if not found.\\n\\nRef: LeetCode #34 Find First and Last Position of Element in Sorted Array`,
    code: `def find_first(nums, target):
    raise NotImplementedError


def find_last(nums, target):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

mod = import_module("kata.30_binary_search_first_last.30_binary_search_first_last_problem")
find_first = mod.find_first
find_last = mod.find_last


def test_find_first():
    assert find_first([1, 2, 2, 2, 3], 2) == 1


def test_find_last():
    assert find_last([1, 2, 2, 2, 3], 2) == 3


def test_not_found():
    assert find_first([1, 3, 5], 2) == -1
    assert find_last([1, 3, 5], 2) == -1


def test_single_match():
    assert find_first([1, 2, 3], 2) == 1
    assert find_last([1, 2, 3], 2) == 1


def test_all_same():
    assert find_first([2, 2, 2], 2) == 0
    assert find_last([2, 2, 2], 2) == 2


def test_empty():
    assert find_first([], 1) == -1
    assert find_last([], 1) == -1


def test_edges():
    assert find_first([1, 2, 3], 1) == 0
    assert find_last([1, 2, 3], 3) == 2`,
    solution: `def find_first(nums, target):
    lo, hi = 0, len(nums) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            result = mid
            hi = mid - 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result


def find_last(nums, target):
    lo, hi = 0, len(nums) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            result = mid
            lo = mid + 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    usage: null,
  },
  {
    id: "py-31_single_number_xor",
    name: "Single Number XOR",
    category: "bit-manipulation",
    language: "python",
    difficulty: "medium",
    description: `Kata: Single Number (XOR)
Function: single_number(nums)

Given a list where every element appears twice except one, find that single one.
Must be O(n) time, O(1) space.\\n\\nRef: LeetCode #136 Single Number`,
    code: `def single_number(nums):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

single_number = import_module("kata.31_single_number_xor.31_single_number_xor_problem").single_number


def test_basic():
    assert single_number([2, 2, 1]) == 1


def test_middle():
    assert single_number([4, 1, 2, 1, 2]) == 4


def test_single():
    assert single_number([1]) == 1


def test_larger():
    assert single_number([10, 20, 10, 30, 20]) == 30`,
    solution: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    usage: null,
  },
  {
    id: "py-32_count_set_bits",
    name: "Count Set Bits",
    category: "bit-manipulation",
    language: "python",
    difficulty: "medium",
    description: `Kata: Count Set Bits
Function: count_bits(n)

Given a non-negative integer, return the number of 1 bits in its
binary representation (Hamming weight).\\n\\nRef: LeetCode #191 Number of 1 Bits`,
    code: `def count_bits(n):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

count_bits = import_module("kata.32_count_set_bits.32_count_set_bits_problem").count_bits


def test_zero():
    assert count_bits(0) == 0


def test_one():
    assert count_bits(1) == 1


def test_three():
    assert count_bits(3) == 2  # 11


def test_seven():
    assert count_bits(7) == 3  # 111


def test_eight():
    assert count_bits(8) == 1  # 1000


def test_255():
    assert count_bits(255) == 8  # 11111111


def test_large():
    assert count_bits(1023) == 10  # 1111111111`,
    solution: `def count_bits(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
    usage: null,
  },
  {
    id: "py-33_climbing_stairs",
    name: "Climbing Stairs",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Kata: Climbing Stairs
Function: climb_stairs(n)

You can climb 1 or 2 steps at a time. Given n steps,
return the number of distinct ways to reach the top.\\n\\nRef: LeetCode #70 Climbing Stairs`,
    code: `def climb_stairs(n):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

climb_stairs = import_module("kata.33_climbing_stairs.33_climbing_stairs_problem").climb_stairs


def test_one():
    assert climb_stairs(1) == 1


def test_two():
    assert climb_stairs(2) == 2


def test_three():
    assert climb_stairs(3) == 3


def test_four():
    assert climb_stairs(4) == 5


def test_five():
    assert climb_stairs(5) == 8


def test_ten():
    assert climb_stairs(10) == 89`,
    solution: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
    usage: null,
  },
  {
    id: "py-34_longest_common_subsequence",
    name: "Longest Common Subsequence",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Kata: Longest Common Subsequence
Function: lcs(text1, text2)

Given two strings, return the length of their longest common subsequence.\\n\\nRef: LeetCode #1143 Longest Common Subsequence`,
    code: `def lcs(text1, text2):
    raise NotImplementedError`,
    testCode: `from importlib import import_module

lcs = import_module("kata.34_longest_common_subsequence.34_longest_common_subsequence_problem").lcs


def test_basic():
    assert lcs("abcde", "ace") == 3


def test_identical():
    assert lcs("abc", "abc") == 3


def test_no_common():
    assert lcs("abc", "def") == 0


def test_one_empty():
    assert lcs("", "abc") == 0


def test_both_empty():
    assert lcs("", "") == 0


def test_longer():
    assert lcs("abcba", "abcbcba") == 5`,
    solution: `def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    usage: null,
  },
];
