import type { SeedKata } from "../types/editor";

const neetcodeGraphs: SeedKata[] = [
  {
    name: "Max Area of Island",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `Given a binary matrix grid, return the maximum area of an island. An island is a group of 1s connected 4-directionally (up, down, left, right). If there is no island, return 0.\n\nExample 1:\nInput: grid = [\n  [0,0,1,0,0,0,0,1,0,0,0,0,0],\n  [0,0,0,0,0,0,0,1,1,1,0,0,0],\n  [0,1,1,0,1,0,0,0,0,0,0,0,0],\n  [0,1,0,0,1,1,0,0,1,0,1,0,0],\n  [0,1,0,0,1,1,0,0,1,1,1,0,0],\n  [0,0,0,0,0,0,0,0,0,0,1,0,0],\n  [0,0,0,0,0,0,0,1,1,1,0,0,0],\n  [0,0,0,0,0,0,0,1,1,0,0,0,0]\n]\nOutput: 6\n\nExample 2:\nInput: grid = [[0,0,0,0,0,0,0,0]]\nOutput: 0\n\nConstraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 50\n- grid[i][j] is 0 or 1\n\nRef: LeetCode #695 Max Area of Island`,
    code: `def max_area_of_island(grid)
  raise NotImplementedError
end`,
    testCode: `def test_max_area_standard
  grid = [
    [0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0],
    [0,1,1,0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,1,1,0,0,1,0,1,0,0],
    [0,1,0,0,1,1,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0],
  ]
  assert_equal(6, max_area_of_island(grid))
end

def test_max_area_all_zeros
  grid = [[0,0,0,0,0,0,0,0]]
  assert_equal(0, max_area_of_island(grid))
end

def test_max_area_single_island
  grid = [[1,1],[1,0]]
  assert_equal(3, max_area_of_island(grid))
end

def test_max_area_single_cell
  grid = [[1]]
  assert_equal(1, max_area_of_island(grid))
end`,
    solution: `def max_area_of_island(grid)
  rows, cols = grid.length, grid[0].length
  visited = {}

  dfs = lambda do |r, c|
    return 0 if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == 0 || visited[[r, c]]
    visited[[r, c]] = true
    1 + dfs.call(r + 1, c) + dfs.call(r - 1, c) + dfs.call(r, c + 1) + dfs.call(r, c - 1)
  end

  max_area = 0
  (0...rows).each do |r|
    (0...cols).each do |c|
      area = dfs.call(r, c)
      max_area = area if area > max_area
    end
  end
  max_area
end`,
    usage: null,
    tags: ["graphs", "dfs", "bfs", "neetcode"],
  },
  {
    name: "Walls And Gates",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `You are given a m x n 2D grid initialized with these three possible values:\n- -1: a wall or obstacle\n- 0: a gate\n- 2147483647 (INF): an empty room\n\nFill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave it as INF.\n\nExample:\nInput:\nINF  -1  0  INF\nINF INF INF  -1\nINF  -1 INF  -1\n  0  -1 INF INF\n\nOutput:\n  3  -1  0   1\n  2   2  1  -1\n  1  -1  2  -1\n  0  -1  3   4\n\nConstraints:\n- m == rooms.length, n == rooms[i].length\n- 1 <= m, n <= 250\n- rooms[i][j] is -1, 0, or 2^31 - 1\n\nRef: LeetCode #286 Walls and Gates`,
    code: `def walls_and_gates(rooms)
  raise NotImplementedError
end`,
    testCode: `def test_walls_and_gates_basic
  inf = 2147483647
  rooms = [
    [inf, -1,  0, inf],
    [inf, inf, inf, -1],
    [inf, -1,  inf, -1],
    [0,   -1,  inf, inf],
  ]
  walls_and_gates(rooms)
  assert_equal([
    [3,  -1, 0, 1],
    [2,   2, 1, -1],
    [1,  -1, 2, -1],
    [0,  -1, 3, 4],
  ], rooms)
end

def test_walls_and_gates_no_gates
  inf = 2147483647
  rooms = [[inf, inf], [inf, inf]]
  walls_and_gates(rooms)
  assert_equal([[inf, inf], [inf, inf]], rooms)
end

def test_walls_and_gates_all_gates
  rooms = [[0, 0], [0, 0]]
  walls_and_gates(rooms)
  assert_equal([[0, 0], [0, 0]], rooms)
end`,
    solution: `def walls_and_gates(rooms)
  inf = 2147483647
  rows, cols = rooms.length, rooms[0].length
  queue = []
  (0...rows).each do |r|
    (0...cols).each do |c|
      queue.push([r, c]) if rooms[r][c] == 0
    end
  end
  until queue.empty?
    r, c = queue.shift
    [[1,0],[-1,0],[0,1],[0,-1]].each do |dr, dc|
      nr, nc = r + dr, c + dc
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] == inf
        rooms[nr][nc] = rooms[r][c] + 1
        queue.push([nr, nc])
      end
    end
  end
end`,
    usage: null,
    tags: ["graphs", "bfs", "neetcode"],
  },
  {
    name: "Rotting Oranges",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `You are given a m x n grid where cells can be:\n- 0: empty\n- 1: fresh orange\n- 2: rotten orange\n\nEvery minute, any fresh orange 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh oranges remain, or -1 if it's impossible.\n\nExample 1:\nInput: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4\n\nExample 2:\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\n\nExample 3:\nInput: grid = [[0,2]]\nOutput: 0\n\nConstraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 10\n- grid[i][j] is 0, 1, or 2\n\nRef: LeetCode #994 Rotting Oranges`,
    code: `def oranges_rotting(grid)
  raise NotImplementedError
end`,
    testCode: `def test_rotting_oranges_basic
  assert_equal(4, oranges_rotting([[2,1,1],[1,1,0],[0,1,1]]))
end

def test_rotting_oranges_impossible
  assert_equal(-1, oranges_rotting([[2,1,1],[0,1,1],[1,0,1]]))
end

def test_rotting_oranges_no_fresh
  assert_equal(0, oranges_rotting([[0,2]]))
end

def test_rotting_oranges_all_fresh_no_rotten
  assert_equal(-1, oranges_rotting([[1,1],[1,1]]))
end

def test_rotting_oranges_empty
  assert_equal(0, oranges_rotting([[0]]))
end`,
    solution: `def oranges_rotting(grid)
  rows, cols = grid.length, grid[0].length
  queue = []
  fresh = 0
  (0...rows).each do |r|
    (0...cols).each do |c|
      if grid[r][c] == 2
        queue.push([r, c, 0])
      elsif grid[r][c] == 1
        fresh += 1
      end
    end
  end
  return 0 if fresh == 0
  time = 0
  until queue.empty?
    r, c, t = queue.shift
    [[1,0],[-1,0],[0,1],[0,-1]].each do |dr, dc|
      nr, nc = r + dr, c + dc
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1
        grid[nr][nc] = 2
        fresh -= 1
        time = t + 1
        queue.push([nr, nc, t + 1])
      end
    end
  end
  fresh == 0 ? time : -1
end`,
    usage: null,
    tags: ["graphs", "bfs", "neetcode"],
  },
  {
    name: "Surrounded Regions",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is captured by flipping all 'O's into 'X's in that region. Regions on the border are never captured.\n\nExample:\nInput:\n[["X","X","X","X"],\n ["X","O","O","X"],\n ["X","X","O","X"],\n ["X","O","X","X"]]\n\nOutput:\n[["X","X","X","X"],\n ["X","X","X","X"],\n ["X","X","X","X"],\n ["X","O","X","X"]]\n\nThe bottom 'O' is on the border and cannot be captured.\n\nConstraints:\n- m == board.length, n == board[i].length\n- 1 <= m, n <= 200\n- board[i][j] is 'X' or 'O'\n\nRef: LeetCode #130 Surrounded Regions`,
    code: `def solve(board)
  raise NotImplementedError
end`,
    testCode: `def test_surrounded_regions_basic
  board = [
    ["X","X","X","X"],
    ["X","O","O","X"],
    ["X","X","O","X"],
    ["X","O","X","X"],
  ]
  solve(board)
  assert_equal([
    ["X","X","X","X"],
    ["X","X","X","X"],
    ["X","X","X","X"],
    ["X","O","X","X"],
  ], board)
end

def test_surrounded_regions_all_x
  board = [["X","X"],["X","X"]]
  solve(board)
  assert_equal([["X","X"],["X","X"]], board)
end

def test_surrounded_regions_single
  board = [["O"]]
  solve(board)
  assert_equal([["O"]], board)
end`,
    solution: `def solve(board)
  rows, cols = board.length, board[0].length

  dfs = lambda do |r, c|
    return if r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] != 'O'
    board[r][c] = 'T'
    dfs.call(r + 1, c)
    dfs.call(r - 1, c)
    dfs.call(r, c + 1)
    dfs.call(r, c - 1)
  end

  (0...rows).each do |r|
    (0...cols).each do |c|
      if (r == 0 || r == rows - 1 || c == 0 || c == cols - 1) && board[r][c] == 'O'
        dfs.call(r, c)
      end
    end
  end

  (0...rows).each do |r|
    (0...cols).each do |c|
      if board[r][c] == 'O'
        board[r][c] = 'X'
      elsif board[r][c] == 'T'
        board[r][c] = 'O'
      end
    end
  end
end`,
    usage: null,
    tags: ["graphs", "dfs", "bfs", "neetcode"],
  },
  {
    name: "Course Schedule II",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `There are numCourses courses (0 to numCourses-1). Prerequisites[i] = [a, b] means you must take course b before course a. Return the ordering of courses to finish all of them. If impossible (cycle exists), return an empty list.\n\nExample 1:\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: [0,1]\n\nExample 2:\nInput: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3] or [0,1,2,3]\n\nExample 3:\nInput: numCourses = 1, prerequisites = []\nOutput: [0]\n\nConstraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= numCourses * (numCourses - 1)\n- prerequisites[i].length == 2\n- No duplicate prerequisites\n\nRef: LeetCode #210 Course Schedule II`,
    code: `def find_order(num_courses, prerequisites)
  raise NotImplementedError
end`,
    testCode: `def test_course_schedule_ii_basic
  assert_equal([0,1], find_order(2, [[1,0]]))
end

def test_course_schedule_ii_four_courses
  result = find_order(4, [[1,0],[2,0],[3,1],[3,2]])
  assert_true([[0,1,2,3], [0,2,1,3]].include?(result))
end

def test_course_schedule_ii_single
  assert_equal([0], find_order(1, []))
end

def test_course_schedule_ii_cycle
  assert_equal([], find_order(2, [[1,0],[0,1]]))
end`,
    solution: `def find_order(num_courses, prerequisites)
  prereq_map = {}
  (0...num_courses).each { |i| prereq_map[i] = [] }
  prerequisites.each do |a, b|
    prereq_map[a] << b
  end

  visited = {}
  cycle = {}
  output = []

  dfs = lambda do |course|
    return false if cycle[course]
    return true if visited[course]
    cycle[course] = true
    prereq_map[course].each do |pre|
      return false unless dfs.call(pre)
    end
    cycle.delete(course)
    visited[course] = true
    output << course
    true
  end

  (0...num_courses).each do |c|
    return [] unless dfs.call(c)
  end
  output
end`,
    usage: null,
    tags: ["graphs", "topological-sort", "dfs", "neetcode"],
  },
  {
    name: "Redundant Connection",
    category: "graphs",
    language: "ruby",
    difficulty: "medium",
    description: `A tree of n nodes (labeled 1 to n) has been grown by adding one extra edge, creating exactly one cycle. Given edges of the resulting graph, return the edge that can be removed to restore the tree. If multiple answers exist, return the last one in the input.\n\nExample 1:\nInput: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]\n\nExample 2:\nInput: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]\nOutput: [1,4]\n\nConstraints:\n- n == edges.length\n- 3 <= n <= 1000\n- edges[i].length == 2\n- 1 <= edges[i][0] < edges[i][1] <= n\n- No repeated edges\n\nRef: LeetCode #684 Redundant Connection`,
    code: `def find_redundant_connection(edges)
  raise NotImplementedError
end`,
    testCode: `def test_redundant_connection_basic
  assert_equal([2,3], find_redundant_connection([[1,2],[1,3],[2,3]]))
end

def test_redundant_connection_longer
  assert_equal([1,4], find_redundant_connection([[1,2],[2,3],[3,4],[1,4],[1,5]]))
end

def test_redundant_connection_two_nodes
  assert_equal([1,3], find_redundant_connection([[1,2],[2,3],[1,3]]))
end`,
    solution: `def find_redundant_connection(edges)
  n = edges.length
  parent = (0..n).to_a
  rank = Array.new(n + 1, 1)

  find = lambda do |x|
    while parent[x] != x
      parent[x] = parent[parent[x]]
      x = parent[x]
    end
    x
  end

  union = lambda do |x, y|
    px, py = find.call(x), find.call(y)
    return false if px == py
    if rank[px] < rank[py]
      px, py = py, px
    end
    parent[py] = px
    rank[px] += rank[py]
    true
  end

  edges.each do |u, v|
    return [u, v] unless union.call(u, v)
  end
  []
end`,
    usage: null,
    tags: ["graphs", "union-find", "neetcode"],
  },
  {
    name: "Word Ladder",
    category: "graphs",
    language: "ruby",
    difficulty: "hard",
    description: `Given two words beginWord and endWord, and a wordList dictionary, return the number of words in the shortest transformation sequence from beginWord to endWord. Each step changes exactly one letter, and each intermediate word must be in wordList. Return 0 if no such sequence exists.\n\nExample 1:\nInput: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5  (hit → hot → dot → dog → cog)\n\nExample 2:\nInput: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]\nOutput: 0  (cog not in wordList)\n\nConstraints:\n- 1 <= beginWord.length <= 10\n- endWord.length == beginWord.length\n- 1 <= wordList.length <= 5000\n- wordList[i].length == beginWord.length\n- beginWord, endWord, wordList[i] consist of lowercase English letters\n- beginWord != endWord\n- All strings in wordList are unique\n\nRef: LeetCode #127 Word Ladder`,
    code: `def ladder_length(begin_word, end_word, word_list)
  raise NotImplementedError
end`,
    testCode: `def test_word_ladder_basic
  assert_equal(5, ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]))
end

def test_word_ladder_no_path
  assert_equal(0, ladder_length("hit", "cog", ["hot","dot","dog","lot","log"]))
end

def test_word_ladder_direct
  assert_equal(2, ladder_length("hot", "dot", ["dot","dog","lot","log","cog"]))
end`,
    solution: `def ladder_length(begin_word, end_word, word_list)
  return 0 unless word_list.include?(end_word)

  l = begin_word.length
  pattern_map = Hash.new { |h, k| h[k] = [] }
  word_list.each do |word|
    (0...l).each do |i|
      pattern = word[0...i] + '*' + word[(i + 1)..]
      pattern_map[pattern] << word
    end
  end

  queue = [[begin_word, 1]]
  visited = { begin_word => true }
  until queue.empty?
    word, steps = queue.shift
    (0...l).each do |i|
      pattern = word[0...i] + '*' + word[(i + 1)..]
      pattern_map[pattern].each do |neighbor|
        return steps + 1 if neighbor == end_word
        unless visited[neighbor]
          visited[neighbor] = true
          queue.push([neighbor, steps + 1])
        end
      end
    end
  end
  0
end`,
    usage: null,
    tags: ["graphs", "bfs", "hash-map", "neetcode"],
  },
];

export { neetcodeGraphs };
