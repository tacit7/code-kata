import type { SeedKata } from "../types/editor";

const blind75Part3: SeedKata[] = [
  {
    name: "Clone Graph",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: "Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of neighbors.\n\nExample:\nInput: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]] (deep copy)\n\nConstraints:\n- The number of nodes is in range [0, 100]\n- Node values are unique\n- No repeated edges, no self-loops",
    code: `class Node
  attr_accessor :val, :neighbors

  def initialize(val = 0, neighbors = nil)
    @val = val
    @neighbors = neighbors || []
  end
end

def clone_graph(node)
  raise NotImplementedError
end`,
    testCode: `class Node
  attr_accessor :val, :neighbors

  def initialize(val = 0, neighbors = nil)
    @val = val
    @neighbors = neighbors || []
  end
end

def test_clone_graph_none
  assert_equal(nil, clone_graph(nil))
end

def test_clone_graph_single_node
  node = Node.new(1)
  cloned = clone_graph(node)
  assert_equal(1, cloned.val)
  assert_false(cloned.equal?(node))
  assert_equal([], cloned.neighbors)
end

def test_clone_graph_two_nodes
  node1 = Node.new(1)
  node2 = Node.new(2)
  node1.neighbors = [node2]
  node2.neighbors = [node1]
  cloned = clone_graph(node1)
  assert_equal(1, cloned.val)
  assert_false(cloned.equal?(node1))
  assert_equal(2, cloned.neighbors[0].val)
  assert_false(cloned.neighbors[0].equal?(node2))
end

def test_clone_graph_structure_preserved
  node1 = Node.new(1)
  node2 = Node.new(2)
  node3 = Node.new(3)
  node1.neighbors = [node2, node3]
  node2.neighbors = [node1]
  node3.neighbors = [node1]
  cloned = clone_graph(node1)
  assert_equal(1, cloned.val)
  neighbor_vals = cloned.neighbors.map(&:val).sort
  assert_equal([2, 3], neighbor_vals)
end`,
    solution: `class Node
  attr_accessor :val, :neighbors

  def initialize(val = 0, neighbors = nil)
    @val = val
    @neighbors = neighbors || []
  end
end

def clone_graph(node)
  return nil unless node

  clones = { node => Node.new(node.val) }
  queue = [node]

  until queue.empty?
    curr = queue.shift
    curr.neighbors.each do |neighbor|
      unless clones.key?(neighbor)
        clones[neighbor] = Node.new(neighbor.val)
        queue.push(neighbor)
      end
      clones[curr].neighbors.push(clones[neighbor])
    end
  end

  clones[node]
end`,
    usage: null,
    tags: ["graph", "bfs", "dfs", "blind75"],
  },
  {
    name: "Course Schedule",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given numCourses and prerequisites list where [a,b] means take b before a, return true if possible to finish all courses.\n\nExample:\nInput: numCourses=2, prerequisites=[[1,0]]\nOutput: True\n\nInput: numCourses=2, prerequisites=[[1,0],[0,1]]\nOutput: False\n\nConstraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000`,
    code: `def can_finish(num_courses, prerequisites)
  raise NotImplementedError
end`,
    testCode: `def test_can_finish_basic
  assert_equal(true, can_finish(2, [[1, 0]]))
end

def test_can_finish_cycle
  assert_equal(false, can_finish(2, [[1, 0], [0, 1]]))
end

def test_can_finish_no_prereqs
  assert_equal(true, can_finish(1, []))
end

def test_can_finish_longer_cycle
  assert_equal(false, can_finish(3, [[0, 1], [1, 2], [2, 0]]))
end`,
    solution: `def can_finish(num_courses, prerequisites)
  graph = Array.new(num_courses) { [] }
  prerequisites.each do |a, b|
    graph[a].push(b)
  end

  # 0 = unvisited, 1 = visiting, 2 = visited
  state = Array.new(num_courses, 0)

  has_cycle = nil
  has_cycle = lambda do |node|
    return true if state[node] == 1
    return false if state[node] == 2

    state[node] = 1
    graph[node].each do |neighbor|
      return true if has_cycle.call(neighbor)
    end
    state[node] = 2
    false
  end

  (0...num_courses).none? { |i| state[i].zero? && has_cycle.call(i) }
end`,
    usage: null,
    tags: ["graph", "topological-sort", "blind75"],
  },
  {
    name: "Pacific Atlantic Water Flow",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given m x n island heights matrix, rain can flow to Pacific (top/left edges) and Atlantic (bottom/right edges) if neighboring cell height <= current. Return list of cells that can flow to both oceans.\n\nExample:\nInput: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]\n\nConstraints:\n- m == heights.length, n == heights[0].length\n- 1 <= m, n <= 200`,
    code: `def pacific_atlantic(heights)
  raise NotImplementedError
end`,
    testCode: `def test_pacific_atlantic_example
  heights = [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4],
  ]
  result = pacific_atlantic(heights).sort
  assert_equal([[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]], result)
end

def test_pacific_atlantic_single_cell
  assert_equal([[0, 0]], pacific_atlantic([[1]]))
end

def test_pacific_atlantic_all_same
  heights = [[1, 1], [1, 1]]
  result = pacific_atlantic(heights).sort
  assert_equal([[0, 0], [0, 1], [1, 0], [1, 1]], result)
end

def test_pacific_atlantic_single_row
  heights = [[1, 2, 3]]
  result = pacific_atlantic(heights).sort
  assert_true(result.include?([0, 2]))
end`,
    solution: `def pacific_atlantic(heights)
  return [] if heights.empty?

  m = heights.length
  n = heights[0].length

  bfs = lambda do |starts|
    visited = {}
    starts.each { |s| visited[s] = true }
    queue = starts.dup
    until queue.empty?
      r, c = queue.shift
      [[0, 1], [0, -1], [1, 0], [-1, 0]].each do |dr, dc|
        nr = r + dr
        nc = c + dc
        if nr >= 0 && nr < m && nc >= 0 && nc < n && !visited.key?([nr, nc]) && heights[nr][nc] >= heights[r][c]
          visited[[nr, nc]] = true
          queue.push([nr, nc])
        end
      end
    end
    visited.keys
  end

  pacific_starts = (0...n).map { |c| [0, c] } + (0...m).map { |r| [r, 0] }
  atlantic_starts = (0...n).map { |c| [m - 1, c] } + (0...m).map { |r| [r, n - 1] }

  pacific = bfs.call(pacific_starts)
  atlantic = bfs.call(atlantic_starts)

  (pacific & atlantic).map { |r, c| [r, c] }
end`,
    usage: null,
    tags: ["graph", "dfs", "bfs", "blind75"],
  },
  {
    name: "Number of Islands",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent '1's horizontally or vertically.\n\nExample:\nInput: grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]\nOutput: 3\n\nConstraints:\n- 1 <= m, n <= 300`,
    code: `def num_islands(grid)
  raise NotImplementedError
end`,
    testCode: `def test_num_islands_example
  grid = [
    ["1", "1", "0", "0"],
    ["1", "1", "0", "0"],
    ["0", "0", "1", "0"],
    ["0", "0", "0", "1"],
  ]
  assert_equal(3, num_islands(grid))
end

def test_num_islands_single_island
  grid = [["1", "1"], ["1", "1"]]
  assert_equal(1, num_islands(grid))
end

def test_num_islands_no_land
  grid = [["0", "0"], ["0", "0"]]
  assert_equal(0, num_islands(grid))
end

def test_num_islands_all_separate
  grid = [["1", "0", "1"], ["0", "1", "0"], ["1", "0", "1"]]
  assert_equal(5, num_islands(grid))
end`,
    solution: `def num_islands(grid)
  return 0 if grid.empty?

  m = grid.length
  n = grid[0].length
  count = 0

  dfs = nil
  dfs = lambda do |r, c|
    return if r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != "1"

    grid[r][c] = "0"
    dfs.call(r + 1, c)
    dfs.call(r - 1, c)
    dfs.call(r, c + 1)
    dfs.call(r, c - 1)
  end

  (0...m).each do |r|
    (0...n).each do |c|
      if grid[r][c] == "1"
        count += 1
        dfs.call(r, c)
      end
    end
  end

  count
end`,
    usage: null,
    tags: ["graph", "dfs", "bfs", "blind75"],
  },
  {
    name: "Longest Consecutive Sequence",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given an unsorted array of integers, return the length of the longest consecutive elements sequence. O(n) time.\n\nExample:\nInput: nums = [100,4,200,1,3,2]\nOutput: 4 ([1,2,3,4])\n\nConstraints:\n- 0 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9`,
    code: `def longest_consecutive(nums)
  raise NotImplementedError
end`,
    testCode: `def test_longest_consecutive_example
  assert_equal(4, longest_consecutive([100, 4, 200, 1, 3, 2]))
end

def test_longest_consecutive_long
  assert_equal(9, longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]))
end

def test_longest_consecutive_empty
  assert_equal(0, longest_consecutive([]))
end

def test_longest_consecutive_single
  assert_equal(1, longest_consecutive([42]))
end`,
    solution: `def longest_consecutive(nums)
  num_set = {}
  nums.each { |n| num_set[n] = true }
  best = 0

  num_set.each_key do |num|
    unless num_set.key?(num - 1)
      length = 1
      length += 1 while num_set.key?(num + length)
      best = [best, length].max
    end
  end

  best
end`,
    usage: null,
    tags: ["array", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Alien Dictionary",
    category: "graph",
    language: "ruby",
    difficulty: "hard",
    description: `Given a sorted list of words in an alien language, determine the order of characters. Return the characters in lexicographic order per alien alphabet. Return "" if invalid (cycle detected).\n\nExample:\nInput: words = ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"\n\nConstraints:\n- 1 <= words.length <= 12\n- 1 <= words[i].length <= 100\n- All characters lowercase`,
    code: `def alien_order(words)
  raise NotImplementedError
end`,
    testCode: `def test_alien_order_example
  result = alien_order(["wrt", "wrf", "er", "ett", "rftt"])
  assert_equal(["e", "f", "r", "t", "w"], result.chars.sort)
  order = {}
  result.chars.each_with_index { |ch, i| order[ch] = i }
  assert_true(order["w"] < order["e"])
  assert_true(order["r"] < order["t"])
  assert_true(order["e"] < order["r"])
end

def test_alien_order_simple
  assert_equal("zx", alien_order(["z", "x"]))
end

def test_alien_order_cycle
  assert_equal("", alien_order(["z", "x", "z"]))
end

def test_alien_order_single_word
  result = alien_order(["abc"])
  assert_equal(["a", "b", "c"], result.chars.sort)
end`,
    solution: `def alien_order(words)
  adj = Hash.new { |h, k| h[k] = {} }
  in_degree = {}
  words.each { |word| word.each_char { |ch| in_degree[ch] ||= 0 } }

  (0...words.length - 1).each do |i|
    w1 = words[i]
    w2 = words[i + 1]
    min_len = [w1.length, w2.length].min
    if w1.length > w2.length && w1[0...min_len] == w2[0...min_len]
      return ""
    end

    (0...min_len).each do |j|
      if w1[j] != w2[j]
        unless adj[w1[j]].key?(w2[j])
          adj[w1[j]][w2[j]] = true
          in_degree[w2[j]] += 1
        end
        break
      end
    end
  end

  queue = in_degree.keys.select { |ch| in_degree[ch] == 0 }
  result = []

  until queue.empty?
    ch = queue.shift
    result.push(ch)
    adj[ch].each_key do |neighbor|
      in_degree[neighbor] -= 1
      queue.push(neighbor) if in_degree[neighbor] == 0
    end
  end

  return "" if result.length != in_degree.length

  result.join
end`,
    usage: null,
    tags: ["graph", "topological-sort", "blind75"],
  },
  {
    name: "Graph Valid Tree",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given n nodes (0 to n-1) and a list of undirected edges, return true if the edges form a valid tree (connected with no cycles).\n\nExample:\nInput: n=5, edges=[[0,1],[0,2],[0,3],[1,4]]\nOutput: True\n\nConstraints:\n- 1 <= n <= 2000\n- 0 <= edges.length <= 5000`,
    code: `def valid_tree(n, edges)
  raise NotImplementedError
end`,
    testCode: `def test_valid_tree_true
  assert_equal(true, valid_tree(5, [[0, 1], [0, 2], [0, 3], [1, 4]]))
end

def test_valid_tree_cycle
  assert_equal(false, valid_tree(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]))
end

def test_valid_tree_single_node
  assert_equal(true, valid_tree(1, []))
end

def test_valid_tree_disconnected
  assert_equal(false, valid_tree(4, [[0, 1], [2, 3]]))
end`,
    solution: `def valid_tree(n, edges)
  return false if edges.length != n - 1

  parent = (0...n).to_a
  rank = Array.new(n, 0)

  find = lambda do |x|
    while parent[x] != x
      parent[x] = parent[parent[x]]
      x = parent[x]
    end
    x
  end

  union = lambda do |x, y|
    px = find.call(x)
    py = find.call(y)
    return false if px == py

    px, py = py, px if rank[px] < rank[py]
    parent[py] = px
    rank[px] += 1 if rank[px] == rank[py]
    true
  end

  edges.all? { |u, v| union.call(u, v) }
end`,
    usage: null,
    tags: ["graph", "union-find", "blind75"],
  },
  {
    name: "Number of Connected Components in an Undirected Graph",
    category: "graph",
    language: "ruby",
    difficulty: "medium",
    description: `Given n nodes (0 to n-1) and a list of undirected edges, return the number of connected components.\n\nExample:\nInput: n=5, edges=[[0,1],[1,2],[3,4]]\nOutput: 2\n\nConstraints:\n- 1 <= n <= 2000\n- 1 <= edges.length <= 5000`,
    code: `def count_components(n, edges)
  raise NotImplementedError
end`,
    testCode: `def test_count_components_two
  assert_equal(2, count_components(5, [[0, 1], [1, 2], [3, 4]]))
end

def test_count_components_one
  assert_equal(1, count_components(5, [[0, 1], [1, 2], [2, 3], [3, 4]]))
end

def test_count_components_all_isolated
  assert_equal(4, count_components(4, []))
end

def test_count_components_single_node
  assert_equal(1, count_components(1, []))
end`,
    solution: `def count_components(n, edges)
  parent = (0...n).to_a
  rank = Array.new(n, 0)

  find = lambda do |x|
    while parent[x] != x
      parent[x] = parent[parent[x]]
      x = parent[x]
    end
    x
  end

  union = lambda do |x, y|
    px = find.call(x)
    py = find.call(y)
    return 0 if px == py

    px, py = py, px if rank[px] < rank[py]
    parent[py] = px
    rank[px] += 1 if rank[px] == rank[py]
    1
  end

  components = n
  edges.each do |u, v|
    components -= union.call(u, v)
  end

  components
end`,
    usage: null,
    tags: ["graph", "union-find", "blind75"],
  },
];

export { blind75Part3 };
