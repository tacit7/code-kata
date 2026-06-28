import type { SeedKata } from "../types/editor";

const neetcodeHeap: SeedKata[] = [
  {
    name: "Kth Largest Element In a Stream",
    category: "heap",
    language: "python",
    difficulty: "easy",
    description: `Design a class to find the kth largest element in a stream of integers.\n\nKthLargest(int k, int[] nums) — initializes with k and an initial array.\nint add(int val) — adds val to the stream and returns the kth largest element.\n\nExample:\nkth = KthLargest(3, [4, 5, 8, 2])\nkth.add(3)  # → 4\nkth.add(5)  # → 5\nkth.add(10) # → 8\nkth.add(9)  # → 8\nkth.add(4)  # → 8\n\nConstraints:\n- 1 <= k <= 10^4\n- 0 <= nums.length <= 10^4\n- -10^4 <= nums[i] <= 10^4\n- -10^4 <= val <= 10^4\n- At most 10^4 calls to add.\n- It is guaranteed that there will be at least k elements in the array when you search for the kth element.\n\nRef: LeetCode #703 Kth Largest Element in a Stream`,
    code: `class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        raise NotImplementedError

    def add(self, val: int) -> int:
        raise NotImplementedError`,
    testCode: `def test_kth_largest_stream():
    kth = KthLargest(3, [4, 5, 8, 2])
    assert kth.add(3) == 4
    assert kth.add(5) == 5
    assert kth.add(10) == 8
    assert kth.add(9) == 8
    assert kth.add(4) == 8

def test_kth_largest_single():
    kth = KthLargest(1, [])
    assert kth.add(5) == 5
    assert kth.add(3) == 5

def test_kth_largest_k2():
    kth = KthLargest(2, [1])
    assert kth.add(2) == 1
    assert kth.add(3) == 2`,
    solution: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = []
        for num in nums:
            heapq.heappush(self.heap, num)
            if len(self.heap) > k:
                heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
    usage: null,
    tags: ["heap", "design", "neetcode"],
  },
  {
    name: "Last Stone Weight",
    category: "heap",
    language: "python",
    difficulty: "easy",
    description: `You are given an array of integers stones where stones[i] is the weight of the ith stone.\n\nEach turn, pick the two heaviest stones and smash them together:\n- If x == y, both are destroyed.\n- If x != y (x < y), x is destroyed and y becomes y - x.\n\nReturn the weight of the last remaining stone, or 0 if none remain.\n\nExample 1:\nInput: stones = [2,7,4,1,8,1]\nOutput: 1\n\nExample 2:\nInput: stones = [1]\nOutput: 1\n\nConstraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 1000\n\nRef: LeetCode #1046 Last Stone Weight`,
    code: `def last_stone_weight(stones: list[int]) -> int:
    raise NotImplementedError`,
    testCode: `def test_last_stone_basic():
    assert last_stone_weight([2,7,4,1,8,1]) == 1

def test_last_stone_single():
    assert last_stone_weight([1]) == 1

def test_last_stone_equal():
    assert last_stone_weight([3,3]) == 0

def test_last_stone_two():
    assert last_stone_weight([2,5]) == 3`,
    solution: `import heapq

def last_stone_weight(stones: list[int]) -> int:
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        y = -heapq.heappop(heap)
        x = -heapq.heappop(heap)
        if x != y:
            heapq.heappush(heap, -(y - x))
    return -heap[0] if heap else 0`,
    usage: null,
    tags: ["heap", "neetcode"],
  },
  {
    name: "K Closest Points to Origin",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Given an array of points where points[i] = [xi, yi] on the X-Y plane, return the k closest points to the origin (0, 0).\n\nThe distance is Euclidean: sqrt(x^2 + y^2). You may return the answer in any order.\n\nExample 1:\nInput: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\n\nExample 2:\nInput: points = [[3,3],[5,-1],[-2,4]], k = 2\nOutput: [[3,3],[-2,4]]\n\nConstraints:\n- 1 <= k <= points.length <= 10^4\n- -10^4 <= xi, yi <= 10^4\n\nRef: LeetCode #973 K Closest Points to Origin`,
    code: `def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    raise NotImplementedError`,
    testCode: `def test_k_closest_one():
    assert k_closest([[1,3],[-2,2]], 1) == [[-2,2]]

def test_k_closest_two():
    result = k_closest([[3,3],[5,-1],[-2,4]], 2)
    assert sorted(result) == sorted([[3,3],[-2,4]])

def test_k_closest_all():
    pts = [[1,1],[2,2]]
    result = k_closest(pts, 2)
    assert sorted(result) == sorted(pts)

def test_k_closest_origin():
    assert k_closest([[0,0],[1,1]], 1) == [[0,0]]`,
    solution: `import heapq

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    heap = []
    for x, y in points:
        dist = x * x + y * y
        heapq.heappush(heap, (dist, x, y))
    result = []
    for _ in range(k):
        _, x, y = heapq.heappop(heap)
        result.append([x, y])
    return result`,
    usage: null,
    tags: ["heap", "sort", "neetcode"],
  },
  {
    name: "Kth Largest Element In An Array",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote: it is the kth largest in sorted order, not the kth distinct element.\n\nExample 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nExample 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4\n\nConstraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n\nRef: LeetCode #215 Kth Largest Element in an Array`,
    code: `def find_kth_largest(nums: list[int], k: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_kth_largest_basic():
    assert find_kth_largest([3,2,1,5,6,4], 2) == 5

def test_kth_largest_duplicates():
    assert find_kth_largest([3,2,3,1,2,4,5,5,6], 4) == 4

def test_kth_largest_single():
    assert find_kth_largest([1], 1) == 1

def test_kth_largest_k_equals_len():
    assert find_kth_largest([5,3,1], 3) == 1`,
    solution: `import heapq

def find_kth_largest(nums: list[int], k: int) -> int:
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    usage: null,
    tags: ["heap", "sort", "neetcode"],
  },
  {
    name: "Task Scheduler",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Given a list of CPU tasks labeled A-Z and a non-negative cooldown n, return the minimum number of intervals needed to finish all tasks.\n\nThe CPU must wait at least n intervals between the same task. It can idle during the wait.\n\nExample 1:\nInput: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8  (A→B→idle→A→B→idle→A→B)\n\nExample 2:\nInput: tasks = ["A","A","A","B","B","B"], n = 0\nOutput: 6\n\nExample 3:\nInput: tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n = 2\nOutput: 16\n\nConstraints:\n- 1 <= tasks.length <= 10^4\n- tasks[i] is an uppercase English letter\n- 0 <= n <= 100\n\nRef: LeetCode #621 Task Scheduler`,
    code: `def least_interval(tasks: list[str], n: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_task_scheduler_basic():
    assert least_interval(["A","A","A","B","B","B"], 2) == 8

def test_task_scheduler_no_cooldown():
    assert least_interval(["A","A","A","B","B","B"], 0) == 6

def test_task_scheduler_many_tasks():
    assert least_interval(["A","A","A","A","A","A","B","C","D","E","F","G"], 2) == 16

def test_task_scheduler_single():
    assert least_interval(["A"], 2) == 1`,
    solution: `import heapq
from collections import Counter, deque

def least_interval(tasks: list[str], n: int) -> int:
    count = Counter(tasks)
    max_heap = [-c for c in count.values()]
    heapq.heapify(max_heap)
    time = 0
    queue: deque = deque()  # (-count, available_at)
    while max_heap or queue:
        time += 1
        if max_heap:
            cnt = 1 + heapq.heappop(max_heap)
            if cnt < 0:
                queue.append((cnt, time + n))
        if queue and queue[0][1] == time:
            heapq.heappush(max_heap, queue.popleft()[0])
    return time`,
    usage: null,
    tags: ["heap", "greedy", "neetcode"],
  },
  {
    name: "Design Twitter",
    category: "heap",
    language: "python",
    difficulty: "medium",
    description: `Design a simplified version of Twitter with the following methods:\n\n- postTweet(userId, tweetId) — compose a new tweet.\n- getNewsFeed(userId) — retrieve the 10 most recent tweet IDs in the user's news feed (from the user and their followees), ordered most recent first.\n- follow(followerId, followeeId) — the follower follows the followee.\n- unfollow(followerId, followeeId) — the follower unfollows the followee.\n\nExample:\ntwitter = Twitter()\ntwitter.post_tweet(1, 5)\ntwitter.get_news_feed(1)   # [5]\ntwitter.follow(1, 2)\ntwitter.post_tweet(2, 6)\ntwitter.get_news_feed(1)   # [6, 5]\ntwitter.unfollow(1, 2)\ntwitter.get_news_feed(1)   # [5]\n\nConstraints:\n- 1 <= userId, tweetId <= 500\n- At most 3 * 10^4 method calls.\n\nRef: LeetCode #355 Design Twitter`,
    code: `class Twitter:
    def __init__(self):
        raise NotImplementedError

    def post_tweet(self, user_id: int, tweet_id: int) -> None:
        raise NotImplementedError

    def get_news_feed(self, user_id: int) -> list[int]:
        raise NotImplementedError

    def follow(self, follower_id: int, followee_id: int) -> None:
        raise NotImplementedError

    def unfollow(self, follower_id: int, followee_id: int) -> None:
        raise NotImplementedError`,
    testCode: `def test_twitter_basic():
    t = Twitter()
    t.post_tweet(1, 5)
    assert t.get_news_feed(1) == [5]

def test_twitter_follow():
    t = Twitter()
    t.post_tweet(1, 5)
    t.follow(1, 2)
    t.post_tweet(2, 6)
    assert t.get_news_feed(1) == [6, 5]

def test_twitter_unfollow():
    t = Twitter()
    t.post_tweet(1, 5)
    t.follow(1, 2)
    t.post_tweet(2, 6)
    t.unfollow(1, 2)
    assert t.get_news_feed(1) == [5]

def test_twitter_own_tweets():
    t = Twitter()
    t.post_tweet(1, 1)
    t.post_tweet(1, 2)
    feed = t.get_news_feed(1)
    assert feed == [2, 1]`,
    solution: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.timestamp = 0
        self.tweets: dict[int, list[tuple[int, int]]] = defaultdict(list)
        self.following: dict[int, set[int]] = defaultdict(set)

    def post_tweet(self, user_id: int, tweet_id: int) -> None:
        self.tweets[user_id].append((self.timestamp, tweet_id))
        self.timestamp += 1

    def get_news_feed(self, user_id: int) -> list[int]:
        heap = []
        sources = self.following[user_id] | {user_id}
        for uid in sources:
            user_tweets = self.tweets[uid]
            if user_tweets:
                idx = len(user_tweets) - 1
                ts, tid = user_tweets[idx]
                heapq.heappush(heap, (-ts, tid, uid, idx - 1))
        result = []
        while heap and len(result) < 10:
            _, tid, uid, idx = heapq.heappop(heap)
            result.append(tid)
            if idx >= 0:
                ts, next_tid = self.tweets[uid][idx]
                heapq.heappush(heap, (-ts, next_tid, uid, idx - 1))
        return result

    def follow(self, follower_id: int, followee_id: int) -> None:
        self.following[follower_id].add(followee_id)

    def unfollow(self, follower_id: int, followee_id: int) -> None:
        self.following[follower_id].discard(followee_id)`,
    usage: null,
    tags: ["heap", "design", "hash-map", "neetcode"],
  },
];

export { neetcodeHeap };
