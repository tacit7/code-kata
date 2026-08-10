import type { SeedKata } from "../types/editor";

const dpFoundationEntries: SeedKata[] = [
  {
    name: "Sum from 1 to n",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given n, return the sum of all integers from 1 through n.\n\nExample:\nInput: n = 5\nOutput: 15\nExplanation: 1 + 2 + 3 + 4 + 5 = 15\n\nDP framing:\n- State: dp[i] = sum of the integers from 1 through i\n- Transition: dp[i] = dp[i - 1] + i\n- Base case: dp[0] = 0\n\nThis kata isolates the simplest DP shape: previous answer plus current contribution.`,
    code: `def sum_from_1_to_n(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_sum_zero():
    assert sum_from_1_to_n(0) == 0

def test_sum_one():
    assert sum_from_1_to_n(1) == 1

def test_sum_five():
    assert sum_from_1_to_n(5) == 15

def test_sum_hundred():
    assert sum_from_1_to_n(100) == 5050`,
    solution: `def sum_from_1_to_n(n: int) -> int:
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + i
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "pre-leetcode"],
  },
  {
    name: "Running Total",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given an array, return an array where each position contains the sum of all values up through that position.\n\nExample:\nInput: nums = [3, 1, 4, 2]\nOutput: [3, 4, 8, 10]\n\nDP framing:\n- State: dp[i] = sum of nums[0..i]\n- Transition: dp[i] = dp[i - 1] + nums[i]\n- Base case: dp[0] = nums[0]\n\nThis is prefix-sum preparation for understanding state meaning, dependency direction, and left-to-right evaluation.`,
    code: `def running_total(nums: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_running_total_empty():
    assert running_total([]) == []

def test_running_total_basic():
    assert running_total([3, 1, 4, 2]) == [3, 4, 8, 10]

def test_running_total_with_negatives():
    assert running_total([-2, 5, -1]) == [-2, 3, 2]

def test_running_total_single():
    assert running_total([7]) == [7]`,
    solution: `def running_total(nums: list[int]) -> list[int]:
    if not nums:
        return []
    dp = [0] * len(nums)
    dp[0] = nums[0]
    for i in range(1, len(nums)):
        dp[i] = dp[i - 1] + nums[i]
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "prefix-sum", "pre-leetcode"],
  },
  {
    name: "Double-or-Add Sequence",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `You are given a sequence where the first value is 1. Each next value is created by doubling the previous value, then adding 1.\n\nThe sequence uses zero-based indexing:\n- index 0 → 1\n- index 1 → 3\n- index 2 → 7\n- index 3 → 15\n\nWrite double_or_add(n) to return the value at index n.\n\nExample 1:\nInput: n = 0\nOutput: 1\n\nExample 2:\nInput: n = 4\nOutput: 31\nExplanation: the first five values are [1, 3, 7, 15, 31].\n\nDP framing:\n- State: dp[i] = the sequence value at index i\n- Transition: dp[i] = 2 * dp[i - 1] + 1\n- Base case: dp[0] = 1\n\nThis kata isolates a one-previous-state recurrence: define the base value, then repeatedly apply the same transition.`,
    code: `def double_or_add(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_double_or_add_zero():
    assert double_or_add(0) == 1

def test_double_or_add_one():
    assert double_or_add(1) == 3

def test_double_or_add_four():
    assert double_or_add(4) == 31

def test_double_or_add_eight():
    assert double_or_add(8) == 511`,
    solution: `def double_or_add(n: int) -> int:
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = 2 * dp[i - 1] + 1
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "pre-leetcode"],
  },
  {
    name: "Two-Step Number Sequence",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `The first two values are 2 and 3. Every later value is the sum of the previous two. Return the value at index n.\n\nExample sequence:\n2, 3, 5, 8, 13, 21\n\nDP framing:\n- State: dp[i] = value at index i\n- Transition: dp[i] = dp[i - 1] + dp[i - 2]\n- Base cases: dp[0] = 2, dp[1] = 3\n\nThis teaches the Fibonacci-shaped recurrence without starting with Fibonacci itself.`,
    code: `def two_step_sequence(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_two_step_zero():
    assert two_step_sequence(0) == 2

def test_two_step_one():
    assert two_step_sequence(1) == 3

def test_two_step_two():
    assert two_step_sequence(2) == 5

def test_two_step_five():
    assert two_step_sequence(5) == 21

def test_two_step_eight():
    assert two_step_sequence(8) == 89`,
    solution: `def two_step_sequence(n: int) -> int:
    if n == 0:
        return 2
    dp = [0] * (n + 1)
    dp[0] = 2
    dp[1] = 3
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "pre-leetcode"],
  },
  {
    name: "Move Through a Hallway",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `You are at position 0 in a hallway. Each move advances either one or two positions. Return the number of ways to reach position n.\n\nDP framing:\n- State: dp[i] = number of ways to reach position i\n- Transition: dp[i] = dp[i - 1] + dp[i - 2]\n- Base cases: dp[0] = 1, dp[1] = 1\n\nThe key question is: from which positions could the final move have come?`,
    code: `def hallway_ways(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_hallway_zero():
    assert hallway_ways(0) == 1

def test_hallway_one():
    assert hallway_ways(1) == 1

def test_hallway_two():
    assert hallway_ways(2) == 2

def test_hallway_four():
    assert hallway_ways(4) == 5

def test_hallway_six():
    assert hallway_ways(6) == 13`,
    solution: `def hallway_ways(n: int) -> int:
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-counting", "pre-leetcode"],
  },
  {
    name: "Build a Strip With Tiles",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `How many ways can you cover a strip of length n using tiles of length 1 and 2?\n\nExample:\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, and 2+1.\n\nDP framing:\n- State: dp[i] = number of ways to tile a strip of length i\n- Transition: dp[i] = dp[i - 1] + dp[i - 2]\n- Base cases: dp[0] = 1, dp[1] = 1\n\nDifferent story, same recurrence as the hallway problem. The recurrence structure matters more than the nouns in the prompt.`,
    code: `def tile_strip(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_tile_strip_zero():
    assert tile_strip(0) == 1

def test_tile_strip_one():
    assert tile_strip(1) == 1

def test_tile_strip_three():
    assert tile_strip(3) == 3

def test_tile_strip_five():
    assert tile_strip(5) == 8`,
    solution: `def tile_strip(n: int) -> int:
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-counting", "pre-leetcode"],
  },
  {
    name: "Reach Target With 1, 2, or 3",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Starting from 0, you may add 1, 2, or 3. Return the number of ordered sequences that reach exactly n.\n\nExample:\nInput: n = 3\nOutput: 4\nExplanation: 1+1+1, 1+2, 2+1, and 3.\n\nDP framing:\n- State: dp[i] = number of ordered ways to reach i\n- Transition: dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3]\n- Base case: dp[0] = 1, with dp[i] = 0 when i < 0\n\nThis extends the same counting idea from two previous states to three.`,
    code: `def reach_target_123(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_reach_target_zero():
    assert reach_target_123(0) == 1

def test_reach_target_one():
    assert reach_target_123(1) == 1

def test_reach_target_three():
    assert reach_target_123(3) == 4

def test_reach_target_four():
    assert reach_target_123(4) == 7

def test_reach_target_five():
    assert reach_target_123(5) == 13`,
    solution: `def reach_target_123(n: int) -> int:
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i - 1]
        if i >= 2:
            dp[i] += dp[i - 2]
        if i >= 3:
            dp[i] += dp[i - 3]
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-counting", "pre-leetcode"],
  },
  {
    name: "Cheapest Walk Across Stones",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Each stone has a cost. You begin before the first stone and may move one or two stones at a time. Return the minimum total cost required to land on the final stone.\n\nExample:\nInput: costs = [4, 2, 7, 1]\nOutput: 3\nExplanation: land on stone 1, then stone 3: 2 + 1.\n\nDP framing:\n- State: dp[i] = minimum cost required to land on stone i\n- Transition: dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])\n- Base cases: dp[0] = costs[0], dp[1] = costs[1]\n\nThis is a cleaner predecessor to Min Cost Climbing Stairs.`,
    code: `def cheapest_stone_walk(costs: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_cheapest_stone_walk_basic():
    assert cheapest_stone_walk([4, 2, 7, 1]) == 3

def test_cheapest_stone_walk_single():
    assert cheapest_stone_walk([5]) == 5

def test_cheapest_stone_walk_prefers_two_step():
    assert cheapest_stone_walk([10, 1, 10, 1, 10]) == 12

def test_cheapest_stone_walk_empty():
    assert cheapest_stone_walk([]) == 0`,
    solution: `def cheapest_stone_walk(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    dp = [0] * len(costs)
    dp[0] = costs[0]
    dp[1] = costs[1]
    for i in range(2, len(costs)):
        dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost", "pre-leetcode"],
  },
  {
    name: "Maximum Points Without Adjacent Cards",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given cards arranged in a row, each containing points, choose cards with the maximum total. You may not choose adjacent cards.\n\nExample:\nInput: cards = [3, 8, 4, 6]\nOutput: 14\nExplanation: choose 8 and 6.\n\nDP framing:\n- State: dp[i] = maximum points obtainable from cards 0 through i\n- Transition: dp[i] = max(dp[i - 1], cards[i] + dp[i - 2])\n- Base cases: dp[0] = cards[0], dp[1] = max(cards[0], cards[1])\n\nThis teaches House Robber as a general take-or-skip recurrence before the burglary story.`,
    code: `def max_non_adjacent_card_points(cards: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_max_non_adjacent_basic():
    assert max_non_adjacent_card_points([3, 8, 4, 6]) == 14

def test_max_non_adjacent_single():
    assert max_non_adjacent_card_points([7]) == 7

def test_max_non_adjacent_empty():
    assert max_non_adjacent_card_points([]) == 0

def test_max_non_adjacent_skip_middle():
    assert max_non_adjacent_card_points([5, 1, 1, 5]) == 10`,
    solution: `def max_non_adjacent_card_points(cards: list[int]) -> int:
    if not cards:
        return 0
    if len(cards) == 1:
        return cards[0]
    dp = [0] * len(cards)
    dp[0] = cards[0]
    dp[1] = max(cards[0], cards[1])
    for i in range(2, len(cards)):
        dp[i] = max(dp[i - 1], cards[i] + dp[i - 2])
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-decision", "pre-leetcode"],
  },
  {
    name: "Maximum Points With a One-Position Cooldown",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Each day offers some points. If you collect points on day i, you must skip day i + 1. Return the maximum points possible.\n\nDP framing:\n- State: dp[i] = maximum points obtainable through day i\n- Transition: dp[i] = max(dp[i - 1], points[i] + dp[i - 2])\n- Base cases: dp[0] = points[0], dp[1] = max(points[0], points[1])\n\nThis shows that different stories can produce the same take-or-skip recurrence.`,
    code: `def max_points_with_cooldown(points: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_cooldown_basic():
    assert max_points_with_cooldown([3, 8, 4, 6]) == 14

def test_cooldown_allows_non_adjacent():
    assert max_points_with_cooldown([2, 7, 9, 3, 1]) == 12

def test_cooldown_single():
    assert max_points_with_cooldown([9]) == 9

def test_cooldown_empty():
    assert max_points_with_cooldown([]) == 0`,
    solution: `def max_points_with_cooldown(points: list[int]) -> int:
    if not points:
        return 0
    if len(points) == 1:
        return points[0]
    dp = [0] * len(points)
    dp[0] = points[0]
    dp[1] = max(points[0], points[1])
    for i in range(2, len(points)):
        dp[i] = max(dp[i - 1], points[i] + dp[i - 2])
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-decision", "pre-leetcode"],
  },
  {
    name: "Cheapest Route Through Checkpoints",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `You must reach the final checkpoint. From a checkpoint, you may move forward one or two checkpoints. Each checkpoint has an entry cost. Return the cheapest route cost.\n\nDP framing:\n- State: dp[i] = cheapest total cost to reach checkpoint i\n- Transition: dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])\n- Base cases: dp[0] = costs[0], dp[1] = costs[1]\n\nThis reinforces value-only optimization before adding optional route reconstruction.`,
    code: `def cheapest_checkpoint_route(costs: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_checkpoint_route_basic():
    assert cheapest_checkpoint_route([4, 2, 7, 1]) == 3

def test_checkpoint_route_single():
    assert cheapest_checkpoint_route([6]) == 6

def test_checkpoint_route_zigzag():
    assert cheapest_checkpoint_route([1, 100, 1, 1, 1]) == 3

def test_checkpoint_route_empty():
    assert cheapest_checkpoint_route([]) == 0`,
    solution: `def cheapest_checkpoint_route(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    dp = [0] * len(costs)
    dp[0] = costs[0]
    dp[1] = costs[1]
    for i in range(2, len(costs)):
        dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost", "pre-leetcode"],
  },
  {
    name: "Can the End Be Reached?",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given an array where allowed[i] says whether position i may be used, determine whether the last position can be reached by moving one or two positions at a time.\n\nExample:\nInput: allowed = [True, True, False, True]\nOutput: True\n\nDP framing:\n- State: dp[i] = whether position i is reachable\n- Transition: dp[i] = allowed[i] and (dp[i - 1] or dp[i - 2])\n- Base case: dp[0] = allowed[0]\n\nThis introduces boolean DP: counting uses addition, optimization uses min/max, feasibility uses or.`,
    code: `def can_reach_end(allowed: list[bool]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_can_reach_end_basic():
    assert can_reach_end([True, True, False, True]) is True

def test_can_reach_end_blocked_start():
    assert can_reach_end([False, True]) is False

def test_can_reach_end_unreachable():
    assert can_reach_end([True, False, False, True]) is False

def test_can_reach_end_empty():
    assert can_reach_end([]) is False`,
    solution: `def can_reach_end(allowed: list[bool]) -> bool:
    if not allowed:
        return False
    dp = [False] * len(allowed)
    dp[0] = allowed[0]
    for i in range(1, len(allowed)):
        from_one = dp[i - 1]
        from_two = dp[i - 2] if i >= 2 else False
        dp[i] = allowed[i] and (from_one or from_two)
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-feasibility", "pre-leetcode"],
  },
  {
    name: "Segment a Number String",
    category: "strings",
    language: "python",
    difficulty: "easy",
    description: `Given a string of digits and a list of allowed chunks, determine whether the full string can be divided into allowed chunks.\n\nExample:\nInput: s = "1234", allowed = ["1", "12", "34"]\nOutput: True\nExplanation: "12" + "34"\n\nDP framing:\n- State: dp[i] = whether the prefix of length i can be segmented\n- Transition: dp[i] is true if some allowed chunk ends at i and the preceding prefix is valid\n- Base case: dp[0] = True\n\nThis is a gentler predecessor to Word Break.`,
    code: `def segment_number_string(s: str, allowed: list[str]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_segment_number_string_basic():
    assert segment_number_string("1234", ["1", "12", "34"]) is True

def test_segment_number_string_false():
    assert segment_number_string("1234", ["12", "3"]) is False

def test_segment_number_string_empty():
    assert segment_number_string("", ["1"]) is True

def test_segment_number_string_reuses_chunks():
    assert segment_number_string("111", ["1", "11"]) is True`,
    solution: `def segment_number_string(s: str, allowed: list[str]) -> bool:
    chunks = set(allowed)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for chunk in chunks:
            start = i - len(chunk)
            if start >= 0 and dp[start] and s[start:i] == chunk:
                dp[i] = True
                break
    return dp[len(s)]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "string-dp", "pre-leetcode"],
  },
  {
    name: "Longest Increasing Run",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Find the length of the longest contiguous strictly increasing run.\n\nExample:\nInput: nums = [1, 2, 5, 3, 4]\nOutput: 3\nExplanation: [1, 2, 5]\n\nDP framing:\n- State: dp[i] = length of the increasing run ending exactly at i\n- Transition: if nums[i] > nums[i - 1], dp[i] = dp[i - 1] + 1; otherwise dp[i] = 1\n- Final answer: max(dp)\n\nThis prepares learners for the phrase ending exactly at i before Longest Increasing Subsequence.`,
    code: `def longest_increasing_run(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_longest_increasing_run_basic():
    assert longest_increasing_run([1, 2, 5, 3, 4]) == 3

def test_longest_increasing_run_descending():
    assert longest_increasing_run([5, 4, 3]) == 1

def test_longest_increasing_run_empty():
    assert longest_increasing_run([]) == 0

def test_longest_increasing_run_late_best():
    assert longest_increasing_run([3, 1, 2, 3, 4]) == 4`,
    solution: `def longest_increasing_run(nums: list[int]) -> int:
    if not nums:
        return 0
    dp = [1] * len(nums)
    best = 1
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            dp[i] = dp[i - 1] + 1
        best = max(best, dp[i])
    return best`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "pre-leetcode"],
  },
  {
    name: "Longest Repeated-Character Run",
    category: "strings",
    language: "python",
    difficulty: "easy",
    description: `Given a string, find the length of the longest contiguous run of one repeated character.\n\nExample:\nInput: s = "abbbaacc"\nOutput: 3\nExplanation: "bbb"\n\nDP framing:\n- State: dp[i] = length of the repeated-character run ending at i\n- Transition: if s[i] == s[i - 1], dp[i] = dp[i - 1] + 1; otherwise dp[i] = 1\n- Final answer: max(dp)\n\nThis isolates the phrase ending at index i without nested loops or subsequences.`,
    code: `def longest_repeated_character_run(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_repeated_character_run_basic():
    assert longest_repeated_character_run("abbbaacc") == 3

def test_repeated_character_run_empty():
    assert longest_repeated_character_run("") == 0

def test_repeated_character_run_single():
    assert longest_repeated_character_run("a") == 1

def test_repeated_character_run_all_same():
    assert longest_repeated_character_run("aaaa") == 4`,
    solution: `def longest_repeated_character_run(s: str) -> int:
    if not s:
        return 0
    dp = [1] * len(s)
    best = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            dp[i] = dp[i - 1] + 1
        best = max(best, dp[i])
    return best`,
    usage: null,
    tags: ["dynamic-programming", "dp", "string-dp", "pre-leetcode"],
  },
  {
    name: "Maximum Contiguous Sum Ending at Each Position",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `For every index, compute the maximum sum of a contiguous subarray ending exactly at that index.\n\nExample:\nInput: nums = [3, -5, 4, 2]\nOutput: [3, -2, 4, 6]\n\nDP framing:\n- State: dp[i] = maximum contiguous sum ending exactly at i\n- Transition: dp[i] = max(nums[i], nums[i] + dp[i - 1])\n\nThis is the teaching form of Kadane's algorithm: continue the previous sequence or start a new one here.`,
    code: `def max_contiguous_sum_endings(nums: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_max_contiguous_sum_endings_basic():
    assert max_contiguous_sum_endings([3, -5, 4, 2]) == [3, -2, 4, 6]

def test_max_contiguous_sum_endings_all_negative():
    assert max_contiguous_sum_endings([-3, -2, -5]) == [-3, -2, -5]

def test_max_contiguous_sum_endings_empty():
    assert max_contiguous_sum_endings([]) == []

def test_max_contiguous_sum_endings_restart():
    assert max_contiguous_sum_endings([5, -10, 6, 1]) == [5, -5, 6, 7]`,
    solution: `def max_contiguous_sum_endings(nums: list[int]) -> list[int]:
    if not nums:
        return []
    dp = [0] * len(nums)
    dp[0] = nums[0]
    for i in range(1, len(nums)):
        dp[i] = max(nums[i], nums[i] + dp[i - 1])
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "pre-leetcode"],
  },
  {
    name: "Fibonacci Number",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `The Fibonacci sequence starts 0, 1 and each later term is the sum of the two before it. Given n, return the n-th Fibonacci number.\n\nExample:\nInput: n = 4\nOutput: 3\n\nConstraints:\n- 0 <= n <= 30\n\nRef: LeetCode #509`,
    code: `def fib(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_fib_zero():
    assert fib(0) == 0

def test_fib_one():
    assert fib(1) == 1

def test_fib_two():
    assert fib(2) == 1

def test_fib_ten():
    assert fib(10) == 55

def test_fib_twenty():
    assert fib(20) == 6765`,
    solution: `def fib(n: int) -> int:
    if n < 2:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "recursion"],
  },
  {
    name: "N-th Tribonacci Number",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `The Tribonacci sequence starts 0, 1, 1 and each later term is the sum of the three before it. Given n, return the n-th Tribonacci number.\n\nExample:\nInput: n = 4\nOutput: 4\n\nConstraints:\n- 0 <= n <= 37\n\nRef: LeetCode #1137`,
    code: `def tribonacci(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_tribonacci_zero():
    assert tribonacci(0) == 0

def test_tribonacci_three():
    assert tribonacci(3) == 2

def test_tribonacci_four():
    assert tribonacci(4) == 4

def test_tribonacci_twenty_five():
    assert tribonacci(25) == 1389537`,
    solution: `def tribonacci(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    a, b, c = 0, 1, 1
    for _ in range(3, n + 1):
        a, b, c = b, c, a + b + c
    return c`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-basic", "recursion"],
  },
  {
    name: "Delete and Earn",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums, you can pick any nums[i], earning nums[i] points, but that operation deletes every element equal to nums[i] - 1 and nums[i] + 1 from the array. Return the maximum points you can earn.\n\nExample:\nInput: nums = [3,4,2]\nOutput: 6\n\nConstraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 10^4\n\nRef: LeetCode #740`,
    code: `def delete_and_earn(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_delete_and_earn_basic():
    assert delete_and_earn([3, 4, 2]) == 6

def test_delete_and_earn_repeats():
    assert delete_and_earn([2, 2, 3, 3, 3, 4]) == 9

def test_delete_and_earn_single():
    assert delete_and_earn([1]) == 1`,
    solution: `def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    max_val = max(nums)
    points = [0] * (max_val + 1)
    for num in nums:
        points[num] += num
    prev2, prev1 = 0, 0
    for i in range(max_val + 1):
        curr = max(prev1, prev2 + points[i])
        prev2, prev1 = prev1, curr
    return prev1`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-decision"],
  },
  {
    name: "Fill One Grid State",
    category: "2-d-dp",
    language: "python",
    difficulty: "easy",
    description: `You are filling one cell in a Grid DP table for a path-counting problem.\n\nYou can only move down or right through the grid. That means any path that reaches the current cell must come from exactly one of two places:\n- the cell directly above it\n- the cell directly to its left\n\nGiven those two already-computed values, return the value for the current cell.\n\nExample:\nInput: top = 1, left = 2\nOutput: 3\nExplanation: 1 path can enter from above and 2 paths can enter from the left, so this cell has 1 + 2 = 3 paths total.\n\nDP framing:\n- State: dp[row][col] = number of paths that reach this cell\n- Transition: dp[row][col] = dp[row - 1][col] + dp[row][col - 1]\n- This kata practices one Grid DP cell update before you build the full table.`,
    code: `def fill_one_grid_state(top: int, left: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_fill_one_grid_state_basic():
    assert fill_one_grid_state(1, 2) == 3

def test_fill_one_grid_state_equal():
    assert fill_one_grid_state(3, 3) == 6

def test_fill_one_grid_state_zero_top():
    assert fill_one_grid_state(0, 4) == 4

def test_fill_one_grid_state_zero_left():
    assert fill_one_grid_state(5, 0) == 5`,
    solution: `def fill_one_grid_state(top: int, left: int) -> int:
    return top + left`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid", "pre-leetcode"],
  },
  {
    name: "Build a Path-Count Table",
    category: "2-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given rows and cols, return the complete DP table for counting paths from the top-left cell to every cell. You can only move down or right.\n\nExample:\nInput: rows = 3, cols = 4\nOutput:\n[\n  [1, 1, 1, 1],\n  [1, 2, 3, 4],\n  [1, 3, 6, 10]\n]\n\nDP framing:\n- State: dp[row][col] = number of paths from top-left to this cell\n- First row and first column are all 1\n- Transition: dp[row][col] = dp[row - 1][col] + dp[row][col - 1]\n\nThis comes right before Unique Paths so you can see every intermediate state instead of only the final answer.`,
    code: `def build_path_count_table(rows: int, cols: int) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_path_count_table_three_by_four():
    assert build_path_count_table(3, 4) == [
        [1, 1, 1, 1],
        [1, 2, 3, 4],
        [1, 3, 6, 10],
    ]

def test_path_count_table_two_by_three():
    assert build_path_count_table(2, 3) == [[1, 1, 1], [1, 2, 3]]

def test_path_count_table_single_row():
    assert build_path_count_table(1, 4) == [[1, 1, 1, 1]]

def test_path_count_table_single_col():
    assert build_path_count_table(4, 1) == [[1], [1], [1], [1]]`,
    solution: `def build_path_count_table(rows: int, cols: int) -> list[list[int]]:
    dp = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid", "pre-leetcode"],
  },
  {
    name: "Build a Blocked-Cell Path Table",
    category: "2-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a grid of booleans where True means blocked and False means open, return the complete path-count DP table. A blocked cell has 0 paths, and paths cannot flow through it.\n\nExample:\nInput:\n[\n  [False, False, False],\n  [False, True,  False],\n  [False, False, False],\n]\nOutput:\n[\n  [1, 1, 1],\n  [1, 0, 1],\n  [1, 1, 2],\n]\n\nDP framing:\n- State: dp[row][col] = number of valid paths to this cell\n- If blocked[row][col] is True, dp[row][col] = 0\n- Otherwise, dp[row][col] = top + left\n\nThis prepares for Unique Paths II by showing how obstacles zero out states.`,
    code: `def build_blocked_path_table(blocked: list[list[bool]]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_blocked_path_table_center_blocked():
    assert build_blocked_path_table([
        [False, False, False],
        [False, True, False],
        [False, False, False],
    ]) == [[1, 1, 1], [1, 0, 1], [1, 1, 2]]

def test_blocked_path_table_start_blocked():
    assert build_blocked_path_table([[True, False]]) == [[0, 0]]

def test_blocked_path_table_first_row_blocked():
    assert build_blocked_path_table([[False, True, False]]) == [[1, 0, 0]]

def test_blocked_path_table_no_blocks():
    assert build_blocked_path_table([[False, False], [False, False]]) == [[1, 1], [1, 2]]`,
    solution: `def build_blocked_path_table(blocked: list[list[bool]]) -> list[list[int]]:
    rows, cols = len(blocked), len(blocked[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if blocked[r][c]:
                dp[r][c] = 0
            elif r == 0 and c == 0:
                dp[r][c] = 1
            else:
                top = dp[r - 1][c] if r > 0 else 0
                left = dp[r][c - 1] if c > 0 else 0
                dp[r][c] = top + left
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid", "pre-leetcode"],
  },
  {
    name: "Build a Minimum-Cost Table",
    category: "2-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a grid of non-negative costs, return the complete DP table where each cell contains the minimum cost to reach that cell from the top-left. You can only move down or right.\n\nExample:\nInput:\n[\n  [1, 3, 1],\n  [1, 5, 1],\n]\nOutput:\n[\n  [1, 4, 5],\n  [2, 7, 6],\n]\n\nDP framing:\n- State: dp[row][col] = minimum cost to reach this cell\n- Transition: dp[row][col] = grid[row][col] + min(top, left)\n\nThis prepares for Minimum Path Sum by exposing the intermediate states.`,
    code: `def build_min_cost_table(grid: list[list[int]]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_min_cost_table_basic():
    assert build_min_cost_table([[1, 3, 1], [1, 5, 1]]) == [[1, 4, 5], [2, 7, 6]]

def test_min_cost_table_three_by_three():
    assert build_min_cost_table([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == [[1, 4, 5], [2, 7, 6], [6, 8, 7]]

def test_min_cost_table_single_cell():
    assert build_min_cost_table([[5]]) == [[5]]

def test_min_cost_table_single_row():
    assert build_min_cost_table([[1, 2, 3]]) == [[1, 3, 6]]`,
    solution: `def build_min_cost_table(grid: list[list[int]]) -> list[list[int]]:
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            else:
                top = dp[r - 1][c] if r > 0 else float("inf")
                left = dp[r][c - 1] if c > 0 else float("inf")
                dp[r][c] = grid[r][c] + min(top, left)
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid", "pre-leetcode"],
  },
  {
    name: "Minimum Path Sum",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n grid filled with non-negative numbers, find a path from top-left to bottom-right which minimizes the sum of numbers along the path. You can only move down or right.\n\nExample:\nInput: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7\n\nConstraints:\n- m == grid.length\n- n == grid[i].length\n- 1 <= m, n <= 200\n- 0 <= grid[i][j] <= 200\n\nRef: LeetCode #64`,
    code: `def min_path_sum(grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_min_path_sum_basic():
    assert min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7

def test_min_path_sum_two_rows():
    assert min_path_sum([[1, 2, 3], [4, 5, 6]]) == 12

def test_min_path_sum_single_cell():
    assert min_path_sum([[5]]) == 5`,
    solution: `def min_path_sum(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp[m - 1][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost", "grid"],
  },
  {
    name: "Perfect Squares",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given an integer n, return the fewest number of perfect square numbers (1, 4, 9, 16, ...) that sum to n.\n\nExample:\nInput: n = 12\nOutput: 3  (4 + 4 + 4)\n\nConstraints:\n- 1 <= n <= 10^4\n\nRef: LeetCode #279`,
    code: `def num_squares(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_num_squares_basic():
    assert num_squares(12) == 3

def test_num_squares_perfect_square():
    assert num_squares(13) == 2

def test_num_squares_one():
    assert num_squares(1) == 1

def test_num_squares_larger():
    assert num_squares(43) == 3`,
    solution: `def num_squares(n: int) -> int:
    dp = [float("inf")] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        j = 1
        while j * j <= i:
            dp[i] = min(dp[i], dp[i - j * j] + 1)
            j += 1
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost"],
  },
  {
    name: "Maximum Length of Repeated Subarray",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given two integer arrays nums1 and nums2, return the length of the longest common contiguous subarray (a run of equal elements at matching relative positions in both arrays).\n\nExample:\nInput: nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]\nOutput: 3  ([3,2,1])\n\nConstraints:\n- 1 <= nums1.length, nums2.length <= 1000\n- 0 <= nums1[i], nums2[i] <= 100\n\nRef: LeetCode #718`,
    code: `def find_length(nums1: list[int], nums2: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_find_length_basic():
    assert find_length([1, 2, 3, 2, 1], [3, 2, 1, 4, 7]) == 3

def test_find_length_full_match():
    assert find_length([0, 0, 0, 0, 0], [0, 0, 0, 0, 0]) == 5

def test_find_length_no_overlap():
    assert find_length([1, 2, 3], [4, 5, 6]) == 0`,
    solution: `def find_length(nums1: list[int], nums2: list[int]) -> int:
    m, n = len(nums1), len(nums2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if nums1[i - 1] == nums2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = max(best, dp[i][j])
    return best`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-subsequence", "array"],
  },
  {
    name: "Longest Palindromic Subsequence",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given a string s, return the length of the longest palindromic subsequence (characters can be skipped but not reordered).\n\nExample:\nInput: s = "bbbab"\nOutput: 4  ("bbbb")\n\nConstraints:\n- 1 <= s.length <= 1000\n- s consists only of lowercase English letters\n\nRef: LeetCode #516`,
    code: `def longest_palindrome_subseq(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_longest_palindrome_subseq_basic():
    assert longest_palindrome_subseq("bbbab") == 4

def test_longest_palindrome_subseq_two():
    assert longest_palindrome_subseq("cbbd") == 2

def test_longest_palindrome_subseq_single():
    assert longest_palindrome_subseq("a") == 1`,
    solution: `def longest_palindrome_subseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "interval-dp", "string"],
  },
  {
    name: "Unique Paths II",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given an m x n integer array grid. There is a robot initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time.\n\nAn obstacle and space are marked as 1 or 0 respectively in grid. A path that the robot takes cannot include any square that is an obstacle.\n\nReturn the number of possible unique paths that the robot can take to reach the bottom-right corner.\n\nExample:\nInput: grid = [[0,0,0],[0,1,0],[0,0,0]]\nOutput: 2\nExplanation: There is one obstacle in the middle of the 3x3 grid. There are two ways to reach the bottom-right corner: right→right→down→down or down→down→right→right.\n\nConstraints:\n- m == obstacle_grid.length\n- n == obstacle_grid[i].length\n- 1 <= m, n <= 100\n- obstacle_grid[i][j] is 0 or 1\n\nRef: LeetCode #63`,
    code: `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_unique_paths_ii_basic():
    assert unique_paths_with_obstacles([[0,0,0],[0,1,0],[0,0,0]]) == 2

def test_unique_paths_ii_start_blocked():
    assert unique_paths_with_obstacles([[1,0]]) == 0

def test_unique_paths_ii_end_blocked():
    assert unique_paths_with_obstacles([[0,0],[0,1]]) == 0

def test_unique_paths_ii_obstacle_zeroes_cell():
    # Obstacle at (0,1) must zero dp[0][1] and make the only path: down→right→right
    assert unique_paths_with_obstacles([[0,1,0],[0,0,0]]) == 1`,
    solution: `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    m, n = len(obstacle_grid), len(obstacle_grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        if obstacle_grid[r][0] == 1:
            break
        dp[r][0] = 1
    for c in range(n):
        if obstacle_grid[0][c] == 1:
            break
        dp[0][c] = 1
    for r in range(1, m):
        for c in range(1, n):
            if obstacle_grid[r][c] == 0:
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid"],
  },
  {
    name: "Triangle",
    category: "2-d-dp",
    language: "python",
    difficulty: "medium",
    description: `Given a triangle array, return the minimum path sum from top to bottom. For each step you may move to an adjacent number of the row below. More formally, if you are on index i on the current row, you may move to either index i or index i + 1 on the next row.\n\nExample:\nInput: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\nOutput: 11\nExplanation: The triangle looks like:\n   2\n  3 4\n 6 5 7\n4 1 8 3\nThe minimum path sum from top to bottom is 2 + 3 + 5 + 1 = 11.\n\nConstraints:\n- 1 <= triangle.length <= 200\n- triangle[i].length == i + 1\n- -10^4 <= triangle[i][j] <= 10^4\n\nRef: LeetCode #120`,
    code: `def minimum_total(triangle: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_triangle_basic():
    assert minimum_total([[2],[3,4],[6,5,7],[4,1,8,3]]) == 11

def test_triangle_single():
    assert minimum_total([[5]]) == 5

def test_triangle_two_rows():
    assert minimum_total([[1],[2,3]]) == 3

def test_triangle_bottom_up_compression():
    # Bottom-up row compression: start from last row, accumulate min upward
    assert minimum_total([[-1],[2,3],[1,-1,-3]]) == -1`,
    solution: `def minimum_total(triangle: list[list[int]]) -> int:
    dp = triangle[-1][:]
    for row in range(len(triangle) - 2, -1, -1):
        for col in range(len(triangle[row])):
            dp[col] = triangle[row][col] + min(dp[col], dp[col + 1])
    return dp[0]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp"],
  },
  {
    name: "0/1 Knapsack",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given a list of items, each with a weight and a value, and a knapsack with a maximum capacity. Each item may be selected at most once. Return the maximum total value you can fit in the knapsack.\n\nExample:\nInput: weights = [1, 2, 3], values = [6, 10, 12], capacity = 5\nOutput: 22\nExplanation: Pick items with weight 2 (value 10) and weight 3 (value 12) → total value 22 at total weight 5.\n\nConstraints:\n- 1 <= len(weights) == len(values)\n- 1 <= weights[i], values[i] <= 1000\n- 1 <= capacity <= 1000\n\nNote: This is a custom teaching kata, not a LeetCode problem. The critical implementation rule is to iterate the capacity dimension BACKWARD so each item can be used at most once.`,
    code: `def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_knapsack_01_basic():
    assert knapsack_01([1, 2, 3], [6, 10, 12], 5) == 22

def test_knapsack_01_zero_capacity():
    assert knapsack_01([1, 2], [3, 4], 0) == 0

def test_knapsack_01_single_item():
    assert knapsack_01([3], [5], 2) == 0

def test_knapsack_01_no_reuse():
    # Forward (unbounded) iteration would let the one weight-1 item fill capacity 3 → 6;
    # correct backward iteration uses it at most once → 2.
    assert knapsack_01([1], [2], 3) == 2`,
    solution: `def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for i in range(len(weights)):
        for c in range(capacity, weights[i] - 1, -1):
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[capacity]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "0-1-knapsack"],
  },
  {
    name: "Unbounded Knapsack",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `You are given a list of items, each with a weight and a value, and a knapsack with a maximum capacity. Each item may be selected any number of times. Return the maximum total value you can fit in the knapsack.\n\nExample:\nInput: weights = [1, 2, 3], values = [6, 10, 12], capacity = 5\nOutput: 30\nExplanation: Pick the weight-1 item five times (value 6 each) → total value 30.\n\nConstraints:\n- 1 <= len(weights) == len(values)\n- 1 <= weights[i], values[i] <= 1000\n- 1 <= capacity <= 1000\n\nNote: This is a custom teaching kata, not a LeetCode problem. The critical implementation rule is to iterate the capacity dimension FORWARD so each item can be reused.`,
    code: `def knapsack_unbounded(weights: list[int], values: list[int], capacity: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_knapsack_unbounded_basic():
    assert knapsack_unbounded([1, 2, 3], [6, 10, 12], 5) == 30

def test_knapsack_unbounded_zero_capacity():
    assert knapsack_unbounded([1, 2], [3, 4], 0) == 0

def test_knapsack_unbounded_reuse():
    # Backward (0/1) iteration would use the weight-1 item at most once → 2;
    # correct forward iteration allows full reuse → 6.
    assert knapsack_unbounded([1], [2], 3) == 6

def test_knapsack_unbounded_larger():
    # Two copies of weight-3/value-6 item (total w=6, v=12) plus weight-2/value-3 item → 15
    assert knapsack_unbounded([2, 5, 4, 3], [3, 4, 5, 6], 8) == 15`,
    solution: `def knapsack_unbounded(weights: list[int], values: list[int], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for c in range(capacity + 1):
        for i in range(len(weights)):
            if weights[i] <= c:
                dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[capacity]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "unbounded-knapsack"],
  },
  {
    name: "Minimum Moves to Reach N",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Starting from 0, you may add 1, 3, or 5 on each move. Return the fewest moves needed to reach exactly n.\n\nExample:\nInput: n = 11\nOutput: 3\nExplanation: 5 + 5 + 1 reaches 11 in three moves.\n\nDP framing:\n- State: dp[i] = minimum number of moves needed to reach total i\n- Transition: dp[i] = 1 + min(dp[i - move]) over moves that fit\n- Base case: dp[0] = 0\n\nThis is the minimization counterpart to the earlier counting reachability exercises.`,
    code: `def min_moves_to_reach_n(n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_min_moves_zero():
    assert min_moves_to_reach_n(0) == 0

def test_min_moves_one():
    assert min_moves_to_reach_n(1) == 1

def test_min_moves_six():
    assert min_moves_to_reach_n(6) == 2

def test_min_moves_eleven():
    assert min_moves_to_reach_n(11) == 3`,
    solution: `def min_moves_to_reach_n(n: int) -> int:
    moves = [1, 3, 5]
    dp = [0] + [float("inf")] * n
    for total in range(1, n + 1):
        for move in moves:
            if move <= total:
                dp[total] = min(dp[total], dp[total - move] + 1)
    return dp[n]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dp-min-cost", "dp-foundations", "pre-leetcode"],
  },
  {
    name: "Maximum Sum With No Three Consecutive Values",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a list of non-negative values, choose a subsequence with maximum total sum. You may choose adjacent values, but you may not choose three consecutive positions.\n\nExample:\nInput: nums = [6, 7, 1, 30, 8, 2, 4]\nOutput: 55\nExplanation: choose positions 0, 1, 3, 4, and 6.\n\nDP framing:\n- State: dp[i] = best sum using positions 0 through i\n- Choices: skip i, take i after skipping i - 1, or take i and i - 1 after skipping i - 2\n- This extends House Robber-style take/skip DP beyond a single take branch.`,
    code: `def max_sum_no_three_consecutive(nums: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_no_three_basic():
    assert max_sum_no_three_consecutive([6, 7, 1, 30, 8, 2, 4]) == 55

def test_no_three_all_small():
    assert max_sum_no_three_consecutive([1, 2, 3]) == 5

def test_no_three_two_values():
    assert max_sum_no_three_consecutive([5, 10]) == 15

def test_no_three_empty():
    assert max_sum_no_three_consecutive([]) == 0`,
    solution: `def max_sum_no_three_consecutive(nums: list[int]) -> int:
    if not nums:
        return 0
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    if n >= 2:
        dp[1] = nums[0] + nums[1]
    for i in range(2, n):
        skip = dp[i - 1]
        take_current = dp[i - 2] + nums[i]
        take_pair = (dp[i - 3] if i >= 3 else 0) + nums[i - 1] + nums[i]
        dp[i] = max(skip, take_current, take_pair)
    return dp[-1]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "1d-sequence-dp", "dp-decision", "pre-leetcode"],
  },
  {
    name: "Reconstruct One Minimum-Cost Grid Path",
    category: "2-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a non-empty grid of costs, return one minimum-cost path from the top-left cell to the bottom-right cell. You may only move right or down. Return the path as a list of [row, col] coordinates.\n\nExample:\nInput: grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]]\nOutput: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]\n\nDP framing:\n- First build the same minimum-cost table used by Minimum Path Sum\n- Then walk backward from the bottom-right through the cheaper parent\n- Reconstruction teaches how to recover choices, not only the final score.`,
    code: `def reconstruct_min_cost_grid_path(grid: list[list[int]]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_reconstruct_min_cost_path_basic():
    assert reconstruct_min_cost_grid_path([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == [
        [0, 0], [0, 1], [0, 2], [1, 2], [2, 2]
    ]

def test_reconstruct_min_cost_path_single_cell():
    assert reconstruct_min_cost_grid_path([[7]]) == [[0, 0]]

def test_reconstruct_min_cost_path_single_row():
    assert reconstruct_min_cost_grid_path([[1, 2, 3]]) == [[0, 0], [0, 1], [0, 2]]

def test_reconstruct_min_cost_path_prefers_down_on_tie():
    assert reconstruct_min_cost_grid_path([[1, 1], [1, 1]]) == [[0, 0], [1, 0], [1, 1]]`,
    solution: `def reconstruct_min_cost_grid_path(grid: list[list[int]]) -> list[list[int]]:
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            else:
                top = dp[r - 1][c] if r > 0 else float("inf")
                left = dp[r][c - 1] if c > 0 else float("inf")
                dp[r][c] = grid[r][c] + min(top, left)

    path = []
    r, c = rows - 1, cols - 1
    while True:
        path.append([r, c])
        if r == 0 and c == 0:
            break
        top = dp[r - 1][c] if r > 0 else float("inf")
        left = dp[r][c - 1] if c > 0 else float("inf")
        if top < left:
            r -= 1
        else:
            c -= 1
    path.reverse()
    return path`,
    usage: null,
    tags: ["dynamic-programming", "dp", "grid-dp", "grid", "reconstruction", "pre-leetcode"],
  },
  {
    name: "Subset Sum",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given positive integers and a target, return whether some subset adds up to exactly the target. Each number may be used at most once.\n\nExample:\nInput: nums = [3, 34, 4, 12, 5, 2], target = 9\nOutput: True\nExplanation: 4 + 5 equals 9.\n\nDP framing:\n- State: dp[sum] = whether this sum is reachable with the items processed so far\n- Transition: for each number, update sums backward so the number is used at most once\n- This is the feasibility form of 0/1 knapsack.`,
    code: `def subset_sum(nums: list[int], target: int) -> bool:
    raise NotImplementedError`,
    testCode: `def test_subset_sum_true():
    assert subset_sum([3, 34, 4, 12, 5, 2], 9) is True

def test_subset_sum_false():
    assert subset_sum([3, 34, 4, 12, 5, 2], 30) is False

def test_subset_sum_zero_target():
    assert subset_sum([5, 7], 0) is True

def test_subset_sum_no_reuse():
    assert subset_sum([4], 8) is False`,
    solution: `def subset_sum(nums: list[int], target: int) -> bool:
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for total in range(target, num - 1, -1):
            dp[total] = dp[total] or dp[total - num]
    return dp[target]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "0-1-knapsack", "dp-feasibility", "pre-leetcode"],
  },
  {
    name: "Count Subsets That Sum to Target",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given positive integers and a target, return how many subsets add up to exactly the target. Each array position may be used at most once.\n\nExample:\nInput: nums = [2, 3, 5, 6, 8, 10], target = 10\nOutput: 3\nExplanation: [2, 3, 5], [2, 8], and [10].\n\nDP framing:\n- State: dp[sum] = number of subsets that produce this sum after processed items\n- Transition: dp[sum] += dp[sum - num]\n- Iterate sums backward to keep this as 0/1 knapsack, not unbounded knapsack.`,
    code: `def count_subsets_sum_target(nums: list[int], target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_subsets_basic():
    assert count_subsets_sum_target([2, 3, 5, 6, 8, 10], 10) == 3

def test_count_subsets_with_duplicates():
    assert count_subsets_sum_target([1, 1, 1], 2) == 3

def test_count_subsets_zero_target():
    assert count_subsets_sum_target([1, 2], 0) == 1

def test_count_subsets_no_solution():
    assert count_subsets_sum_target([4, 5], 3) == 0`,
    solution: `def count_subsets_sum_target(nums: list[int], target: int) -> int:
    dp = [0] * (target + 1)
    dp[0] = 1
    for num in nums:
        for total in range(target, num - 1, -1):
            dp[total] += dp[total - num]
    return dp[target]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "0-1-knapsack", "dp-counting", "pre-leetcode"],
  },
  {
    name: "LIS Length Ending at Each Index",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a list of integers, return an array where result[i] is the length of the longest strictly increasing subsequence that ends exactly at index i.\n\nExample:\nInput: nums = [1, 3, 2, 4]\nOutput: [1, 2, 2, 3]\n\nDP framing:\n- State: dp[i] = best increasing subsequence length ending at i\n- Transition: look at every j < i with nums[j] < nums[i]\n- Returning the whole table makes the ending-at-index idea visible before asking only for max(dp).`,
    code: `def lis_lengths_ending_at_each_index(nums: list[int]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_lis_lengths_basic():
    assert lis_lengths_ending_at_each_index([1, 3, 2, 4]) == [1, 2, 2, 3]

def test_lis_lengths_neetcode_example():
    assert lis_lengths_ending_at_each_index([10, 9, 2, 5, 3, 7, 101, 18]) == [1, 1, 1, 2, 2, 3, 4, 4]

def test_lis_lengths_all_same():
    assert lis_lengths_ending_at_each_index([7, 7, 7]) == [1, 1, 1]

def test_lis_lengths_empty():
    assert lis_lengths_ending_at_each_index([]) == []`,
    solution: `def lis_lengths_ending_at_each_index(nums: list[int]) -> list[int]:
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return dp`,
    usage: null,
    tags: ["dynamic-programming", "dp", "lis-and-chain-dp", "dp-subsequence", "pre-leetcode"],
  },
  {
    name: "Count Paths in a DAG",
    category: "1-d-dp",
    language: "python",
    difficulty: "easy",
    description: `Given a directed acyclic graph as an adjacency list, count how many directed paths lead from start to target. The graph is guaranteed not to contain directed cycles.\n\nExample:\nInput: graph = [[1, 2], [3], [3], []], start = 0, target = 3\nOutput: 2\nExplanation: 0 -> 1 -> 3 and 0 -> 2 -> 3.\n\nDP framing:\n- State: ways(node) = number of paths from node to target\n- Transition: ways(node) = sum(ways(next_node) for each outgoing edge)\n- Memoized DFS fits because dependencies follow graph edges rather than a simple left-to-right index.`,
    code: `def count_paths_in_dag(graph: list[list[int]], start: int, target: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_count_paths_dag_basic():
    assert count_paths_in_dag([[1, 2], [3], [3], []], 0, 3) == 2

def test_count_paths_dag_three_paths():
    assert count_paths_in_dag([[1, 2, 3], [4], [4], [4], []], 0, 4) == 3

def test_count_paths_dag_start_is_target():
    assert count_paths_in_dag([[1], []], 0, 0) == 1

def test_count_paths_dag_unreachable():
    assert count_paths_in_dag([[1], [], []], 0, 2) == 0`,
    solution: `def count_paths_in_dag(graph: list[list[int]], start: int, target: int) -> int:
    memo = {}

    def ways(node: int) -> int:
        if node == target:
            return 1
        if node not in memo:
            memo[node] = sum(ways(next_node) for next_node in graph[node])
        return memo[node]

    return ways(start)`,
    usage: null,
    tags: ["dynamic-programming", "dp", "dfs-with-memoization", "graph", "pre-leetcode"],
  },
  {
    name: "Minimum Worker-Job Assignment Cost",
    category: "1-d-dp",
    language: "python",
    difficulty: "medium",
    description: `There are n workers and n jobs. costs[worker][job] gives the cost of assigning that worker to that job. Assign every worker to a different job and return the minimum total cost.\n\nExample:\nInput: costs = [[9, 2, 7], [6, 4, 3], [5, 8, 1]]\nOutput: 9\nExplanation: worker 0 -> job 1, worker 1 -> job 0, worker 2 -> job 2 costs 2 + 6 + 1.\n\nDP framing:\n- State: dp[mask] = minimum cost after assigning the set of jobs in mask\n- The next worker index is the number of assigned jobs\n- This is a first real bitmask DP problem: the set of chosen jobs is the state.`,
    code: `def min_worker_job_assignment_cost(costs: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_assignment_cost_three_by_three():
    assert min_worker_job_assignment_cost([[9, 2, 7], [6, 4, 3], [5, 8, 1]]) == 9

def test_assignment_cost_two_by_two():
    assert min_worker_job_assignment_cost([[10, 2], [1, 10]]) == 3

def test_assignment_cost_single():
    assert min_worker_job_assignment_cost([[5]]) == 5

def test_assignment_cost_four_by_four():
    assert min_worker_job_assignment_cost([
        [7, 4, 8, 6],
        [6, 2, 9, 5],
        [5, 8, 1, 7],
        [9, 6, 4, 3],
    ]) == 13`,
    solution: `def min_worker_job_assignment_cost(costs: list[list[int]]) -> int:
    n = len(costs)
    full_mask = (1 << n) - 1
    dp = [float("inf")] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        worker = bin(mask).count("1")
        if worker == n:
            continue
        for job in range(n):
            if mask & (1 << job):
                continue
            next_mask = mask | (1 << job)
            dp[next_mask] = min(dp[next_mask], dp[mask] + costs[worker][job])
    return dp[full_mask]`,
    usage: null,
    tags: ["dynamic-programming", "dp", "bitmask-dp", "assignment", "pre-leetcode"],
  },
];

const dpFoundationMetadataByLabel: Record<string, Pick<NonNullable<SeedKata["solutionVariants"]>[number], "complexity" | "explanation">> = {
  Recursive: {
    complexity: "Time: O(branching^n) for branching recurrences, O(n) for single-chain recurrences; Space: O(n)",
    explanation: "Shows the direct recurrence before memoization; useful for learning the dependency shape, but may recompute overlapping subproblems.",
  },
  Memoized: {
    complexity: "Time: O(number of states * transition cost), Space: O(number of states)",
    explanation: "Keeps the recursive shape but caches each state after it is solved once.",
  },
  Tabulation: {
    complexity: "Time: O(number of states * transition cost), Space: O(number of states)",
    explanation: "Fills states bottom-up in dependency order so each state is computed once.",
  },
  Optimized: {
    complexity: "Time: O(number of states * transition cost), Space: O(1) or reduced rolling state",
    explanation: "Removes DP storage when each transition only needs a small fixed window of previous states.",
  },
  "Direct transition": {
    complexity: "Time: O(1), Space: O(1)",
    explanation: "Computes a single DP state directly from its already-known predecessors.",
  },
};

const variant = (label: string, code: string) => ({
  label,
  code,
  ...(dpFoundationMetadataByLabel[label] ?? {
    complexity: "Time: O(number of states * transition cost), Space: O(number of states)",
    explanation: "Computes the DP recurrence with the storage required by this variant.",
  }),
});

const dpFoundationSolutionVariants: Record<string, NonNullable<SeedKata["solutionVariants"]>> = {
  "Sum from 1 to n": [
    variant("Recursive", `def sum_from_1_to_n(n: int) -> int:
    if n == 0:
        return 0
    return n + sum_from_1_to_n(n - 1)`),
    variant("Memoized", `def sum_from_1_to_n(n: int) -> int:
    memo = {0: 0}

    def total(i: int) -> int:
        if i not in memo:
            memo[i] = i + total(i - 1)
        return memo[i]

    return total(n)`),
    variant("Tabulation", `def sum_from_1_to_n(n: int) -> int:
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + i
    return dp[n]`),
    variant("Optimized", `def sum_from_1_to_n(n: int) -> int:
    total = 0
    for i in range(1, n + 1):
        total += i
    return total`),
  ],
  "Running Total": [
    variant("Recursive", `def running_total(nums: list[int]) -> list[int]:
    def prefix(i: int) -> int:
        if i == 0:
            return nums[0]
        return prefix(i - 1) + nums[i]

    return [prefix(i) for i in range(len(nums))]`),
    variant("Memoized", `def running_total(nums: list[int]) -> list[int]:
    memo = {}

    def prefix(i: int) -> int:
        if i in memo:
            return memo[i]
        if i == 0:
            memo[i] = nums[0]
        else:
            memo[i] = prefix(i - 1) + nums[i]
        return memo[i]

    return [prefix(i) for i in range(len(nums))]`),
    variant("Tabulation", `def running_total(nums: list[int]) -> list[int]:
    if not nums:
        return []
    dp = [0] * len(nums)
    dp[0] = nums[0]
    for i in range(1, len(nums)):
        dp[i] = dp[i - 1] + nums[i]
    return dp`),
    variant("Optimized", `def running_total(nums: list[int]) -> list[int]:
    total = 0
    result = []
    for num in nums:
        total += num
        result.append(total)
    return result`),
  ],
  "Double-or-Add Sequence": [
    variant("Recursive", `def double_or_add(n: int) -> int:
    if n == 0:
        return 1
    return 2 * double_or_add(n - 1) + 1`),
    variant("Memoized", `def double_or_add(n: int) -> int:
    memo = {0: 1}

    def value(i: int) -> int:
        if i not in memo:
            memo[i] = 2 * value(i - 1) + 1
        return memo[i]

    return value(n)`),
    variant("Tabulation", `def double_or_add(n: int) -> int:
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = 2 * dp[i - 1] + 1
    return dp[n]`),
    variant("Optimized", `def double_or_add(n: int) -> int:
    value = 1
    for _ in range(n):
        value = 2 * value + 1
    return value`),
  ],
  "Two-Step Number Sequence": [
    variant("Recursive", `def two_step_sequence(n: int) -> int:
    if n == 0:
        return 2
    if n == 1:
        return 3
    return two_step_sequence(n - 1) + two_step_sequence(n - 2)`),
    variant("Memoized", `def two_step_sequence(n: int) -> int:
    memo = {0: 2, 1: 3}

    def value(i: int) -> int:
        if i not in memo:
            memo[i] = value(i - 1) + value(i - 2)
        return memo[i]

    return value(n)`),
    variant("Tabulation", `def two_step_sequence(n: int) -> int:
    if n == 0:
        return 2
    dp = [0] * (n + 1)
    dp[0] = 2
    dp[1] = 3
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`),
    variant("Optimized", `def two_step_sequence(n: int) -> int:
    if n == 0:
        return 2
    prev2, prev1 = 2, 3
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`),
  ],
  "Move Through a Hallway": [
    variant("Recursive", `def hallway_ways(n: int) -> int:
    if n <= 1:
        return 1
    return hallway_ways(n - 1) + hallway_ways(n - 2)`),
    variant("Memoized", `def hallway_ways(n: int) -> int:
    memo = {}

    def ways(i: int) -> int:
        if i <= 1:
            return 1
        if i not in memo:
            memo[i] = ways(i - 1) + ways(i - 2)
        return memo[i]

    return ways(n)`),
    variant("Tabulation", `def hallway_ways(n: int) -> int:
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`),
    variant("Optimized", `def hallway_ways(n: int) -> int:
    if n <= 1:
        return 1
    prev2, prev1 = 1, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`),
  ],
  "Build a Strip With Tiles": [
    variant("Recursive", `def tile_strip(n: int) -> int:
    if n <= 1:
        return 1
    return tile_strip(n - 1) + tile_strip(n - 2)`),
    variant("Memoized", `def tile_strip(n: int) -> int:
    memo = {}

    def ways(length: int) -> int:
        if length <= 1:
            return 1
        if length not in memo:
            memo[length] = ways(length - 1) + ways(length - 2)
        return memo[length]

    return ways(n)`),
    variant("Tabulation", `def tile_strip(n: int) -> int:
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`),
    variant("Optimized", `def tile_strip(n: int) -> int:
    if n <= 1:
        return 1
    prev2, prev1 = 1, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`),
  ],
  "Reach Target With 1, 2, or 3": [
    variant("Recursive", `def reach_target_123(n: int) -> int:
    if n == 0:
        return 1
    if n < 0:
        return 0
    return reach_target_123(n - 1) + reach_target_123(n - 2) + reach_target_123(n - 3)`),
    variant("Memoized", `def reach_target_123(n: int) -> int:
    memo = {}

    def ways(total: int) -> int:
        if total == 0:
            return 1
        if total < 0:
            return 0
        if total not in memo:
            memo[total] = ways(total - 1) + ways(total - 2) + ways(total - 3)
        return memo[total]

    return ways(n)`),
    variant("Tabulation", `def reach_target_123(n: int) -> int:
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i - 1]
        if i >= 2:
            dp[i] += dp[i - 2]
        if i >= 3:
            dp[i] += dp[i - 3]
    return dp[n]`),
    variant("Optimized", `def reach_target_123(n: int) -> int:
    if n == 0:
        return 1
    a, b, c = 1, 0, 0
    for _ in range(1, n + 1):
        a, b, c = a + b + c, a, b
    return a`),
  ],
  "Cheapest Walk Across Stones": [
    variant("Recursive", `def cheapest_stone_walk(costs: list[int]) -> int:
    if not costs:
        return 0

    def best(i: int) -> int:
        if i == 0:
            return costs[0]
        if i == 1:
            return costs[1]
        return costs[i] + min(best(i - 1), best(i - 2))

    return best(len(costs) - 1)`),
    variant("Memoized", `def cheapest_stone_walk(costs: list[int]) -> int:
    if not costs:
        return 0
    memo = {}

    def best(i: int) -> int:
        if i == 0:
            return costs[0]
        if i == 1:
            return costs[1]
        if i not in memo:
            memo[i] = costs[i] + min(best(i - 1), best(i - 2))
        return memo[i]

    return best(len(costs) - 1)`),
    variant("Tabulation", `def cheapest_stone_walk(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    dp = [0] * len(costs)
    dp[0] = costs[0]
    dp[1] = costs[1]
    for i in range(2, len(costs)):
        dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])
    return dp[-1]`),
    variant("Optimized", `def cheapest_stone_walk(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    prev2, prev1 = costs[0], costs[1]
    for i in range(2, len(costs)):
        prev2, prev1 = prev1, costs[i] + min(prev1, prev2)
    return prev1`),
  ],
  "Maximum Points Without Adjacent Cards": [
    variant("Recursive", `def max_non_adjacent_card_points(cards: list[int]) -> int:
    def best(i: int) -> int:
        if i < 0:
            return 0
        return max(best(i - 1), cards[i] + best(i - 2))

    return best(len(cards) - 1)`),
    variant("Memoized", `def max_non_adjacent_card_points(cards: list[int]) -> int:
    memo = {}

    def best(i: int) -> int:
        if i < 0:
            return 0
        if i not in memo:
            memo[i] = max(best(i - 1), cards[i] + best(i - 2))
        return memo[i]

    return best(len(cards) - 1)`),
    variant("Tabulation", `def max_non_adjacent_card_points(cards: list[int]) -> int:
    if not cards:
        return 0
    if len(cards) == 1:
        return cards[0]
    dp = [0] * len(cards)
    dp[0] = cards[0]
    dp[1] = max(cards[0], cards[1])
    for i in range(2, len(cards)):
        dp[i] = max(dp[i - 1], cards[i] + dp[i - 2])
    return dp[-1]`),
    variant("Optimized", `def max_non_adjacent_card_points(cards: list[int]) -> int:
    prev2, prev1 = 0, 0
    for points in cards:
        prev2, prev1 = prev1, max(prev1, prev2 + points)
    return prev1`),
  ],
  "Fibonacci Number": [
    variant("Recursive", `def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`),
    variant("Memoized", `def fib(n: int) -> int:
    memo = {}

    def value(i: int) -> int:
        if i < 2:
            return i
        if i not in memo:
            memo[i] = value(i - 1) + value(i - 2)
        return memo[i]

    return value(n)`),
    variant("Tabulation", `def fib(n: int) -> int:
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`),
    variant("Optimized", `def fib(n: int) -> int:
    if n < 2:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`),
  ],
  "N-th Tribonacci Number": [
    variant("Recursive", `def tribonacci(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    return tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3)`),
    variant("Memoized", `def tribonacci(n: int) -> int:
    memo = {}

    def value(i: int) -> int:
        if i == 0:
            return 0
        if i <= 2:
            return 1
        if i not in memo:
            memo[i] = value(i - 1) + value(i - 2) + value(i - 3)
        return memo[i]

    return value(n)`),
    variant("Tabulation", `def tribonacci(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3]
    return dp[n]`),
    variant("Optimized", `def tribonacci(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    a, b, c = 0, 1, 1
    for _ in range(3, n + 1):
        a, b, c = b, c, a + b + c
    return c`),
  ],
  "Maximum Points With a One-Position Cooldown": [
    variant("Recursive", `def max_points_with_cooldown(points: list[int]) -> int:
    def best(i: int) -> int:
        if i < 0:
            return 0
        return max(best(i - 1), points[i] + best(i - 2))

    return best(len(points) - 1)`),
    variant("Memoized", `def max_points_with_cooldown(points: list[int]) -> int:
    memo = {}

    def best(i: int) -> int:
        if i < 0:
            return 0
        if i not in memo:
            memo[i] = max(best(i - 1), points[i] + best(i - 2))
        return memo[i]

    return best(len(points) - 1)`),
    variant("Tabulation", `def max_points_with_cooldown(points: list[int]) -> int:
    if not points:
        return 0
    dp = [0] * len(points)
    dp[0] = points[0]
    if len(points) > 1:
        dp[1] = max(points[0], points[1])
    for i in range(2, len(points)):
        dp[i] = max(dp[i - 1], points[i] + dp[i - 2])
    return dp[-1]`),
    variant("Optimized", `def max_points_with_cooldown(points: list[int]) -> int:
    two_back = 0
    one_back = 0
    for value in points:
        two_back, one_back = one_back, max(one_back, two_back + value)
    return one_back`),
  ],
  "Cheapest Route Through Checkpoints": [
    variant("Recursive", `def cheapest_checkpoint_route(costs: list[int]) -> int:
    if not costs:
        return 0

    def best(i: int) -> int:
        if i == 0:
            return costs[0]
        if i == 1:
            return costs[1]
        return costs[i] + min(best(i - 1), best(i - 2))

    return best(len(costs) - 1)`),
    variant("Memoized", `def cheapest_checkpoint_route(costs: list[int]) -> int:
    if not costs:
        return 0
    memo = {}

    def best(i: int) -> int:
        if i == 0:
            return costs[0]
        if i == 1:
            return costs[1]
        if i not in memo:
            memo[i] = costs[i] + min(best(i - 1), best(i - 2))
        return memo[i]

    return best(len(costs) - 1)`),
    variant("Tabulation", `def cheapest_checkpoint_route(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    dp = [0] * len(costs)
    dp[0] = costs[0]
    dp[1] = costs[1]
    for i in range(2, len(costs)):
        dp[i] = costs[i] + min(dp[i - 1], dp[i - 2])
    return dp[-1]`),
    variant("Optimized", `def cheapest_checkpoint_route(costs: list[int]) -> int:
    if not costs:
        return 0
    if len(costs) == 1:
        return costs[0]
    two_back, one_back = costs[0], costs[1]
    for i in range(2, len(costs)):
        two_back, one_back = one_back, costs[i] + min(one_back, two_back)
    return one_back`),
  ],
  "Can the End Be Reached?": [
    variant("Recursive", `def can_reach_end(allowed: list[bool]) -> bool:
    def reachable(i: int) -> bool:
        if i < 0:
            return False
        if i == 0:
            return allowed[0]
        return allowed[i] and (reachable(i - 1) or reachable(i - 2))

    return bool(allowed) and reachable(len(allowed) - 1)`),
    variant("Memoized", `def can_reach_end(allowed: list[bool]) -> bool:
    memo = {}

    def reachable(i: int) -> bool:
        if i < 0:
            return False
        if i == 0:
            return allowed[0]
        if i not in memo:
            memo[i] = allowed[i] and (reachable(i - 1) or reachable(i - 2))
        return memo[i]

    return bool(allowed) and reachable(len(allowed) - 1)`),
    variant("Tabulation", `def can_reach_end(allowed: list[bool]) -> bool:
    if not allowed:
        return False
    dp = [False] * len(allowed)
    dp[0] = allowed[0]
    for i in range(1, len(allowed)):
        dp[i] = allowed[i] and (dp[i - 1] or (i >= 2 and dp[i - 2]))
    return dp[-1]`),
    variant("Optimized", `def can_reach_end(allowed: list[bool]) -> bool:
    if not allowed:
        return False
    two_back = False
    one_back = allowed[0]
    for i in range(1, len(allowed)):
        current = allowed[i] and (one_back or two_back)
        two_back, one_back = one_back, current
    return one_back`),
  ],
  "Segment a Number String": [
    variant("Recursive", `def segment_number_string(s: str, allowed: list[str]) -> bool:
    chunks = set(allowed)

    def can(start: int) -> bool:
        if start == len(s):
            return True
        return any(s.startswith(chunk, start) and can(start + len(chunk)) for chunk in chunks)

    return can(0)`),
    variant("Memoized", `def segment_number_string(s: str, allowed: list[str]) -> bool:
    chunks = set(allowed)
    memo = {}

    def can(start: int) -> bool:
        if start == len(s):
            return True
        if start not in memo:
            memo[start] = any(s.startswith(chunk, start) and can(start + len(chunk)) for chunk in chunks)
        return memo[start]

    return can(0)`),
    variant("Tabulation", `def segment_number_string(s: str, allowed: list[str]) -> bool:
    chunks = set(allowed)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for chunk in chunks:
            start = i - len(chunk)
            if start >= 0 and dp[start] and s[start:i] == chunk:
                dp[i] = True
                break
    return dp[-1]`),
  ],
  "Longest Increasing Run": [
    variant("Tabulation", `def longest_increasing_run(nums: list[int]) -> int:
    if not nums:
        return 0
    dp = [1] * len(nums)
    best = 1
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            dp[i] = dp[i - 1] + 1
        best = max(best, dp[i])
    return best`),
    variant("Optimized", `def longest_increasing_run(nums: list[int]) -> int:
    if not nums:
        return 0
    current = 1
    best = 1
    for i in range(1, len(nums)):
        current = current + 1 if nums[i] > nums[i - 1] else 1
        best = max(best, current)
    return best`),
  ],
  "Longest Repeated-Character Run": [
    variant("Tabulation", `def longest_repeated_character_run(s: str) -> int:
    if not s:
        return 0
    dp = [1] * len(s)
    best = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            dp[i] = dp[i - 1] + 1
        best = max(best, dp[i])
    return best`),
    variant("Optimized", `def longest_repeated_character_run(s: str) -> int:
    if not s:
        return 0
    current = 1
    best = 1
    for i in range(1, len(s)):
        current = current + 1 if s[i] == s[i - 1] else 1
        best = max(best, current)
    return best`),
  ],
  "Maximum Contiguous Sum Ending at Each Position": [
    variant("Memoized", `def max_contiguous_sum_endings(nums: list[int]) -> list[int]:
    memo = {}

    def ending_at(i: int) -> int:
        if i == 0:
            return nums[0]
        if i not in memo:
            memo[i] = max(nums[i], nums[i] + ending_at(i - 1))
        return memo[i]

    return [ending_at(i) for i in range(len(nums))]`),
    variant("Tabulation", `def max_contiguous_sum_endings(nums: list[int]) -> list[int]:
    if not nums:
        return []
    dp = [0] * len(nums)
    dp[0] = nums[0]
    for i in range(1, len(nums)):
        dp[i] = max(nums[i], nums[i] + dp[i - 1])
    return dp`),
  ],
  "Delete and Earn": [
    variant("Memoized value DP", `def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    points = [0] * (max(nums) + 1)
    for num in nums:
        points[num] += num
    memo = {}

    def best(value: int) -> int:
        if value < 0:
            return 0
        if value not in memo:
            memo[value] = max(best(value - 1), points[value] + best(value - 2))
        return memo[value]

    return best(len(points) - 1)`),
    variant("Tabulation", `def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    points = [0] * (max(nums) + 1)
    for num in nums:
        points[num] += num
    dp = [0] * len(points)
    dp[0] = points[0]
    for i in range(1, len(points)):
        dp[i] = max(dp[i - 1], points[i] + (dp[i - 2] if i >= 2 else 0))
    return dp[-1]`),
    variant("Optimized", `def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    points = [0] * (max(nums) + 1)
    for num in nums:
        points[num] += num
    two_back = 0
    one_back = 0
    for value in points:
        two_back, one_back = one_back, max(one_back, two_back + value)
    return one_back`),
  ],
  "Fill One Grid State": [
    variant("Direct transition", `def fill_one_grid_state(top: int, left: int) -> int:
    return top + left`),
  ],
  "Build a Path-Count Table": [
    variant("Tabulation", `def build_path_count_table(rows: int, cols: int) -> list[list[int]]:
    dp = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp`),
  ],
  "Build a Blocked-Cell Path Table": [
    variant("Tabulation", `def build_blocked_path_table(blocked: list[list[bool]]) -> list[list[int]]:
    rows, cols = len(blocked), len(blocked[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if blocked[r][c]:
                dp[r][c] = 0
            elif r == 0 and c == 0:
                dp[r][c] = 1
            else:
                top = dp[r - 1][c] if r > 0 else 0
                left = dp[r][c - 1] if c > 0 else 0
                dp[r][c] = top + left
    return dp`),
  ],
  "Build a Minimum-Cost Table": [
    variant("Tabulation", `def build_min_cost_table(grid: list[list[int]]) -> list[list[int]]:
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            else:
                top = dp[r - 1][c] if r > 0 else float("inf")
                left = dp[r][c - 1] if c > 0 else float("inf")
                dp[r][c] = grid[r][c] + min(top, left)
    return dp`),
  ],
  "Minimum Path Sum": [
    variant("Memoized DFS", `def min_path_sum(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    memo = {}

    def best(r: int, c: int) -> int:
        if r == rows - 1 and c == cols - 1:
            return grid[r][c]
        key = (r, c)
        if key not in memo:
            down = best(r + 1, c) if r + 1 < rows else float("inf")
            right = best(r, c + 1) if c + 1 < cols else float("inf")
            memo[key] = grid[r][c] + min(down, right)
        return memo[key]

    return best(0, 0)`),
    variant("Tabulation", `def min_path_sum(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = grid[0][0]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                continue
            up = dp[r - 1][c] if r > 0 else float("inf")
            left = dp[r][c - 1] if c > 0 else float("inf")
            dp[r][c] = grid[r][c] + min(up, left)
    return dp[-1][-1]`),
    variant("Optimized", `def min_path_sum(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    dp = [float("inf")] * cols
    dp[0] = 0
    for r in range(rows):
        for c in range(cols):
            if c == 0:
                dp[c] = dp[c] + grid[r][c]
            else:
                dp[c] = grid[r][c] + min(dp[c], dp[c - 1])
    return dp[-1]`),
  ],
  "Perfect Squares": [
    variant("Memoized", `def num_squares(n: int) -> int:
    squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
    memo = {0: 0}

    def best(total: int) -> int:
        if total not in memo:
            memo[total] = 1 + min(best(total - sq) for sq in squares if sq <= total)
        return memo[total]

    return best(n)`),
    variant("Tabulation", `def num_squares(n: int) -> int:
    dp = [0] + [float("inf")] * n
    for total in range(1, n + 1):
        square = 1
        while square * square <= total:
            dp[total] = min(dp[total], 1 + dp[total - square * square])
            square += 1
    return dp[n]`),
    variant("BFS shortest path", `def num_squares(n: int) -> int:
    from collections import deque

    squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
    q = deque([(n, 0)])
    seen = {n}
    while q:
        remaining, steps = q.popleft()
        for square in squares:
            next_remaining = remaining - square
            if next_remaining == 0:
                return steps + 1
            if next_remaining < 0:
                break
            if next_remaining not in seen:
                seen.add(next_remaining)
                q.append((next_remaining, steps + 1))
    return 0`),
  ],
  "Maximum Length of Repeated Subarray": [
    variant("Tabulation", `def find_length(a: list[int], b: list[int]) -> int:
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    best = 0
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = max(best, dp[i][j])
    return best`),
    variant("Optimized", `def find_length(a: list[int], b: list[int]) -> int:
    dp = [0] * (len(b) + 1)
    best = 0
    for i in range(1, len(a) + 1):
        next_dp = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                next_dp[j] = dp[j - 1] + 1
                best = max(best, next_dp[j])
        dp = next_dp
    return best`),
  ],
  "Longest Palindromic Subsequence": [
    variant("Memoized", `def longest_palindrome_subseq(s: str) -> int:
    memo = {}

    def best(left: int, right: int) -> int:
        if left > right:
            return 0
        if left == right:
            return 1
        key = (left, right)
        if key not in memo:
            if s[left] == s[right]:
                memo[key] = 2 + best(left + 1, right - 1)
            else:
                memo[key] = max(best(left + 1, right), best(left, right - 1))
        return memo[key]

    return best(0, len(s) - 1)`),
    variant("Tabulation", `def longest_palindrome_subseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = 2 + dp[i + 1][j - 1]
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][-1]`),
    variant("LCS with reversed string", `def longest_palindrome_subseq(s: str) -> int:
    rev = s[::-1]
    dp = [0] * (len(s) + 1)
    for ch1 in s:
        next_dp = [0] * (len(s) + 1)
        for j, ch2 in enumerate(rev, 1):
            if ch1 == ch2:
                next_dp[j] = dp[j - 1] + 1
            else:
                next_dp[j] = max(dp[j], next_dp[j - 1])
        dp = next_dp
    return dp[-1]`),
  ],
  "Unique Paths II": [
    variant("Memoized DFS", `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    rows, cols = len(obstacle_grid), len(obstacle_grid[0])
    memo = {}

    def ways(r: int, c: int) -> int:
        if r >= rows or c >= cols or obstacle_grid[r][c] == 1:
            return 0
        if r == rows - 1 and c == cols - 1:
            return 1
        key = (r, c)
        if key not in memo:
            memo[key] = ways(r + 1, c) + ways(r, c + 1)
        return memo[key]

    return ways(0, 0)`),
    variant("Tabulation", `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    rows, cols = len(obstacle_grid), len(obstacle_grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = 1 if obstacle_grid[0][0] == 0 else 0
    for r in range(rows):
        for c in range(cols):
            if obstacle_grid[r][c] == 1 or (r == 0 and c == 0):
                continue
            dp[r][c] = (dp[r - 1][c] if r > 0 else 0) + (dp[r][c - 1] if c > 0 else 0)
    return dp[-1][-1]`),
    variant("Optimized", `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    cols = len(obstacle_grid[0])
    dp = [0] * cols
    dp[0] = 1
    for row in obstacle_grid:
        for c in range(cols):
            if row[c] == 1:
                dp[c] = 0
            elif c > 0:
                dp[c] += dp[c - 1]
    return dp[-1]`),
  ],
  "Triangle": [
    variant("Memoized recursion", `def minimum_total(triangle: list[list[int]]) -> int:
    memo = {}

    def best(r: int, c: int) -> int:
        if r == len(triangle) - 1:
            return triangle[r][c]
        key = (r, c)
        if key not in memo:
            memo[key] = triangle[r][c] + min(best(r + 1, c), best(r + 1, c + 1))
        return memo[key]

    return best(0, 0)`),
    variant("2D tabulation", `def minimum_total(triangle: list[list[int]]) -> int:
    dp = [row[:] for row in triangle]
    for r in range(len(dp) - 2, -1, -1):
        for c in range(len(dp[r])):
            dp[r][c] += min(dp[r + 1][c], dp[r + 1][c + 1])
    return dp[0][0]`),
    variant("Tabulation", `def minimum_total(triangle: list[list[int]]) -> int:
    dp = triangle[-1][:]
    for r in range(len(triangle) - 2, -1, -1):
        for c in range(len(triangle[r])):
            dp[c] = triangle[r][c] + min(dp[c], dp[c + 1])
    return dp[0]`),
  ],
  "0/1 Knapsack": [
    variant("Tabulation", `def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for i in range(len(weights)):
        for c in range(capacity, weights[i] - 1, -1):
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[capacity]`),
  ],
  "Minimum Moves to Reach N": [
    variant("Memoized", `def min_moves_to_reach_n(n: int) -> int:
    moves = [1, 3, 5]
    memo = {0: 0}

    def best(total: int) -> int:
        if total not in memo:
            memo[total] = 1 + min(best(total - move) for move in moves if move <= total)
        return memo[total]

    return best(n)`),
    variant("Tabulation", `def min_moves_to_reach_n(n: int) -> int:
    moves = [1, 3, 5]
    dp = [0] + [float("inf")] * n
    for total in range(1, n + 1):
        for move in moves:
            if move <= total:
                dp[total] = min(dp[total], dp[total - move] + 1)
    return dp[n]`),
  ],
  "Maximum Sum With No Three Consecutive Values": [
    variant("Memoized", `def max_sum_no_three_consecutive(nums: list[int]) -> int:
    memo = {}

    def best(i: int) -> int:
        if i < 0:
            return 0
        if i not in memo:
            skip = best(i - 1)
            take_current = best(i - 2) + nums[i]
            take_pair = best(i - 3) + nums[i - 1] + nums[i] if i >= 1 else nums[i]
            memo[i] = max(skip, take_current, take_pair)
        return memo[i]

    return best(len(nums) - 1)`),
    variant("Tabulation", `def max_sum_no_three_consecutive(nums: list[int]) -> int:
    if not nums:
        return 0
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    if n >= 2:
        dp[1] = nums[0] + nums[1]
    for i in range(2, n):
        skip = dp[i - 1]
        take_current = dp[i - 2] + nums[i]
        take_pair = (dp[i - 3] if i >= 3 else 0) + nums[i - 1] + nums[i]
        dp[i] = max(skip, take_current, take_pair)
    return dp[-1]`),
    variant("Optimized", `def max_sum_no_three_consecutive(nums: list[int]) -> int:
    prev3 = 0
    prev2 = 0
    prev1 = 0
    prev_num = 0
    for num in nums:
        current = max(prev1, prev2 + num, prev3 + prev_num + num)
        prev3, prev2, prev1, prev_num = prev2, prev1, current, num
    return prev1`),
  ],
  "Reconstruct One Minimum-Cost Grid Path": [
    variant("Tabulation", `def reconstruct_min_cost_grid_path(grid: list[list[int]]) -> list[list[int]]:
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            else:
                top = dp[r - 1][c] if r > 0 else float("inf")
                left = dp[r][c - 1] if c > 0 else float("inf")
                dp[r][c] = grid[r][c] + min(top, left)

    path = []
    r, c = rows - 1, cols - 1
    while True:
        path.append([r, c])
        if r == 0 and c == 0:
            break
        top = dp[r - 1][c] if r > 0 else float("inf")
        left = dp[r][c - 1] if c > 0 else float("inf")
        if top < left:
            r -= 1
        else:
            c -= 1
    return path[::-1]`),
  ],
  "Subset Sum": [
    variant("2D tabulation", `def subset_sum(nums: list[int], target: int) -> bool:
    dp = [[False] * (target + 1) for _ in range(len(nums) + 1)]
    dp[0][0] = True
    for i, num in enumerate(nums, 1):
        for total in range(target + 1):
            dp[i][total] = dp[i - 1][total] or (total >= num and dp[i - 1][total - num])
    return dp[-1][target]`),
    variant("Tabulation", `def subset_sum(nums: list[int], target: int) -> bool:
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for total in range(target, num - 1, -1):
            dp[total] = dp[total] or dp[total - num]
    return dp[target]`),
  ],
  "Count Subsets That Sum to Target": [
    variant("2D tabulation", `def count_subsets_sum_target(nums: list[int], target: int) -> int:
    dp = [[0] * (target + 1) for _ in range(len(nums) + 1)]
    dp[0][0] = 1
    for i, num in enumerate(nums, 1):
        for total in range(target + 1):
            dp[i][total] = dp[i - 1][total]
            if total >= num:
                dp[i][total] += dp[i - 1][total - num]
    return dp[-1][target]`),
    variant("Tabulation", `def count_subsets_sum_target(nums: list[int], target: int) -> int:
    dp = [0] * (target + 1)
    dp[0] = 1
    for num in nums:
        for total in range(target, num - 1, -1):
            dp[total] += dp[total - num]
    return dp[target]`),
  ],
  "LIS Length Ending at Each Index": [
    variant("Tabulation", `def lis_lengths_ending_at_each_index(nums: list[int]) -> list[int]:
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return dp`),
  ],
  "Count Paths in a DAG": [
    variant("Memoized", `def count_paths_in_dag(graph: list[list[int]], start: int, target: int) -> int:
    memo = {}

    def ways(node: int) -> int:
        if node == target:
            return 1
        if node not in memo:
            memo[node] = sum(ways(next_node) for next_node in graph[node])
        return memo[node]

    return ways(start)`),
  ],
  "Minimum Worker-Job Assignment Cost": [
    variant("Memoized", `def min_worker_job_assignment_cost(costs: list[list[int]]) -> int:
    n = len(costs)
    memo = {}

    def best(worker: int, mask: int) -> int:
        if worker == n:
            return 0
        if mask not in memo:
            answer = float("inf")
            for job in range(n):
                if mask & (1 << job):
                    continue
                answer = min(answer, costs[worker][job] + best(worker + 1, mask | (1 << job)))
            memo[mask] = answer
        return memo[mask]

    return best(0, 0)`),
    variant("Tabulation", `def min_worker_job_assignment_cost(costs: list[list[int]]) -> int:
    n = len(costs)
    full_mask = (1 << n) - 1
    dp = [float("inf")] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        worker = bin(mask).count("1")
        if worker == n:
            continue
        for job in range(n):
            if mask & (1 << job):
                continue
            next_mask = mask | (1 << job)
            dp[next_mask] = min(dp[next_mask], dp[mask] + costs[worker][job])
    return dp[full_mask]`),
  ],
  "Unbounded Knapsack": [
    variant("Tabulation", `def knapsack_unbounded(weights: list[int], values: list[int], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for c in range(capacity + 1):
        for i in range(len(weights)):
            if weights[i] <= c:
                dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[capacity]`),
  ],
};

export const dpFoundations: SeedKata[] = dpFoundationEntries.map((kata) => ({
  ...kata,
  solutionVariants: dpFoundationSolutionVariants[kata.name] ?? kata.solutionVariants,
}));
