import type { SeedKata } from "../types/editor";

const blind75Part5: SeedKata[] = [
  {
    name: "Set Matrix Zeroes",
    category: "matrix",
    language: "ruby",
    difficulty: "medium",
    description: `Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. Do it in-place.\n\nExample:\nInput: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\n\nConstraints:\n- m == matrix.length\n- n == matrix[0].length\n- 1 <= m, n <= 200\n- -2^31 <= matrix[i][j] <= 2^31 - 1`,
    code: `def set_zeroes(matrix)
  raise NotImplementedError
end`,
    testCode: `def test_set_zeroes_basic
  matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
  set_zeroes(matrix)
  assert_equal([[1, 0, 1], [0, 0, 0], [1, 0, 1]], matrix)
end

def test_set_zeroes_multiple_zeros
  matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
  set_zeroes(matrix)
  assert_equal([[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]], matrix)
end

def test_set_zeroes_no_zeros
  matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  set_zeroes(matrix)
  assert_equal([[1, 2, 3], [4, 5, 6], [7, 8, 9]], matrix)
end

def test_set_zeroes_single_cell_zero
  matrix = [[0]]
  set_zeroes(matrix)
  assert_equal([[0]], matrix)
end`,
    solution: `def set_zeroes(matrix)
  m = matrix.length
  n = matrix[0].length
  first_row_zero = (0...n).any? { |j| matrix[0][j] == 0 }
  first_col_zero = (0...m).any? { |i| matrix[i][0] == 0 }

  (1...m).each do |i|
    (1...n).each do |j|
      if matrix[i][j] == 0
        matrix[i][0] = 0
        matrix[0][j] = 0
      end
    end
  end

  (1...m).each do |i|
    (1...n).each do |j|
      if matrix[i][0] == 0 || matrix[0][j] == 0
        matrix[i][j] = 0
      end
    end
  end

  if first_row_zero
    (0...n).each { |j| matrix[0][j] = 0 }
  end

  if first_col_zero
    (0...m).each { |i| matrix[i][0] = 0 }
  end

  nil
end`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Spiral Matrix",
    category: "matrix",
    language: "ruby",
    difficulty: "medium",
    description: `Given an m x n matrix, return all elements in spiral order (clockwise from top-left).\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]\n\nConstraints:\n- m == matrix.length\n- n == matrix[0].length\n- 1 <= m, n <= 10\n- -100 <= matrix[i][j] <= 100`,
    code: `def spiral_order(matrix)
  raise NotImplementedError
end`,
    testCode: `def test_spiral_order_3x3
  assert_equal([1, 2, 3, 6, 9, 8, 7, 4, 5], spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
end

def test_spiral_order_2x2
  assert_equal([1, 2, 4, 3], spiral_order([[1, 2], [3, 4]]))
end

def test_spiral_order_single
  assert_equal([1], spiral_order([[1]]))
end

def test_spiral_order_2x3
  assert_equal([1, 2, 3, 6, 5, 4], spiral_order([[1, 2, 3], [4, 5, 6]]))
end`,
    solution: `def spiral_order(matrix)
  result = []
  top = 0
  bottom = matrix.length - 1
  left = 0
  right = matrix[0].length - 1

  while top <= bottom && left <= right
    (left..right).each { |col| result.push(matrix[top][col]) }
    top += 1

    (top..bottom).each { |row| result.push(matrix[row][right]) }
    right -= 1

    if top <= bottom
      right.downto(left) { |col| result.push(matrix[bottom][col]) }
      bottom -= 1
    end

    if left <= right
      bottom.downto(top) { |row| result.push(matrix[row][left]) }
      left += 1
    end
  end

  result
end`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Rotate Image",
    category: "matrix",
    language: "ruby",
    difficulty: "medium",
    description: `Given an n x n 2D matrix representing an image, rotate the image by 90 degrees clockwise. In-place.\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]\n\nConstraints:\n- n == matrix.length == matrix[0].length\n- 1 <= n <= 20\n- -1000 <= matrix[i][j] <= 1000`,
    code: `def rotate(matrix)
  raise NotImplementedError
end`,
    testCode: `def test_rotate_3x3
  matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  rotate(matrix)
  assert_equal([[7, 4, 1], [8, 5, 2], [9, 6, 3]], matrix)
end

def test_rotate_4x4
  matrix = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]
  rotate(matrix)
  assert_equal([[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]], matrix)
end

def test_rotate_1x1
  matrix = [[1]]
  rotate(matrix)
  assert_equal([[1]], matrix)
end

def test_rotate_2x2
  matrix = [[1, 2], [3, 4]]
  rotate(matrix)
  assert_equal([[3, 1], [4, 2]], matrix)
end`,
    solution: `def rotate(matrix)
  n = matrix.length

  # Transpose
  (0...n).each do |i|
    (i + 1...n).each do |j|
      matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    end
  end

  # Reverse each row
  (0...n).each do |i|
    matrix[i].reverse!
  end

  nil
end`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Word Search",
    category: "matrix",
    language: "ruby",
    difficulty: "medium",
    description: `Given an m x n grid of characters and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). A cell may not be used more than once.\n\nExample:\nInput: board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED"\nOutput: True\n\nConstraints:\n- m == board.length\n- n == board[0].length\n- 1 <= m, n <= 6\n- 1 <= word.length <= 15`,
    code: `def exist(board, word)
  raise NotImplementedError
end`,
    testCode: `def test_exist_abcced
  board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
  assert_equal(true, exist(board, "ABCCED"))
end

def test_exist_see
  board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
  assert_equal(true, exist(board, "SEE"))
end

def test_exist_abcb
  board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
  assert_equal(false, exist(board, "ABCB"))
end

def test_exist_single_cell
  board = [["A"]]
  assert_equal(true, exist(board, "A"))
end`,
    solution: `def exist(board, word)
  m = board.length
  n = board[0].length

  dfs = lambda do |i, j, k|
    next true if k == word.length
    if i < 0 || i >= m || j < 0 || j >= n || board[i][j] != word[k]
      next false
    end

    temp = board[i][j]
    board[i][j] = '#'

    found = dfs.call(i + 1, j, k + 1) ||
            dfs.call(i - 1, j, k + 1) ||
            dfs.call(i, j + 1, k + 1) ||
            dfs.call(i, j - 1, k + 1)

    board[i][j] = temp
    found
  end

  (0...m).each do |i|
    (0...n).each do |j|
      return true if dfs.call(i, j, 0)
    end
  end

  false
end`,
    usage: null,
    tags: ["array", "matrix", "backtracking", "blind75"],
  },
];

export { blind75Part5 };
