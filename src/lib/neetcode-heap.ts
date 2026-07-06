import type { SeedKata } from "../types/editor";

const neetcodeHeap: SeedKata[] = [
  {
    name: "Kth Largest Element In a Stream",
    category: "heap",
    language: "ruby",
    difficulty: "easy",
    description: `Design a class to find the kth largest element in a stream of integers.\n\nKthLargest(int k, int[] nums) — initializes with k and an initial array.\nint add(int val) — adds val to the stream and returns the kth largest element.\n\nExample:\nkth = KthLargest(3, [4, 5, 8, 2])\nkth.add(3)  # → 4\nkth.add(5)  # → 5\nkth.add(10) # → 8\nkth.add(9)  # → 8\nkth.add(4)  # → 8\n\nConstraints:\n- 1 <= k <= 10^4\n- 0 <= nums.length <= 10^4\n- -10^4 <= nums[i] <= 10^4\n- -10^4 <= val <= 10^4\n- At most 10^4 calls to add.\n- It is guaranteed that there will be at least k elements in the array when you search for the kth element.\n\nRef: LeetCode #703 Kth Largest Element in a Stream`,
    code: `class KthLargest
  def initialize(k, nums)
    raise NotImplementedError
  end

  def add(val)
    raise NotImplementedError
  end
end`,
    testCode: `def test_kth_largest_stream
  kth = KthLargest.new(3, [4, 5, 8, 2])
  assert_equal(4, kth.add(3))
  assert_equal(5, kth.add(5))
  assert_equal(5, kth.add(10))
  assert_equal(8, kth.add(9))
  assert_equal(8, kth.add(4))
end

def test_kth_largest_single
  kth = KthLargest.new(1, [])
  assert_equal(5, kth.add(5))
  assert_equal(5, kth.add(3))
end

def test_kth_largest_k2
  kth = KthLargest.new(2, [1])
  assert_equal(1, kth.add(2))
  assert_equal(2, kth.add(3))
end`,
    solution: `class KthLargest
  def initialize(k, nums)
    @k = k
    @heap = []
    nums.each { |num| push_val(num) }
  end

  def add(val)
    push_val(val)
  end

  def push_val(val)
    idx = @heap.bsearch_index { |x| x >= val } || @heap.length
    @heap.insert(idx, val)
    @heap.shift if @heap.length > @k
    @heap[0]
  end
end`,
    usage: null,
    tags: ["heap", "design", "neetcode"],
  },
  {
    name: "Last Stone Weight",
    category: "heap",
    language: "ruby",
    difficulty: "easy",
    description: `You are given an array of integers stones where stones[i] is the weight of the ith stone.\n\nEach turn, pick the two heaviest stones and smash them together:\n- If x == y, both are destroyed.\n- If x != y (x < y), x is destroyed and y becomes y - x.\n\nReturn the weight of the last remaining stone, or 0 if none remain.\n\nExample 1:\nInput: stones = [2,7,4,1,8,1]\nOutput: 1\n\nExample 2:\nInput: stones = [1]\nOutput: 1\n\nConstraints:\n- 1 <= stones.length <= 30\n- 1 <= stones[i] <= 1000\n\nRef: LeetCode #1046 Last Stone Weight`,
    code: `def last_stone_weight(stones)
  raise NotImplementedError
end`,
    testCode: `def test_last_stone_basic
  assert_equal(1, last_stone_weight([2, 7, 4, 1, 8, 1]))
end

def test_last_stone_single
  assert_equal(1, last_stone_weight([1]))
end

def test_last_stone_equal
  assert_equal(0, last_stone_weight([3, 3]))
end

def test_last_stone_two
  assert_equal(3, last_stone_weight([2, 5]))
end`,
    solution: `def last_stone_weight(stones)
  heap = stones.sort
  while heap.length > 1
    y = heap.pop
    x = heap.pop
    if x != y
      diff = y - x
      idx = heap.bsearch_index { |v| v >= diff } || heap.length
      heap.insert(idx, diff)
    end
  end
  heap.empty? ? 0 : heap[0]
end`,
    usage: null,
    tags: ["heap", "neetcode"],
  },
  {
    name: "K Closest Points to Origin",
    category: "heap",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of points where points[i] = [xi, yi] on the X-Y plane, return the k closest points to the origin (0, 0).\n\nThe distance is Euclidean: sqrt(x^2 + y^2). You may return the answer in any order.\n\nExample 1:\nInput: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\n\nExample 2:\nInput: points = [[3,3],[5,-1],[-2,4]], k = 2\nOutput: [[3,3],[-2,4]]\n\nConstraints:\n- 1 <= k <= points.length <= 10^4\n- -10^4 <= xi, yi <= 10^4\n\nRef: LeetCode #973 K Closest Points to Origin`,
    code: `def k_closest(points, k)
  raise NotImplementedError
end`,
    testCode: `def test_k_closest_one
  assert_equal([[-2, 2]], k_closest([[1, 3], [-2, 2]], 1))
end

def test_k_closest_two
  result = k_closest([[3, 3], [5, -1], [-2, 4]], 2)
  assert_equal([[3, 3], [-2, 4]].sort, result.sort)
end

def test_k_closest_all
  pts = [[1, 1], [2, 2]]
  result = k_closest(pts, 2)
  assert_equal(pts.sort, result.sort)
end

def test_k_closest_origin
  assert_equal([[0, 0]], k_closest([[0, 0], [1, 1]], 1))
end`,
    solution: `def k_closest(points, k)
  points.sort_by { |x, y| x * x + y * y }.first(k)
end`,
    usage: null,
    tags: ["heap", "sort", "neetcode"],
  },
  {
    name: "Kth Largest Element In An Array",
    category: "heap",
    language: "ruby",
    difficulty: "medium",
    description: `Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote: it is the kth largest in sorted order, not the kth distinct element.\n\nExample 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nExample 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4\n\nConstraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n\nRef: LeetCode #215 Kth Largest Element in an Array`,
    code: `def find_kth_largest(nums, k)
  raise NotImplementedError
end`,
    testCode: `def test_kth_largest_basic
  assert_equal(5, find_kth_largest([3, 2, 1, 5, 6, 4], 2))
end

def test_kth_largest_duplicates
  assert_equal(4, find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
end

def test_kth_largest_single
  assert_equal(1, find_kth_largest([1], 1))
end

def test_kth_largest_k_equals_len
  assert_equal(1, find_kth_largest([5, 3, 1], 3))
end`,
    solution: `def find_kth_largest(nums, k)
  nums.sort[-k]
end`,
    usage: null,
    tags: ["heap", "sort", "neetcode"],
  },
  {
    name: "Task Scheduler",
    category: "heap",
    language: "ruby",
    difficulty: "medium",
    description: `Given a list of CPU tasks labeled A-Z and a non-negative cooldown n, return the minimum number of intervals needed to finish all tasks.\n\nThe CPU must wait at least n intervals between the same task. It can idle during the wait.\n\nExample 1:\nInput: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8  (A→B→idle→A→B→idle→A→B)\n\nExample 2:\nInput: tasks = ["A","A","A","B","B","B"], n = 0\nOutput: 6\n\nExample 3:\nInput: tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n = 2\nOutput: 16\n\nConstraints:\n- 1 <= tasks.length <= 10^4\n- tasks[i] is an uppercase English letter\n- 0 <= n <= 100\n\nRef: LeetCode #621 Task Scheduler`,
    code: `def least_interval(tasks, n)
  raise NotImplementedError
end`,
    testCode: `def test_task_scheduler_basic
  assert_equal(8, least_interval(["A", "A", "A", "B", "B", "B"], 2))
end

def test_task_scheduler_no_cooldown
  assert_equal(6, least_interval(["A", "A", "A", "B", "B", "B"], 0))
end

def test_task_scheduler_many_tasks
  assert_equal(16, least_interval(["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2))
end

def test_task_scheduler_single
  assert_equal(1, least_interval(["A"], 2))
end`,
    solution: `def least_interval(tasks, n)
  heap = tasks.tally.values.sort
  time = 0
  queue = []
  while !heap.empty? || !queue.empty?
    time += 1
    if !heap.empty?
      cnt = heap.pop - 1
      queue.push([cnt, time + n]) if cnt > 0
    end
    if !queue.empty? && queue[0][1] == time
      c, _ = queue.shift
      idx = heap.bsearch_index { |v| v >= c } || heap.length
      heap.insert(idx, c)
    end
  end
  time
end`,
    usage: null,
    tags: ["heap", "greedy", "neetcode"],
  },
  {
    name: "Design Twitter",
    category: "heap",
    language: "ruby",
    difficulty: "medium",
    description: `Design a simplified version of Twitter with the following methods:\n\n- postTweet(userId, tweetId) — compose a new tweet.\n- getNewsFeed(userId) — retrieve the 10 most recent tweet IDs in the user's news feed (from the user and their followees), ordered most recent first.\n- follow(followerId, followeeId) — the follower follows the followee.\n- unfollow(followerId, followeeId) — the follower unfollows the followee.\n\nExample:\ntwitter = Twitter()\ntwitter.post_tweet(1, 5)\ntwitter.get_news_feed(1)   # [5]\ntwitter.follow(1, 2)\ntwitter.post_tweet(2, 6)\ntwitter.get_news_feed(1)   # [6, 5]\ntwitter.unfollow(1, 2)\ntwitter.get_news_feed(1)   # [5]\n\nConstraints:\n- 1 <= userId, tweetId <= 500\n- At most 3 * 10^4 method calls.\n\nRef: LeetCode #355 Design Twitter`,
    code: `class Twitter
  def initialize
    raise NotImplementedError
  end

  def post_tweet(user_id, tweet_id)
    raise NotImplementedError
  end

  def get_news_feed(user_id)
    raise NotImplementedError
  end

  def follow(follower_id, followee_id)
    raise NotImplementedError
  end

  def unfollow(follower_id, followee_id)
    raise NotImplementedError
  end
end`,
    testCode: `def test_twitter_basic
  t = Twitter.new
  t.post_tweet(1, 5)
  assert_equal([5], t.get_news_feed(1))
end

def test_twitter_follow
  t = Twitter.new
  t.post_tweet(1, 5)
  t.follow(1, 2)
  t.post_tweet(2, 6)
  assert_equal([6, 5], t.get_news_feed(1))
end

def test_twitter_unfollow
  t = Twitter.new
  t.post_tweet(1, 5)
  t.follow(1, 2)
  t.post_tweet(2, 6)
  t.unfollow(1, 2)
  assert_equal([5], t.get_news_feed(1))
end

def test_twitter_own_tweets
  t = Twitter.new
  t.post_tweet(1, 1)
  t.post_tweet(1, 2)
  feed = t.get_news_feed(1)
  assert_equal([2, 1], feed)
end`,
    solution: `class Twitter
  def initialize
    @timestamp = 0
    @tweets = Hash.new { |h, k| h[k] = [] }
    @following = Hash.new { |h, k| h[k] = {} }
  end

  def post_tweet(user_id, tweet_id)
    @tweets[user_id].push([@timestamp, tweet_id])
    @timestamp += 1
  end

  def get_news_feed(user_id)
    sources = (@following[user_id].keys + [user_id]).uniq
    pointers = {}
    sources.each { |uid| pointers[uid] = @tweets[uid].length - 1 }
    result = []
    while result.length < 10
      best_uid = nil
      best_ts = nil
      sources.each do |uid|
        idx = pointers[uid]
        next if idx < 0
        ts = @tweets[uid][idx][0]
        if best_ts.nil? || ts > best_ts
          best_ts = ts
          best_uid = uid
        end
      end
      break if best_uid.nil?
      idx = pointers[best_uid]
      result.push(@tweets[best_uid][idx][1])
      pointers[best_uid] -= 1
    end
    result
  end

  def follow(follower_id, followee_id)
    @following[follower_id][followee_id] = true
  end

  def unfollow(follower_id, followee_id)
    @following[follower_id].delete(followee_id)
  end
end`,
    usage: null,
    tags: ["heap", "design", "hash-map", "neetcode"],
  },
];

export { neetcodeHeap };
