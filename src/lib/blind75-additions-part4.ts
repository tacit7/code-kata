import type { SeedKata } from "../types/editor";

const blind75Part4: SeedKata[] = [
  // 30. Insert Interval
  {
    name: "Insert Interval",
    category: "intervals",
    language: "python",
    difficulty: "medium",
    description: `Given a list of non-overlapping intervals sorted by start, insert a new interval and merge if necessary.\n\nExample:\nInput: intervals=[[1,3],[6,9]], newInterval=[2,5]\nOutput: [[1,5],[6,9]]\n\nConstraints:\n- 0 <= intervals.length <= 10^4\n- intervals sorted by start\n- No overlap in existing intervals`,
    code: `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_insert_basic():
    assert insert([[1,3],[6,9]], [2,5]) == [[1,5],[6,9]]

def test_no_overlap():
    assert insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]) == [[1,2],[3,10],[12,16]]

def test_empty():
    assert insert([], [5,7]) == [[5,7]]

def test_at_start():
    assert insert([[3,5],[6,9]], [1,2]) == [[1,2],[3,5],[6,9]]`,
    solution: `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    result = []
    i = 0
    n = len(intervals)

    # Collect all intervals that come before new_interval
    while i < n and intervals[i][1] < new_interval[0]:
        result.append(intervals[i])
        i += 1

    # Merge overlapping intervals with new_interval
    while i < n and intervals[i][0] <= new_interval[1]:
        new_interval[0] = min(new_interval[0], intervals[i][0])
        new_interval[1] = max(new_interval[1], intervals[i][1])
        i += 1
    result.append(new_interval)

    # Collect remaining intervals
    while i < n:
        result.append(intervals[i])
        i += 1

    return result`,
    usage: null,
    tags: ["array", "intervals", "blind75"],
  },

  // 31. Non-overlapping Intervals
  {
    name: "Non-overlapping Intervals",
    category: "intervals",
    language: "python",
    difficulty: "medium",
    description: `Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.\n\nExample:\nInput: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\n\nConstraints:\n- 1 <= intervals.length <= 10^5\n- -5 * 10^4 <= start < end <= 5 * 10^4`,
    code: `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_one_removal():
    assert erase_overlap_intervals([[1,2],[2,3],[3,4],[1,3]]) == 1

def test_two_removals():
    assert erase_overlap_intervals([[1,2],[1,2],[1,2]]) == 2

def test_no_removal():
    assert erase_overlap_intervals([[1,2],[2,3]]) == 0

def test_multiple_overlaps():
    assert erase_overlap_intervals([[1,100],[11,22],[1,11],[2,12]]) == 2`,
    solution: `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    if not intervals:
        return 0

    # Sort by end time (greedy: keep interval that ends earliest)
    intervals.sort(key=lambda x: x[1])

    removals = 0
    prev_end = intervals[0][1]

    for i in range(1, len(intervals)):
        if intervals[i][0] < prev_end:
            # Overlap — remove this interval
            removals += 1
        else:
            # No overlap — update prev_end
            prev_end = intervals[i][1]

    return removals`,
    usage: null,
    tags: ["array", "intervals", "greedy", "blind75"],
  },

  // 32. Meeting Rooms
  {
    name: "Meeting Rooms",
    category: "intervals",
    language: "python",
    difficulty: "easy",
    description: `Given an array of meeting time intervals [start, end], determine if a person could attend all meetings (no overlaps).\n\nExample:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: False\n\nConstraints:\n- 0 <= intervals.length <= 10^4`,
    code: `def can_attend_meetings(intervals: list[list[int]]) -> bool:
    raise NotImplementedError`,
    testCode: `def test_overlapping():
    assert can_attend_meetings([[0,30],[5,10],[15,20]]) == False

def test_no_overlap():
    assert can_attend_meetings([[7,10],[2,4]]) == True

def test_empty():
    assert can_attend_meetings([]) == True

def test_back_to_back():
    assert can_attend_meetings([[1,5],[5,10]]) == True`,
    solution: `def can_attend_meetings(intervals: list[list[int]]) -> bool:
    if not intervals:
        return True

    # Sort by start time
    intervals.sort(key=lambda x: x[0])

    for i in range(1, len(intervals)):
        # If current start is before previous end, overlap exists
        if intervals[i][0] < intervals[i - 1][1]:
            return False

    return True`,
    usage: null,
    tags: ["array", "intervals", "sorting", "blind75"],
  },

  // 33. Meeting Rooms II
  {
    name: "Meeting Rooms II",
    category: "intervals",
    language: "python",
    difficulty: "medium",
    description: `Given meeting time intervals, return the minimum number of conference rooms required.\n\nExample:\nInput: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\n\nConstraints:\n- 1 <= intervals.length <= 10^4`,
    code: `import heapq

def min_meeting_rooms(intervals: list[list[int]]) -> int:
    raise NotImplementedError`,
    testCode: `def test_two_rooms():
    assert min_meeting_rooms([[0,30],[5,10],[15,20]]) == 2

def test_one_room():
    assert min_meeting_rooms([[7,10],[2,4]]) == 1

def test_two_rooms_complex():
    assert min_meeting_rooms([[1,5],[8,9],[2,6]]) == 2

def test_single():
    assert min_meeting_rooms([[1,10]]) == 1`,
    solution: `import heapq

def min_meeting_rooms(intervals: list[list[int]]) -> int:
    if not intervals:
        return 0

    # Sort by start time
    intervals.sort(key=lambda x: x[0])

    # Min-heap tracking end times of ongoing meetings
    heap = []

    for start, end in intervals:
        if heap and heap[0] <= start:
            # Reuse a room: pop the earliest ending meeting
            heapq.heappop(heap)
        heapq.heappush(heap, end)

    return len(heap)`,
    usage: null,
    tags: ["array", "intervals", "heap", "blind75"],
  },

  // 34. Merge Two Sorted Lists
  {
    name: "Merge Two Sorted Lists",
    category: "linked-list",
    language: "python",
    difficulty: "easy",
    description: `Merge two sorted linked lists and return the merged list.\n\nExample:\nInput: l1=[1,2,4], l2=[1,3,4]\nOutput: [1,1,2,3,4,4]\n\nConstraints:\n- 0 <= number of nodes <= 50\n- -100 <= Node.val <= 100`,
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_two_lists(l1, l2):
    raise NotImplementedError`,
    testCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

def test_basic_merge():
    assert to_list(merge_two_lists(make_list([1,2,4]), make_list([1,3,4]))) == [1,1,2,3,4,4]

def test_empty_first():
    assert to_list(merge_two_lists(make_list([]), make_list([1,2,3]))) == [1,2,3]

def test_empty_second():
    assert to_list(merge_two_lists(make_list([1,2,3]), make_list([]))) == [1,2,3]

def test_both_empty():
    assert to_list(merge_two_lists(make_list([]), make_list([]))) == []`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    cur = dummy

    while l1 and l2:
        if l1.val <= l2.val:
            cur.next = l1
            l1 = l1.next
        else:
            cur.next = l2
            l2 = l2.next
        cur = cur.next

    cur.next = l1 if l1 else l2

    return dummy.next`,
    usage: null,
    tags: ["linked-list", "blind75"],
  },

  // 35. Merge K Sorted Lists
  {
    name: "Merge K Sorted Lists",
    category: "linked-list",
    language: "python",
    difficulty: "hard",
    description: `Merge k sorted linked lists into one sorted linked list.\n\nExample:\nInput: lists=[[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\n\nConstraints:\n- k == lists.length\n- 0 <= k <= 10^4\n- 0 <= nodes per list <= 500`,
    code: `import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    raise NotImplementedError`,
    testCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

def test_three_lists():
    lists = [make_list([1,4,5]), make_list([1,3,4]), make_list([2,6])]
    assert to_list(merge_k_lists(lists)) == [1,1,2,3,4,4,5,6]

def test_empty_lists():
    assert to_list(merge_k_lists([])) == []

def test_single_list():
    assert to_list(merge_k_lists([make_list([1,2,3])])) == [1,2,3]

def test_lists_with_empty():
    lists = [make_list([1,2]), make_list([]), make_list([3,4])]
    assert to_list(merge_k_lists(lists)) == [1,2,3,4]`,
    solution: `import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode(0)
    cur = dummy

    while heap:
        val, i, node = heapq.heappop(heap)
        cur.next = node
        cur = cur.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next`,
    usage: null,
    tags: ["linked-list", "heap", "divide-and-conquer", "blind75"],
  },

  // 36. Remove Nth Node From End of List
  {
    name: "Remove Nth Node From End of List",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Given the head of a linked list, remove the nth node from the end and return the head.\n\nExample:\nInput: head=[1,2,3,4,5], n=2\nOutput: [1,2,3,5]\n\nConstraints:\n- 1 <= sz <= 30\n- 0 <= Node.val <= 100\n- 1 <= n <= sz`,
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def remove_nth_from_end(head, n: int):
    raise NotImplementedError`,
    testCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

def test_remove_second_from_end():
    assert to_list(remove_nth_from_end(make_list([1,2,3,4,5]), 2)) == [1,2,3,5]

def test_remove_only_node():
    assert to_list(remove_nth_from_end(make_list([1]), 1)) == []

def test_remove_first():
    assert to_list(remove_nth_from_end(make_list([1,2]), 2)) == [2]

def test_remove_last():
    assert to_list(remove_nth_from_end(make_list([1,2,3]), 1)) == [1,2]`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def remove_nth_from_end(head, n: int):
    dummy = ListNode(0)
    dummy.next = head
    fast = dummy
    slow = dummy

    # Advance fast pointer n+1 steps ahead
    for _ in range(n + 1):
        fast = fast.next

    # Move both until fast reaches end
    while fast:
        fast = fast.next
        slow = slow.next

    # Remove the nth node from end
    slow.next = slow.next.next

    return dummy.next`,
    usage: null,
    tags: ["linked-list", "two-pointers", "blind75"],
  },

  // 37. Reorder List
  {
    name: "Reorder List",
    category: "linked-list",
    language: "python",
    difficulty: "medium",
    description: `Given a singly linked list L0→L1→…→Ln, reorder it to L0→Ln→L1→Ln-1→L2→Ln-2→…. Modify in-place.\n\nExample:\nInput: head=[1,2,3,4]\nOutput: [1,4,2,3]\n\nConstraints:\n- 1 <= number of nodes <= 5*10^4\n- 1 <= Node.val <= 1000`,
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reorder_list(head) -> None:
    raise NotImplementedError`,
    testCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

def test_even_length():
    head = make_list([1,2,3,4])
    reorder_list(head)
    assert to_list(head) == [1,4,2,3]

def test_odd_length():
    head = make_list([1,2,3,4,5])
    reorder_list(head)
    assert to_list(head) == [1,5,2,4,3]

def test_two_nodes():
    head = make_list([1,2])
    reorder_list(head)
    assert to_list(head) == [1,2]

def test_single_node():
    head = make_list([1])
    reorder_list(head)
    assert to_list(head) == [1]`,
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reorder_list(head) -> None:
    if not head or not head.next:
        return

    # Step 1: Find the middle of the list using slow/fast pointers
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: Reverse the second half
    prev = None
    cur = slow.next
    slow.next = None  # Cut the list in half
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    second = prev

    # Step 3: Merge the two halves
    first = head
    while second:
        tmp1 = first.next
        tmp2 = second.next
        first.next = second
        second.next = tmp1
        first = tmp1
        second = tmp2`,
    usage: null,
    tags: ["linked-list", "two-pointers", "blind75"],
  },
];

export { blind75Part4 };
