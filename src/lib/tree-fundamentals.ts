import type { SeedKata } from "../types/editor";

// Foundational binary-tree katas — the "same traversal, one changed local
// condition" ladder that leads into the harder tree problems. All reuse the
// shared TreeNode + make_tree(level-order, None-aware) scaffolding.

const TREE_NODE_CLASS = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right`;

const MAKE_TREE_HELPER = `def make_tree(vals):
    if not vals:
        return None
    from collections import deque
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root`;

const TEST_HEADER = `${TREE_NODE_CLASS}

${MAKE_TREE_HELPER}

`;

const treeFundamentals: SeedKata[] = [
  {
    name: "Count Nodes",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return the total number of nodes in a binary tree.\n\nThis is the cleanest first recursive tree problem — a node's count is 1 plus the counts of its two subtrees; an empty tree is 0.\n\nExample:\nInput: root = [1, 2, 3, None, None, 4]\n(the tree)\n    1\n   / \\\n  2   3\n     /\n    4\nOutput: 4\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- An empty tree returns 0.`,
    code: `def count_nodes(root) -> int:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_count_nodes_basic():
    assert count_nodes(make_tree([1, 2, 3, None, None, 4])) == 4

def test_count_nodes_single():
    assert count_nodes(make_tree([1])) == 1

def test_count_nodes_empty():
    assert count_nodes(make_tree([])) == 0

def test_count_nodes_full():
    assert count_nodes(make_tree([1, 2, 3, 4, 5, 6, 7])) == 7`,
    solution: `${TREE_NODE_CLASS}

def count_nodes(root) -> int:
    if root is None:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)`,
    usage: null,
    tags: ["trees", "recursion"],
  },
  {
    name: "Sum Node Values",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return the sum of every value in a binary tree.\n\nAlmost identical in shape to counting nodes — that repetition is the point. Each recursive call returns a useful value: this node's value plus the sums of its subtrees. An empty tree sums to 0.\n\nExample:\n    5\n   / \\\n  2   7\nInput: root = [5, 2, 7]\nOutput: 14\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- Values may be negative; an empty tree returns 0.`,
    code: `def sum_values(root) -> int:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_sum_values_basic():
    assert sum_values(make_tree([5, 2, 7])) == 14

def test_sum_values_single():
    assert sum_values(make_tree([1])) == 1

def test_sum_values_empty():
    assert sum_values(make_tree([])) == 0

def test_sum_values_negatives():
    assert sum_values(make_tree([3, -2, -1])) == 0`,
    solution: `${TREE_NODE_CLASS}

def sum_values(root) -> int:
    if root is None:
        return 0
    return root.val + sum_values(root.left) + sum_values(root.right)`,
    usage: null,
    tags: ["trees", "recursion"],
  },
  {
    name: "Count Leaves",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return the number of leaf nodes in a binary tree. A leaf is a node with no left child and no right child.\n\nThis forces you to distinguish three cases: an empty (None) spot, a leaf, and an internal node — a distinction that matters later for minimum depth, paths, and serialization.\n\nExample:\n    1\n   / \\\n  2   3\n     / \\\n    4   5\nInput: root = [1, 2, 3, None, None, 4, 5]\nLeaves: 2, 4, 5\nOutput: 3\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- An empty tree has 0 leaves; a single node is a leaf.`,
    code: `def count_leaves(root) -> int:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_count_leaves_basic():
    assert count_leaves(make_tree([1, 2, 3, None, None, 4, 5])) == 3

def test_count_leaves_single():
    assert count_leaves(make_tree([1])) == 1

def test_count_leaves_empty():
    assert count_leaves(make_tree([])) == 0

def test_count_leaves_skewed():
    assert count_leaves(make_tree([1, 2, None, 3])) == 1`,
    solution: `${TREE_NODE_CLASS}

def count_leaves(root) -> int:
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves(root.left) + count_leaves(root.right)`,
    usage: null,
    tags: ["trees", "recursion"],
  },
  {
    name: "Find Maximum Value",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return the largest value in a binary tree, or None if the tree is empty.\n\nThis teaches combining results from two subtrees: the answer is the maximum of this node's value and the maxima of its (non-empty) subtrees.\n\nExample:\n    4\n   / \\\n  9   2\nInput: root = [4, 9, 2]\nOutput: 9\n\nNegative example:\n    -5\n   /  \\\n -2   -9\nInput: root = [-5, -2, -9]\nOutput: -2\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- Values may be negative; an empty tree returns None.`,
    code: `def max_value(root):
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_max_value_basic():
    assert max_value(make_tree([4, 9, 2])) == 9

def test_max_value_single():
    assert max_value(make_tree([1])) == 1

def test_max_value_negatives():
    assert max_value(make_tree([-5, -2, -9])) == -2

def test_max_value_empty():
    assert max_value(make_tree([])) is None`,
    solution: `${TREE_NODE_CLASS}

def max_value(root):
    if root is None:
        return None
    best = root.val
    for child in (root.left, root.right):
        if child is not None:
            best = max(best, max_value(child))
    return best`,
    usage: null,
    tags: ["trees", "recursion"],
  },
  {
    name: "Search for a Value",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return True if a binary tree contains a target value, False otherwise. This is a general tree — the value could be anywhere, so you must search both subtrees.\n\nIt introduces early termination: as soon as one branch reports success, you can stop (Python's 'or' is short-circuiting).\n\nExample:\n    1\n   / \\\n  2   3\n     / \\\n    4   5\nInput: contains(root, 4)\nOutput: True\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- An empty tree contains nothing (False).`,
    code: `def contains(root, target) -> bool:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_contains_present():
    root = make_tree([1, 2, 3, None, None, 4, 5])
    assert contains(root, 4) is True

def test_contains_absent():
    root = make_tree([1, 2, 3, None, None, 4, 5])
    assert contains(root, 9) is False

def test_contains_root():
    assert contains(make_tree([1]), 1) is True

def test_contains_empty():
    assert contains(make_tree([]), 1) is False`,
    solution: `${TREE_NODE_CLASS}

def contains(root, target) -> bool:
    if root is None:
        return False
    if root.val == target:
        return True
    return contains(root.left, target) or contains(root.right, target)`,
    usage: null,
    tags: ["trees", "dfs", "recursion"],
  },
  {
    name: "BFS Flat Traversal",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return every value in a binary tree in breadth-first (level-order) order, as a single flat list.\n\nThis is the simplest introduction to BFS with a queue: remove a node, record it, then add its children. (Grouping values by level comes later.)\n\nExample:\n    1\n   / \\\n  2   3\n / \\\n4   5\nInput: root = [1, 2, 3, 4, 5]\nOutput: [1, 2, 3, 4, 5]\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- An empty tree returns [].`,
    code: `def bfs_values(root) -> list:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_bfs_basic():
    assert bfs_values(make_tree([1, 2, 3, 4, 5])) == [1, 2, 3, 4, 5]

def test_bfs_single():
    assert bfs_values(make_tree([1])) == [1]

def test_bfs_empty():
    assert bfs_values(make_tree([])) == []

def test_bfs_skewed():
    assert bfs_values(make_tree([1, 2, None, 3])) == [1, 2, 3]`,
    solution: `${TREE_NODE_CLASS}

def bfs_values(root) -> list:
    if root is None:
        return []
    from collections import deque
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result`,
    usage: null,
    tags: ["trees", "bfs"],
  },
  {
    name: "Values at Depth K",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return all values at depth k in a binary tree, left to right. The root is at depth 0.\n\nSolvable with DFS (carry the current depth down) or BFS (process levels until depth k) — a good first comparison of the two strategies, since neither is complicated here.\n\nExample:\n    1\n   / \\\n  2   3\n /\n4\nInput: values_at_depth(root, 1)   (root = [1, 2, 3, 4])\nOutput: [2, 3]\n\nConstraints:\n- 0 <= k, 0 <= number of nodes <= 10^4\n- A depth with no nodes (or an empty tree) returns [].`,
    code: `def values_at_depth(root, k) -> list:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_values_at_depth_one():
    assert values_at_depth(make_tree([1, 2, 3, 4]), 1) == [2, 3]

def test_values_at_depth_two():
    assert values_at_depth(make_tree([1, 2, 3, 4]), 2) == [4]

def test_values_at_depth_zero():
    assert values_at_depth(make_tree([1, 2, 3, 4]), 0) == [1]

def test_values_at_depth_beyond():
    assert values_at_depth(make_tree([1, 2, 3, 4]), 5) == []

def test_values_at_depth_empty():
    assert values_at_depth(make_tree([]), 0) == []`,
    solution: `${TREE_NODE_CLASS}

def values_at_depth(root, k) -> list:
    result = []

    def dfs(node, depth):
        if node is None:
            return
        if depth == k:
            result.append(node.val)
            return
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return result`,
    usage: null,
    tags: ["trees", "dfs", "bfs"],
  },
  {
    name: "Root-to-Leaf Paths",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Return every root-to-leaf path in a binary tree, each as a list of values from the root down to a leaf.\n\nThis is a strong bridge from ordinary recursion into tree backtracking — you build a path on the way down and undo the last step on the way back up (append, recurse, pop).\n\nExample:\n    1\n   / \\\n  2   3\nInput: root = [1, 2, 3]\nOutput: [[1, 2], [1, 3]]\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- An empty tree returns []. A single node returns [[value]].`,
    code: `def root_to_leaf_paths(root) -> list:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_paths_basic():
    assert root_to_leaf_paths(make_tree([1, 2, 3])) == [[1, 2], [1, 3]]

def test_paths_single():
    assert root_to_leaf_paths(make_tree([1])) == [[1]]

def test_paths_empty():
    assert root_to_leaf_paths(make_tree([])) == []

def test_paths_skewed():
    assert root_to_leaf_paths(make_tree([1, 2, None, 3])) == [[1, 2, 3]]`,
    solution: `${TREE_NODE_CLASS}

def root_to_leaf_paths(root) -> list:
    result = []

    def dfs(node, path):
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            result.append(list(path))
        else:
            dfs(node.left, path)
            dfs(node.right, path)
        path.pop()

    dfs(root, [])
    return result`,
    usage: null,
    tags: ["trees", "dfs", "backtracking"],
  },
  {
    name: "Subtree Sizes",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `For every node, compute the size of the subtree rooted at that node (the node itself plus all its descendants). Return a dict mapping each node's value to its subtree size. Assume all values are distinct.\n\nThis is a clean introduction to postorder DFS: you must have both children's results before you can compute the current node's — get the left size, get the right size, then combine.\n\nExample:\n        1\n       / \\\n      2   3\n     / \\\n    4   5\nInput: root = [1, 2, 3, 4, 5]\nOutput: {1: 5, 2: 3, 3: 1, 4: 1, 5: 1}\n\nConstraints:\n- 0 <= number of nodes <= 10^4, values distinct.\n- An empty tree returns {}.`,
    code: `def subtree_sizes(root) -> dict:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_subtree_sizes_basic():
    assert subtree_sizes(make_tree([1, 2, 3, 4, 5])) == {1: 5, 2: 3, 3: 1, 4: 1, 5: 1}

def test_subtree_sizes_single():
    assert subtree_sizes(make_tree([10])) == {10: 1}

def test_subtree_sizes_empty():
    assert subtree_sizes(make_tree([])) == {}`,
    solution: `${TREE_NODE_CLASS}

def subtree_sizes(root) -> dict:
    sizes = {}

    def dfs(node):
        if node is None:
            return 0
        size = 1 + dfs(node.left) + dfs(node.right)
        sizes[node.val] = size
        return size

    dfs(root)
    return sizes`,
    usage: null,
    tags: ["trees", "dfs", "postorder"],
  },
  {
    name: "Search a Binary Search Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the root of a binary search tree (BST) and a target value, return the node whose value equals the target, or None if it is absent.\n\nUnlike a general-tree search, each comparison eliminates half the remaining tree: if the target is smaller than the current node go left, otherwise go right. This is why the BST ordering invariant matters.\n\nExample:\n      4\n     / \\\n    2   7\n   / \\ / \\\n  1  3 6  9\nInput: search_bst(root, 6)   (root = [4, 2, 7, 1, 3, 6, 9])\nOutput: the node with value 6\n\nConstraints:\n- The tree is a valid BST with distinct values.\n- Return None if the value is not present (or the tree is empty).`,
    code: `def search_bst(root, target):
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_search_bst_present():
    root = make_tree([4, 2, 7, 1, 3, 6, 9])
    assert search_bst(root, 6).val == 6

def test_search_bst_root():
    root = make_tree([4, 2, 7, 1, 3, 6, 9])
    assert search_bst(root, 2).val == 2

def test_search_bst_absent():
    root = make_tree([4, 2, 7, 1, 3, 6, 9])
    assert search_bst(root, 5) is None

def test_search_bst_empty():
    assert search_bst(make_tree([]), 1) is None`,
    solution: `${TREE_NODE_CLASS}

def search_bst(root, target):
    node = root
    while node is not None:
        if node.val == target:
            return node
        node = node.left if target < node.val else node.right
    return None`,
    usage: null,
    tags: ["trees", "bst", "binary-search"],
  },
];

export default treeFundamentals;
export { treeFundamentals };
