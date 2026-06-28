import type { SeedKata } from "../types/editor";

const neetcodeGreedy: SeedKata[] = [
  {
    name: "Jump Game II",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `Given an array of non-negative integers nums where nums[i] represents the maximum jump length from index i, return the minimum number of jumps to reach the last index. You can assume you can always reach the last index.\n\nExample 1:\nInput: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.\n\nExample 2:\nInput: nums = [2,3,0,1,4]\nOutput: 2\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 1000\n- The answer is guaranteed to exist.\n\nRef: LeetCode #45 Jump Game II`,
    code: `def jump(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_jump_basic():
    assert jump([2,3,1,1,4]) == 2

def test_jump_skip_zero():
    assert jump([2,3,0,1,4]) == 2

def test_jump_single():
    assert jump([0]) == 0

def test_jump_two():
    assert jump([1,2]) == 1`,
    solution: `def jump(nums: list[int]) -> int:
    jumps = 0
    left = right = 0
    while right < len(nums) - 1:
        farthest = 0
        for i in range(left, right + 1):
            farthest = max(farthest, i + nums[i])
        left = right + 1
        right = farthest
        jumps += 1
    return jumps`,
    usage: null,
    tags: ["greedy", "dynamic-programming", "neetcode"],
  },
  {
    name: "Gas Station",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `There are n gas stations along a circular route. You are given two integer arrays gas and cost where gas[i] is the amount of gas at station i and cost[i] is the cost to travel from station i to the next.\n\nReturn the starting station index if you can travel around the circuit once in the clockwise direction. Otherwise, return -1. If a solution exists, it is guaranteed to be unique.\n\nExample 1:\nInput: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3\n\nExample 2:\nInput: gas = [2,3,4], cost = [3,4,3]\nOutput: -1\n\nConstraints:\n- n == gas.length == cost.length\n- 1 <= n <= 10^5\n- 0 <= gas[i], cost[i] <= 10^4\n\nRef: LeetCode #134 Gas Station`,
    code: `def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_gas_station_basic():
    assert can_complete_circuit([1,2,3,4,5], [3,4,5,1,2]) == 3

def test_gas_station_impossible():
    assert can_complete_circuit([2,3,4], [3,4,3]) == -1

def test_gas_station_single_valid():
    assert can_complete_circuit([5], [4]) == 0

def test_gas_station_single_invalid():
    assert can_complete_circuit([1], [2]) == -1`,
    solution: `def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    if sum(gas) < sum(cost):
        return -1
    tank = 0
    start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            tank = 0
            start = i + 1
    return start`,
    usage: null,
    tags: ["greedy", "neetcode"],
  },
  {
    name: "Hand of Straights",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.\n\nGiven an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return True if she can rearrange the cards, or False otherwise.\n\nExample 1:\nInput: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: True\nExplanation: Groups: [1,2,3], [2,3,4], [6,7,8]\n\nExample 2:\nInput: hand = [1,2,3,4,5], groupSize = 4\nOutput: False\n\nConstraints:\n- 1 <= hand.length <= 10^4\n- 0 <= hand[i] <= 10^9\n- 1 <= groupSize <= hand.length\n\nRef: LeetCode #846 Hand of Straights`,
    code: `def is_n_straight_hand(hand: list[int], group_size: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_hand_straights_valid():
    assert is_n_straight_hand([1,2,3,6,2,3,4,7,8], 3) == True

def test_hand_straights_invalid():
    assert is_n_straight_hand([1,2,3,4,5], 4) == False

def test_hand_straights_single_groups():
    assert is_n_straight_hand([1,2,3], 3) == True

def test_hand_straights_not_divisible():
    assert is_n_straight_hand([1,2,3,4], 3) == False`,
    solution: `def is_n_straight_hand(hand: list[int], group_size: int) -> bool:
    from collections import Counter
    if len(hand) % group_size != 0:
        return False
    count = Counter(hand)
    for card in sorted(count):
        if count[card] > 0:
            n = count[card]
            for i in range(group_size):
                if count[card + i] < n:
                    return False
                count[card + i] -= n
    return True`,
    usage: null,
    tags: ["greedy", "hash-map", "sorting", "neetcode"],
  },
  {
    name: "Merge Triplets to Form Target Triplet",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `A triplet is an array of three integers. You are given a 2D integer array triplets and an integer array target of three integers.\n\nYou may apply the following operation any number of times: choose two triplets and replace one with the element-wise maximum.\n\nReturn True if it is possible to obtain target as an element of triplets, or False otherwise. Only consider triplets where no element exceeds target[i].\n\nExample 1:\nInput: triplets = [[2,7,1],[8,1,3],[3,2,1]], target = [8,7,1]\nOutput: True\n\nExample 2:\nInput: triplets = [[1,3,4],[2,5,8]], target = [2,7,9]\nOutput: False\n\nConstraints:\n- 1 <= triplets.length <= 10^5\n- triplets[i].length == target.length == 3\n- 1 <= triplets[i][j], target[j] <= 1000\n\nRef: LeetCode #1899 Merge Triplets to Form Target Triplet`,
    code: `def merge_triplets(triplets: list[list[int]], target: list[int]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_merge_triplets_valid():
    assert merge_triplets([[2,7,1],[8,1,3],[3,2,1]], [8,7,1]) == True

def test_merge_triplets_invalid():
    assert merge_triplets([[1,3,4],[2,5,8]], [2,7,9]) == False

def test_merge_triplets_single_match():
    assert merge_triplets([[8,7,1]], [8,7,1]) == True

def test_merge_triplets_no_valid():
    assert merge_triplets([[3,4,5],[4,5,6]], [3,4,5]) == True`,
    solution: `def merge_triplets(triplets: list[list[int]], target: list[int]) -> bool:
    result = [0, 0, 0]
    for t in triplets:
        if t[0] <= target[0] and t[1] <= target[1] and t[2] <= target[2]:
            result = [max(result[i], t[i]) for i in range(3)]
    return result == target`,
    usage: null,
    tags: ["greedy", "neetcode"],
  },
  {
    name: "Partition Labels",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nReturn a list of integers representing the size of these parts.\n\nExample 1:\nInput: s = "ababcbacadefegdehijhklij"\nOutput: [9,7,8]\nExplanation: Partitions are "ababcbaca", "defegde", "hijhklij".\n\nExample 2:\nInput: s = "eccbbbbdec"\nOutput: [10]\n\nConstraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters.\n\nRef: LeetCode #763 Partition Labels`,
    code: `def partition_labels(s: str) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_partition_labels_basic():
    assert partition_labels("ababcbacadefegdehijhklij") == [9,7,8]

def test_partition_labels_single():
    assert partition_labels("eccbbbbdec") == [10]

def test_partition_labels_all_unique():
    assert partition_labels("abc") == [1,1,1]

def test_partition_labels_one_char():
    assert partition_labels("a") == [1]`,
    solution: `def partition_labels(s: str) -> list[int]:
    last = {c: i for i, c in enumerate(s)}
    result = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result`,
    usage: null,
    tags: ["greedy", "hash-map", "two-pointers", "neetcode"],
  },
  {
    name: "Valid Parenthesis String",
    category: "greedy",
    language: "python",
    difficulty: "medium",
    description: `Given a string s containing only '(', ')' and '*', return True if s is valid.\n\nThe following rules define a valid string:\n- Any left parenthesis '(' must have a corresponding right parenthesis ')'.\n- Any right parenthesis ')' must have a corresponding left parenthesis '('.\n- Left parenthesis '(' must go before the corresponding right parenthesis ')'.\n- '*' could be treated as a single right parenthesis ')' or a single left parenthesis '(' or an empty string "".\n\nExample 1:\nInput: s = "(*))"\nOutput: True\n\nExample 2:\nInput: s = "(*)"\nOutput: True\n\nConstraints:\n- 1 <= s.length <= 100\n- s[i] is '(', ')' or '*'.\n\nRef: LeetCode #678 Valid Parenthesis String`,
    code: `def check_valid_string(s: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_valid_paren_star_basic():
    assert check_valid_string("(*))") == True

def test_valid_paren_star_simple():
    assert check_valid_string("(*)") == True

def test_valid_paren_star_open():
    assert check_valid_string("(*()") == True

def test_valid_paren_star_only():
    assert check_valid_string("(*") == True

def test_valid_paren_star_invalid():
    assert check_valid_string(")") == False`,
    solution: `def check_valid_string(s: str) -> bool:
    low = high = 0
    for c in s:
        if c == '(':
            low += 1
            high += 1
        elif c == ')':
            low -= 1
            high -= 1
        else:
            low -= 1
            high += 1
        if high < 0:
            return False
        low = max(low, 0)
    return low == 0`,
    usage: null,
    tags: ["greedy", "stack", "dynamic-programming", "neetcode"],
  },
  {
    name: "Minimum Interval to Include Each Query",
    category: "intervals",
    language: "python",
    difficulty: "hard",
    description: `You are given a 2D integer array intervals where intervals[i] = [left, right] and an integer array queries.\n\nFor each query, find the minimum size of any interval that contains query. The size of an interval is right - left + 1. If no interval contains query, return -1 for that query.\n\nReturn an integer array containing the answers to the queries in the same order.\n\nExample 1:\nInput: intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]\nOutput: [3,3,1,4]\n\nExample 2:\nInput: intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,22]\nOutput: [2,-1,6]\n\nConstraints:\n- 1 <= intervals.length <= 10^5\n- 1 <= left <= right <= 10^7\n- 1 <= queries.length <= 10^5\n- 1 <= queries[i] <= 10^7\n\nRef: LeetCode #1851 Minimum Interval to Include Each Query`,
    code: `def min_interval(intervals: list[list[int]], queries: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_min_interval_basic():
    assert min_interval([[1,4],[2,4],[3,6],[4,4]], [2,3,4,5]) == [3,3,1,4]

def test_min_interval_no_match():
    assert min_interval([[2,3],[2,5],[1,8],[20,25]], [2,19,22]) == [2,-1,6]

def test_min_interval_single():
    assert min_interval([[1,10]], [5]) == [10]

def test_min_interval_exact():
    assert min_interval([[3,3]], [3]) == [1]`,
    solution: `def min_interval(intervals: list[list[int]], queries: list[int]) -> list[int]:
    import heapq
    intervals.sort()
    min_heap = []
    res = {}
    i = 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(min_heap, (r - l + 1, r))
            i += 1
        while min_heap and min_heap[0][1] < q:
            heapq.heappop(min_heap)
        res[q] = min_heap[0][0] if min_heap else -1
    return [res[q] for q in queries]`,
    usage: null,
    tags: ["intervals", "heap", "sorting", "neetcode"],
  },
];

export { neetcodeGreedy };
