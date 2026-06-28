import type { SeedKata } from "../types/editor";

const neetcodeAdvancedGraphs: SeedKata[] = [
  {
    name: "Network Delay Time",
    category: "advanced-graphs",
    language: "python",
    difficulty: "medium",
    description: `You are given a network of n nodes (1-indexed) and a list of travel times as directed edges times[i] = [u, v, w], where u is the source, v is the target, and w is the time. Send a signal from node k. Return the minimum time for all n nodes to receive the signal, or -1 if impossible.\n\nUse Dijkstra's algorithm.\n\nExample 1:\nInput: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2\n\nExample 2:\nInput: times = [[1,2,1]], n = 2, k = 1\nOutput: 1\n\nExample 3:\nInput: times = [[1,2,1]], n = 2, k = 2\nOutput: -1\n\nConstraints:\n- 1 <= k <= n <= 100\n- 1 <= times.length <= 6000\n- times[i].length == 3\n- 1 <= u, v <= n, u != v\n- 0 <= w <= 100\n\nRef: LeetCode #743 Network Delay Time`,
    code: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_network_delay_basic():
    assert network_delay_time([[2,1,1],[2,3,1],[3,4,1]], 4, 2) == 2

def test_network_delay_direct():
    assert network_delay_time([[1,2,1]], 2, 1) == 1

def test_network_delay_impossible():
    assert network_delay_time([[1,2,1]], 2, 2) == -1`,
    solution: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    import heapq
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        graph[u].append((w, v))
    dist = {i: float("inf") for i in range(1, n + 1)}
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for w, nei in graph[node]:
            nd = d + w
            if nd < dist[nei]:
                dist[nei] = nd
                heapq.heappush(heap, (nd, nei))
    ans = max(dist.values())
    return ans if ans < float("inf") else -1`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dijkstra", "neetcode"],
  },
  {
    name: "Reconstruct Itinerary",
    category: "advanced-graphs",
    language: "python",
    difficulty: "hard",
    description: `Given a list of airline tickets represented by pairs [from, to], reconstruct the itinerary in order. All of the tickets belong to a man who departs from "JFK". The itinerary must use all tickets exactly once and begin with "JFK". If there are multiple valid itineraries, return the lexicographically smallest one.\n\nExample 1:\nInput: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\nOutput: ["JFK","MUC","LHR","SFO","SJC"]\n\nExample 2:\nInput: tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]\nOutput: ["JFK","ATL","JFK","SFO","ATL","SFO"]\n\nConstraints:\n- 1 <= tickets.length <= 300\n- tickets[i].length == 2\n- tickets[i][0].length == 3, tickets[i][1].length == 3\n- tickets[i][0] and tickets[i][1] consist of uppercase English letters\n- tickets[i][0] != tickets[i][1]\n\nRef: LeetCode #332 Reconstruct Itinerary`,
    code: `def find_itinerary(tickets: list[list[str]]) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_itinerary_basic():
    result = find_itinerary([["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]])
    assert result == ["JFK","MUC","LHR","SFO","SJC"]

def test_itinerary_cycle():
    result = find_itinerary([["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]])
    assert result == ["JFK","ATL","JFK","SFO","ATL","SFO"]`,
    solution: `def find_itinerary(tickets: list[list[str]]) -> list[str]:
    from collections import defaultdict
    import heapq
    graph = defaultdict(list)
    for src, dst in tickets:
        heapq.heappush(graph[src], dst)
    result = []
    def dfs(node):
        while graph[node]:
            next_node = heapq.heappop(graph[node])
            dfs(next_node)
        result.append(node)
    dfs("JFK")
    return result[::-1]`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dfs", "eulerian-path", "neetcode"],
  },
  {
    name: "Min Cost to Connect All Points",
    category: "advanced-graphs",
    language: "python",
    difficulty: "medium",
    description: `You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the Manhattan distance between them: |xi - xj| + |yi - yj|.\n\nReturn the minimum cost to make all points connected (minimum spanning tree).\n\nExample 1:\nInput: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20\n\nExample 2:\nInput: points = [[3,12],[-2,5],[-4,1]]\nOutput: 18\n\nConstraints:\n- 1 <= points.length <= 1000\n- -10^6 <= xi, yi <= 10^6\n- All pairs are distinct\n\nRef: LeetCode #1584 Min Cost to Connect All Points`,
    code: `def min_cost_connect_points(points: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_min_cost_basic():
    assert min_cost_connect_points([[0,0],[2,2],[3,10],[5,2],[7,0]]) == 20

def test_min_cost_three_points():
    assert min_cost_connect_points([[3,12],[-2,5],[-4,1]]) == 18

def test_min_cost_single():
    assert min_cost_connect_points([[0,0]]) == 0`,
    solution: `def min_cost_connect_points(points: list[list[int]]) -> int:
    import heapq
    n = len(points)
    visited = set()
    heap = [(0, 0)]
    total = 0
    while len(visited) < n:
        cost, i = heapq.heappop(heap)
        if i in visited:
            continue
        visited.add(i)
        total += cost
        for j in range(n):
            if j not in visited:
                dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                heapq.heappush(heap, (dist, j))
    return total`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "minimum-spanning-tree", "neetcode"],
  },
  {
    name: "Swim In Rising Water",
    category: "advanced-graphs",
    language: "python",
    difficulty: "hard",
    description: `You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). Rain starts to fall. At time t, the depth of water everywhere is t. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares is at most t. Find the least time until you can reach the bottom right square (n-1, n-1) from the top left square (0, 0).\n\nExample 1:\nInput: grid = [[0,2],[1,3]]\nOutput: 3\n\nExample 2:\nInput: grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]\nOutput: 16\n\nConstraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 50\n- 0 <= grid[i][j] < n^2\n- Each value grid[i][j] is unique\n\nRef: LeetCode #778 Swim in Rising Water`,
    code: `def swim_in_water(grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_swim_basic():
    assert swim_in_water([[0,2],[1,3]]) == 3

def test_swim_large():
    grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]
    assert swim_in_water(grid) == 16

def test_swim_single():
    assert swim_in_water([[0]]) == 0`,
    solution: `def swim_in_water(grid: list[list[int]]) -> int:
    import heapq
    n = len(grid)
    visited = set()
    heap = [(grid[0][0], 0, 0)]
    visited.add((0, 0))
    while heap:
        t, r, c = heapq.heappop(heap)
        if r == n - 1 and c == n - 1:
            return t
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in visited:
                visited.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dijkstra", "binary-search", "neetcode"],
  },
  {
    name: "Cheapest Flights Within K Stops",
    category: "advanced-graphs",
    language: "python",
    difficulty: "medium",
    description: `There are n cities connected by some flights. You are given an array flights where flights[i] = [fromi, toi, pricei] indicates that there is a flight from city fromi to city toi with cost pricei.\n\nGiven src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.\n\nUse Bellman-Ford with k+1 iterations.\n\nExample 1:\nInput: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\n\nExample 2:\nInput: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1\nOutput: 200\n\nConstraints:\n- 1 <= n <= 100\n- 0 <= flights.length <= (n*(n-1)/2)\n- flights[i].length == 3\n- 0 <= src, dst, fromi, toi < n\n- src != dst\n- 1 <= pricei <= 10^4\n- 0 <= k < n\n\nRef: LeetCode #787 Cheapest Flights Within K Stops`,
    code: `def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_cheapest_flights_basic():
    flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]
    assert find_cheapest_price(4, flights, 0, 3, 1) == 700

def test_cheapest_flights_direct():
    flights = [[0,1,100],[1,2,100],[0,2,500]]
    assert find_cheapest_price(3, flights, 0, 2, 1) == 200

def test_cheapest_flights_no_route():
    flights = [[0,1,100]]
    assert find_cheapest_price(3, flights, 0, 2, 1) == -1`,
    solution: `def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
    prices = [float("inf")] * n
    prices[src] = 0
    for _ in range(k + 1):
        temp = prices[:]
        for u, v, w in flights:
            if prices[u] != float("inf") and prices[u] + w < temp[v]:
                temp[v] = prices[u] + w
        prices = temp
    return prices[dst] if prices[dst] != float("inf") else -1`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dynamic-programming", "bellman-ford", "neetcode"],
  },
];

export { neetcodeAdvancedGraphs };
