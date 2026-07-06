import type { SeedKata } from "../types/editor";

const neetcodeAdvancedGraphs: SeedKata[] = [
  {
    name: "Network Delay Time",
    category: "advanced-graphs",
    language: "ruby",
    difficulty: "medium",
    description: `You are given a network of n nodes (1-indexed) and a list of travel times as directed edges times[i] = [u, v, w], where u is the source, v is the target, and w is the time. Send a signal from node k. Return the minimum time for all n nodes to receive the signal, or -1 if impossible.\n\nUse Dijkstra's algorithm.\n\nExample 1:\nInput: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2\n\nExample 2:\nInput: times = [[1,2,1]], n = 2, k = 1\nOutput: 1\n\nExample 3:\nInput: times = [[1,2,1]], n = 2, k = 2\nOutput: -1\n\nConstraints:\n- 1 <= k <= n <= 100\n- 1 <= times.length <= 6000\n- times[i].length == 3\n- 1 <= u, v <= n, u != v\n- 0 <= w <= 100\n\nRef: LeetCode #743 Network Delay Time`,
    code: `def network_delay_time(times, n, k)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_network_delay_basic
  assert_equal(2, network_delay_time([[2,1,1],[2,3,1],[3,4,1]], 4, 2))
end

def test_network_delay_direct
  assert_equal(1, network_delay_time([[1,2,1]], 2, 1))
end

def test_network_delay_impossible
  assert_equal(-1, network_delay_time([[1,2,1]], 2, 2))
end`,
    solution: `def network_delay_time(times, n, k)
  # Dijkstra with a plain array acting as the priority queue (linear-scan
  # min extraction instead of Ruby's non-existent core heap).
  graph = {}
  (1..n).each { |i| graph[i] = [] }
  times.each do |u, v, w|
    graph[u] << [w, v]
  end
  dist = {}
  (1..n).each { |i| dist[i] = Float::INFINITY }
  dist[k] = 0
  heap = [[0, k]]
  until heap.empty?
    min_idx = 0
    heap.each_with_index { |pair, idx| min_idx = idx if pair[0] < heap[min_idx][0] }
    d, node = heap.delete_at(min_idx)
    next if d > dist[node]
    graph[node].each do |w, nei|
      nd = d + w
      if nd < dist[nei]
        dist[nei] = nd
        heap << [nd, nei]
      end
    end
  end
  ans = dist.values.max
  ans < Float::INFINITY ? ans : -1
end`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dijkstra", "neetcode"],
  },
  {
    name: "Reconstruct Itinerary",
    category: "advanced-graphs",
    language: "ruby",
    difficulty: "hard",
    description: `Given a list of airline tickets represented by pairs [from, to], reconstruct the itinerary in order. All of the tickets belong to a man who departs from "JFK". The itinerary must use all tickets exactly once and begin with "JFK". If there are multiple valid itineraries, return the lexicographically smallest one.\n\nExample 1:\nInput: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\nOutput: ["JFK","MUC","LHR","SFO","SJC"]\n\nExample 2:\nInput: tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]\nOutput: ["JFK","ATL","JFK","SFO","ATL","SFO"]\n\nConstraints:\n- 1 <= tickets.length <= 300\n- tickets[i].length == 2\n- tickets[i][0].length == 3, tickets[i][1].length == 3\n- tickets[i][0] and tickets[i][1] consist of uppercase English letters\n- tickets[i][0] != tickets[i][1]\n\nRef: LeetCode #332 Reconstruct Itinerary`,
    code: `def find_itinerary(tickets)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_itinerary_basic
  result = find_itinerary([["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]])
  assert_equal(["JFK","MUC","LHR","SFO","SJC"], result)
end

def test_itinerary_cycle
  result = find_itinerary([["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]])
  assert_equal(["JFK","ATL","JFK","SFO","ATL","SFO"], result)
end`,
    solution: `def find_itinerary(tickets)
  # Destinations kept sorted (insert in sorted position) instead of a heap.
  graph = Hash.new { |h, k| h[k] = [] }
  tickets.each do |src, dst|
    list = graph[src]
    idx = list.bsearch_index { |d| d >= dst } || list.length
    list.insert(idx, dst)
  end
  result = []
  dfs = nil
  dfs = ->(node) {
    while !graph[node].empty?
      next_node = graph[node].shift
      dfs.call(next_node)
    end
    result << node
  }
  dfs.call("JFK")
  result.reverse
end`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dfs", "eulerian-path", "neetcode"],
  },
  {
    name: "Min Cost to Connect All Points",
    category: "advanced-graphs",
    language: "ruby",
    difficulty: "medium",
    description: `You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the Manhattan distance between them: |xi - xj| + |yi - yj|.\n\nReturn the minimum cost to make all points connected (minimum spanning tree).\n\nExample 1:\nInput: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20\n\nExample 2:\nInput: points = [[3,12],[-2,5],[-4,1]]\nOutput: 18\n\nConstraints:\n- 1 <= points.length <= 1000\n- -10^6 <= xi, yi <= 10^6\n- All pairs are distinct\n\nRef: LeetCode #1584 Min Cost to Connect All Points`,
    code: `def min_cost_connect_points(points)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_min_cost_basic
  assert_equal(20, min_cost_connect_points([[0,0],[2,2],[3,10],[5,2],[7,0]]))
end

def test_min_cost_three_points
  assert_equal(18, min_cost_connect_points([[3,12],[-2,5],[-4,1]]))
end

def test_min_cost_single
  assert_equal(0, min_cost_connect_points([[0,0]]))
end`,
    solution: `def min_cost_connect_points(points)
  # Prim's MST with a plain array as the priority queue (linear-scan min
  # extraction instead of Ruby's non-existent core heap).
  n = points.length
  visited = {}
  heap = [[0, 0]]
  total = 0
  while visited.length < n
    min_idx = 0
    heap.each_with_index { |pair, idx| min_idx = idx if pair[0] < heap[min_idx][0] }
    cost, i = heap.delete_at(min_idx)
    next if visited[i]
    visited[i] = true
    total += cost
    (0...n).each do |j|
      next if visited[j]
      dist = (points[i][0] - points[j][0]).abs + (points[i][1] - points[j][1]).abs
      heap << [dist, j]
    end
  end
  total
end`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "minimum-spanning-tree", "neetcode"],
  },
  {
    name: "Swim In Rising Water",
    category: "advanced-graphs",
    language: "ruby",
    difficulty: "hard",
    description: `You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). Rain starts to fall. At time t, the depth of water everywhere is t. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares is at most t. Find the least time until you can reach the bottom right square (n-1, n-1) from the top left square (0, 0).\n\nExample 1:\nInput: grid = [[0,2],[1,3]]\nOutput: 3\n\nExample 2:\nInput: grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]\nOutput: 16\n\nConstraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 50\n- 0 <= grid[i][j] < n^2\n- Each value grid[i][j] is unique\n\nRef: LeetCode #778 Swim in Rising Water`,
    code: `def swim_in_water(grid)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_swim_basic
  assert_equal(3, swim_in_water([[0,2],[1,3]]))
end

def test_swim_large
  grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]
  assert_equal(16, swim_in_water(grid))
end

def test_swim_single
  assert_equal(0, swim_in_water([[0]]))
end`,
    solution: `def swim_in_water(grid)
  # Dijkstra-style search with a plain array as the priority queue
  # (linear-scan min extraction instead of Ruby's non-existent core heap).
  n = grid.length
  visited = { [0, 0] => true }
  heap = [[grid[0][0], 0, 0]]
  until heap.empty?
    min_idx = 0
    heap.each_with_index { |trip, idx| min_idx = idx if trip[0] < heap[min_idx][0] }
    t, r, c = heap.delete_at(min_idx)
    return t if r == n - 1 && c == n - 1
    [[0,1],[0,-1],[1,0],[-1,0]].each do |dr, dc|
      nr, nc = r + dr, c + dc
      if nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[[nr, nc]]
        visited[[nr, nc]] = true
        heap << [[t, grid[nr][nc]].max, nr, nc]
      end
    end
  end
  -1
end`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dijkstra", "binary-search", "neetcode"],
  },
  {
    name: "Cheapest Flights Within K Stops",
    category: "advanced-graphs",
    language: "ruby",
    difficulty: "medium",
    description: `There are n cities connected by some flights. You are given an array flights where flights[i] = [fromi, toi, pricei] indicates that there is a flight from city fromi to city toi with cost pricei.\n\nGiven src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.\n\nUse Bellman-Ford with k+1 iterations.\n\nExample 1:\nInput: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\n\nExample 2:\nInput: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1\nOutput: 200\n\nConstraints:\n- 1 <= n <= 100\n- 0 <= flights.length <= (n*(n-1)/2)\n- flights[i].length == 3\n- 0 <= src, dst, fromi, toi < n\n- src != dst\n- 1 <= pricei <= 10^4\n- 0 <= k < n\n\nRef: LeetCode #787 Cheapest Flights Within K Stops`,
    code: `def find_cheapest_price(n, flights, src, dst, k)
  # your code here
  raise NotImplementedError
end`,
    testCode: `def test_cheapest_flights_basic
  flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]
  assert_equal(700, find_cheapest_price(4, flights, 0, 3, 1))
end

def test_cheapest_flights_direct
  flights = [[0,1,100],[1,2,100],[0,2,500]]
  assert_equal(200, find_cheapest_price(3, flights, 0, 2, 1))
end

def test_cheapest_flights_no_route
  flights = [[0,1,100]]
  assert_equal(-1, find_cheapest_price(3, flights, 0, 2, 1))
end`,
    solution: `def find_cheapest_price(n, flights, src, dst, k)
  prices = Array.new(n, Float::INFINITY)
  prices[src] = 0
  (k + 1).times do
    temp = prices.dup
    flights.each do |u, v, w|
      if prices[u] != Float::INFINITY && prices[u] + w < temp[v]
        temp[v] = prices[u] + w
      end
    end
    prices = temp
  end
  prices[dst] != Float::INFINITY ? prices[dst] : -1
end`,
    usage: null,
    tags: ["graphs", "advanced-graphs", "dynamic-programming", "bellman-ford", "neetcode"],
  },
];

export { neetcodeAdvancedGraphs };
