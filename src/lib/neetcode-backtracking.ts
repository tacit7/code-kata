import type { SeedKata } from "../types/editor";

const neetcodeBacktracking: SeedKata[] = [
  {
    name: "Combination Sum",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen from candidates an unlimited number of times.\n\nYou may return the combinations in any order. The answer is guaranteed to be fewer than 150 combinations.\n\nExample 1:\nInput: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]\n\nExample 2:\nInput: candidates = [2,3], target = 6\nOutput: [[2,2,2],[3,3]]\n\nConstraints:\n- 1 <= candidates.length <= 30\n- 2 <= candidates[i] <= 40\n- All elements of candidates are distinct.\n- 1 <= target <= 40\n\nRef: LeetCode #39 Combination Sum`,
    code: `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_combination_sum_basic():
    result = combination_sum([2,3,6,7], 7)
    assert sorted(sorted(r) for r in result) == sorted(sorted(r) for r in [[2,2,3],[7]])

def test_combination_sum_two():
    result = combination_sum([2,3], 6)
    assert sorted(sorted(r) for r in result) == sorted(sorted(r) for r in [[2,2,2],[3,3]])

def test_combination_sum_single():
    result = combination_sum([7], 7)
    assert result == [[7]]

def test_combination_sum_no_result():
    result = combination_sum([3,5], 4)
    assert result == []`,
    solution: `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    result = []

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(list(current))
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                continue
            current.append(candidates[i])
            backtrack(i, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Combination Sum II",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given a collection of candidate numbers candidates and a target number target, find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination.\n\nNote: The solution set must not contain duplicate combinations.\n\nExample 1:\nInput: candidates = [10,1,2,7,6,1,5], target = 8\nOutput: [[1,1,6],[1,2,5],[1,7],[2,6]]\n\nExample 2:\nInput: candidates = [2,5,2,1,2], target = 5\nOutput: [[1,2,2],[5]]\n\nConstraints:\n- 1 <= candidates.length <= 100\n- 1 <= candidates[i] <= 50\n- 1 <= target <= 30\n\nRef: LeetCode #40 Combination Sum II`,
    code: `def combination_sum2(candidates: list[int], target: int) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_combination_sum2_basic():
    result = combination_sum2([10,1,2,7,6,1,5], 8)
    assert sorted(sorted(r) for r in result) == sorted(sorted(r) for r in [[1,1,6],[1,2,5],[1,7],[2,6]])

def test_combination_sum2_duplicates():
    result = combination_sum2([2,5,2,1,2], 5)
    assert sorted(sorted(r) for r in result) == sorted(sorted(r) for r in [[1,2,2],[5]])

def test_combination_sum2_no_result():
    result = combination_sum2([1,1], 5)
    assert result == []

def test_combination_sum2_single():
    result = combination_sum2([1], 1)
    assert result == [[1]]`,
    solution: `def combination_sum2(candidates: list[int], target: int) -> list[list[int]]:
    candidates.sort()
    result = []

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(list(current))
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            current.append(candidates[i])
            backtrack(i + 1, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Subsets II",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.\n\nExample 1:\nInput: nums = [1,2,2]\nOutput: [[], [1], [1,2], [1,2,2], [2], [2,2]]\n\nExample 2:\nInput: nums = [0]\nOutput: [[], [0]]\n\nConstraints:\n- 1 <= nums.length <= 10\n- -10 <= nums[i] <= 10\n\nRef: LeetCode #90 Subsets II`,
    code: `def subsets_with_dup(nums: list[int]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_subsets_with_dup_basic():
    result = subsets_with_dup([1,2,2])
    normalized = sorted(tuple(sorted(r)) for r in result)
    expected = sorted(tuple(sorted(r)) for r in [[], [1], [1,2], [1,2,2], [2], [2,2]])
    assert normalized == expected

def test_subsets_with_dup_single():
    result = subsets_with_dup([0])
    normalized = sorted(tuple(r) for r in result)
    expected = sorted(tuple(r) for r in [[], [0]])
    assert normalized == expected

def test_subsets_with_dup_all_same():
    result = subsets_with_dup([1,1,1])
    normalized = sorted(tuple(r) for r in result)
    expected = sorted(tuple(r) for r in [[], [1], [1,1], [1,1,1]])
    assert normalized == expected`,
    solution: `def subsets_with_dup(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []

    def backtrack(start, current):
        result.append(list(current))
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Generate Parentheses",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n\nExample 1:\nInput: n = 3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]\n\nExample 2:\nInput: n = 1\nOutput: ["()"]\n\nConstraints:\n- 1 <= n <= 8\n\nRef: LeetCode #22 Generate Parentheses`,
    code: `def generate_parenthesis(n: int) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_generate_parens_three():
    result = generate_parenthesis(3)
    assert sorted(result) == sorted(["((()))","(()())","(())()","()(())","()()()"])

def test_generate_parens_one():
    assert generate_parenthesis(1) == ["()"]

def test_generate_parens_two():
    result = generate_parenthesis(2)
    assert sorted(result) == sorted(["(())", "()()"])`,
    solution: `def generate_parenthesis(n: int) -> list[str]:
    result = []

    def backtrack(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            backtrack(current + "(", open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ")", open_count, close_count + 1)

    backtrack("", 0, 0)
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "Palindrome Partitioning",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.\n\nExample 1:\nInput: s = "aab"\nOutput: [["a","a","b"],["aa","b"]]\n\nExample 2:\nInput: s = "a"\nOutput: [["a"]]\n\nConstraints:\n- 1 <= s.length <= 16\n- s contains only lowercase English letters.\n\nRef: LeetCode #131 Palindrome Partitioning`,
    code: `def partition(s: str) -> list[list[str]]:
    raise NotImplementedError`,
    testCode: `def test_partition_basic():
    result = partition("aab")
    assert sorted(result) == sorted([["a","a","b"],["aa","b"]])

def test_partition_single():
    assert partition("a") == [["a"]]

def test_partition_palindrome():
    result = partition("aba")
    assert sorted(result) == sorted([["a","b","a"],["aba"]])

def test_partition_all_same():
    result = partition("aaa")
    assert sorted(result) == sorted([["a","a","a"],["a","aa"],["aa","a"],["aaa"]])`,
    solution: `def partition(s: str) -> list[list[str]]:
    result = []

    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start, current):
        if start == len(s):
            result.append(list(current))
            return
        for end in range(start + 1, len(s) + 1):
            substr = s[start:end]
            if is_palindrome(substr):
                current.append(substr)
                backtrack(end, current)
                current.pop()

    backtrack(0, [])
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "Letter Combinations of a Phone Number",
    category: "backtracking",
    language: "python",
    difficulty: "medium",
    description: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return an empty list if the input is empty.\n\nPhone keypad mapping:\n2 → abc, 3 → def, 4 → ghi, 5 → jkl\n6 → mno, 7 → pqrs, 8 → tuv, 9 → wxyz\n\nExample 1:\nInput: digits = "23"\nOutput: ["ad","ae","af","bd","be","bf","cd","ce","cf"]\n\nExample 2:\nInput: digits = ""\nOutput: []\n\nExample 3:\nInput: digits = "2"\nOutput: ["a","b","c"]\n\nConstraints:\n- 0 <= digits.length <= 4\n- digits[i] is a digit in the range ['2', '9']\n\nRef: LeetCode #17 Letter Combinations of a Phone Number`,
    code: `def letter_combinations(digits: str) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_letter_combinations_two_digits():
    result = letter_combinations("23")
    assert sorted(result) == sorted(["ad","ae","af","bd","be","bf","cd","ce","cf"])

def test_letter_combinations_empty():
    assert letter_combinations("") == []

def test_letter_combinations_single():
    assert sorted(letter_combinations("2")) == sorted(["a","b","c"])

def test_letter_combinations_seven():
    assert sorted(letter_combinations("7")) == sorted(["p","q","r","s"])`,
    solution: `def letter_combinations(digits: str) -> list[str]:
    if not digits:
        return []
    phone_map = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"
    }
    result = []

    def backtrack(index, current):
        if index == len(digits):
            result.append(current)
            return
        for ch in phone_map[digits[index]]:
            backtrack(index + 1, current + ch)

    backtrack(0, "")
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "N Queens",
    category: "backtracking",
    language: "python",
    difficulty: "hard",
    description: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.\n\nEach solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.\n\nExample 1:\nInput: n = 4\nOutput: [["..Q.","Q...","...Q",".Q.."],["...Q",".Q..","Q...","..Q."]]\n\nExample 2:\nInput: n = 1\nOutput: [["Q"]]\n\nConstraints:\n- 1 <= n <= 9\n\nRef: LeetCode #51 N-Queens`,
    code: `def solve_n_queens(n: int) -> list[list[str]]:
    raise NotImplementedError`,
    testCode: `def test_n_queens_four():
    result = solve_n_queens(4)
    assert len(result) == 2
    expected = [["..Q.","Q...","...Q",".Q.."],["...Q",".Q..","Q...","..Q."]]
    assert sorted(result) == sorted(expected)

def test_n_queens_one():
    assert solve_n_queens(1) == [["Q"]]

def test_n_queens_count():
    assert len(solve_n_queens(5)) == 10

def test_n_queens_no_attacks():
    for board in solve_n_queens(4):
        queens = [(r, c) for r, row in enumerate(board) for c, ch in enumerate(row) if ch == 'Q']
        for i in range(len(queens)):
            for j in range(i + 1, len(queens)):
                r1, c1 = queens[i]
                r2, c2 = queens[j]
                assert r1 != r2 and c1 != c2 and abs(r1-r2) != abs(c1-c2)`,
    solution: `def solve_n_queens(n: int) -> list[list[str]]:
    result = []
    cols = set()
    pos_diag = set()  # (row + col)
    neg_diag = set()  # (row - col)
    board = [["." for _ in range(n)] for _ in range(n)]

    def backtrack(row):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row + col) in pos_diag or (row - col) in neg_diag:
                continue
            cols.add(col)
            pos_diag.add(row + col)
            neg_diag.add(row - col)
            board[row][col] = "Q"
            backtrack(row + 1)
            cols.remove(col)
            pos_diag.remove(row + col)
            neg_diag.remove(row - col)
            board[row][col] = "."

    backtrack(0)
    return result`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
];

export { neetcodeBacktracking };
