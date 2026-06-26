import type { SeedKata } from "../types/editor";

const blind75Part3: SeedKata[] = [
  {
    name: "Clone Graph",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: "Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of neighbors.\n\nExample:\nInput: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]] (deep copy)\n\nConstraints:\n- The number of nodes is in range [0, 100]\n- Node values are unique\n- No repeated edges, no self-loops",
    code: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []


def clone_graph(node):
    raise NotImplementedError`,
    testCode: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []


def test_clone_graph_none():
    assert clone_graph(None) is None


def test_clone_graph_single_node():
    node = Node(1)
    cloned = clone_graph(node)
    assert cloned.val == 1
    assert cloned is not node
    assert cloned.neighbors == []


def test_clone_graph_two_nodes():
    node1 = Node(1)
    node2 = Node(2)
    node1.neighbors = [node2]
    node2.neighbors = [node1]
    cloned = clone_graph(node1)
    assert cloned.val == 1
    assert cloned is not node1
    assert cloned.neighbors[0].val == 2
    assert cloned.neighbors[0] is not node2


def test_clone_graph_structure_preserved():
    node1 = Node(1)
    node2 = Node(2)
    node3 = Node(3)
    node1.neighbors = [node2, node3]
    node2.neighbors = [node1]
    node3.neighbors = [node1]
    cloned = clone_graph(node1)
    assert cloned.val == 1
    neighbor_vals = sorted(n.val for n in cloned.neighbors)
    assert neighbor_vals == [2, 3]`,
    solution: `from collections import deque


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []


def clone_graph(node):
    if not node:
        return None

    clones = {node: Node(node.val)}
    queue = deque([node])

    while queue:
        curr = queue.popleft()
        for neighbor in curr.neighbors:
            if neighbor not in clones:
                clones[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            clones[curr].neighbors.append(clones[neighbor])

    return clones[node]`,
    usage: null,
    tags: ["graph", "bfs", "dfs", "blind75"],
  },
  {
    name: "Course Schedule",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given numCourses and prerequisites list where [a,b] means take b before a, return true if possible to finish all courses.\n\nExample:\nInput: numCourses=2, prerequisites=[[1,0]]\nOutput: True\n\nInput: numCourses=2, prerequisites=[[1,0],[0,1]]\nOutput: False\n\nConstraints:\n- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000`,
    code: `def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_can_finish_basic():
    assert can_finish(2, [[1, 0]]) == True


def test_can_finish_cycle():
    assert can_finish(2, [[1, 0], [0, 1]]) == False


def test_can_finish_no_prereqs():
    assert can_finish(1, []) == True


def test_can_finish_longer_cycle():
    assert can_finish(3, [[0, 1], [1, 2], [2, 0]]) == False`,
    solution: `def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    graph = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        graph[a].append(b)

    # 0 = unvisited, 1 = visiting, 2 = visited
    state = [0] * num_courses

    def has_cycle(node):
        if state[node] == 1:
            return True
        if state[node] == 2:
            return False
        state[node] = 1
        for neighbor in graph[node]:
            if has_cycle(neighbor):
                return True
        state[node] = 2
        return False

    return not any(has_cycle(i) for i in range(num_courses) if state[i] == 0)`,
    usage: null,
    tags: ["graph", "topological-sort", "blind75"],
  },
  {
    name: "Pacific Atlantic Water Flow",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given m x n island heights matrix, rain can flow to Pacific (top/left edges) and Atlantic (bottom/right edges) if neighboring cell height <= current. Return list of cells that can flow to both oceans.\n\nExample:\nInput: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]\n\nConstraints:\n- m == heights.length, n == heights[0].length\n- 1 <= m, n <= 200`,
    code: `def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_pacific_atlantic_example():
    heights = [
        [1, 2, 2, 3, 5],
        [3, 2, 3, 4, 4],
        [2, 4, 5, 3, 1],
        [6, 7, 1, 4, 5],
        [5, 1, 1, 2, 4],
    ]
    result = sorted(pacific_atlantic(heights))
    assert result == [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]


def test_pacific_atlantic_single_cell():
    assert pacific_atlantic([[1]]) == [[0, 0]]


def test_pacific_atlantic_all_same():
    heights = [[1, 1], [1, 1]]
    result = sorted(pacific_atlantic(heights))
    assert result == [[0, 0], [0, 1], [1, 0], [1, 1]]


def test_pacific_atlantic_single_row():
    heights = [[1, 2, 3]]
    result = sorted(pacific_atlantic(heights))
    assert [0, 2] in result`,
    solution: `from collections import deque


def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    if not heights:
        return []
    m, n = len(heights), len(heights[0])

    def bfs(starts):
        visited = set(starts)
        queue = deque(starts)
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = r + dr, c + dc
                if (
                    0 <= nr < m
                    and 0 <= nc < n
                    and (nr, nc) not in visited
                    and heights[nr][nc] >= heights[r][c]
                ):
                    visited.add((nr, nc))
                    queue.append((nr, nc))
        return visited

    pacific_starts = [(0, c) for c in range(n)] + [(r, 0) for r in range(m)]
    atlantic_starts = [(m - 1, c) for c in range(n)] + [(r, n - 1) for r in range(m)]

    pacific = bfs(pacific_starts)
    atlantic = bfs(atlantic_starts)

    return [[r, c] for r, c in pacific & atlantic]`,
    usage: null,
    tags: ["graph", "dfs", "bfs", "blind75"],
  },
  {
    name: "Number of Islands",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent '1's horizontally or vertically.\n\nExample:\nInput: grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]\nOutput: 3\n\nConstraints:\n- 1 <= m, n <= 300`,
    code: `def num_islands(grid: list[list[str]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_num_islands_example():
    grid = [
        ["1", "1", "0", "0"],
        ["1", "1", "0", "0"],
        ["0", "0", "1", "0"],
        ["0", "0", "0", "1"],
    ]
    assert num_islands(grid) == 3


def test_num_islands_single_island():
    grid = [["1", "1"], ["1", "1"]]
    assert num_islands(grid) == 1


def test_num_islands_no_land():
    grid = [["0", "0"], ["0", "0"]]
    assert num_islands(grid) == 0


def test_num_islands_all_separate():
    grid = [["1", "0", "1"], ["0", "1", "0"], ["1", "0", "1"]]
    assert num_islands(grid) == 5`,
    solution: `def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(m):
        for c in range(n):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)

    return count`,
    usage: null,
    tags: ["graph", "dfs", "bfs", "blind75"],
  },
  {
    name: "Longest Consecutive Sequence",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given an unsorted array of integers, return the length of the longest consecutive elements sequence. O(n) time.\n\nExample:\nInput: nums = [100,4,200,1,3,2]\nOutput: 4 ([1,2,3,4])\n\nConstraints:\n- 0 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9`,
    code: `def longest_consecutive(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_longest_consecutive_example():
    assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4


def test_longest_consecutive_long():
    assert longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9


def test_longest_consecutive_empty():
    assert longest_consecutive([]) == 0


def test_longest_consecutive_single():
    assert longest_consecutive([42]) == 1`,
    solution: `def longest_consecutive(nums: list[int]) -> int:
    num_set = set(nums)
    best = 0

    for num in num_set:
        if num - 1 not in num_set:
            length = 1
            while num + length in num_set:
                length += 1
            best = max(best, length)

    return best`,
    usage: null,
    tags: ["array", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Alien Dictionary",
    category: "graph",
    language: "python",
    difficulty: "hard",
    description: `Given a sorted list of words in an alien language, determine the order of characters. Return the characters in lexicographic order per alien alphabet. Return "" if invalid (cycle detected).\n\nExample:\nInput: words = ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"\n\nConstraints:\n- 1 <= words.length <= 12\n- 1 <= words[i].length <= 100\n- All characters lowercase`,
    code: `def alien_order(words: list[str]) -> str:
    raise NotImplementedError`,
    testCode: `def test_alien_order_example():
    result = alien_order(["wrt", "wrf", "er", "ett", "rftt"])
    assert set(result) == {"w", "e", "r", "t", "f"}
    order = {ch: i for i, ch in enumerate(result)}
    assert order["w"] < order["e"]
    assert order["r"] < order["t"]
    assert order["e"] < order["r"]


def test_alien_order_simple():
    assert alien_order(["z", "x"]) == "zx"


def test_alien_order_cycle():
    assert alien_order(["z", "x", "z"]) == ""


def test_alien_order_single_word():
    result = alien_order(["abc"])
    assert set(result) == {"a", "b", "c"}`,
    solution: `from collections import defaultdict, deque


def alien_order(words: list[str]) -> str:
    adj = defaultdict(set)
    in_degree = {ch: 0 for word in words for ch in word}

    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
            return ""
        for j in range(min_len):
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:
                    adj[w1[j]].add(w2[j])
                    in_degree[w2[j]] += 1
                break

    queue = deque([ch for ch in in_degree if in_degree[ch] == 0])
    result = []

    while queue:
        ch = queue.popleft()
        result.append(ch)
        for neighbor in adj[ch]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(in_degree):
        return ""

    return "".join(result)`,
    usage: null,
    tags: ["graph", "topological-sort", "blind75"],
  },
  {
    name: "Graph Valid Tree",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given n nodes (0 to n-1) and a list of undirected edges, return true if the edges form a valid tree (connected with no cycles).\n\nExample:\nInput: n=5, edges=[[0,1],[0,2],[0,3],[1,4]]\nOutput: True\n\nConstraints:\n- 1 <= n <= 2000\n- 0 <= edges.length <= 5000`,
    code: `def valid_tree(n: int, edges: list[list[int]]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_valid_tree_true():
    assert valid_tree(5, [[0, 1], [0, 2], [0, 3], [1, 4]]) == True


def test_valid_tree_cycle():
    assert valid_tree(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]) == False


def test_valid_tree_single_node():
    assert valid_tree(1, []) == True


def test_valid_tree_disconnected():
    assert valid_tree(4, [[0, 1], [2, 3]]) == False`,
    solution: `def valid_tree(n: int, edges: list[list[int]]) -> bool:
    if len(edges) != n - 1:
        return False

    parent = list(range(n))
    rank = [0] * n

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
        if rank[px] == rank[py]:
            rank[px] += 1
        return True

    return all(union(u, v) for u, v in edges)`,
    usage: null,
    tags: ["graph", "union-find", "blind75"],
  },
  {
    name: "Number of Connected Components in an Undirected Graph",
    category: "graph",
    language: "python",
    difficulty: "medium",
    description: `Given n nodes (0 to n-1) and a list of undirected edges, return the number of connected components.\n\nExample:\nInput: n=5, edges=[[0,1],[1,2],[3,4]]\nOutput: 2\n\nConstraints:\n- 1 <= n <= 2000\n- 1 <= edges.length <= 5000`,
    code: `def count_components(n: int, edges: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_components_two():
    assert count_components(5, [[0, 1], [1, 2], [3, 4]]) == 2


def test_count_components_one():
    assert count_components(5, [[0, 1], [1, 2], [2, 3], [3, 4]]) == 1


def test_count_components_all_isolated():
    assert count_components(4, []) == 4


def test_count_components_single_node():
    assert count_components(1, []) == 1`,
    solution: `def count_components(n: int, edges: list[list[int]]) -> int:
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return 0
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]:
            rank[px] += 1
        return 1

    components = n
    for u, v in edges:
        components -= union(u, v)

    return components`,
    usage: null,
    tags: ["graph", "union-find", "blind75"],
  },
];

export { blind75Part3 };
