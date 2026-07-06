import type { SeedKata } from "../types/editor";

const blind75Part7: SeedKata[] = [
  {
    name: "Maximum Depth of Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to farthest leaf).\n\nExample:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- -100 <= Node.val <= 100`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def max_depth(root)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_example
  root = make_tree([3, 9, 20, nil, nil, 15, 7])
  assert_equal(3, max_depth(root))
end

def test_single_node
  root = make_tree([1])
  assert_equal(1, max_depth(root))
end

def test_empty_tree
  assert_equal(0, max_depth(nil))
end

def test_left_skewed
  root = make_tree([1, 2, nil, 3, nil])
  assert_equal(3, max_depth(root))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def max_depth(root)
  return 0 if root.nil?
  1 + [max_depth(root.left), max_depth(root.right)].max
end`,
    usage: null,
    tags: ["tree", "dfs", "bfs", "blind75"],
  },
  {
    name: "Same Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given the roots of two binary trees, check if they are the same (structurally identical with same node values).\n\nExample:\nInput: p=[1,2,3], q=[1,2,3]\nOutput: True\n\nConstraints:\n- 0 <= number of nodes <= 100\n- -10^4 <= Node.val <= 10^4`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_same_tree(p, q)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_both_none
  assert_equal(true, is_same_tree(nil, nil))
end

def test_same_structure
  p = make_tree([1, 2, 3])
  q = make_tree([1, 2, 3])
  assert_equal(true, is_same_tree(p, q))
end

def test_different_values
  p = make_tree([1, 2])
  q = make_tree([1, nil, 2])
  assert_equal(false, is_same_tree(p, q))
end

def test_different_structure
  p = make_tree([1, 2, 1])
  q = make_tree([1, 1, 2])
  assert_equal(false, is_same_tree(p, q))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_same_tree(p, q)
  return true if p.nil? && q.nil?
  return false if p.nil? || q.nil?
  return false if p.val != q.val
  is_same_tree(p.left, q.left) && is_same_tree(p.right, q.right)
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Invert Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given the root of a binary tree, invert the tree (mirror it) and return its root.\n\nExample:\nInput: root=[4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n\nConstraints:\n- 0 <= number of nodes <= 100\n- -100 <= Node.val <= 100`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def invert_tree(root)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def bfs_values(root)
  return [] if root.nil?
  result = []
  queue = [root]
  while !queue.empty?
    node = queue.shift
    result.push(node.val)
    queue.push(node.left) if node.left
    queue.push(node.right) if node.right
  end
  result
end

def test_example
  root = make_tree([4, 2, 7, 1, 3, 6, 9])
  inverted = invert_tree(root)
  assert_equal([4, 7, 2, 9, 6, 3, 1], bfs_values(inverted))
end

def test_empty
  assert_equal(nil, invert_tree(nil))
end

def test_single_node
  root = make_tree([1])
  result = invert_tree(root)
  assert_equal(1, result.val)
  assert_equal(nil, result.left)
  assert_equal(nil, result.right)
end

def test_two_levels
  root = make_tree([1, 2, 3])
  inverted = invert_tree(root)
  assert_equal(3, inverted.left.val)
  assert_equal(2, inverted.right.val)
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def invert_tree(root)
  return nil if root.nil?
  root.left, root.right = invert_tree(root.right), invert_tree(root.left)
  root
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Binary Tree Maximum Path Sum",
    category: "trees",
    language: "ruby",
    difficulty: "hard",
    description: `A path in a binary tree is a sequence of nodes where each pair has an edge. The path does not need to go through the root. Given root, return the maximum path sum.\n\nExample:\nInput: root=[-10,9,20,null,null,15,7]\nOutput: 42 (path: 15->20->7)\n\nConstraints:\n- 1 <= number of nodes <= 3 * 10^4\n- -1000 <= Node.val <= 1000`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def max_path_sum(root)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_example
  root = make_tree([-10, 9, 20, nil, nil, 15, 7])
  assert_equal(42, max_path_sum(root))
end

def test_simple
  root = make_tree([1, 2, 3])
  assert_equal(6, max_path_sum(root))
end

def test_single_negative
  root = make_tree([-3])
  assert_equal(-3, max_path_sum(root))
end

def test_all_negative
  root = make_tree([-1, -2, -3])
  assert_equal(-1, max_path_sum(root))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def max_path_sum(root)
  result = [root.val]

  dfs = lambda do |node|
    return 0 if node.nil?
    left_gain = [dfs.call(node.left), 0].max
    right_gain = [dfs.call(node.right), 0].max
    result[0] = [result[0], node.val + left_gain + right_gain].max
    node.val + [left_gain, right_gain].max
  end

  dfs.call(root)
  result[0]
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Serialize and Deserialize Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "hard",
    description: `Design algorithms to serialize a binary tree to a string and deserialize it back. Use BFS with 'null' for None nodes.\n\nExample:\nInput: root=[1,2,3,null,null,4,5]\nSerialized: "1,2,3,null,null,4,5"\n\nConstraints:\n- 0 <= number of nodes <= 10^4\n- -1000 <= Node.val <= 1000`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def serialize(root)
  raise NotImplementedError
end

def deserialize(data)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def bfs_values(root)
  return [] if root.nil?
  result = []
  queue = [root]
  while !queue.empty?
    node = queue.shift
    result.push(node.val)
    queue.push(node.left) if node.left
    queue.push(node.right) if node.right
  end
  result
end

def test_roundtrip_simple
  root = make_tree([1, 2, 3, nil, nil, 4, 5])
  data = serialize(root)
  restored = deserialize(data)
  assert_equal(bfs_values(root), bfs_values(restored))
end

def test_roundtrip_empty
  data = serialize(nil)
  restored = deserialize(data)
  assert_equal(nil, restored)
end

def test_roundtrip_single
  root = make_tree([42])
  data = serialize(root)
  restored = deserialize(data)
  assert_equal(42, restored.val)
  assert_equal(nil, restored.left)
  assert_equal(nil, restored.right)
end

def test_roundtrip_skewed
  root = make_tree([1, 2, nil, 3, nil])
  data = serialize(root)
  restored = deserialize(data)
  assert_equal(1, restored.val)
  assert_equal(2, restored.left.val)
  assert_equal(3, restored.left.left.val)
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def serialize(root)
  return "" if root.nil?
  result = []
  queue = [root]
  while !queue.empty?
    node = queue.shift
    if node.nil?
      result.push("null")
    else
      result.push(node.val.to_s)
      queue.push(node.left)
      queue.push(node.right)
    end
  end
  result.join(",")
end

def deserialize(data)
  return nil if data.nil? || data.empty?
  vals = data.split(",")
  root = TreeNode.new(vals[0].to_i)
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if vals[i] != "null"
      node.left = TreeNode.new(vals[i].to_i)
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && vals[i] != "null"
      node.right = TreeNode.new(vals[i].to_i)
      queue.push(node.right)
    end
    i += 1
  end
  root
end`,
    usage: null,
    tags: ["tree", "bfs", "blind75"],
  },
  {
    name: "Subtree of Another Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and values as subRoot.\n\nExample:\nInput: root=[3,4,5,1,2], subRoot=[4,1,2]\nOutput: True\n\nConstraints:\n- 1 <= root nodes <= 2000\n- 1 <= subRoot nodes <= 1000\n- -10^4 <= Node.val <= 10^4`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_subtree(root, sub_root)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_is_subtree
  root = make_tree([3, 4, 5, 1, 2])
  sub = make_tree([4, 1, 2])
  assert_equal(true, is_subtree(root, sub))
end

def test_not_subtree
  root = make_tree([3, 4, 5, 1, 2, nil, nil, nil, nil, 0])
  sub = make_tree([4, 1, 2])
  assert_equal(false, is_subtree(root, sub))
end

def test_same_tree
  root = make_tree([1, 2, 3])
  sub = make_tree([1, 2, 3])
  assert_equal(true, is_subtree(root, sub))
end

def test_single_node_subtree
  root = make_tree([1, 2, 3])
  sub = make_tree([2])
  assert_equal(true, is_subtree(root, sub))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_same_tree(p, q)
  return true if p.nil? && q.nil?
  return false if p.nil? || q.nil?
  return false if p.val != q.val
  is_same_tree(p.left, q.left) && is_same_tree(p.right, q.right)
end

def is_subtree(root, sub_root)
  return true if sub_root.nil?
  return false if root.nil?
  return true if is_same_tree(root, sub_root)
  is_subtree(root.left, sub_root) || is_subtree(root.right, sub_root)
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Construct Binary Tree from Preorder and Inorder Traversal",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given two integer arrays preorder and inorder, construct and return the binary tree.\n\nExample:\nInput: preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]\nOutput: tree with root 3\n\nConstraints:\n- 1 <= preorder.length <= 3000\n- All values are unique`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def build_tree(preorder, inorder)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_example
  root = build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
  assert_equal(3, root.val)
  assert_equal(9, root.left.val)
  assert_equal(20, root.right.val)
  assert_equal(15, root.right.left.val)
  assert_equal(7, root.right.right.val)
end

def test_single
  root = build_tree([1], [1])
  assert_equal(1, root.val)
  assert_equal(nil, root.left)
  assert_equal(nil, root.right)
end

def test_left_only
  root = build_tree([1, 2], [2, 1])
  assert_equal(1, root.val)
  assert_equal(2, root.left.val)
  assert_equal(nil, root.right)
end

def test_right_only
  root = build_tree([1, 2], [1, 2])
  assert_equal(1, root.val)
  assert_equal(2, root.right.val)
  assert_equal(nil, root.left)
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def build_tree(preorder, inorder)
  return nil if preorder.empty? || inorder.empty?
  root_val = preorder[0]
  root = TreeNode.new(root_val)
  mid = inorder.index(root_val)
  root.left = build_tree(preorder[1..mid], inorder[0...mid])
  root.right = build_tree(preorder[(mid + 1)..-1], inorder[(mid + 1)..-1])
  root
end`,
    usage: null,
    tags: ["tree", "dfs", "divide-and-conquer", "blind75"],
  },
  {
    name: "Validate Binary Search Tree",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given the root of a binary tree, determine if it is a valid binary search tree. A BST requires left subtree values < node < right subtree values.\n\nExample:\nInput: root=[2,1,3]\nOutput: True\n\nInput: root=[5,1,4,null,null,3,6]\nOutput: False\n\nConstraints:\n- 1 <= number of nodes <= 10^4\n- -2^31 <= Node.val <= 2^31 - 1`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_valid_bst(root)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_valid_bst
  root = make_tree([2, 1, 3])
  assert_equal(true, is_valid_bst(root))
end

def test_invalid_bst
  root = make_tree([5, 1, 4, nil, nil, 3, 6])
  assert_equal(false, is_valid_bst(root))
end

def test_single_node
  root = make_tree([1])
  assert_equal(true, is_valid_bst(root))
end

def test_subtree_violation
  root = TreeNode.new(5)
  root.left = TreeNode.new(4)
  root.right = TreeNode.new(6)
  root.right.left = TreeNode.new(3)
  root.right.right = TreeNode.new(7)
  assert_equal(false, is_valid_bst(root))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_valid_bst(root)
  validate = lambda do |node, min_val, max_val|
    return true if node.nil?
    return false if node.val <= min_val || node.val >= max_val
    validate.call(node.left, min_val, node.val) && validate.call(node.right, node.val, max_val)
  end

  validate.call(root, -Float::INFINITY, Float::INFINITY)
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Kth Smallest Element in a BST",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given the root of a BST and an integer k, return the kth smallest value (1-indexed).\n\nExample:\nInput: root=[3,1,4,null,2], k=1\nOutput: 1\n\nConstraints:\n- 1 <= k <= number of nodes <= 10^4\n- 0 <= Node.val <= 10^4`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def kth_smallest(root, k)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def make_tree(vals)
  return nil if vals.nil? || vals.empty?
  root = TreeNode.new(vals[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < vals.length
    node = queue.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      queue.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      queue.push(node.right)
    end
    i += 1
  end
  root
end

def test_first_smallest
  root = make_tree([3, 1, 4, nil, 2])
  assert_equal(1, kth_smallest(root, 1))
end

def test_third_smallest
  root = make_tree([5, 3, 6, 2, 4, nil, nil, 1])
  assert_equal(3, kth_smallest(root, 3))
end

def test_single_node
  root = make_tree([1])
  assert_equal(1, kth_smallest(root, 1))
end

def test_last_element
  root = make_tree([3, 1, 4, nil, 2])
  assert_equal(4, kth_smallest(root, 4))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def kth_smallest(root, k)
  count = [0]
  result = [0]

  dfs = lambda do |node|
    return if node.nil?
    dfs.call(node.left)
    count[0] += 1
    if count[0] == k
      result[0] = node.val
      return
    end
    dfs.call(node.right)
  end

  dfs.call(root)
  result[0]
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Lowest Common Ancestor of a Binary Search Tree",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given a BST, find the lowest common ancestor (LCA) of two nodes p and q. LCA is the lowest node that has both p and q as descendants (a node is a descendant of itself).\n\nExample:\nInput: root=[6,2,8,0,4,7,9,null,null,3,5], p=2, q=8\nOutput: 6\n\nConstraints:\n- 2 <= number of nodes <= 10^5\n- -10^9 <= Node.val <= 10^9\n- All values unique\n- p and q exist in the BST`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def lowest_common_ancestor(root, p, q)
  raise NotImplementedError
end`,
    testCode: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def test_lca_root
  root = TreeNode.new(6)
  n2 = TreeNode.new(2)
  n8 = TreeNode.new(8)
  n0 = TreeNode.new(0)
  n4 = TreeNode.new(4)
  n7 = TreeNode.new(7)
  n9 = TreeNode.new(9)
  root.left = n2
  root.right = n8
  n2.left = n0
  n2.right = n4
  n8.left = n7
  n8.right = n9
  result = lowest_common_ancestor(root, n2, n8)
  assert_equal(6, result.val)
end

def test_lca_left_subtree
  root = TreeNode.new(6)
  n2 = TreeNode.new(2)
  n8 = TreeNode.new(8)
  n0 = TreeNode.new(0)
  n4 = TreeNode.new(4)
  root.left = n2
  root.right = n8
  n2.left = n0
  n2.right = n4
  result = lowest_common_ancestor(root, n2, n4)
  assert_equal(2, result.val)
end

def test_lca_ancestor_is_node
  root = TreeNode.new(2)
  n1 = TreeNode.new(1)
  root.left = n1
  result = lowest_common_ancestor(root, root, n1)
  assert_equal(2, result.val)
end

def test_lca_single_path
  root = TreeNode.new(6)
  n2 = TreeNode.new(2)
  n0 = TreeNode.new(0)
  n4 = TreeNode.new(4)
  n3 = TreeNode.new(3)
  root.left = n2
  n2.left = n0
  n2.right = n4
  n4.left = n3
  result = lowest_common_ancestor(root, n0, n3)
  assert_equal(2, result.val)
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def lowest_common_ancestor(root, p, q)
  return lowest_common_ancestor(root.left, p, q) if p.val < root.val && q.val < root.val
  return lowest_common_ancestor(root.right, p, q) if p.val > root.val && q.val > root.val
  root
end`,
    usage: null,
    tags: ["tree", "dfs", "blind75"],
  },
  {
    name: "Add and Search Word",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Design a data structure that supports adding new words and searching a string where '.' can match any letter.\n\nExample:\nwd = WordDictionary()\nwd.add_word("bad")\nwd.add_word("dad")\nwd.search("pad") -> False\nwd.search(".ad") -> True\nwd.search("b..") -> True\n\nConstraints:\n- 1 <= word.length <= 25\n- word consists of lowercase English letters or '.'\n- At most 10^4 calls to add_word and search`,
    code: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

class WordDictionary
  def initialize
    raise NotImplementedError
  end

  def add_word(word)
    raise NotImplementedError
  end

  def search(word)
    raise NotImplementedError
  end
end`,
    testCode: `def test_basic_search
  wd = WordDictionary.new
  wd.add_word("bad")
  wd.add_word("dad")
  assert_equal(false, wd.search("pad"))
  assert_equal(true, wd.search(".ad"))
  assert_equal(true, wd.search("b.."))
end

def test_exact_match
  wd = WordDictionary.new
  wd.add_word("hello")
  assert_equal(true, wd.search("hello"))
  assert_equal(false, wd.search("hell"))
end

def test_wildcard_all
  wd = WordDictionary.new
  wd.add_word("abc")
  assert_equal(true, wd.search("..."))
  assert_equal(false, wd.search("...."))
end

def test_not_found
  wd = WordDictionary.new
  wd.add_word("cat")
  assert_equal(false, wd.search("dog"))
  assert_equal(false, wd.search(".og"))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right

  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

class WordDictionary
  attr_accessor :children, :is_end

  def initialize
    @children = {}
    @is_end = false
  end

  def add_word(word)
    node = self
    word.each_char do |ch|
      node.children[ch] = WordDictionary.new unless node.children.key?(ch)
      node = node.children[ch]
    end
    node.is_end = true
  end

  def search(word)
    dfs = lambda do |node, i|
      return node.is_end if i == word.length
      ch = word[i]
      if ch == '.'
        node.children.each_value do |child|
          return true if dfs.call(child, i + 1)
        end
        return false
      end
      return false unless node.children.key?(ch)
      dfs.call(node.children[ch], i + 1)
    end

    dfs.call(self, 0)
  end
end`,
    usage: null,
    tags: ["trie", "dfs", "blind75"],
  },
  {
    name: "Word Search II",
    category: "trees",
    language: "ruby",
    difficulty: "hard",
    description: `Given an m x n board of characters and a list of strings words, return all words that can be found in the board. Words can be constructed from sequentially adjacent cells (horizontally/vertically). A cell may not be used more than once per word.\n\nExample:\nInput: board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words=["oath","pea","eat","rain"]\nOutput: ["eat","oath"]\n\nConstraints:\n- m == board.length, n == board[0].length\n- 1 <= m, n <= 12\n- 1 <= words.length <= 3 * 10^4\n- 1 <= words[i].length <= 10`,
    code: `def find_words(board, words)
  raise NotImplementedError
end`,
    testCode: `def test_example
  board = [
    ["o", "a", "a", "n"],
    ["e", "t", "a", "e"],
    ["i", "h", "k", "r"],
    ["i", "f", "l", "v"]
  ]
  words = ["oath", "pea", "eat", "rain"]
  result = find_words(board, words)
  assert_equal(["eat", "oath"].sort, result.sort)
end

def test_no_match
  board = [["a", "b"], ["c", "d"]]
  words = ["xyz"]
  assert_equal([], find_words(board, words))
end

def test_single_cell
  board = [["a"]]
  words = ["a"]
  assert_equal(["a"], find_words(board, words))
end

def test_multiple_words
  board = [["o", "a", "t", "h"], ["e", "a", "t", "s"]]
  words = ["eat", "oath", "none"]
  result = find_words(board, words)
  assert_equal(["eat", "oath"].sort, result.sort)
end`,
    solution: `class WordSearchTrieNode
  attr_accessor :children, :word

  def initialize
    @children = {}
    @word = nil
  end
end

def find_words(board, words)
  root = WordSearchTrieNode.new
  words.each do |word|
    node = root
    word.each_char do |ch|
      node.children[ch] = WordSearchTrieNode.new unless node.children.key?(ch)
      node = node.children[ch]
    end
    node.word = word
  end

  rows = board.length
  cols = board[0].length
  result = []

  dfs = lambda do |node, r, c|
    ch = board[r][c]
    next unless node.children.key?(ch)
    next_node = node.children[ch]
    if next_node.word
      result.push(next_node.word)
      next_node.word = nil
    end
    board[r][c] = '#'
    [[0, 1], [0, -1], [1, 0], [-1, 0]].each do |dr, dc|
      nr = r + dr
      nc = c + dc
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] != '#'
        dfs.call(next_node, nr, nc)
      end
    end
    board[r][c] = ch
    if next_node.children.empty? && next_node.word.nil?
      node.children.delete(ch)
    end
  end

  (0...rows).each do |r|
    (0...cols).each do |c|
      dfs.call(root, r, c)
    end
  end

  result
end`,
    usage: null,
    tags: ["trie", "backtracking", "blind75"],
  },
];

export { blind75Part7 };
