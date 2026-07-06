import type { SeedKata } from "../types/editor";

const neetcodeBacktracking: SeedKata[] = [
  {
    name: "Combination Sum",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen from candidates an unlimited number of times.\n\nYou may return the combinations in any order. The answer is guaranteed to be fewer than 150 combinations.\n\nExample 1:\nInput: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]\n\nExample 2:\nInput: candidates = [2,3], target = 6\nOutput: [[2,2,2],[3,3]]\n\nConstraints:\n- 1 <= candidates.length <= 30\n- 2 <= candidates[i] <= 40\n- All elements of candidates are distinct.\n- 1 <= target <= 40\n\nRef: LeetCode #39 Combination Sum`,
    code: `def combination_sum(candidates, target)
  raise NotImplementedError
end`,
    testCode: `def test_combination_sum_basic
  result = combination_sum([2,3,6,7], 7)
  actual = result.map(&:sort).sort
  expected = [[2,2,3],[7]].map(&:sort).sort
  assert_equal(expected, actual)
end

def test_combination_sum_two
  result = combination_sum([2,3], 6)
  actual = result.map(&:sort).sort
  expected = [[2,2,2],[3,3]].map(&:sort).sort
  assert_equal(expected, actual)
end

def test_combination_sum_single
  result = combination_sum([7], 7)
  assert_equal([[7]], result)
end

def test_combination_sum_no_result
  result = combination_sum([3,5], 4)
  assert_equal([], result)
end`,
    solution: `def combination_sum(candidates, target)
  result = []

  backtrack = lambda do |start, current, remaining|
    if remaining == 0
      result << current.dup
      return
    end
    (start...candidates.length).each do |i|
      next if candidates[i] > remaining
      current << candidates[i]
      backtrack.call(i, current, remaining - candidates[i])
      current.pop
    end
  end

  backtrack.call(0, [], target)
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Combination Sum II",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given a collection of candidate numbers candidates and a target number target, find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination.\n\nNote: The solution set must not contain duplicate combinations.\n\nExample 1:\nInput: candidates = [10,1,2,7,6,1,5], target = 8\nOutput: [[1,1,6],[1,2,5],[1,7],[2,6]]\n\nExample 2:\nInput: candidates = [2,5,2,1,2], target = 5\nOutput: [[1,2,2],[5]]\n\nConstraints:\n- 1 <= candidates.length <= 100\n- 1 <= candidates[i] <= 50\n- 1 <= target <= 30\n\nRef: LeetCode #40 Combination Sum II`,
    code: `def combination_sum2(candidates, target)
  raise NotImplementedError
end`,
    testCode: `def test_combination_sum2_basic
  result = combination_sum2([10,1,2,7,6,1,5], 8)
  actual = result.map(&:sort).sort
  expected = [[1,1,6],[1,2,5],[1,7],[2,6]].map(&:sort).sort
  assert_equal(expected, actual)
end

def test_combination_sum2_duplicates
  result = combination_sum2([2,5,2,1,2], 5)
  actual = result.map(&:sort).sort
  expected = [[1,2,2],[5]].map(&:sort).sort
  assert_equal(expected, actual)
end

def test_combination_sum2_no_result
  result = combination_sum2([1,1], 5)
  assert_equal([], result)
end

def test_combination_sum2_single
  result = combination_sum2([1], 1)
  assert_equal([[1]], result)
end`,
    solution: `def combination_sum2(candidates, target)
  candidates = candidates.sort
  result = []

  backtrack = lambda do |start, current, remaining|
    if remaining == 0
      result << current.dup
      return
    end
    (start...candidates.length).each do |i|
      break if candidates[i] > remaining
      next if i > start && candidates[i] == candidates[i - 1]
      current << candidates[i]
      backtrack.call(i + 1, current, remaining - candidates[i])
      current.pop
    end
  end

  backtrack.call(0, [], target)
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Subsets II",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.\n\nExample 1:\nInput: nums = [1,2,2]\nOutput: [[], [1], [1,2], [1,2,2], [2], [2,2]]\n\nExample 2:\nInput: nums = [0]\nOutput: [[], [0]]\n\nConstraints:\n- 1 <= nums.length <= 10\n- -10 <= nums[i] <= 10\n\nRef: LeetCode #90 Subsets II`,
    code: `def subsets_with_dup(nums)
  raise NotImplementedError
end`,
    testCode: `def test_subsets_with_dup_basic
  result = subsets_with_dup([1,2,2])
  normalized = result.map(&:sort).sort
  expected = [[], [1], [1,2], [1,2,2], [2], [2,2]].map(&:sort).sort
  assert_equal(expected, normalized)
end

def test_subsets_with_dup_single
  result = subsets_with_dup([0])
  normalized = result.map(&:sort).sort
  expected = [[], [0]].map(&:sort).sort
  assert_equal(expected, normalized)
end

def test_subsets_with_dup_all_same
  result = subsets_with_dup([1,1,1])
  normalized = result.map(&:sort).sort
  expected = [[], [1], [1,1], [1,1,1]].map(&:sort).sort
  assert_equal(expected, normalized)
end`,
    solution: `def subsets_with_dup(nums)
  nums = nums.sort
  result = []

  backtrack = lambda do |start, current|
    result << current.dup
    (start...nums.length).each do |i|
      next if i > start && nums[i] == nums[i - 1]
      current << nums[i]
      backtrack.call(i + 1, current)
      current.pop
    end
  end

  backtrack.call(0, [])
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
  {
    name: "Generate Parentheses",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n\nExample 1:\nInput: n = 3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]\n\nExample 2:\nInput: n = 1\nOutput: ["()"]\n\nConstraints:\n- 1 <= n <= 8\n\nRef: LeetCode #22 Generate Parentheses`,
    code: `def generate_parenthesis(n)
  raise NotImplementedError
end`,
    testCode: `def test_generate_parens_three
  result = generate_parenthesis(3)
  assert_equal(["((()))","(()())","(())()","()(())","()()()"].sort, result.sort)
end

def test_generate_parens_one
  assert_equal(["()"], generate_parenthesis(1))
end

def test_generate_parens_two
  result = generate_parenthesis(2)
  assert_equal(["(())", "()()"].sort, result.sort)
end`,
    solution: `def generate_parenthesis(n)
  result = []

  backtrack = lambda do |current, open_count, close_count|
    if current.length == 2 * n
      result << current
      return
    end
    backtrack.call(current + "(", open_count + 1, close_count) if open_count < n
    backtrack.call(current + ")", open_count, close_count + 1) if close_count < open_count
  end

  backtrack.call("", 0, 0)
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "Palindrome Partitioning",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.\n\nExample 1:\nInput: s = "aab"\nOutput: [["a","a","b"],["aa","b"]]\n\nExample 2:\nInput: s = "a"\nOutput: [["a"]]\n\nConstraints:\n- 1 <= s.length <= 16\n- s contains only lowercase English letters.\n\nRef: LeetCode #131 Palindrome Partitioning`,
    code: `def partition(s)
  raise NotImplementedError
end`,
    testCode: `def test_partition_basic
  result = partition("aab")
  assert_equal([["a","a","b"],["aa","b"]].sort, result.sort)
end

def test_partition_single
  assert_equal([["a"]], partition("a"))
end

def test_partition_palindrome
  result = partition("aba")
  assert_equal([["a","b","a"],["aba"]].sort, result.sort)
end

def test_partition_all_same
  result = partition("aaa")
  assert_equal([["a","a","a"],["a","aa"],["aa","a"],["aaa"]].sort, result.sort)
end`,
    solution: `def partition(s)
  result = []

  is_palindrome = lambda do |sub|
    sub == sub.reverse
  end

  backtrack = lambda do |start, current|
    if start == s.length
      result << current.dup
      return
    end
    ((start + 1)..s.length).each do |end_|
      substr = s[start...end_]
      if is_palindrome.call(substr)
        current << substr
        backtrack.call(end_, current)
        current.pop
      end
    end
  end

  backtrack.call(0, [])
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "Letter Combinations of a Phone Number",
    category: "backtracking",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return an empty list if the input is empty.\n\nPhone keypad mapping:\n2 → abc, 3 → def, 4 → ghi, 5 → jkl\n6 → mno, 7 → pqrs, 8 → tuv, 9 → wxyz\n\nExample 1:\nInput: digits = "23"\nOutput: ["ad","ae","af","bd","be","bf","cd","ce","cf"]\n\nExample 2:\nInput: digits = ""\nOutput: []\n\nExample 3:\nInput: digits = "2"\nOutput: ["a","b","c"]\n\nConstraints:\n- 0 <= digits.length <= 4\n- digits[i] is a digit in the range ['2', '9']\n\nRef: LeetCode #17 Letter Combinations of a Phone Number`,
    code: `def letter_combinations(digits)
  raise NotImplementedError
end`,
    testCode: `def test_letter_combinations_two_digits
  result = letter_combinations("23")
  assert_equal(["ad","ae","af","bd","be","bf","cd","ce","cf"].sort, result.sort)
end

def test_letter_combinations_empty
  assert_equal([], letter_combinations(""))
end

def test_letter_combinations_single
  assert_equal(["a","b","c"].sort, letter_combinations("2").sort)
end

def test_letter_combinations_seven
  assert_equal(["p","q","r","s"].sort, letter_combinations("7").sort)
end`,
    solution: `def letter_combinations(digits)
  return [] if digits.empty?
  phone_map = {
    "2" => "abc", "3" => "def", "4" => "ghi", "5" => "jkl",
    "6" => "mno", "7" => "pqrs", "8" => "tuv", "9" => "wxyz"
  }
  result = []

  backtrack = lambda do |index, current|
    if index == digits.length
      result << current
      return
    end
    phone_map[digits[index]].each_char do |ch|
      backtrack.call(index + 1, current + ch)
    end
  end

  backtrack.call(0, "")
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "string", "neetcode"],
  },
  {
    name: "N Queens",
    category: "backtracking",
    language: "ruby",
    difficulty: "hard",
    description: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.\n\nEach solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.\n\nExample 1:\nInput: n = 4\nOutput: [["..Q.","Q...","...Q",".Q.."],["...Q",".Q..","Q...","..Q."]]\n\nExample 2:\nInput: n = 1\nOutput: [["Q"]]\n\nConstraints:\n- 1 <= n <= 9\n\nRef: LeetCode #51 N-Queens`,
    code: `def solve_n_queens(n)
  raise NotImplementedError
end`,
    testCode: `def test_n_queens_four
  result = solve_n_queens(4)
  assert_equal(2, result.length)
  expected = [["..Q.","Q...","...Q",".Q.."],[".Q..","...Q","Q...","..Q."]]
  assert_equal(expected.sort, result.sort)
end

def test_n_queens_one
  assert_equal([["Q"]], solve_n_queens(1))
end

def test_n_queens_count
  assert_equal(10, solve_n_queens(5).length)
end

def test_n_queens_no_attacks
  solve_n_queens(4).each do |board|
    queens = []
    board.each_with_index do |row, r|
      row.each_char.with_index do |ch, c|
        queens << [r, c] if ch == 'Q'
      end
    end
    (0...queens.length).each do |i|
      ((i + 1)...queens.length).each do |j|
        r1, c1 = queens[i]
        r2, c2 = queens[j]
        assert_true(r1 != r2 && c1 != c2 && (r1 - r2).abs != (c1 - c2).abs)
      end
    end
  end
end`,
    solution: `def solve_n_queens(n)
  result = []
  cols = {}
  pos_diag = {}
  neg_diag = {}
  board = Array.new(n) { Array.new(n, ".") }

  backtrack = lambda do |row|
    if row == n
      result << board.map(&:join)
      return
    end
    (0...n).each do |col|
      next if cols[col] || pos_diag[row + col] || neg_diag[row - col]
      cols[col] = true
      pos_diag[row + col] = true
      neg_diag[row - col] = true
      board[row][col] = "Q"
      backtrack.call(row + 1)
      cols.delete(col)
      pos_diag.delete(row + col)
      neg_diag.delete(row - col)
      board[row][col] = "."
    end
  end

  backtrack.call(0)
  result
end`,
    usage: null,
    tags: ["backtracking", "recursion", "neetcode"],
  },
];

export { neetcodeBacktracking };
