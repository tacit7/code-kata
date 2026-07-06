import type { SeedKata } from "../types/editor";

const blind75Part4: SeedKata[] = [
  // 30. Insert Interval
  {
    name: "Insert Interval",
    category: "intervals",
    language: "ruby",
    difficulty: "medium",
    description: `Given a list of non-overlapping intervals sorted by start, insert a new interval and merge if necessary.\n\nExample:\nInput: intervals=[[1,3],[6,9]], newInterval=[2,5]\nOutput: [[1,5],[6,9]]\n\nConstraints:\n- 0 <= intervals.length <= 10^4\n- intervals sorted by start\n- No overlap in existing intervals`,
    code: `def insert(intervals, new_interval)
  raise NotImplementedError
end`,
    testCode: `def test_insert_basic
  assert_equal([[1,5],[6,9]], insert([[1,3],[6,9]], [2,5]))
end

def test_no_overlap
  assert_equal([[1,2],[3,10],[12,16]], insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]))
end

def test_empty
  assert_equal([[5,7]], insert([], [5,7]))
end

def test_at_start
  assert_equal([[1,2],[3,5],[6,9]], insert([[3,5],[6,9]], [1,2]))
end`,
    solution: `def insert(intervals, new_interval)
  result = []
  i = 0
  n = intervals.length

  # Collect all intervals that come before new_interval
  while i < n && intervals[i][1] < new_interval[0]
    result << intervals[i]
    i += 1
  end

  # Merge overlapping intervals with new_interval
  while i < n && intervals[i][0] <= new_interval[1]
    new_interval[0] = [new_interval[0], intervals[i][0]].min
    new_interval[1] = [new_interval[1], intervals[i][1]].max
    i += 1
  end
  result << new_interval

  # Collect remaining intervals
  while i < n
    result << intervals[i]
    i += 1
  end

  result
end`,
    usage: null,
    tags: ["array", "intervals", "blind75"],
  },

  // 31. Non-overlapping Intervals
  {
    name: "Non-overlapping Intervals",
    category: "intervals",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.\n\nExample:\nInput: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\n\nConstraints:\n- 1 <= intervals.length <= 10^5\n- -5 * 10^4 <= start < end <= 5 * 10^4`,
    code: `def erase_overlap_intervals(intervals)
  raise NotImplementedError
end`,
    testCode: `def test_one_removal
  assert_equal(1, erase_overlap_intervals([[1,2],[2,3],[3,4],[1,3]]))
end

def test_two_removals
  assert_equal(2, erase_overlap_intervals([[1,2],[1,2],[1,2]]))
end

def test_no_removal
  assert_equal(0, erase_overlap_intervals([[1,2],[2,3]]))
end

def test_multiple_overlaps
  assert_equal(2, erase_overlap_intervals([[1,100],[11,22],[1,11],[2,12]]))
end`,
    solution: `def erase_overlap_intervals(intervals)
  return 0 if intervals.empty?

  # Sort by end time (greedy: keep interval that ends earliest)
  intervals = intervals.sort_by { |x| x[1] }

  removals = 0
  prev_end = intervals[0][1]

  (1...intervals.length).each do |i|
    if intervals[i][0] < prev_end
      # Overlap — remove this interval
      removals += 1
    else
      # No overlap — update prev_end
      prev_end = intervals[i][1]
    end
  end

  removals
end`,
    usage: null,
    tags: ["array", "intervals", "greedy", "blind75"],
  },

  // 32. Meeting Rooms
  {
    name: "Meeting Rooms",
    category: "intervals",
    language: "ruby",
    difficulty: "easy",
    description: `Given an array of meeting time intervals [start, end], determine if a person could attend all meetings (no overlaps).\n\nExample:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: False\n\nConstraints:\n- 0 <= intervals.length <= 10^4`,
    code: `def can_attend_meetings(intervals)
  raise NotImplementedError
end`,
    testCode: `def test_overlapping
  assert_equal(false, can_attend_meetings([[0,30],[5,10],[15,20]]))
end

def test_no_overlap
  assert_equal(true, can_attend_meetings([[7,10],[2,4]]))
end

def test_empty
  assert_equal(true, can_attend_meetings([]))
end

def test_back_to_back
  assert_equal(true, can_attend_meetings([[1,5],[5,10]]))
end`,
    solution: `def can_attend_meetings(intervals)
  return true if intervals.empty?

  # Sort by start time
  intervals = intervals.sort_by { |x| x[0] }

  (1...intervals.length).each do |i|
    # If current start is before previous end, overlap exists
    return false if intervals[i][0] < intervals[i - 1][1]
  end

  true
end`,
    usage: null,
    tags: ["array", "intervals", "sorting", "blind75"],
  },

  // 33. Meeting Rooms II
  {
    name: "Meeting Rooms II",
    category: "intervals",
    language: "ruby",
    difficulty: "medium",
    description: `Given meeting time intervals, return the minimum number of conference rooms required.\n\nExample:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\n\nConstraints:\n- 1 <= intervals.length <= 10^4`,
    code: `def min_meeting_rooms(intervals)
  raise NotImplementedError
end`,
    testCode: `def test_two_rooms
  assert_equal(2, min_meeting_rooms([[0,30],[5,10],[15,20]]))
end

def test_one_room
  assert_equal(1, min_meeting_rooms([[7,10],[2,4]]))
end

def test_two_rooms_complex
  assert_equal(2, min_meeting_rooms([[1,5],[8,9],[2,6]]))
end

def test_single
  assert_equal(1, min_meeting_rooms([[1,10]]))
end`,
    solution: `def min_meeting_rooms(intervals)
  return 0 if intervals.empty?

  # Sort by start time
  intervals = intervals.sort_by { |x| x[0] }

  # Sorted array of end times standing in for a min-heap (no gems allowed)
  ends = []

  intervals.each do |start, fin|
    if !ends.empty? && ends[0] <= start
      # Reuse a room: pop the earliest ending meeting
      ends.shift
    end
    idx = ends.bsearch_index { |e| e >= fin } || ends.length
    ends.insert(idx, fin)
  end

  ends.length
end`,
    usage: null,
    tags: ["array", "intervals", "heap", "blind75"],
  },

  // 34. Merge Two Sorted Lists
  {
    name: "Merge Two Sorted Lists",
    category: "linked-list",
    language: "ruby",
    difficulty: "easy",
    description: `Merge two sorted linked lists and return the merged list.\n\nExample:\nInput: l1=[1,2,4], l2=[1,3,4]\nOutput: [1,1,2,3,4,4]\n\nConstraints:\n- 0 <= number of nodes <= 50\n- -100 <= Node.val <= 100`,
    code: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def merge_two_lists(l1, l2)
  raise NotImplementedError
end`,
    testCode: `def make_list(vals)
  dummy = ListNode.new(0)
  cur = dummy
  vals.each do |v|
    cur.next = ListNode.new(v)
    cur = cur.next
  end
  dummy.next
end

def to_list(node)
  result = []
  while node
    result << node.val
    node = node.next
  end
  result
end

def test_basic_merge
  assert_equal([1,1,2,3,4,4], to_list(merge_two_lists(make_list([1,2,4]), make_list([1,3,4]))))
end

def test_empty_first
  assert_equal([1,2,3], to_list(merge_two_lists(make_list([]), make_list([1,2,3]))))
end

def test_empty_second
  assert_equal([1,2,3], to_list(merge_two_lists(make_list([1,2,3]), make_list([]))))
end

def test_both_empty
  assert_equal([], to_list(merge_two_lists(make_list([]), make_list([]))))
end`,
    solution: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def merge_two_lists(l1, l2)
  dummy = ListNode.new(0)
  cur = dummy

  while l1 && l2
    if l1.val <= l2.val
      cur.next = l1
      l1 = l1.next
    else
      cur.next = l2
      l2 = l2.next
    end
    cur = cur.next
  end

  cur.next = l1 ? l1 : l2

  dummy.next
end`,
    usage: null,
    tags: ["linked-list", "blind75"],
  },

  // 35. Merge K Sorted Lists
  {
    name: "Merge K Sorted Lists",
    category: "linked-list",
    language: "ruby",
    difficulty: "hard",
    description: `Merge k sorted linked lists into one sorted linked list.\n\nExample:\nInput: lists=[[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\n\nConstraints:\n- k == lists.length\n- 0 <= k <= 10^4\n- 0 <= nodes per list <= 500`,
    code: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def merge_k_lists(lists)
  raise NotImplementedError
end`,
    testCode: `def make_list(vals)
  dummy = ListNode.new(0)
  cur = dummy
  vals.each do |v|
    cur.next = ListNode.new(v)
    cur = cur.next
  end
  dummy.next
end

def to_list(node)
  result = []
  while node
    result << node.val
    node = node.next
  end
  result
end

def test_three_lists
  lists = [make_list([1,4,5]), make_list([1,3,4]), make_list([2,6])]
  assert_equal([1,1,2,3,4,4,5,6], to_list(merge_k_lists(lists)))
end

def test_empty_lists
  assert_equal([], to_list(merge_k_lists([])))
end

def test_single_list
  assert_equal([1,2,3], to_list(merge_k_lists([make_list([1,2,3])])))
end

def test_lists_with_empty
  lists = [make_list([1,2]), make_list([]), make_list([3,4])]
  assert_equal([1,2,3,4], to_list(merge_k_lists(lists)))
end`,
    solution: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def merge_k_lists(lists)
  lists = lists.dup
  dummy = ListNode.new(0)
  cur = dummy

  loop do
    min_idx = nil
    lists.each_with_index do |node, i|
      next unless node
      min_idx = i if min_idx.nil? || node.val < lists[min_idx].val
    end
    break if min_idx.nil?

    cur.next = lists[min_idx]
    cur = cur.next
    lists[min_idx] = lists[min_idx].next
  end

  dummy.next
end`,
    usage: null,
    tags: ["linked-list", "heap", "divide-and-conquer", "blind75"],
  },

  // 36. Remove Nth Node From End of List
  {
    name: "Remove Nth Node From End of List",
    category: "linked-list",
    language: "ruby",
    difficulty: "medium",
    description: `Given the head of a linked list, remove the nth node from the end and return the head.\n\nExample:\nInput: head=[1,2,3,4,5], n=2\nOutput: [1,2,3,5]\n\nConstraints:\n- 1 <= sz <= 30\n- 0 <= Node.val <= 100\n- 1 <= n <= sz`,
    code: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def remove_nth_from_end(head, n)
  raise NotImplementedError
end`,
    testCode: `def make_list(vals)
  dummy = ListNode.new(0)
  cur = dummy
  vals.each do |v|
    cur.next = ListNode.new(v)
    cur = cur.next
  end
  dummy.next
end

def to_list(node)
  result = []
  while node
    result << node.val
    node = node.next
  end
  result
end

def test_remove_second_from_end
  assert_equal([1,2,3,5], to_list(remove_nth_from_end(make_list([1,2,3,4,5]), 2)))
end

def test_remove_only_node
  assert_equal([], to_list(remove_nth_from_end(make_list([1]), 1)))
end

def test_remove_first
  assert_equal([2], to_list(remove_nth_from_end(make_list([1,2]), 2)))
end

def test_remove_last
  assert_equal([1,2], to_list(remove_nth_from_end(make_list([1,2,3]), 1)))
end`,
    solution: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def remove_nth_from_end(head, n)
  dummy = ListNode.new(0)
  dummy.next = head
  fast = dummy
  slow = dummy

  # Advance fast pointer n+1 steps ahead
  (n + 1).times do
    fast = fast.next
  end

  # Move both until fast reaches end
  while fast
    fast = fast.next
    slow = slow.next
  end

  # Remove the nth node from end
  slow.next = slow.next.next

  dummy.next
end`,
    usage: null,
    tags: ["linked-list", "two-pointers", "blind75"],
  },

  // 37. Reorder List
  {
    name: "Reorder List",
    category: "linked-list",
    language: "ruby",
    difficulty: "medium",
    description: `Given a singly linked list L0→L1→…→Ln, reorder it to L0→Ln→L1→Ln-1→L2→Ln-2→…. Modify in-place.\n\nExample:\nInput: head=[1,2,3,4]\nOutput: [1,4,2,3]\n\nConstraints:\n- 1 <= number of nodes <= 5*10^4\n- 1 <= Node.val <= 1000`,
    code: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def reorder_list(head)
  raise NotImplementedError
end`,
    testCode: `def make_list(vals)
  dummy = ListNode.new(0)
  cur = dummy
  vals.each do |v|
    cur.next = ListNode.new(v)
    cur = cur.next
  end
  dummy.next
end

def to_list(node)
  result = []
  while node
    result << node.val
    node = node.next
  end
  result
end

def test_even_length
  head = make_list([1,2,3,4])
  reorder_list(head)
  assert_equal([1,4,2,3], to_list(head))
end

def test_odd_length
  head = make_list([1,2,3,4,5])
  reorder_list(head)
  assert_equal([1,5,2,4,3], to_list(head))
end

def test_two_nodes
  head = make_list([1,2])
  reorder_list(head)
  assert_equal([1,2], to_list(head))
end

def test_single_node
  head = make_list([1])
  reorder_list(head)
  assert_equal([1], to_list(head))
end`,
    solution: `class ListNode
  attr_accessor :val, :next

  def initialize(val = 0, next_node = nil)
    @val = val
    @next = next_node
  end
end

def reorder_list(head)
  return if !head || !head.next

  # Step 1: Find the middle of the list using slow/fast pointers
  slow = head
  fast = head
  while fast.next && fast.next.next
    slow = slow.next
    fast = fast.next.next
  end

  # Step 2: Reverse the second half
  prev = nil
  cur = slow.next
  slow.next = nil # Cut the list in half
  while cur
    nxt = cur.next
    cur.next = prev
    prev = cur
    cur = nxt
  end
  second = prev

  # Step 3: Merge the two halves
  first = head
  while second
    tmp1 = first.next
    tmp2 = second.next
    first.next = second
    second.next = tmp1
    first = tmp1
    second = tmp2
  end
end`,
    usage: null,
    tags: ["linked-list", "two-pointers", "blind75"],
  },
];

export { blind75Part4 };
