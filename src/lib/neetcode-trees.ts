import type { SeedKata } from "../types/editor";

const TREE_NODE_CLASS = `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end`;

const MAKE_TREE_HELPER = `def make_tree(vals)
  return nil if vals.empty?
  root = TreeNode.new(vals[0])
  q = [root]
  i = 1
  while !q.empty? && i < vals.length
    node = q.shift
    if i < vals.length && !vals[i].nil?
      node.left = TreeNode.new(vals[i])
      q.push(node.left)
    end
    i += 1
    if i < vals.length && !vals[i].nil?
      node.right = TreeNode.new(vals[i])
      q.push(node.right)
    end
    i += 1
  end
  root
end`;

const TEST_HEADER = `${TREE_NODE_CLASS}

${MAKE_TREE_HELPER}

`;

const neetcodeTrees: SeedKata[] = [
  {
    name: "Diameter of Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given the root of a binary tree, return the length of the diameter of the tree.\n\nThe diameter is the length of the longest path between any two nodes. This path may or may not pass through the root.\n\nThe length of a path between two nodes is the number of edges between them.\n\nExample 1:\nInput: root = [1,2,3,4,5]\nOutput: 3  (path: 4 → 2 → 1 → 3, or 5 → 2 → 1 → 3)\n\nExample 2:\nInput: root = [1,2]\nOutput: 1\n\nConstraints:\n- The number of nodes is in the range [1, 10^4].\n- -100 <= Node.val <= 100\n\nRef: LeetCode #543 Diameter of Binary Tree`,
    code: `def diameter_of_binary_tree(root)
  raise NotImplementedError
end`,
    testCode: `${TEST_HEADER}def test_diameter_single
  root = make_tree([1])
  assert_equal(0, diameter_of_binary_tree(root))
end

def test_diameter_three_nodes
  root = make_tree([1, 2, 3])
  assert_equal(2, diameter_of_binary_tree(root))
end

def test_diameter_five_nodes
  root = make_tree([1, 2, 3, 4, 5])
  assert_equal(3, diameter_of_binary_tree(root))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def diameter_of_binary_tree(root)
  result = [0]

  dfs = lambda do |node|
    return 0 unless node
    left = dfs.call(node.left)
    right = dfs.call(node.right)
    result[0] = [result[0], left + right].max
    1 + [left, right].max
  end

  dfs.call(root)
  result[0]
end`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
  {
    name: "Balanced Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "easy",
    description: `Given a binary tree, determine if it is height-balanced.\n\nA binary tree is height-balanced if the depth of the two subtrees of every node never differs by more than one.\n\nExample 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: True\n\nExample 2:\nInput: root = [1,2,2,3,3,null,null,4,4]\nOutput: False\n\nExample 3:\nInput: root = []\nOutput: True\n\nConstraints:\n- The number of nodes is in the range [0, 5000].\n- -10^4 <= Node.val <= 10^4\n\nRef: LeetCode #110 Balanced Binary Tree`,
    code: `def is_balanced(root)
  raise NotImplementedError
end`,
    testCode: `${TEST_HEADER}def test_balanced_true
  root = make_tree([3, 9, 20, nil, nil, 15, 7])
  assert_true(is_balanced(root))
end

def test_balanced_false
  root = make_tree([1, 2, 2, 3, 3, nil, nil, 4, 4])
  assert_false(is_balanced(root))
end

def test_balanced_empty
  assert_true(is_balanced(nil))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def is_balanced(root)
  check = lambda do |node|
    return 0 unless node
    left = check.call(node.left)
    return -1 if left == -1
    right = check.call(node.right)
    return -1 if right == -1
    return -1 if (left - right).abs > 1
    1 + [left, right].max
  end

  check.call(root) != -1
end`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
  {
    name: "Binary Tree Level Order Traversal",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).\n\nExample 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n\nExample 2:\nInput: root = [1]\nOutput: [[1]]\n\nExample 3:\nInput: root = []\nOutput: []\n\nConstraints:\n- The number of nodes is in the range [0, 2000].\n- -1000 <= Node.val <= 1000\n\nRef: LeetCode #102 Binary Tree Level Order Traversal`,
    code: `def level_order(root)
  raise NotImplementedError
end`,
    testCode: `${TEST_HEADER}def test_level_order_basic
  root = make_tree([3, 9, 20, nil, nil, 15, 7])
  assert_equal([[3], [9, 20], [15, 7]], level_order(root))
end

def test_level_order_single
  root = make_tree([1])
  assert_equal([[1]], level_order(root))
end

def test_level_order_empty
  assert_equal([], level_order(nil))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def level_order(root)
  return [] unless root
  result = []
  q = [root]
  until q.empty?
    level = []
    q.length.times do
      node = q.shift
      level << node.val
      q.push(node.left) if node.left
      q.push(node.right) if node.right
    end
    result << level
  end
  result
end`,
    usage: null,
    tags: ["trees", "bfs", "neetcode"],
  },
  {
    name: "Binary Tree Right Side View",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom.\n\nExample 1:\nInput: root = [1,2,3,null,5,null,4]\nOutput: [1,3,4]\n\nExample 2:\nInput: root = [1,null,3]\nOutput: [1,3]\n\nExample 3:\nInput: root = []\nOutput: []\n\nConstraints:\n- The number of nodes is in the range [0, 100].\n- -100 <= Node.val <= 100\n\nRef: LeetCode #199 Binary Tree Right Side View`,
    code: `def right_side_view(root)
  raise NotImplementedError
end`,
    testCode: `${TEST_HEADER}def test_right_side_basic
  root = make_tree([1, 2, 3, nil, 5, nil, 4])
  assert_equal([1, 3, 4], right_side_view(root))
end

def test_right_side_skewed
  root = make_tree([1, nil, 3])
  assert_equal([1, 3], right_side_view(root))
end

def test_right_side_empty
  assert_equal([], right_side_view(nil))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def right_side_view(root)
  return [] unless root
  result = []
  q = [root]
  until q.empty?
    q.length.times do |i|
      node = q.shift
      result << node.val if i == 0
      q.push(node.right) if node.right
      q.push(node.left) if node.left
    end
  end
  result
end`,
    usage: null,
    tags: ["trees", "bfs", "dfs", "neetcode"],
  },
  {
    name: "Count Good Nodes In Binary Tree",
    category: "trees",
    language: "ruby",
    difficulty: "medium",
    description: `Given a binary tree root, a node X in the tree is named "good" if in the path from root to X there are no nodes with a value greater than X.\n\nReturn the number of good nodes in the binary tree.\n\nExample 1:\nInput: root = [3,1,4,3,null,1,5]\nOutput: 4  (root=3, 4, 3 under left, 5 are good)\n\nExample 2:\nInput: root = [3,3,null,4,2]\nOutput: 3  (root=3, left 3, and 4 are good)\n\nExample 3:\nInput: root = [1]\nOutput: 1\n\nConstraints:\n- The number of nodes in the binary tree is in the range [1, 10^5].\n- Each node's value is between [-10^4, 10^4].\n\nRef: LeetCode #1448 Count Good Nodes In Binary Tree`,
    code: `def good_nodes(root)
  raise NotImplementedError
end`,
    testCode: `${TEST_HEADER}def test_good_nodes_basic
  root = make_tree([3, 1, 4, 3, nil, 1, 5])
  assert_equal(4, good_nodes(root))
end

def test_good_nodes_left_heavy
  root = make_tree([3, 3, nil, 4, 2])
  assert_equal(3, good_nodes(root))
end

def test_good_nodes_single
  root = make_tree([1])
  assert_equal(1, good_nodes(root))
end`,
    solution: `class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def good_nodes(root)
  dfs = lambda do |node, max_so_far|
    return 0 unless node
    count = node.val >= max_so_far ? 1 : 0
    new_max = [max_so_far, node.val].max
    count + dfs.call(node.left, new_max) + dfs.call(node.right, new_max)
  end

  dfs.call(root, -Float::INFINITY)
end`,
    usage: null,
    tags: ["trees", "dfs", "neetcode"],
  },
];

export { neetcodeTrees };
