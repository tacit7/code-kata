import type { SeedKata } from "../types/editor";

const blind75Part7: SeedKata[] = [
  {
    name: "Maximum Depth of Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to farthest leaf).\n\nExample:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- -100 <= Node.val <= 100`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root) -> int:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_example():
    root = make_tree([3, 9, 20, None, None, 15, 7])
    assert max_depth(root) == 3


def test_single_node():
    root = make_tree([1])
    assert max_depth(root) == 1


def test_empty_tree():
    assert max_depth(None) == 0


def test_left_skewed():
    root = make_tree([1, 2, None, 3, None])
    assert max_depth(root) == 3`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
    usage: null,
    tags: ["tree", "dfs", "bfs", "blind75"],
  },
  {
    name: "Same Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the roots of two binary trees, check if they are the same (structurally identical with same node values).\n\nExample:\nInput: p=[1,2,3], q=[1,2,3]\nOutput: True\n\nConstraints:\n- 0 <= number of nodes <= 100\n- -10^4 <= Node.val <= 10^4`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_same_tree(p, q) -> bool:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_both_none():
    assert is_same_tree(None, None) == True


def test_same_structure():
    p = make_tree([1, 2, 3])
    q = make_tree([1, 2, 3])
    assert is_same_tree(p, q) == True


def test_different_values():
    p = make_tree([1, 2])
    q = make_tree([1, None, 2])
    assert is_same_tree(p, q) == False


def test_different_structure():
    p = make_tree([1, 2, 1])
    q = make_tree([1, 1, 2])
    assert is_same_tree(p, q) == False`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_same_tree(p, q) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Invert Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the root of a binary tree, invert the tree (mirror it) and return its root.\n\nExample:\nInput: root=[4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n\nConstraints:\n- 0 <= number of nodes <= 100\n- -100 <= Node.val <= 100`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def invert_tree(root):
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def bfs_values(root):
    if root is None:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result


def test_example():
    root = make_tree([4, 2, 7, 1, 3, 6, 9])
    inverted = invert_tree(root)
    assert bfs_values(inverted) == [4, 7, 2, 9, 6, 3, 1]


def test_empty():
    assert invert_tree(None) is None


def test_single_node():
    root = make_tree([1])
    result = invert_tree(root)
    assert result.val == 1
    assert result.left is None
    assert result.right is None


def test_two_levels():
    root = make_tree([1, 2, 3])
    inverted = invert_tree(root)
    assert inverted.left.val == 3
    assert inverted.right.val == 2`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Binary Tree Maximum Path Sum",
    category: "trees",
    language: "python",
    difficulty: "hard",
    description: `A path in a binary tree is a sequence of nodes where each pair has an edge. The path does not need to go through the root. Given root, return the maximum path sum.\n\nExample:\nInput: root=[-10,9,20,null,null,15,7]\nOutput: 42 (path: 15->20->7)\n\nConstraints:\n- 1 <= number of nodes <= 3 * 10^4\n- -1000 <= Node.val <= 1000`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_path_sum(root) -> int:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_example():
    root = make_tree([-10, 9, 20, None, None, 15, 7])
    assert max_path_sum(root) == 42


def test_simple():
    root = make_tree([1, 2, 3])
    assert max_path_sum(root) == 6


def test_single_negative():
    root = make_tree([-3])
    assert max_path_sum(root) == -3


def test_all_negative():
    root = make_tree([-1, -2, -3])
    assert max_path_sum(root) == -1`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_path_sum(root) -> int:
    result = [root.val]

    def dfs(node):
        if node is None:
            return 0
        left_gain = max(dfs(node.left), 0)
        right_gain = max(dfs(node.right), 0)
        result[0] = max(result[0], node.val + left_gain + right_gain)
        return node.val + max(left_gain, right_gain)

    dfs(root)
    return result[0]`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Serialize and Deserialize Binary Tree",
    category: "trees",
    language: "python",
    difficulty: "hard",
    description: `Design algorithms to serialize a binary tree to a string and deserialize it back. Use BFS with 'null' for None nodes.\n\nExample:\nInput: root=[1,2,3,null,null,4,5]\nSerialized: "1,2,3,null,null,4,5"\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- -1000 <= Node.val <= 1000`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def serialize(root) -> str:
    raise NotImplementedError


def deserialize(data: str):
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def bfs_values(root):
    if root is None:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result


def test_roundtrip_simple():
    root = make_tree([1, 2, 3, None, None, 4, 5])
    data = serialize(root)
    restored = deserialize(data)
    assert bfs_values(restored) == bfs_values(root)


def test_roundtrip_empty():
    data = serialize(None)
    restored = deserialize(data)
    assert restored is None


def test_roundtrip_single():
    root = make_tree([42])
    data = serialize(root)
    restored = deserialize(data)
    assert restored.val == 42
    assert restored.left is None
    assert restored.right is None


def test_roundtrip_skewed():
    root = make_tree([1, 2, None, 3, None])
    data = serialize(root)
    restored = deserialize(data)
    assert restored.val == 1
    assert restored.left.val == 2
    assert restored.left.left.val == 3`,
    solution: `import collections


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def serialize(root) -> str:
    if root is None:
        return ""
    result = []
    queue = collections.deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            result.append("null")
        else:
            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
    return ",".join(result)


def deserialize(data: str):
    if not data:
        return None
    vals = data.split(",")
    root = TreeNode(int(vals[0]))
    queue = collections.deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if vals[i] != "null":
            node.left = TreeNode(int(vals[i]))
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != "null":
            node.right = TreeNode(int(vals[i]))
            queue.append(node.right)
        i += 1
    return root`,
    usage: null,
    tags: ["tree", "bfs", "blind75"],
  },
  {
    name: "Subtree of Another Tree",
    category: "trees",
    language: "python",
    difficulty: "easy",
    description: `Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and values as subRoot.\n\nExample:\nInput: root=[3,4,5,1,2], subRoot=[4,1,2]\nOutput: True\n\nConstraints:\n- 1 <= root nodes <= 2000\n- 1 <= subRoot nodes <= 1000\n- -10^4 <= Node.val <= 10^4`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_subtree(root, sub_root) -> bool:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_is_subtree():
    root = make_tree([3, 4, 5, 1, 2])
    sub = make_tree([4, 1, 2])
    assert is_subtree(root, sub) == True


def test_not_subtree():
    root = make_tree([3, 4, 5, 1, 2, None, None, None, None, 0])
    sub = make_tree([4, 1, 2])
    assert is_subtree(root, sub) == False


def test_same_tree():
    root = make_tree([1, 2, 3])
    sub = make_tree([1, 2, 3])
    assert is_subtree(root, sub) == True


def test_single_node_subtree():
    root = make_tree([1, 2, 3])
    sub = make_tree([2])
    assert is_subtree(root, sub) == True`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_same_tree(p, q) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)


def is_subtree(root, sub_root) -> bool:
    if sub_root is None:
        return True
    if root is None:
        return False
    if is_same_tree(root, sub_root):
        return True
    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Construct Binary Tree from Preorder and Inorder Traversal",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given two integer arrays preorder and inorder, construct and return the binary tree.\n\nExample:\nInput: preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]\nOutput: tree with root 3\n\nConstraints:\n- 1 <= preorder.length <= 3000\n- All values are unique`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(preorder: list[int], inorder: list[int]):
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_example():
    root = build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
    assert root.val == 3
    assert root.left.val == 9
    assert root.right.val == 20
    assert root.right.left.val == 15
    assert root.right.right.val == 7


def test_single():
    root = build_tree([1], [1])
    assert root.val == 1
    assert root.left is None
    assert root.right is None


def test_left_only():
    root = build_tree([1, 2], [2, 1])
    assert root.val == 1
    assert root.left.val == 2
    assert root.right is None


def test_right_only():
    root = build_tree([1, 2], [1, 2])
    assert root.val == 1
    assert root.right.val == 2
    assert root.left is None`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_tree(preorder: list[int], inorder: list[int]):
    if not preorder or not inorder:
        return None
    root_val = preorder[0]
    root = TreeNode(root_val)
    mid = inorder.index(root_val)
    root.left = build_tree(preorder[1:mid + 1], inorder[:mid])
    root.right = build_tree(preorder[mid + 1:], inorder[mid + 1:])
    return root`,
    usage: null,
    tags: ["tree", "dfs", "divide-and-conquer", "blind75"],
  },
  {
    name: "Validate Binary Search Tree",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given the root of a binary tree, determine if it is a valid binary search tree. A BST requires left subtree values < node < right subtree values.\n\nExample:\nInput: root=[2,1,3]\nOutput: True\n\nInput: root=[5,1,4,null,null,3,6]\nOutput: False\n\nConstraints:\n- 1 <= number of nodes <= 10^4\n- -2^31 <= Node.val <= 2^31 - 1`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_valid_bst(root) -> bool:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_valid_bst():
    root = make_tree([2, 1, 3])
    assert is_valid_bst(root) == True


def test_invalid_bst():
    root = make_tree([5, 1, 4, None, None, 3, 6])
    assert is_valid_bst(root) == False


def test_single_node():
    root = make_tree([1])
    assert is_valid_bst(root) == True


def test_subtree_violation():
    root = TreeNode(5)
    root.left = TreeNode(4)
    root.right = TreeNode(6)
    root.right.left = TreeNode(3)
    root.right.right = TreeNode(7)
    assert is_valid_bst(root) == False`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def is_valid_bst(root) -> bool:
    def validate(node, min_val, max_val):
        if node is None:
            return True
        if node.val <= min_val or node.val >= max_val:
            return False
        return (validate(node.left, min_val, node.val) and
                validate(node.right, node.val, max_val))

    return validate(root, float('-inf'), float('inf'))`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Kth Smallest Element in a BST",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given the root of a BST and an integer k, return the kth smallest value (1-indexed).\n\nExample:\nInput: root=[3,1,4,null,2], k=1\nOutput: 1\n\nConstraints:\n- 1 <= k <= number of nodes <= 10^4\n- 0 <= Node.val <= 10^4`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def kth_smallest(root, k: int) -> int:
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def make_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root


def test_first_smallest():
    root = make_tree([3, 1, 4, None, 2])
    assert kth_smallest(root, 1) == 1


def test_third_smallest():
    root = make_tree([5, 3, 6, 2, 4, None, None, 1])
    assert kth_smallest(root, 3) == 3


def test_single_node():
    root = make_tree([1])
    assert kth_smallest(root, 1) == 1


def test_last_element():
    root = make_tree([3, 1, 4, None, 2])
    assert kth_smallest(root, 4) == 4`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def kth_smallest(root, k: int) -> int:
    count = [0]
    result = [0]

    def dfs(node):
        if node is None:
            return
        dfs(node.left)
        count[0] += 1
        if count[0] == k:
            result[0] = node.val
            return
        dfs(node.right)

    dfs(root)
    return result[0]`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Lowest Common Ancestor of a Binary Search Tree",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Given a BST, find the lowest common ancestor (LCA) of two nodes p and q. LCA is the lowest node that has both p and q as descendants (a node is a descendant of itself).\n\nExample:\nInput: root=[6,2,8,0,4,7,9,null,null,3,5], p=2, q=8\nOutput: 6\n\nConstraints:\n- 2 <= number of nodes <= 10^5\n- -10^9 <= Node.val <= 10^9\n- All values unique\n- p and q exist in the BST`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def lowest_common_ancestor(root, p, q):
    raise NotImplementedError`,
    testCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def test_lca_root():
    root = TreeNode(6)
    n2 = TreeNode(2)
    n8 = TreeNode(8)
    n0 = TreeNode(0)
    n4 = TreeNode(4)
    n7 = TreeNode(7)
    n9 = TreeNode(9)
    root.left = n2
    root.right = n8
    n2.left = n0
    n2.right = n4
    n8.left = n7
    n8.right = n9
    result = lowest_common_ancestor(root, n2, n8)
    assert result.val == 6


def test_lca_left_subtree():
    root = TreeNode(6)
    n2 = TreeNode(2)
    n8 = TreeNode(8)
    n0 = TreeNode(0)
    n4 = TreeNode(4)
    root.left = n2
    root.right = n8
    n2.left = n0
    n2.right = n4
    result = lowest_common_ancestor(root, n2, n4)
    assert result.val == 2


def test_lca_ancestor_is_node():
    root = TreeNode(2)
    n1 = TreeNode(1)
    root.left = n1
    result = lowest_common_ancestor(root, root, n1)
    assert result.val == 2


def test_lca_single_path():
    root = TreeNode(6)
    n2 = TreeNode(2)
    n0 = TreeNode(0)
    n4 = TreeNode(4)
    n3 = TreeNode(3)
    root.left = n2
    n2.left = n0
    n2.right = n4
    n4.left = n3
    result = lowest_common_ancestor(root, n0, n3)
    assert result.val == 2`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def lowest_common_ancestor(root, p, q):
    if p.val < root.val and q.val < root.val:
        return lowest_common_ancestor(root.left, p, q)
    if p.val > root.val and q.val > root.val:
        return lowest_common_ancestor(root.right, p, q)
    return root`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Add and Search Word",
    category: "trees",
    language: "python",
    difficulty: "medium",
    description: `Design a data structure that supports adding new words and searching a string where '.' can match any letter.\n\nExample:\nwd = WordDictionary()\nwd.add_word("bad")\nwd.add_word("dad")\nwd.search("pad") -> False\nwd.search(".ad") -> True\nwd.search("b..") -> True\n\nConstraints:\n- 1 <= word.length <= 25\n- word consists of lowercase English letters or '.'\n- At most 10^4 calls to add_word and search`,
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class WordDictionary:
    def __init__(self):
        raise NotImplementedError

    def add_word(self, word: str) -> None:
        raise NotImplementedError

    def search(self, word: str) -> bool:
        raise NotImplementedError`,
    testCode: `class WordDictionary:
    def __init__(self):
        raise NotImplementedError

    def add_word(self, word: str) -> None:
        raise NotImplementedError

    def search(self, word: str) -> bool:
        raise NotImplementedError


def test_basic_search():
    wd = WordDictionary()
    wd.add_word("bad")
    wd.add_word("dad")
    assert wd.search("pad") == False
    assert wd.search(".ad") == True
    assert wd.search("b..") == True


def test_exact_match():
    wd = WordDictionary()
    wd.add_word("hello")
    assert wd.search("hello") == True
    assert wd.search("hell") == False


def test_wildcard_all():
    wd = WordDictionary()
    wd.add_word("abc")
    assert wd.search("...") == True
    assert wd.search("....") == False


def test_not_found():
    wd = WordDictionary()
    wd.add_word("cat")
    assert wd.search("dog") == False
    assert wd.search(".og") == False`,
    solution: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class WordDictionary:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def add_word(self, word: str) -> None:
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = WordDictionary()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            ch = word[i]
            if ch == '.':
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)

        return dfs(self, 0)`,
    usage: null,
    tags: ["trie", "dfs", "blind75"],
  },
  {
    name: "Word Search II",
    category: "trees",
    language: "python",
    difficulty: "hard",
    description: `Given an m x n board of characters and a list of strings words, return all words that can be found in the board. Words can be constructed from sequentially adjacent cells (horizontally/vertically). A cell may not be used more than once per word.\n\nExample:\nInput: board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words=["oath","pea","eat","rain"]\nOutput: ["eat","oath"]\n\nConstraints:\n- m == board.length, n == board[0].length\n- 1 <= m, n <= 12\n- 1 <= words.length <= 3 * 10^4\n- 1 <= words[i].length <= 10`,
    code: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_example():
    board = [
        ["o", "a", "a", "n"],
        ["e", "t", "a", "e"],
        ["i", "h", "k", "r"],
        ["i", "f", "l", "v"]
    ]
    words = ["oath", "pea", "eat", "rain"]
    result = find_words(board, words)
    assert sorted(result) == sorted(["eat", "oath"])


def test_no_match():
    board = [["a", "b"], ["c", "d"]]
    words = ["xyz"]
    assert find_words(board, words) == []


def test_single_cell():
    board = [["a"]]
    words = ["a"]
    assert find_words(board, words) == ["a"]


def test_multiple_words():
    board = [["o", "a", "n"], ["e", "t", "a"], ["i", "h", "k"]]
    words = ["eat", "oath", "none"]
    result = find_words(board, words)
    assert sorted(result) == sorted(["eat", "oath"])`,
    solution: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.word = None

    root = TrieNode()
    for word in words:
        node = root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.word = word

    rows, cols = len(board), len(board[0])
    result = []

    def dfs(node, r, c):
        ch = board[r][c]
        if ch not in node.children:
            return
        next_node = node.children[ch]
        if next_node.word:
            result.append(next_node.word)
            next_node.word = None
        board[r][c] = '#'
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                dfs(next_node, nr, nc)
        board[r][c] = ch
        if not next_node.children and not next_node.word:
            del node.children[ch]

    for r in range(rows):
        for c in range(cols):
            dfs(root, r, c)

    return result`,
    usage: null,
    tags: ["trie", "backtracking", "blind75"],
  },
];

export { blind75Part7 };
