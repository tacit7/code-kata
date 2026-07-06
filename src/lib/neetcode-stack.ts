import type { SeedKata } from "../types/editor";

const neetcodeStack: SeedKata[] = [
  {
    name: "Valid Parentheses",
    category: "stack",
    language: "ruby",
    difficulty: "easy",
    description: `Given a string containing only '(', ')', '{', '}', '[', ']', determine if the input string is valid.\n\nA string is valid if:\n- Open brackets are closed by the same type of bracket.\n- Open brackets are closed in the correct order.\n- Every closing bracket has a corresponding open bracket.\n\nExample 1:\nInput: s = "()"\nOutput: True\n\nExample 2:\nInput: s = "()[{}]"\nOutput: True\n\nExample 3:\nInput: s = "(]"\nOutput: False\n\nConstraints:\n- 1 <= s.length <= 10^4\n- s consists only of '()[]{}'.\n\nRef: LeetCode #20 Valid Parentheses`,
    code: `def is_valid(s)
  raise NotImplementedError
end`,
    testCode: `def test_valid_parens_simple
  assert_equal(true, is_valid("()"))
end

def test_valid_parens_mixed
  assert_equal(true, is_valid("()[{}]"))
end

def test_valid_parens_invalid
  assert_equal(false, is_valid("(]"))
end

def test_valid_parens_empty
  assert_equal(true, is_valid(""))
end

def test_valid_parens_unclosed
  assert_equal(false, is_valid("([)"))
end`,
    solution: `def is_valid(s)
  stack = []
  close_to_open = { ")" => "(", "]" => "[", "}" => "{" }
  s.each_char do |ch|
    if close_to_open.key?(ch)
      return false if stack.empty? || stack[-1] != close_to_open[ch]
      stack.pop
    else
      stack.push(ch)
    end
  end
  stack.empty?
end`,
    usage: null,
    tags: ["stack", "string", "neetcode"],
  },
  {
    name: "Min Stack",
    category: "stack",
    language: "ruby",
    difficulty: "medium",
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class:\n- MinStack() — initializes the stack.\n- push(val) — pushes val onto the stack.\n- pop() — removes the top element.\n- top() — gets the top element.\n- get_min() — retrieves the minimum element.\n\nAll operations must run in O(1) time.\n\nExample:\nms = MinStack()\nms.push(-2)\nms.push(0)\nms.push(-3)\nms.get_min()  # → -3\nms.pop()\nms.top()      # → 0\nms.get_min()  # → -2\n\nRef: LeetCode #155 Min Stack`,
    code: `class MinStack
  def initialize
    raise NotImplementedError
  end

  def push(val)
    raise NotImplementedError
  end

  def pop
    raise NotImplementedError
  end

  def top
    raise NotImplementedError
  end

  def get_min
    raise NotImplementedError
  end
end`,
    testCode: `def test_min_stack_basic
  ms = MinStack.new
  ms.push(-2)
  ms.push(0)
  ms.push(-3)
  assert_equal(-3, ms.get_min)
  ms.pop
  assert_equal(0, ms.top)
  assert_equal(-2, ms.get_min)
end

def test_min_stack_single
  ms = MinStack.new
  ms.push(5)
  assert_equal(5, ms.top)
  assert_equal(5, ms.get_min)
end

def test_min_stack_equal_values
  ms = MinStack.new
  ms.push(1)
  ms.push(1)
  assert_equal(1, ms.get_min)
  ms.pop
  assert_equal(1, ms.get_min)
end`,
    solution: `class MinStack
  def initialize
    @stack = []
    @min_stack = []
  end

  def push(val)
    @stack.push(val)
    min_val = @min_stack.empty? ? val : [val, @min_stack[-1]].min
    @min_stack.push(min_val)
  end

  def pop
    @stack.pop
    @min_stack.pop
  end

  def top
    @stack[-1]
  end

  def get_min
    @min_stack[-1]
  end
end`,
    usage: null,
    tags: ["stack", "design", "neetcode"],
  },
  {
    name: "Evaluate Reverse Polish Notation",
    category: "stack",
    language: "ruby",
    difficulty: "medium",
    description: `Evaluate an expression in Reverse Polish Notation (postfix). Valid operators are +, -, *, /. Division truncates toward zero. No division by zero will occur.\n\nExample 1:\nInput: tokens = ["2","1","+","3","*"]\nOutput: 9  ((2+1)*3)\n\nExample 2:\nInput: tokens = ["4","13","5","/","+"]\nOutput: 6  (4+(13/5))\n\nExample 3:\nInput: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]\nOutput: 22\n\nConstraints:\n- 1 <= tokens.length <= 10^4\n- tokens[i] is an integer or one of +, -, *, /\n\nRef: LeetCode #150 Evaluate Reverse Polish Notation`,
    code: `def eval_rpn(tokens)
  raise NotImplementedError
end`,
    testCode: `def test_eval_rpn_add_mul
  assert_equal(9, eval_rpn(["2","1","+","3","*"]))
end

def test_eval_rpn_div
  assert_equal(6, eval_rpn(["4","13","5","/","+"]))
end

def test_eval_rpn_complex
  assert_equal(22, eval_rpn(["10","6","9","3","+","-11","*","/","*","17","+","5","+"]))
end

def test_eval_rpn_single
  assert_equal(3, eval_rpn(["3"]))
end

def test_eval_rpn_negative_div
  assert_equal(-13, eval_rpn(["3","11","5","+","-"]))
end`,
    solution: `def eval_rpn(tokens)
  stack = []
  ops = {
    "+" => ->(a, b) { a + b },
    "-" => ->(a, b) { a - b },
    "*" => ->(a, b) { a * b },
    "/" => ->(a, b) { (a.to_f / b).truncate },
  }
  tokens.each do |token|
    if ops.key?(token)
      b = stack.pop
      a = stack.pop
      stack.push(ops[token].call(a, b))
    else
      stack.push(token.to_i)
    end
  end
  stack[0]
end`,
    usage: null,
    tags: ["stack", "math", "neetcode"],
  },
  {
    name: "Daily Temperatures",
    category: "stack",
    language: "ruby",
    difficulty: "medium",
    description: `Given a list of daily temperatures, return a list where answer[i] is the number of days until a warmer temperature. If no future warmer day exists, answer[i] = 0.\n\nExample 1:\nInput: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\n\nExample 2:\nInput: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]\n\nExample 3:\nInput: temperatures = [30,60,90]\nOutput: [1,1,0]\n\nConstraints:\n- 1 <= temperatures.length <= 10^5\n- 30 <= temperatures[i] <= 100\n\nRef: LeetCode #739 Daily Temperatures`,
    code: `def daily_temperatures(temperatures)
  raise NotImplementedError
end`,
    testCode: `def test_daily_temps_basic
  assert_equal([1,1,4,2,1,1,0,0], daily_temperatures([73,74,75,71,69,72,76,73]))
end

def test_daily_temps_ascending
  assert_equal([1,1,1,0], daily_temperatures([30,40,50,60]))
end

def test_daily_temps_simple
  assert_equal([1,1,0], daily_temperatures([30,60,90]))
end

def test_daily_temps_descending
  assert_equal([0,0,0,0], daily_temperatures([90,80,70,60]))
end`,
    solution: `def daily_temperatures(temperatures)
  result = Array.new(temperatures.length, 0)
  stack = [] # [temp, index]
  temperatures.each_with_index do |t, i|
    while !stack.empty? && t > stack[-1][0]
      _, j = stack.pop
      result[j] = i - j
    end
    stack.push([t, i])
  end
  result
end`,
    usage: null,
    tags: ["stack", "monotonic-stack", "array", "neetcode"],
  },
  {
    name: "Car Fleet",
    category: "stack",
    language: "ruby",
    difficulty: "medium",
    description: `N cars are heading to a target destination on a single-lane road. You are given arrays position and speed. A car can never pass another; if it catches up it becomes part of that fleet and moves at the slower speed.\n\nReturn the number of fleets that arrive at the destination.\n\nExample 1:\nInput: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]\nOutput: 3\n\nExample 2:\nInput: target = 10, position = [3], speed = [3]\nOutput: 1\n\nConstraints:\n- 1 <= target <= 10^6\n- 0 < position[i] < target\n- All positions are unique\n\nRef: LeetCode #853 Car Fleet`,
    code: `def car_fleet(target, position, speed)
  raise NotImplementedError
end`,
    testCode: `def test_car_fleet_basic
  assert_equal(3, car_fleet(12, [10,8,0,5,3], [2,4,1,1,3]))
end

def test_car_fleet_single
  assert_equal(1, car_fleet(10, [3], [3]))
end

def test_car_fleet_all_merge
  assert_equal(1, car_fleet(100, [0,2,4], [4,2,1]))
end

def test_car_fleet_none_merge
  assert_equal(2, car_fleet(10, [6,8], [3,2]))
end`,
    solution: `def car_fleet(target, position, speed)
  pairs = position.zip(speed).sort_by { |pos, _| -pos }
  stack = []
  pairs.each do |pos, spd|
    time = (target - pos).to_f / spd
    stack.push(time) if stack.empty? || time > stack[-1]
  end
  stack.length
end`,
    usage: null,
    tags: ["stack", "sorting", "math", "neetcode"],
  },
  {
    name: "Largest Rectangle In Histogram",
    category: "stack",
    language: "ruby",
    difficulty: "hard",
    description: `Given an array of integers heights representing the histogram's bar heights where each bar has width 1, return the area of the largest rectangle in the histogram.\n\nExample 1:\nInput: heights = [2,1,5,6,2,3]\nOutput: 10  (rectangle spanning bars 2-3 with height 5)\n\nExample 2:\nInput: heights = [2,4]\nOutput: 4\n\nConstraints:\n- 1 <= heights.length <= 10^5\n- 0 <= heights[i] <= 10^4\n\nRef: LeetCode #84 Largest Rectangle in Histogram`,
    code: `def largest_rectangle_area(heights)
  raise NotImplementedError
end`,
    testCode: `def test_largest_rect_basic
  assert_equal(10, largest_rectangle_area([2,1,5,6,2,3]))
end

def test_largest_rect_two
  assert_equal(4, largest_rectangle_area([2,4]))
end

def test_largest_rect_uniform
  assert_equal(9, largest_rectangle_area([3,3,3]))
end

def test_largest_rect_single
  assert_equal(5, largest_rectangle_area([5]))
end

def test_largest_rect_ascending
  assert_equal(9, largest_rectangle_area([1,2,3,4,5]))
end`,
    solution: `def largest_rectangle_area(heights)
  stack = [] # [index, height]
  max_area = 0
  heights.each_with_index do |h, i|
    start = i
    while !stack.empty? && stack[-1][1] > h
      idx, height = stack.pop
      max_area = [max_area, height * (i - idx)].max
      start = idx
    end
    stack.push([start, h])
  end
  stack.each do |idx, height|
    max_area = [max_area, height * (heights.length - idx)].max
  end
  max_area
end`,
    usage: null,
    tags: ["stack", "monotonic-stack", "array", "neetcode"],
  },
];

export { neetcodeStack };
