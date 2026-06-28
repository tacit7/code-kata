import type { SeedKata } from "../types/editor";

const neetcodeGraphs: SeedKata[] = [
  {
    name: "Max Area of Island",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Given a binary matrix grid, return the maximum area of an island. An island is a group of 1s connected 4-directionally (up, down, left, right). If there is no island, return 0.\n\nExample 1:\nInput: grid = [\n  [0,0,1,0,0,0,0,1,0,0,0,0,0],\n  [0,0,0,0,0,0,0,1,1,1,0,0,0],\n  [0,1,1,0,1,0,0,0,0,0,0,0,0],\n  [0,1,0,0,1,1,0,0,1,0,1,0,0],\n  [0,1,0,0,1,1,0,0,1,1,1,0,0],\n  [0,0,0,0,0,0,0,0,0,0,1,0,0],\n  [0,0,0,0,0,0,0,1,1,1,0,0,0],\n  [0,0,0,0,0,0,0,1,1,0,0,0,0]\n]\nOutput: 6\n\nExample 2:\nInput: grid = [[0,0,0,0,0,0,0,0]]\nOutput: 0\n\nConstraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 50\n- grid[i][j] is 0 or 1\n\nRef: LeetCode #695 Max Area of Island`,
    code: `def max_area_of_island(grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_max_area_standard():
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
    assert max_area_of_island(grid) == 6

def test_max_area_all_zeros():
    grid = [[0,0,0,0,0,0,0,0]]
    assert max_area_of_island(grid) == 0

def test_max_area_single_island():
    grid = [[1,1],[1,0]]
    assert max_area_of_island(grid) == 3

def test_max_area_single_cell():
    grid = [[1]]
    assert max_area_of_island(grid) == 1`,
    solution: `def max_area_of_island(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    visited = set()

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == 0 or (r, c) in visited:
            return 0
        visited.add((r, c))
        return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)

    return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    usage: null,
    tags: ["graphs", "dfs", "bfs", "neetcode"],
  },
  {
    name: "Walls And Gates",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `You are given a m x n 2D grid initialized with these three possible values:\n- -1: a wall or obstacle\n- 0: a gate\n- 2147483647 (INF): an empty room\n\nFill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave it as INF.\n\nExample:\nInput:\nINF  -1  0  INF\nINF INF INF  -1\nINF  -1 INF  -1\n  0  -1 INF INF\n\nOutput:\n  3  -1  0   1\n  2   2  1  -1\n  1  -1  2  -1\n  0  -1  3   4\n\nConstraints:\n- m == rooms.length, n == rooms[i].length\n- 1 <= m, n <= 250\n- rooms[i][j] is -1, 0, or 2^31 - 1\n\nRef: LeetCode #286 Walls and Gates`,
    code: `def walls_and_gates(rooms: list[list[int]]) -> None:
    raise NotImplementedError`,
    testCode: `def test_walls_and_gates_basic():
    INF = 2147483647
    rooms = [
        [INF, -1,  0, INF],
        [INF, INF, INF, -1],
        [INF, -1,  INF, -1],
        [0,   -1,  INF, INF],
    ]
    walls_and_gates(rooms)
    assert rooms == [
        [3,  -1, 0, 1],
        [2,   2, 1, -1],
        [1,  -1, 2, -1],
        [0,  -1, 3, 4],
    ]

def test_walls_and_gates_no_gates():
    INF = 2147483647
    rooms = [[INF, INF], [INF, INF]]
    walls_and_gates(rooms)
    assert rooms == [[INF, INF], [INF, INF]]

def test_walls_and_gates_all_gates():
    rooms = [[0, 0], [0, 0]]
    walls_and_gates(rooms)
    assert rooms == [[0, 0], [0, 0]]`,
    solution: `def walls_and_gates(rooms: list[list[int]]) -> None:
    from collections import deque
    INF = 2147483647
    rows, cols = len(rooms), len(rooms[0])
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if rooms[r][c] == 0:
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:
                rooms[nr][nc] = rooms[r][c] + 1
                queue.append((nr, nc))`,
    usage: null,
    tags: ["graphs", "bfs", "neetcode"],
  },
  {
    name: "Rotting Oranges",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `You are given a m x n grid where cells can be:\n- 0: empty\n- 1: fresh orange\n- 2: rotten orange\n\nEvery minute, any fresh orange 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh oranges remain, or -1 if it's impossible.\n\nExample 1:\nInput: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4\n\nExample 2:\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\n\nExample 3:\nInput: grid = [[0,2]]\nOutput: 0\n\nConstraints:\n- m == grid.length, n == grid[i].length\n- 1 <= m, n <= 10\n- grid[i][j] is 0, 1, or 2\n\nRef: LeetCode #994 Rotting Oranges`,
    code: `def oranges_rotting(grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_rotting_oranges_basic():
    assert oranges_rotting([[2,1,1],[1,1,0],[0,1,1]]) == 4

def test_rotting_oranges_impossible():
    assert oranges_rotting([[2,1,1],[0,1,1],[1,0,1]]) == -1

def test_rotting_oranges_no_fresh():
    assert oranges_rotting([[0,2]]) == 0

def test_rotting_oranges_all_fresh_no_rotten():
    assert oranges_rotting([[1,1],[1,1]]) == -1

def test_rotting_oranges_empty():
    assert oranges_rotting([[0]]) == 0`,
    solution: `def oranges_rotting(grid: list[list[int]]) -> int:
    from collections import deque
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1
    if fresh == 0:
        return 0
    time = 0
    while queue:
        r, c, t = queue.popleft()
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                time = t + 1
                queue.append((nr, nc, t+1))
    return time if fresh == 0 else -1`,
    usage: null,
    tags: ["graphs", "bfs", "neetcode"],
  },
  {
    name: "Surrounded Regions",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is captured by flipping all 'O's into 'X's in that region. Regions on the border are never captured.\n\nExample:\nInput:\n[["X","X","X","X"],\n ["X","O","O","X"],\n ["X","X","O","X"],\n ["X","O","X","X"]]\n\nOutput:\n[["X","X","X","X"],\n ["X","X","X","X"],\n ["X","X","X","X"],\n ["X","O","X","X"]]\n\nThe bottom 'O' is on the border and cannot be captured.\n\nConstraints:\n- m == board.length, n == board[i].length\n- 1 <= m, n <= 200\n- board[i][j] is 'X' or 'O'\n\nRef: LeetCode #130 Surrounded Regions`,
    code: `def solve(board: list[list[str]]) -> None:
    raise NotImplementedError`,
    testCode: `def test_surrounded_regions_basic():
    board = [
        ["X","X","X","X"],
        ["X","O","O","X"],
        ["X","X","O","X"],
        ["X","O","X","X"],
    ]
    solve(board)
    assert board == [
        ["X","X","X","X"],
        ["X","X","X","X"],
        ["X","X","X","X"],
        ["X","O","X","X"],
    ]

def test_surrounded_regions_all_x():
    board = [["X","X"],["X","X"]]
    solve(board)
    assert board == [["X","X"],["X","X"]]

def test_surrounded_regions_single():
    board = [["O"]]
    solve(board)
    assert board == [["O"]]`,
    solution: `def solve(board: list[list[str]]) -> None:
    rows, cols = len(board), len(board[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != 'O':
            return
        board[r][c] = 'T'
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)

    for r in range(rows):
        for c in range(cols):
            if (r in (0, rows-1) or c in (0, cols-1)) and board[r][c] == 'O':
                dfs(r, c)

    for r in range(rows):
        for c in range(cols):
            if board[r][c] == 'O':
                board[r][c] = 'X'
            elif board[r][c] == 'T':
                board[r][c] = 'O'`,
    usage: null,
    tags: ["graphs", "dfs", "bfs", "neetcode"],
  },
  {
    name: "Course Schedule II",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `There are numCourses courses (0 to numCourses-1). Prerequisites[i] = [a, b] means you must take course b before course a. Return the ordering of courses to finish all of them. If impossible (cycle exists), return an empty list.\n\nExample 1:\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: [0,1]\n\nExample 2:\nInput: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3] or [0,1,2,3]\n\nExample 3:\nInput: numCourses = 1, prerequisites = []\nOutput: [0]\n\nConstraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= numCourses * (numCourses - 1)\n- prerequisites[i].length == 2\n- No duplicate prerequisites\n\nRef: LeetCode #210 Course Schedule II`,
    code: `def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_course_schedule_ii_basic():
    assert find_order(2, [[1,0]]) == [0,1]

def test_course_schedule_ii_four_courses():
    result = find_order(4, [[1,0],[2,0],[3,1],[3,2]])
    assert result in ([0,1,2,3], [0,2,1,3])

def test_course_schedule_ii_single():
    assert find_order(1, []) == [0]

def test_course_schedule_ii_cycle():
    assert find_order(2, [[1,0],[0,1]]) == []`,
    solution: `def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    prereq_map = {i: [] for i in range(num_courses)}
    for a, b in prerequisites:
        prereq_map[a].append(b)

    visited = set()
    cycle = set()
    output = []

    def dfs(course):
        if course in cycle:
            return False
        if course in visited:
            return True
        cycle.add(course)
        for pre in prereq_map[course]:
            if not dfs(pre):
                return False
        cycle.remove(course)
        visited.add(course)
        output.append(course)
        return True

    for c in range(num_courses):
        if not dfs(c):
            return []
    return output`,
    usage: null,
    tags: ["graphs", "topological-sort", "dfs", "neetcode"],
  },
  {
    name: "Redundant Connection",
    category: "graphs",
    language: "python",
    difficulty: "medium",
    description: `A tree of n nodes (labeled 1 to n) has been grown by adding one extra edge, creating exactly one cycle. Given edges of the resulting graph, return the edge that can be removed to restore the tree. If multiple answers exist, return the last one in the input.\n\nExample 1:\nInput: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]\n\nExample 2:\nInput: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]\nOutput: [1,4]\n\nConstraints:\n- n == edges.length\n- 3 <= n <= 1000\n- edges[i].length == 2\n- 1 <= edges[i][0] < edges[i][1] <= n\n- No repeated edges\n\nRef: LeetCode #684 Redundant Connection`,
    code: `def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_redundant_connection_basic():
    assert find_redundant_connection([[1,2],[1,3],[2,3]]) == [2,3]

def test_redundant_connection_longer():
    assert find_redundant_connection([[1,2],[2,3],[3,4],[1,4],[1,5]]) == [1,4]

def test_redundant_connection_two_nodes():
    assert find_redundant_connection([[1,2],[2,3],[1,3]]) == [1,3]`,
    solution: `def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    n = len(edges)
    parent = list(range(n + 1))
    rank = [1] * (n + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        rank[px] += rank[py]
        return True

    for u, v in edges:
        if not union(u, v):
            return [u, v]
    return []`,
    usage: null,
    tags: ["graphs", "union-find", "neetcode"],
  },
  {
    name: "Word Ladder",
    category: "graphs",
    language: "python",
    difficulty: "hard",
    description: `Given two words beginWord and endWord, and a wordList dictionary, return the number of words in the shortest transformation sequence from beginWord to endWord. Each step changes exactly one letter, and each intermediate word must be in wordList. Return 0 if no such sequence exists.\n\nExample 1:\nInput: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5  (hit → hot → dot → dog → cog)\n\nExample 2:\nInput: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]\nOutput: 0  (cog not in wordList)\n\nConstraints:\n- 1 <= beginWord.length <= 10\n- endWord.length == beginWord.length\n- 1 <= wordList.length <= 5000\n- wordList[i].length == beginWord.length\n- beginWord, endWord, wordList[i] consist of lowercase English letters\n- beginWord != endWord\n- All strings in wordList are unique\n\nRef: LeetCode #127 Word Ladder`,
    code: `def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    raise NotImplementedError`,
    testCode: `def test_word_ladder_basic():
    assert ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]) == 5

def test_word_ladder_no_path():
    assert ladder_length("hit", "cog", ["hot","dot","dog","lot","log"]) == 0

def test_word_ladder_direct():
    assert ladder_length("hot", "dot", ["dot","dog","lot","log","cog"]) == 2`,
    solution: `def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    from collections import deque, defaultdict
    if end_word not in word_list:
        return 0

    word_set = set(word_list)
    L = len(begin_word)
    pattern_map = defaultdict(list)
    for word in word_list:
        for i in range(L):
            pattern = word[:i] + '*' + word[i+1:]
            pattern_map[pattern].append(word)

    queue = deque([(begin_word, 1)])
    visited = {begin_word}
    while queue:
        word, steps = queue.popleft()
        for i in range(L):
            pattern = word[:i] + '*' + word[i+1:]
            for neighbor in pattern_map[pattern]:
                if neighbor == end_word:
                    return steps + 1
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, steps + 1))
    return 0`,
    usage: null,
    tags: ["graphs", "bfs", "hash-map", "neetcode"],
  },
];

export { neetcodeGraphs };
