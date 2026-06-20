import type { SeedKata } from "../types/editor";

const blind75Part5: SeedKata[] = [
  {
    name: "Set Matrix Zeroes",
    category: "matrix",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. Do it in-place.\n\nExample:\nInput: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\n\nConstraints:\n- m == matrix.length\n- n == matrix[0].length\n- 1 <= m, n <= 200\n- -2^31 <= matrix[i][j] <= 2^31 - 1`,
    code: `def set_zeroes(matrix: list[list[int]]) -> None:
    raise NotImplementedError`,
    testCode: `def test_set_zeroes_basic():
    matrix = [[1,1,1],[1,0,1],[1,1,1]]
    set_zeroes(matrix)
    assert matrix == [[1,0,1],[0,0,0],[1,0,1]]

def test_set_zeroes_multiple_zeros():
    matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
    set_zeroes(matrix)
    assert matrix == [[0,0,0,0],[0,4,5,0],[0,3,1,0]]

def test_set_zeroes_no_zeros():
    matrix = [[1,2,3],[4,5,6],[7,8,9]]
    set_zeroes(matrix)
    assert matrix == [[1,2,3],[4,5,6],[7,8,9]]

def test_set_zeroes_single_cell_zero():
    matrix = [[0]]
    set_zeroes(matrix)
    assert matrix == [[0]]`,
    solution: `def set_zeroes(matrix: list[list[int]]) -> None:
    m, n = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][j] == 0 for j in range(n))
    first_col_zero = any(matrix[i][0] == 0 for i in range(m))

    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0

    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0

    if first_row_zero:
        for j in range(n):
            matrix[0][j] = 0

    if first_col_zero:
        for i in range(m):
            matrix[i][0] = 0`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Spiral Matrix",
    category: "matrix",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n matrix, return all elements in spiral order (clockwise from top-left).\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]\n\nConstraints:\n- m == matrix.length\n- n == matrix[0].length\n- 1 <= m, n <= 10\n- -100 <= matrix[i][j] <= 100`,
    code: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    raise NotImplementedError`,
    testCode: `def test_spiral_order_3x3():
    assert spiral_order([[1,2,3],[4,5,6],[7,8,9]]) == [1,2,3,6,9,8,7,4,5]

def test_spiral_order_2x2():
    assert spiral_order([[1,2],[3,4]]) == [1,2,4,3]

def test_spiral_order_single():
    assert spiral_order([[1]]) == [1]

def test_spiral_order_2x3():
    assert spiral_order([[1,2,3],[4,5,6]]) == [1,2,3,6,5,4]`,
    solution: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1

        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1

        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1

        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1

    return result`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Rotate Image",
    category: "matrix",
    language: "python",
    difficulty: "medium",
    description: `Given an n x n 2D matrix representing an image, rotate the image by 90 degrees clockwise. In-place.\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]\n\nConstraints:\n- n == matrix.length == matrix[0].length\n- 1 <= n <= 20\n- -1000 <= matrix[i][j] <= 1000`,
    code: `def rotate(matrix: list[list[int]]) -> None:
    raise NotImplementedError`,
    testCode: `def test_rotate_3x3():
    matrix = [[1,2,3],[4,5,6],[7,8,9]]
    rotate(matrix)
    assert matrix == [[7,4,1],[8,5,2],[9,6,3]]

def test_rotate_4x4():
    matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
    rotate(matrix)
    assert matrix == [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]

def test_rotate_1x1():
    matrix = [[1]]
    rotate(matrix)
    assert matrix == [[1]]

def test_rotate_2x2():
    matrix = [[1,2],[3,4]]
    rotate(matrix)
    assert matrix == [[3,1],[4,2]]`,
    solution: `def rotate(matrix: list[list[int]]) -> None:
    n = len(matrix)

    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

    # Reverse each row
    for i in range(n):
        matrix[i].reverse()`,
    usage: null,
    tags: ["array", "matrix", "blind75"],
  },
  {
    name: "Word Search",
    category: "matrix",
    language: "python",
    difficulty: "medium",
    description: `Given an m x n grid of characters and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). A cell may not be used more than once.\n\nExample:\nInput: board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED"\nOutput: True\n\nConstraints:\n- m == board.length\n- n == board[0].length\n- 1 <= m, n <= 6\n- 1 <= word.length <= 15`,
    code: `def exist(board: list[list[str]], word: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_exist_abcced():
    board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
    assert exist(board, "ABCCED") == True

def test_exist_see():
    board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
    assert exist(board, "SEE") == True

def test_exist_abcb():
    board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
    assert exist(board, "ABCB") == False

def test_exist_single_cell():
    board = [["A"]]
    assert exist(board, "A") == True`,
    solution: `def exist(board: list[list[str]], word: str) -> bool:
    m, n = len(board), len(board[0])

    def dfs(i: int, j: int, k: int) -> bool:
        if k == len(word):
            return True
        if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[k]:
            return False

        temp = board[i][j]
        board[i][j] = '#'

        found = (
            dfs(i + 1, j, k + 1) or
            dfs(i - 1, j, k + 1) or
            dfs(i, j + 1, k + 1) or
            dfs(i, j - 1, k + 1)
        )

        board[i][j] = temp
        return found

    for i in range(m):
        for j in range(n):
            if dfs(i, j, 0):
                return True

    return False`,
    usage: null,
    tags: ["array", "matrix", "backtracking", "blind75"],
  },
];

export { blind75Part5 };
