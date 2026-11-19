// Ruby snippets from the same MIT-licensed collection credited in code-templates.ts.
import type { CodeTemplate } from "./code-templates";

export const rubyCodeTemplates: CodeTemplate[] = [
  {
    "id": "array:prefix-sum",
    "title": "Array: Prefix Sum",
    "description": "Convert range sums into subtraction between prefixes.",
    "keywords": [
      "array",
      "prefix",
      "sum"
    ],
    "code": "# This method computes the prefix sum of an array.\n# It returns a new array where each element at index i is the sum of elements from index 0 to i-1 in the original array.\n# # For example, given the array [1, 2, 3], the prefix sum array will be [1, 3, 6].\ndef prefix_sum(arr)\n  n       = arr.length\n  prefix  = [arr[0]]\n\n  (1...n).each do |i|\n    prefix << (prefix.last + arr[i])\n  end\n\n  prefix\nend"
  },
  {
    "id": "array:sliding-window",
    "title": "Array: Sliding Window",
    "description": "Maintain a valid contiguous window with two bounds.",
    "keywords": [
      "array",
      "sliding",
      "window"
    ],
    "code": "def fn(arr)\n  n       = arr.length\n  window  = 0\n  left    = 0\n  result  = 0\n\n  (0...n).each do |right|\n    # TODO: add arr[right] to window\n\n    while WINDOW_CONDITION_BROKEN\n      # TODO: remove arr[left] from window\n      left += 1\n    end\n\n    # TODO: update result\n  end\n\n  result\nend"
  },
  {
    "id": "array:string-building",
    "title": "Array: String Building",
    "description": "Build strings incrementally without repeated concatenation costs.",
    "keywords": [
      "array",
      "string",
      "building"
    ],
    "code": "def fn(strs)\n  # array of strings/chrs\n  ans = []\n\n  strs.each do |char|\n    ans << char\n  end\n\n  ans.join('')\nend\n\n# simple\ndef fn2(strs)\n  strs.join\nend"
  },
  {
    "id": "array:two-pointers-one-input",
    "title": "Array: Two Pointers One Input",
    "description": "Walk inward from both ends of one ordered input.",
    "keywords": [
      "array",
      "two",
      "pointers",
      "one",
      "input"
    ],
    "code": "def fn(arr)\n  ans   = 0\n  left  = 0\n  right = arr.length - 1\n\n  while left < right\n    # TODO: logic with left and right\n    if CONDITION\n      left  += 1\n    else\n      right -= 1\n    end\n  end\n\n  ans\nend"
  },
  {
    "id": "array:two-pointers-two-inputs",
    "title": "Array: Two Pointers Two Inputs",
    "description": "Advance two indices across two inputs until both are exhausted.",
    "keywords": [
      "array",
      "two",
      "pointers",
      "inputs"
    ],
    "code": "def fn(arr1, arr2)\n  i, j  = 0, 0\n  ans   = 0\n\n  while i < arr1.length && j < arr2.length\n    # TODO: Logic\n    if CONDITION\n      i += 1\n    else\n      j += 1\n    end\n  end\n\n  while i < arr1.length\n    # TODO: Logic\n    i += 1\n  end\n\n  while j < arr2.length\n    # TODO: Logic\n    j += 1\n  end\n\n  ans\nend"
  },
  {
    "id": "hash-map:find-number-of-subarrays",
    "title": "Hash Map: Find Number Of Subarrays",
    "description": "Count exact-criteria subarrays with prefix frequencies.",
    "keywords": [
      "hash",
      "map",
      "find",
      "number",
      "of",
      "subarrays"
    ],
    "code": "def fn(arr, k)\n  counts    = Hash.new(0)\n  counts[0] = 1\n  ans       = 0\n  curr      = 0\n\n  arr.each do |num|\n    # TODO: logic to change curr\n    ans += counts[curr - k]\n    counts[curr] += 1\n  end\n\n  ans\nend"
  },
  {
    "id": "hash-map:sliding-window",
    "title": "Hash Map: Sliding Window",
    "description": "Track window counts with a hash map.",
    "keywords": [
      "hash",
      "map",
      "sliding",
      "window"
    ],
    "code": "require 'set'\n\ndef fn(arr)\n  window  = Set.new\n  ans     = 0\n  left    = 0\n\n  arr.each_with_index do |ELEMENT, right|\n    # TODO: add arr[right] to window\n\n    while WINDOW_CONDITION_BROKEN\n      # TODO: remove arr[left] from window\n      left += 1\n    end\n\n    # TODO: update ans\n  end\n\n  ans\nend"
  },
  {
    "id": "linked-list:fast-and-slow-pointer",
    "title": "Linked List: Fast And Slow Pointer",
    "description": "Use two runners to detect midpoint or cycles.",
    "keywords": [
      "linked",
      "list",
      "fast",
      "and",
      "slow",
      "pointer"
    ],
    "code": "def fn(head)\n  slow  = head\n  fast  = head\n  ans   = 0\n\n  until fast.nil? || fast.next.nil?\n    # TODO: logic\n    slow = slow.next\n    fast = fast.next.next\n  end\n\n  ans\nend"
  },
  {
    "id": "linked-list:reverse-linked-list",
    "title": "Linked List: Reverse Linked List",
    "description": "Reverse links iteratively with previous/current pointers.",
    "keywords": [
      "linked",
      "list",
      "reverse"
    ],
    "code": "def fn(head)\n  prev = nil\n  curr = head\n\n  until curr.nil?\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\n  end\n\n  prev\nend"
  },
  {
    "id": "binary-tree:bfs",
    "title": "Binary Tree: BFS",
    "description": "Process a binary tree level by level with a queue.",
    "keywords": [
      "binary",
      "tree",
      "bfs"
    ],
    "code": "def fn(root)\n  queue = [root]\n  ans   = 0\n\n  until queue.empty?\n    current_length = queue.length\n    # TODO: logic for current level\n\n    current_length.times do\n      node = queue.shift\n      # TODO: logic\n\n      queue << node.left if node.left\n      queue << node.right if node.right\n    end\n  end\n\n  ans\nend"
  },
  {
    "id": "binary-tree:dfs-iterative",
    "title": "Binary Tree: DFS Iterative",
    "description": "Traverse a binary tree with an explicit stack.",
    "keywords": [
      "binary",
      "tree",
      "dfs",
      "iterative"
    ],
    "code": "def dfs(root)\n  stack = [root]\n  ans   = 0\n\n  until stack.empty?\n    node = stack.pop\n    # TODO: logic\n\n    stack << node.left if node.left\n    stack << node.right if node.right\n  end\n\n  ans\nend"
  },
  {
    "id": "binary-tree:dfs-recursive",
    "title": "Binary Tree: DFS Recursive",
    "description": "Traverse a binary tree recursively.",
    "keywords": [
      "binary",
      "tree",
      "dfs",
      "recursive"
    ],
    "code": "def dfs(root)\n  return unless root\n\n  ans = 0\n\n  # TODO: logic\n  dfs(root.left)\n  dfs(root.right)\n\n  ans\nend"
  },
  {
    "id": "graph:bellman-ford",
    "title": "Graph: Bellman Ford",
    "description": "Shortest paths that tolerate negative edge weights.",
    "keywords": [
      "graph",
      "bellman",
      "ford"
    ],
    "code": "def bellman_ford(n, edges, source)\n  distances         = Array.new(n, Float::INFINITY)\n  distances[source] = 0\n\n  (n - 1).times do\n    edges.each do |u, v, w|\n      if distances[u] != Float::INFINITY && distances[u] + w < distances[v]\n        distances[v] = distances[u] + w\n      end\n    end\n  end\n\n  edges.each do |u, v, w|\n    if distances[u] != Float::INFINITY && distances[u] + w < distances[v]\n      return []\n    end\n  end\n\n  distances\nend"
  },
  {
    "id": "graph:bfs",
    "title": "Graph: BFS",
    "description": "Explore graph nodes level by level with a queue.",
    "keywords": [
      "graph",
      "bfs"
    ],
    "code": "require 'set'\n\ndef fn(graph)\n  queue = [START_NODE]\n  seen  = Set.new([START_NODE])\n  ans   = 0\n\n  until queue.empty?\n    node = queue.shift\n    # TODO: logic\n    graph[node].each do |neighbor|\n      unless seen.include?(neighbor)\n        seen.add(neighbor)\n        queue << neighbor\n      end\n    end\n  end\n\n  ans\nend"
  },
  {
    "id": "graph:dfs-iterative",
    "title": "Graph: DFS Iterative",
    "description": "Explore graph nodes with an explicit stack.",
    "keywords": [
      "graph",
      "dfs",
      "iterative"
    ],
    "code": "require 'set'\n\ndef fn(graph)\n  stack = [START_NODE]\n  seen  = Set.new([START_NODE])\n  ans   = 0\n\n  until stack.empty?\n    node = stack.pop\n    # TODO: logic\n    graph[node].each do |neighbor|\n      unless seen.include?(neighbor)\n        seen.add(neighbor)\n        stack << neighbor\n      end\n    end\n  end\n\n  ans\nend"
  },
  {
    "id": "graph:dfs-recursive",
    "title": "Graph: DFS Recursive",
    "description": "Explore graph nodes recursively with visited tracking.",
    "keywords": [
      "graph",
      "dfs",
      "recursive"
    ],
    "code": "require 'set'\n\ndef fn(graph)\n  seen = Set.new([START_NODE])\n\n  dfs = lambda do |node|\n    ans = 0\n    # TODO: logic\n    graph[node].each do |neighbor|\n      unless seen.include?(neighbor)\n        seen.add(neighbor)\n        ans += dfs.call(neighbor)\n      end\n    end\n    ans\n  end\n\n  dfs.call(START_NODE)\nend"
  },
  {
    "id": "graph:dijkstra",
    "title": "Graph: Dijkstra",
    "description": "Shortest paths from one source on non-negative weighted graphs.",
    "keywords": [
      "graph",
      "dijkstra"
    ],
    "code": "require 'priority_queue'\n\ndef dijkstras(graph, source)\n  n         = graph.size\n  distances = Array.new(n, Float::INFINITY)\n\n  distances[source] = 0\n\n  heap = PriorityQueue.new\n  heap[source] = 0\n\n  until heap.empty?\n    node, curr_dist = heap.delete_min\n    next if curr_dist > distances[node]\n\n    graph[node].each do |neighbor, weight|\n      dist = curr_dist + weight\n      if dist < distances[neighbor]\n        distances[neighbor] = dist\n        heap[neighbor] = dist\n      end\n    end\n  end\n\n  distances\nend"
  },
  {
    "id": "graph:kahn",
    "title": "Graph: Kahn",
    "description": "Topologically sort a directed acyclic graph by indegree.",
    "keywords": [
      "graph",
      "kahn"
    ],
    "code": "def kahn_topological_sort(graph)\n  result    = []\n  indegree  = Hash.new(0)\n\n  graph.each_value do |vertices|\n    vertices.each do |v|\n      indegree[v] += 1\n    end\n  end\n\n  queue = graph.keys.select { |node| indegree[node] == 0 }\n\n  until queue.empty?\n    node = queue.shift\n    result << node\n\n    graph[node].each do |neighbor|\n      indegree[neighbor] -= 1\n      queue << neighbor if indegree[neighbor] == 0\n    end\n  end\n\n  result.size == graph.size ? result : []\nend"
  },
  {
    "id": "graph:kruskal",
    "title": "Graph: Kruskal",
    "description": "Build a minimum spanning tree with sorted edges and union find.",
    "keywords": [
      "graph",
      "kruskal"
    ],
    "code": "def kruskal_mst(n, edges)\n  mst = []\n  uf  = UnionFind.new(n)\n  edges.sort.each do |w, u, v|\n    unless uf.connected(u, v)\n      uf.union(u, v)\n      mst << [w, u, v]\n    end\n  end\n\n  mst\nend"
  },
  {
    "id": "graph:prim",
    "title": "Graph: Prim",
    "description": "Build a minimum spanning tree by expanding a frontier.",
    "keywords": [
      "graph",
      "prim"
    ],
    "code": "def prim_mst(n, edges)\n  mst = []\n  uf  = UnionFind.new(n)\n  edges.sort.each do |w, u, v|\n    unless uf.connected(u, v)\n      uf.union(u, v)\n      mst << [w, u, v]\n    end\n  end\n\n  mst\nend"
  },
  {
    "id": "heap:find-top-k-elements",
    "title": "Heap: Find Top K Elements",
    "description": "Keep the best k candidates with a heap.",
    "keywords": [
      "heap",
      "find",
      "top",
      "k",
      "elements"
    ],
    "code": "def fn(arr, k)\n  heap = []\n\n  arr.each do |num|\n    # TODO: logic to push onto heap according to problem's criteria\n    heap.push([CRITERIA, num])\n\n    if heap.size > k\n      # TODO: pop the top element from heap\n      heap.pop\n    end\n  end\n\n  heap.map { |item| item[1] }\nend"
  },
  {
    "id": "stack:monotonic-decreasing",
    "title": "Stack: Monotonic Decreasing",
    "description": "Maintain decreasing order while scanning.",
    "keywords": [
      "stack",
      "monotonic",
      "decreasing"
    ],
    "code": "def fn(arr)\n  stack = []\n  ans   = 0\n\n  arr.each do |num|\n    while !stack.empty? && stack[-1] < num\n      # TODO: logic\n      stack.pop\n    end\n    stack << num\n  end\n\n  ans\nend"
  },
  {
    "id": "stack:monotonic-increasing",
    "title": "Stack: Monotonic Increasing",
    "description": "Maintain increasing order while scanning.",
    "keywords": [
      "stack",
      "monotonic",
      "increasing"
    ],
    "code": "def fn(arr)\n  stack = []\n  ans   = 0\n\n  arr.each do |num|\n    while !stack.empty? && stack[-1] > num\n      # TODO: logic\n      stack.pop\n    end\n    stack << num\n  end\n\n  ans\nend"
  },
  {
    "id": "matrix:create-copy",
    "title": "Matrix: Create Copy",
    "description": "Create and copy two-dimensional arrays safely.",
    "keywords": [
      "matrix",
      "create",
      "copy"
    ],
    "code": "def fn(matrix)\n  r = matrix.size\n  c = matrix[0].size\n\n  create_matrix = Array.new(r) { Array.new(c, 0) }\n  copy_matrix = matrix.map(&:dup)\nend"
  },
  {
    "id": "matrix:diagonals",
    "title": "Matrix: Diagonals",
    "description": "Iterate diagonals and anti-diagonals in a matrix.",
    "keywords": [
      "matrix",
      "diagonals"
    ],
    "code": "def fn(matrix)\n  r = matrix.size\n  c = matrix[0].size\n\n  main_diagonal = (0...[r, c].min).map { |i| matrix[i][i] }\n  anti_diagonal = (0...[r, c].min).map { |i| matrix[i][-i - 1] }\nend"
  },
  {
    "id": "matrix:rotate-transpose",
    "title": "Matrix: Rotate Transpose",
    "description": "Rotate or transpose a square matrix.",
    "keywords": [
      "matrix",
      "rotate",
      "transpose"
    ],
    "code": "def fn(matrix)\n  r = matrix.size\n  c = matrix[0].size\n\n  transpose = matrix[0].zip(*matrix[1..-1])\n  rotate_left = transpose.reverse\n  rotate_right = transpose.map(&:reverse)\nend"
  },
  {
    "id": "binary-search:binary-search",
    "title": "Binary Search: Binary Search",
    "description": "Search a sorted answer space or array in logarithmic time.",
    "keywords": [
      "binary",
      "search"
    ],
    "code": "def fn(arr, target)\n  left  = 0\n  right = arr.length - 1\n\n  while left <= right\n    mid = (left + right) / 2\n\n    if arr[mid] == target\n      # TODO: logic\n      return\n    elsif arr[mid] > target\n      right = mid - 1\n    else\n      left = mid + 1\n    end\n  end\n\n  left\nend"
  },
  {
    "id": "binary-search:duplicate-elements-left-insertion",
    "title": "Binary Search: Duplicate Elements Left Insertion",
    "description": "Find the leftmost insertion point among duplicates.",
    "keywords": [
      "binary",
      "search",
      "duplicate",
      "elements",
      "left",
      "insertion"
    ],
    "code": "def fn(arr, target)\n  left  = 0\n  right = len(arr)\n\n  while left < right\n    mid = (left + right) / 2\n\n    if arr[mid] >= target\n      right = mid\n    else\n      left = mid + 1\n    end\n  end\n\n  left\nend"
  },
  {
    "id": "binary-search:duplicate-elements-right-insertion",
    "title": "Binary Search: Duplicate Elements Right Insertion",
    "description": "Find the rightmost insertion point among duplicates.",
    "keywords": [
      "binary",
      "search",
      "duplicate",
      "elements",
      "right",
      "insertion"
    ],
    "code": "def fn(arr, target)\n  left  = 0\n  right = len(arr)\n\n  while left < right\n    mid = (left + right) / 2\n\n    if arr[mid] > target\n      right = mid\n    else\n      left = mid + 1\n    end\n  end\n\n  left\nend"
  },
  {
    "id": "binary-search:greedy-maximum",
    "title": "Binary Search: Greedy Maximum",
    "description": "Binary search the maximum feasible answer.",
    "keywords": [
      "binary",
      "search",
      "greedy",
      "maximum"
    ],
    "code": "def fn(arr)\n  left  = MINIMUM_POSSIBLE_ANSWER\n  right = MAXIMUM_POSSIBLE_ANSWER\n\n  while left <= right\n    mid = (left + right) / 2 # integer division\n\n    if check(mid)\n      left = mid + 1\n    else\n      right = mid - 1\n    end\n\n  end\n\n  right\nend\n\ndef check(x)\n  BOOLEAN\nend"
  },
  {
    "id": "binary-search:greedy-minimum",
    "title": "Binary Search: Greedy Minimum",
    "description": "Binary search the minimum feasible answer.",
    "keywords": [
      "binary",
      "search",
      "greedy",
      "minimum"
    ],
    "code": "def fn(arr)\n  left  = MINIMUM_POSSIBLE_ANSWER\n  right = MAXIMUM_POSSIBLE_ANSWER\n\n  while left <= right\n    mid = (left + right) / 2 # int div\n\n    if check(mid)\n      right = mid - 1\n    else\n      left = mid + 1\n    end\n  end\n\n  left\nend\n\ndef check(x)\n  BOOLEAN\nend"
  },
  {
    "id": "backtracking:backtracking",
    "title": "Backtracking: Backtracking",
    "description": "Explore choices, undo them, and collect valid states.",
    "keywords": [
      "backtracking"
    ],
    "code": "def backtrack(curr, OTHER_ARGUMENTS...)\n  if(BASE_CASE)\n    # TODO: modify answer\n    return\n  end\n\n  ans = 0\n\n  INPUTS.each do |i|\n    # TODO: modify current state\n    ans += backtrack(curr, OTHER_ARGUMENTS...)\n    # TODO: undo modification of current state\n  end\n\n  ans\nend"
  },
  {
    "id": "bit-manipulation:check-power-of-two",
    "title": "Bit Manipulation: Check Power Of Two",
    "description": "Check whether a number has exactly one set bit.",
    "keywords": [
      "bit",
      "manipulation",
      "check",
      "power",
      "of",
      "two"
    ],
    "code": "def is_power_of_two(num)\n  (num & (num - 1)) == 0\nend"
  },
  {
    "id": "bit-manipulation:clear-kth-bit",
    "title": "Bit Manipulation: Clear Kth Bit",
    "description": "Clear one bit by position.",
    "keywords": [
      "bit",
      "manipulation",
      "clear",
      "kth"
    ],
    "code": "def clear_kth_bit(num, k)\n  num & ~(1 << k)\nend"
  },
  {
    "id": "bit-manipulation:count-set-bits",
    "title": "Bit Manipulation: Count Set Bits",
    "description": "Count bits set to one.",
    "keywords": [
      "bit",
      "manipulation",
      "count",
      "set",
      "bits"
    ],
    "code": "def count_set_bits(num)\n  num.to_s(2).count('1')\nend"
  },
  {
    "id": "bit-manipulation:divide-power-of-two",
    "title": "Bit Manipulation: Divide Power Of Two",
    "description": "Divide by a power of two with shifting.",
    "keywords": [
      "bit",
      "manipulation",
      "divide",
      "power",
      "of",
      "two"
    ],
    "code": "def divide_by_power_of_two(num, k)\n  num >> k\nend"
  },
  {
    "id": "bit-manipulation:get-rightmost-bit",
    "title": "Bit Manipulation: Get Rightmost Bit",
    "description": "Isolate the least significant set bit.",
    "keywords": [
      "bit",
      "manipulation",
      "get",
      "rightmost"
    ],
    "code": "def get_rightmost_set_bit(num)\n  num & -num\nend"
  },
  {
    "id": "bit-manipulation:multiply-power-of-two",
    "title": "Bit Manipulation: Multiply Power Of Two",
    "description": "Multiply by a power of two with shifting.",
    "keywords": [
      "bit",
      "manipulation",
      "multiply",
      "power",
      "of",
      "two"
    ],
    "code": "def multiply_by_power_of_two(num, k)\n  num << k\nend"
  },
  {
    "id": "bit-manipulation:set-kth-bit",
    "title": "Bit Manipulation: Set Kth Bit",
    "description": "Set one bit by position.",
    "keywords": [
      "bit",
      "manipulation",
      "set",
      "kth"
    ],
    "code": "def set_kth_bit(num, k)\n  num | (1 << k)\nend"
  },
  {
    "id": "bit-manipulation:swap-variables",
    "title": "Bit Manipulation: Swap Variables",
    "description": "Swap values with bitwise XOR.",
    "keywords": [
      "bit",
      "manipulation",
      "swap",
      "variables"
    ],
    "code": "# in-memory swaps\n# unnecessary for modern languages\ndef swap_variables(num1, num2)\n  num1 ^= num2\n  num2 ^= num1\n  num1 ^= num2\n\n  return num1, num2\nend"
  },
  {
    "id": "bit-manipulation:test-kth-bit",
    "title": "Bit Manipulation: Test Kth Bit",
    "description": "Check whether a specific bit is set.",
    "keywords": [
      "bit",
      "manipulation",
      "test",
      "kth"
    ],
    "code": "def test_kth_bit(num, k)\n  num & (1 << k) != 0\nend"
  },
  {
    "id": "bit-manipulation:toggle-kth-bit",
    "title": "Bit Manipulation: Toggle Kth Bit",
    "description": "Flip one bit by position.",
    "keywords": [
      "bit",
      "manipulation",
      "toggle",
      "kth"
    ],
    "code": "def toggle_kth_bit(num, k)\n  num ^ (1 << k)\nend"
  },
  {
    "id": "dynamic-programming:bottom-up",
    "title": "Dynamic Programming: Bottom Up",
    "description": "Fill smaller states before larger states.",
    "keywords": [
      "dynamic",
      "programming",
      "bottom",
      "up"
    ],
    "code": "def fn(arr)\n  if BASE_CASE\n    return 0\n  end\n\n  dp = Array.new(STATE_FOR_WHOLE_INPUT + 1, BASE_CASE)\n\n  (SMALLEST_SUBPROBLEM..STATE_FOR_WHOLE_INPUT).each do |state|\n    if BASE_CASE\n      dp[state] = BASE_CASE\n    else\n      dp[state] = RECURRENCE_RELATION(state)\n    end\n  end\n\n  dp[STATE_FOR_WHOLE_INPUT]\nend"
  },
  {
    "id": "dynamic-programming:kadane",
    "title": "Dynamic Programming: Kadane",
    "description": "Track best subarray ending here and global best.",
    "keywords": [
      "dynamic",
      "programming",
      "kadane"
    ],
    "code": "def kadane(arr)\n  curr_sub  = arr[0]\n  max_sub   = arr[0]\n\n  arr[1..-1].each do |num|\n    curr_sub = [curr_sub + num, num].max\n    max_sub = [max_sub, curr_sub].max\n  end\n\n  max_sub\nend"
  },
  {
    "id": "dynamic-programming:top-down",
    "title": "Dynamic Programming: Top Down",
    "description": "Cache recursive states to avoid repeated subproblems.",
    "keywords": [
      "dynamic",
      "programming",
      "top",
      "down"
    ],
    "code": "def fn(arr)\n  cache = {}\n\n  dp = lambda do |state|\n    return 0 if BASE_CASE\n    return cache[state] if cache.key?(state)\n\n    cache[state] = RECURRENCE_RELATION(state)\n  end\n\n  dp.call(STATE_FOR_WHOLE_INPUT)\nend"
  },
  {
    "id": "data-structures:array",
    "title": "Array",
    "description": "Array template.",
    "keywords": [
      "data",
      "structures",
      "array"
    ],
    "code": "class Array\n  def initialize(size)\n    @size = size\n    @data = Array.new(size)\n  end\n\n  def [](index)\n    @data[index]\n  end\n\n  def []=(index, value)\n    @data[index] = value\n  end\n\n  def length\n    @data.length\n  end\n\n  def to_s\n    @data.to_s\n  end\nend"
  },
  {
    "id": "data-structures:binary-search-tree",
    "title": "Binary Search Tree",
    "description": "Binary Search Tree template.",
    "keywords": [
      "data",
      "structures",
      "binary",
      "search",
      "tree"
    ],
    "code": "class TreeNode\n  attr_accessor :data, :left, :right\n\n  def initialize(data)\n    @data   = data\n    @left   = nil\n    @right  = nil\n  end\nend\n\nclass BinarySearchTree\n  attr_accessor :root\n\n  def initialize\n    @root = nil\n  end\n\n  def insert(data)\n    if @root.nil?\n      @root = TreeNode.new(data)\n    else\n      insert_node(@root, data)\n    end\n  end\n\n  def insert_node(node, data)\n    if data < node.data\n      if node.left.nil?\n        node.left = TreeNode.new(data)\n      else\n        insert_node(node.left, data)\n      end\n    else\n      if node.right.nil?\n        node.right = TreeNode.new(data)\n      else\n        insert_node(node.right, data)\n      end\n    end\n  end\n\n  def to_s\n    @root.nil? ? 'Empty tree' : print_tree(@root, '', true)\n  end\n\n  private\n\n  def print_tree(node, prefix, is_left)\n    return '' if node.nil?\n\n    result = ''\n    result += print_tree(node.right, prefix + (is_left ? '\u2502   ' : '    '), false)\n    result += prefix + (is_left ? '\u2514\u2500\u2500 ' : '\u250c\u2500\u2500 ') + node.data.to_s + \"\\n\"\n    result += print_tree(node.left, prefix + (is_left ? '    ' : '\u2502   '), true)\n\n    result\n  end\nend"
  },
  {
    "id": "data-structures:binary-tree",
    "title": "Binary Tree",
    "description": "Binary Tree template.",
    "keywords": [
      "data",
      "structures",
      "binary",
      "tree"
    ],
    "code": "class TreeNode\n  attr_accessor :data, :left, :right\n\n  def initialize(data)\n    @data   = data\n    @left   = nil\n    @right  = nil\n  end\nend\n\nclass BinaryTree\n  attr_accessor :root\n\n  def initialize\n    @root = nil\n  end\n\n  def insert(data)\n    if @root.nil?\n      @root = TreeNode.new(data)\n    else\n      insert_node(@root, data)\n    end\n  end\n\n  def insert_node(node, data)\n    return TreeNode.new(data) if node.nil?\n\n    if node.left.nil?\n      node.left = TreeNode.new(data)\n    elsif node.right.nil?\n      node.right = TreeNode.new(data)\n    else\n      node.left = insert_node(node.left, data)\n    end\n\n    node\n  end\n\n  def to_s\n    @root.nil? ? 'Empty tree' : print_tree(@root, '', true)\n  end\n\n  private\n\n  def print_tree(node, prefix, is_left)\n    return '' if node.nil?\n\n    result = ''\n    result += print_tree(node.right, prefix + (is_left ? '\u2502   ' : '    '), false)\n    result += prefix + (is_left ? '\u2514\u2500\u2500 ' : '\u250c\u2500\u2500 ') + node.data.to_s + \"\\n\"\n    result += print_tree(node.left, prefix + (is_left ? '    ' : '\u2502   '), true)\n\n    result\n  end\nend"
  },
  {
    "id": "data-structures:doubly-linked-list",
    "title": "Doubly Linked List",
    "description": "Doubly Linked List template.",
    "keywords": [
      "data",
      "structures",
      "doubly",
      "linked",
      "list"
    ],
    "code": "class ListNode\n  attr_accessor :data, :prev, :next\n\n  def initialize(data)\n    @data = data\n    @prev = nil\n    @next = nil\n  end\n\n  def to_s\n    \"[#{@data}]\"\n  end\nend\n\nclass DoublyLinkedList\n  attr_accessor :head\n\n  def initialize\n    @head = nil\n  end\n\n  def append(data)\n    if @head.nil?\n      @head = ListNode.new(data)\n      return\n    end\n\n    curr = @head\n    curr = curr.next while curr.next\n\n    new_node = ListNode.new(data)\n    curr.next = new_node\n    new_node.prev = curr\n  end\n\n  def delete(data)\n    return if @head.nil?\n\n    if @head.data == data\n      @head = @head.next\n      @head.prev = nil if @head\n      return\n    end\n\n    curr = @head\n    while curr\n      if curr.data == data\n        prev_node = curr.prev\n        prev_node.next = curr.next\n        curr.next.prev = prev_node if curr.next\n        return\n      end\n      curr = curr.next\n    end\n  end\n\n  def reverse\n    curr = @head\n    prev = nil\n\n    while curr\n      nxt = curr.next\n      curr.next = prev\n      curr.prev = nxt\n      prev = curr\n      curr = nxt\n    end\n\n    @head = prev\n  end\n\n  def to_s\n    return 'None' if @head.nil?\n\n    nodes = []\n    curr = @head\n    while curr\n      nodes << curr.to_s\n      curr = curr.next\n    end\n\n    nodes.join(' <-> ') + ' <-> None'\n  end\nend"
  },
  {
    "id": "data-structures:graph",
    "title": "Graph",
    "description": "Graph template.",
    "keywords": [
      "data",
      "structures",
      "graph"
    ],
    "code": "class Graph\n  attr_accessor :graph\n\n  def initialize\n    @graph = {}\n  end\n\n  def add_vertex(vertex)\n    @graph[vertex] ||= []\n  end\n\n  def add_edge(a, b)\n    add_vertex(a)\n    add_vertex(b)\n    @graph[a] << b\n    @graph[b] << a\n  end\n\n  def get_neighbors(vertex)\n    @graph.fetch(vertex, [])\n  end\n\n  def to_s\n    output = ''\n    @graph.each do |vertex, neighbors|\n      output += \"#{vertex} - #{neighbors.join(' - ')}\\n\"\n    end\n    output\n  end\nend"
  },
  {
    "id": "data-structures:hash-map",
    "title": "Hash Map",
    "description": "Hash Map template.",
    "keywords": [
      "data",
      "structures",
      "hash",
      "map"
    ],
    "code": "class HashMap\n  def initialize\n    @size   = 100_000\n    @bucket = Array.new(@size)\n  end\n\n  def hash_key(key)\n    key.hash % @size\n  end\n\n  def []=(key, value)\n    @bucket[hash_key(key)] = value\n  end\n\n  def [](key)\n    @bucket[hash_key(key)]\n  end\n\n  def delete(key)\n    @bucket[hash_key(key)] = nil\n  end\nend"
  },
  {
    "id": "data-structures:linked-list",
    "title": "Linked List",
    "description": "Linked List template.",
    "keywords": [
      "data",
      "structures",
      "linked",
      "list"
    ],
    "code": "class ListNode\n  attr_accessor :data, :next\n\n  def initialize(data)\n    @data = data\n    @next = nil\n  end\n\n  def to_s\n    \"[#{@data}]\"\n  end\nend\n\nclass LinkedList\n  attr_accessor :head\n\n  def initialize\n    @head = nil\n  end\n\n  def append(data)\n    if @head.nil?\n      @head = ListNode.new(data)\n      return\n    end\n\n    curr = @head\n    curr = curr.next while curr.next\n    curr.next = ListNode.new(data)\n  end\n\n  def delete(data)\n    return if @head.nil?\n\n    if @head.data == data\n      @head = @head.next\n      return\n    end\n\n    prev = nil\n    curr = @head\n\n    while curr\n      if curr.data == data\n        prev.next = curr.next\n        return\n      end\n      prev = curr\n      curr = curr.next\n    end\n  end\n\n  def reverse\n    prev = nil\n    curr = @head\n\n    while curr\n      nxt = curr.next\n      curr.next = prev\n      prev = curr\n      curr = nxt\n    end\n\n    @head = prev\n  end\n\n  def to_s\n    return 'nil' if @head.nil?\n\n    nodes = []\n    curr = @head\n    while curr\n      nodes << curr.to_s\n      curr = curr.next\n    end\n\n    nodes.join(' -> ') + ' -> nil'\n  end\nend"
  },
  {
    "id": "data-structures:trie",
    "title": "Trie",
    "description": "Trie template.",
    "keywords": [
      "data",
      "structures",
      "trie"
    ],
    "code": "class TrieNode\n  attr_accessor :children, :is_word\n\n  def initialize\n    @children = {}\n    @is_word  = false\n  end\nend\n\nclass Trie\n  attr_accessor :root\n\n  def initialize\n    @root = TrieNode.new\n  end\n\n  def build(words)\n    words.each { |word| insert(word) }\n  end\n\n  def insert(word)\n    node = @root\n    word.each_char do |char|\n      node.children[char] ||= TrieNode.new\n      node = node.children[char]\n    end\n    node.is_word = true\n  end\n\n  def search(word)\n    node = @root\n    word.each_char do |char|\n      return false unless node.children.key?(char)\n      node = node.children[char]\n    end\n    node.is_word\n  end\n\n  def starts_with(prefix)\n    node = @root\n    prefix.each_char do |char|\n      return false unless node.children.key?(char)\n      node = node.children[char]\n    end\n    true\n  end\n\n  def collect_words(node = @root, prefix = '')\n    words = []\n    words << prefix if node.is_word\n    node.children.each do |char, child_node|\n      words.concat(collect_words(child_node, prefix + char))\n    end\n    words\n  end\n\n  def to_s\n    \"Trie:\\n\" + print_trie(@root)\n  end\n\n  private\n\n  def print_trie(node, level = 0, prefix = '')\n    return '' unless node\n\n    output = ''\n    prefix_str = '    ' * level + prefix\n    output += prefix_str + ' \u251c\u2500 (*)' + \"\\n\" if node.is_word\n\n    node.children.each_with_index do |(char, child_node), i|\n      is_last = i == node.children.size - 1\n      marker = is_last ? '\u2514\u2500 ' : '\u251c\u2500 '\n      output += prefix_str + marker + char + \"\\n\"\n      new_prefix = is_last ? '     ' : '    \u2502'\n      output += print_trie(child_node, level + 1, new_prefix)\n    end\n\n    output\n  end\nend"
  },
  {
    "id": "data-structures:union-find-optimized",
    "title": "Union Find Optimized",
    "description": "Union Find Optimized template.",
    "keywords": [
      "data",
      "structures",
      "union",
      "find",
      "optimized"
    ],
    "code": "class UnionFind\n  attr_accessor :root, :rank\n\n  def initialize(n)\n    @root = Array.new(n) { |i| i }\n    @rank = Array.new(n, 1)\n  end\n\n  def find(a)\n    return a if a == @root[a]\n\n    @root[a] = find(@root[a])\n  end\n\n  def union(a, b)\n    root_a = find(a)\n    root_b = find(b)\n\n    return if root_a == root_b\n\n    if @rank[root_a] < @rank[root_b]\n      @root[root_a] = root_b\n    elsif @rank[root_a] > @rank[root_b]\n      @root[root_b] = root_a\n    else\n      @root[root_b] = root_a\n      @rank[root_a] += 1\n    end\n  end\n\n  def connected(a, b)\n    find(a) == find(b)\n  end\n\n  def to_s\n    n = @root.size\n    components = Hash.new { |h, k| h[k] = [] }\n\n    (0...n).each do |i|\n      root_i = find(i)\n      components[root_i] << i\n    end\n\n    components.values.map { |comp| comp.map { |node| \"(#{node})\" }.join(' - ') }.join(\"\\n\")\n  end\nend"
  },
  {
    "id": "data-structures:union-find",
    "title": "Union Find",
    "description": "Union Find template.",
    "keywords": [
      "data",
      "structures",
      "union",
      "find"
    ],
    "code": "class UnionFind\n  attr_accessor :root\n\n  def initialize(n)\n    @root = Array.new(n) { |i| i }\n  end\n\n  def find(a)\n    return a if a == @root[a]\n\n    @root[a] = find(@root[a])\n  end\n\n  def union(a, b)\n    @root[find(a)] = find(b)\n  end\n\n  def connected(a, b)\n    find(a) == find(b)\n  end\n\n  def to_s\n    n = @root.size\n    components = Hash.new { |h, k| h[k] = [] }\n\n    (0...n).each do |i|\n      root_i = find(i)\n      components[root_i] << i\n    end\n\n    components.values.map { |comp| comp.map { |node| \"(#{node})\" }.join(' - ') }.join(\"\\n\")\n  end\nend"
  },
  {
    "id": "sorting-algorithms:bogo-sort",
    "title": "Bogo Sort",
    "description": "Bogo Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "bogo",
      "sort"
    ],
    "code": "def bogo_sort(arr)\n  target = arr.sort\n\n  until arr == target\n    arr.shuffle!\n  end\nend"
  },
  {
    "id": "sorting-algorithms:bubble-sort",
    "title": "Bubble Sort",
    "description": "Bubble Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "bubble",
      "sort"
    ],
    "code": "def bubble_sort(arr)\n  n = arr.size\n\n  n.times do |i|\n    swapped = false\n\n    (0...(n - i - 1)).each do |j|\n      if arr[j] > arr[j + 1]\n        arr[j], arr[j + 1] = arr[j + 1], arr[j]\n        swapped = true\n      end\n    end\n\n    break unless swapped\n  end\nend"
  },
  {
    "id": "sorting-algorithms:bucket-sort",
    "title": "Bucket Sort",
    "description": "Bucket Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "bucket",
      "sort"
    ],
    "code": "def bucket_sort(arr)\n  num_buckets = 10\n  min_num     = arr.min\n  max_num     = arr.max\n  bucket_size = (max_num - min_num).to_f / num_buckets\n  buckets     = Array.new(num_buckets) { [] }\n\n  arr.each do |num|\n    index = [( (num - min_num) / bucket_size ).to_i, num_buckets - 1].min\n    buckets[index] << num\n  end\n\n  buckets.map { |bucket| bucket.sort }.flatten\nend"
  },
  {
    "id": "sorting-algorithms:counting-sort",
    "title": "Counting Sort",
    "description": "Counting Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "counting",
      "sort"
    ],
    "code": "def counting_sort(arr)\n  max_num     = arr.max\n  min_num     = arr.min\n  count_range = max_num - min_num + 1\n  count       = Array.new(count_range, 0)\n  output      = Array.new(arr.size, 0)\n\n  arr.each do |num|\n    count[num - min_num] += 1\n  end\n\n  (1...count_range).each do |i|\n    count[i] += count[i - 1]\n  end\n\n  arr.reverse_each do |num|\n    output[count[num - min_num] - 1] = num\n    count[num - min_num] -= 1\n  end\n\n  output\nend"
  },
  {
    "id": "sorting-algorithms:cube-sort",
    "title": "Cube Sort",
    "description": "Cube Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "cube",
      "sort"
    ],
    "code": "def cube_sort(arr, processors)\n  n             = arr.size\n  subarrays     = []\n  subarray_size = n / processors\n\n  (0...processors).each do |i|\n    subarray = arr[i * subarray_size, subarray_size]\n    subarrays << subarray\n  end\n\n  subarrays.each(&:sort!)\n\n  (0...(processors.bit_length - 1)).each do |dimension|\n    (0...processors).each do |i|\n      partner = i ^ (1 << dimension)\n      if i < partner\n        merged = subarrays[i] + subarrays[partner]\n      else\n        merged = subarrays[partner] + subarrays[i]\n      end\n      merged.sort!\n      subarrays[i] = merged[0...subarray_size]\n      subarrays[partner] = merged[subarray_size, subarray_size]\n    end\n  end\n\n  arr.replace(subarrays.flatten)\nend"
  },
  {
    "id": "sorting-algorithms:heap-sort",
    "title": "Heap Sort",
    "description": "Heap Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "heap",
      "sort"
    ],
    "code": "def heap_sort(arr)\n  n = arr.size\n\n  (n / 2 - 1).downto(0) do |i|\n    heapify(arr, n, i)\n  end\n\n  (n - 1).downto(1) do |i|\n    arr[i], arr[0] = arr[0], arr[i]\n    heapify(arr, i, 0)\n  end\n\n  arr\nend\n\ndef heapify(arr, n, i)\n  largest = i\n  left = 2 * i + 1\n  right = 2 * i + 2\n\n  largest = left if left < n && arr[left] > arr[largest]\n  largest = right if right < n && arr[right] > arr[largest]\n\n  if largest != i\n    arr[i], arr[largest] = arr[largest], arr[i]\n    heapify(arr, n, largest)\n  end\nend"
  },
  {
    "id": "sorting-algorithms:insertion-sort",
    "title": "Insertion Sort",
    "description": "Insertion Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "insertion",
      "sort"
    ],
    "code": "def insertion_sort(arr)\n  n = arr.size\n\n  (1...n).each do |i|\n    key = arr[i]\n    j = i - 1\n\n    while j >= 0 && key < arr[j]\n      arr[j + 1] = arr[j]\n      j -= 1\n    end\n\n    arr[j + 1] = key\n  end\nend"
  },
  {
    "id": "sorting-algorithms:merge-sort",
    "title": "Merge Sort",
    "description": "Merge Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "merge",
      "sort"
    ],
    "code": "def merge_sort(arr)\n  n = arr.size\n  return arr if n <= 1\n\n  mid   = n / 2\n  left  = merge_sort(arr[0...mid])\n  right = merge_sort(arr[mid..-1])\n\n  merge(left, right)\nend\n\ndef merge(left, right)\n  output = []\n\n  until left.empty? || right.empty?\n    if left.first <= right.first\n      output << left.shift\n    else\n      output << right.shift\n    end\n  end\n\n  output + left + right\nend"
  },
  {
    "id": "sorting-algorithms:pancake-sort",
    "title": "Pancake Sort",
    "description": "Pancake Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "pancake",
      "sort"
    ],
    "code": "def pancake_sort(arr)\n  n = arr.size\n\n  (2..n).to_a.reverse.each do |size|\n    max_idx = find_max_index(arr, size)\n\n    if max_idx != size - 1\n      flip(arr, max_idx)\n      flip(arr, size - 1)\n    end\n  end\nend\n\ndef flip(arr, i)\n  left = 0\n\n  while left < i\n    arr[left], arr[i] = arr[i], arr[left]\n    left += 1\n    i -= 1\n  end\nend\n\ndef find_max_index(arr, n)\n  max_idx = 0\n\n  n.times do |i|\n    max_idx = i if arr[i] > arr[max_idx]\n  end\n\n  max_idx\nend"
  },
  {
    "id": "sorting-algorithms:quick-sort",
    "title": "Quick Sort",
    "description": "Quick Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "quick",
      "sort"
    ],
    "code": "def quick_sort(arr)\n  n = arr.size\n  return arr if n <= 1\n\n  pivot = arr[n / 2]\n  left  = arr.select { |x| x < pivot }\n  right = arr.select { |x| x > pivot }\n\n  quick_sort(left) + [pivot] + quick_sort(right)\nend"
  },
  {
    "id": "sorting-algorithms:radix-sort",
    "title": "Radix Sort",
    "description": "Radix Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "radix",
      "sort"
    ],
    "code": "def radix_sort(arr)\n  max_val = arr.max\n  exp     = 1\n\n  while max_val / exp > 0\n    counting_sort(arr, exp)\n    exp *= 10\n  end\nend\n\ndef counting_sort(arr, exp)\n  n       = arr.size\n  output  = Array.new(n, 0)\n  count   = Array.new(10, 0)\n\n  n.times do |i|\n    idx = arr[i] / exp\n    count[idx % 10] += 1\n  end\n\n  (1...10).each do |i|\n    count[i] += count[i - 1]\n  end\n\n  (n - 1).downto(0) do |i|\n    idx = arr[i] / exp\n    output[count[idx % 10] - 1] = arr[i]\n    count[idx % 10] -= 1\n  end\n\n  n.times do |i|\n    arr[i] = output[i]\n  end\nend"
  },
  {
    "id": "sorting-algorithms:selection-sort",
    "title": "Selection Sort",
    "description": "Selection Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "selection",
      "sort"
    ],
    "code": "def selection_sort(arr)\n  n = arr.size\n\n  n.times do |i|\n    min_i = i\n\n    ((i + 1)...n).each do |j|\n      min_i = j if arr[j] < arr[min_i]\n    end\n\n    arr[i], arr[min_i] = arr[min_i], arr[i] if min_i != i\n  end\nend"
  },
  {
    "id": "sorting-algorithms:shell-sort",
    "title": "Shell Sort",
    "description": "Shell Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "shell",
      "sort"
    ],
    "code": "def shell_sort(arr)\n  n     = arr.size\n  gaps  = [701, 301, 132, 57, 23, 10, 4, 1]\n\n  gaps.each do |gap|\n    (gap...n).each do |i|\n      tmp = arr[i]\n      j = i\n\n      while j >= gap && arr[j - gap] > tmp\n        arr[j] = arr[j - gap]\n        j -= gap\n      end\n\n      arr[j] = tmp if j != i\n    end\n  end\nend"
  },
  {
    "id": "sorting-algorithms:sleep-sort",
    "title": "Sleep Sort",
    "description": "Sleep Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "sleep",
      "sort"
    ],
    "code": "def sleep_sort(arr)\n  sorted_arr  = []\n  threads     = []\n\n  arr.each do |num|\n    threads << Thread.new do\n      sleep(num / 1000.0)\n      sorted_arr << num\n    end\n  end\n\n  threads.each(&:join)\n  sorted_arr\nend"
  },
  {
    "id": "sorting-algorithms:tim-sort",
    "title": "Tim Sort",
    "description": "Tim Sort template.",
    "keywords": [
      "sorting",
      "algorithms",
      "tim",
      "sort"
    ],
    "code": "def tim_sort(arr)\n  n       = arr.size\n  min_run = 32\n\n  (0...n).step(min_run) do |start_idx|\n    end_idx = [start_idx + min_run - 1, n - 1].min\n    insertion_sort(arr, start_idx, end_idx)\n  end\n\n  size = min_run\n\n  while size < n\n    (0...n).step(2 * size) do |left|\n      mid = [left + size - 1, n - 1].min\n      right = [left + 2 * size - 1, n - 1].min\n      arr[left..right] = merge(arr[left..mid], arr[(mid + 1)..right])\n    end\n    size *= 2\n  end\n\n  arr\nend\n\ndef insertion_sort(arr, left, right)\n  (left + 1..right).each do |i|\n    key = arr[i]\n    j = i\n    while j > left && key < arr[j - 1]\n      arr[j] = arr[j - 1]\n      j -= 1\n    end\n    arr[j] = key\n  end\nend\n\ndef merge_sort(arr)\n  return arr if arr.size <= 1\n\n  mid = arr.size / 2\n  left = merge_sort(arr[0...mid])\n  right = merge_sort(arr[mid..-1])\n\n  merge(left, right)\nend\n\ndef merge(left, right)\n  output = []\n\n  until left.empty? || right.empty?\n    if left.first <= right.first\n      output << left.shift\n    else\n      output << right.shift\n    end\n  end\n\n  output + left + right\nend"
  },
  {
    "id": "recursion:frame",
    "title": "Recursion: Frame",
    "description": "Base case, pre-process, recurse, post-process, and combine.",
    "keywords": [
      "recursion",
      "recursive",
      "base",
      "case",
      "process",
      "recurse",
      "combine"
    ],
    "code": "def recurse(state)\n  # Return the base result when state is complete.\n  # Process this frame, recurse on a smaller state, then combine the result.\nend"
  },
  {
    "id": "recursion:backtracking",
    "title": "Recursion: Backtracking",
    "description": "Choose, recurse, and unchoose for exhaustive search.",
    "keywords": [
      "recursion",
      "recursive",
      "backtracking",
      "choose",
      "unchoose",
      "dfs"
    ],
    "code": "def backtrack(path, choices, result)\n  # Record a copy of path when complete.\n  choices.each do |choice|\n    path << choice\n    # Recurse with the remaining choices.\n    path.pop\n  end\n  result\nend"
  }
];
