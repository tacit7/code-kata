import type { SeedKata } from "../types/editor";

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

const neetcodeTrees: SeedKata[] = [
  {
    name: "Diameter of Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the root of a binary tree, return the length of the diameter of the tree.\n\nThe diameter is the length of the longest path between any two nodes. This path may or may not pass through the root.\n\nThe length of a path between two nodes is the number of edges between them.\n\nExample 1:\nInput: root = [1,2,3,4,5]\nOutput: 3  (path: 4 → 2 → 1 → 3, or 5 → 2 → 1 → 3)\n\nExample 2:\nInput: root = [1,2]\nOutput: 1\n\nConstraints:\n- The number of nodes is in the range [1, 10^4].\n- -100 <= Node.val <= 100\n\nRef: LeetCode #543 Diameter of Binary Tree`,
    code: `def diameter_of_binary_tree(root) -> int:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_diameter_single():
    root = make_tree([1])
    assert diameter_of_binary_tree(root) == 0

def test_diameter_three_nodes():
    root = make_tree([1, 2, 3])
    assert diameter_of_binary_tree(root) == 2

def test_diameter_five_nodes():
    root = make_tree([1, 2, 3, 4, 5])
    assert diameter_of_binary_tree(root) == 3`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def diameter_of_binary_tree(root) -> int:
    result = [0]

    def dfs(node):
        if not node:
            return 0
        left = dfs(node.left)
        right = dfs(node.right)
        result[0] = max(result[0], left + right)
        return 1 + max(left, right)

    dfs(root)
    return result[0]`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
  {
    name: "Balanced Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given a binary tree, determine if it is height-balanced.\n\nA binary tree is height-balanced if the depth of the two subtrees of every node never differs by more than one.\n\nExample 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: True\n\nExample 2:\nInput: root = [1,2,2,3,3,null,null,4,4]\nOutput: False\n\nExample 3:\nInput: root = []\nOutput: True\n\nConstraints:\n- The number of nodes is in the range [0, 5000].\n- -10^4 <= Node.val <= 10^4\n\nRef: LeetCode #110 Balanced Binary Tree`,
    code: `def is_balanced(root) -> bool:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_balanced_true():
    root = make_tree([3, 9, 20, None, None, 15, 7])
    assert is_balanced(root) == True

def test_balanced_false():
    root = make_tree([1, 2, 2, 3, 3, None, None, 4, 4])
    assert is_balanced(root) == False

def test_balanced_empty():
    assert is_balanced(None) == True`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_balanced(root) -> bool:
    def check(node):
        if not node:
            return 0
        left = check(node.left)
        if left == -1:
            return -1
        right = check(node.right)
        if right == -1:
            return -1
        if abs(left - right) > 1:
            return -1
        return 1 + max(left, right)

    return check(root) != -1`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
  {
    name: "Binary Tree Level Order Traversal",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).\n\nExample 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n\nExample 2:\nInput: root = [1]\nOutput: [[1]]\n\nExample 3:\nInput: root = []\nOutput: []\n\nConstraints:\n- The number of nodes is in the range [0, 2000].\n- -1000 <= Node.val <= 1000\n\nRef: LeetCode #102 Binary Tree Level Order Traversal`,
    code: `def level_order(root) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_level_order_basic():
    root = make_tree([3, 9, 20, None, None, 15, 7])
    assert level_order(root) == [[3], [9, 20], [15, 7]]

def test_level_order_single():
    root = make_tree([1])
    assert level_order(root) == [[1]]

def test_level_order_empty():
    assert level_order(None) == []`,
    solution: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root) -> list[list[int]]:
    if not root:
        return []
    result = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        result.append(level)
    return result`,
    usage: null,
    tags: ["trees", "bfs", "neetcode"],
  },
  {
    name: "Binary Tree Right Side View",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom.\n\nExample 1:\nInput: root = [1,2,3,null,5,null,4]\nOutput: [1,3,4]\n\nExample 2:\nInput: root = [1,null,3]\nOutput: [1,3]\n\nExample 3:\nInput: root = []\nOutput: []\n\nConstraints:\n- The number of nodes is in the range [0, 100].\n- -100 <= Node.val <= 100\n\nRef: LeetCode #199 Binary Tree Right Side View`,
    code: `def right_side_view(root) -> list[int]:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_right_side_basic():
    root = make_tree([1, 2, 3, None, 5, None, 4])
    assert right_side_view(root) == [1, 3, 4]

def test_right_side_skewed():
    root = make_tree([1, None, 3])
    assert right_side_view(root) == [1, 3]

def test_right_side_empty():
    assert right_side_view(None) == []`,
    solution: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def right_side_view(root) -> list[int]:
    if not root:
        return []
    result = []
    q = deque([root])
    while q:
        for i in range(len(q)):
            node = q.popleft()
            if i == 0:
                result.append(node.val)
            if node.right:
                q.append(node.right)
            if node.left:
                q.append(node.left)
    return result`,
    usage: null,
    tags: ["trees", "bfs", "dfs", "neetcode"],
  },
  {
    name: "Count Good Nodes In Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given a binary tree root, a node X in the tree is named "good" if in the path from root to X there are no nodes with a value greater than X.\n\nReturn the number of good nodes in the binary tree.\n\nExample 1:\nInput: root = [3,1,4,3,null,1,5]\nOutput: 4  (root=3, 4, 3 under left, 5 are good)\n\nExample 2:\nInput: root = [3,3,null,4,2]\nOutput: 3  (root=3, left 3, and 4 are good)\n\nExample 3:\nInput: root = [1]\nOutput: 1\n\nConstraints:\n- The number of nodes in the binary tree is in the range [1, 10^5].\n- Each node's value is between [-10^4, 10^4].\n\nRef: LeetCode #1448 Count Good Nodes In Binary Tree`,
    code: `def good_nodes(root) -> int:
    raise NotImplementedError`,
    testCode: `${TEST_HEADER}def test_good_nodes_basic():
    root = make_tree([3, 1, 4, 3, None, 1, 5])
    assert good_nodes(root) == 4

def test_good_nodes_left_heavy():
    root = make_tree([3, 3, None, 4, 2])
    assert good_nodes(root) == 3

def test_good_nodes_single():
    root = make_tree([1])
    assert good_nodes(root) == 1`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def good_nodes(root) -> int:
    def dfs(node, max_so_far):
        if not node:
            return 0
        count = 1 if node.val >= max_so_far else 0
        new_max = max(max_so_far, node.val)
        return count + dfs(node.left, new_max) + dfs(node.right, new_max)

    return dfs(root, float('-inf'))`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
];

export { neetcodeTrees };
