import type { SeedKata } from "../types/editor";

const blind75Part6: SeedKata[] = [
  {
    name: "Longest Substring Without Repeating Characters",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces`,
    code: `def length_of_longest_substring(s)
  raise NotImplementedError
end`,
    testCode: `def test_abcabcbb
  assert_equal(3, length_of_longest_substring("abcabcbb"))
end

def test_bbbbb
  assert_equal(1, length_of_longest_substring("bbbbb"))
end

def test_empty
  assert_equal(0, length_of_longest_substring(""))
end

def test_pwwkew
  assert_equal(3, length_of_longest_substring("pwwkew"))
end`,
    solution: `def length_of_longest_substring(s)
  char_index = {}
  left = 0
  max_len = 0

  s.each_char.with_index do |char, right|
    if char_index.key?(char) && char_index[char] >= left
      left = char_index[char] + 1
    end
    char_index[char] = right
    max_len = [max_len, right - left + 1].max
  end

  max_len
end`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Longest Repeating Character Replacement",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s and integer k, you can replace any k characters. Find the length of the longest substring containing the same letter after replacements.

Example:
Input: s="AABABBA", k=1
Output: 4

Constraints:
- 1 <= s.length <= 10^5
- s consists of uppercase English letters
- 0 <= k <= s.length`,
    code: `def character_replacement(s, k)
  raise NotImplementedError
end`,
    testCode: `def test_aababba
  assert_equal(4, character_replacement("AABABBA", 1))
end

def test_abab
  assert_equal(4, character_replacement("ABAB", 2))
end

def test_aaaa
  assert_equal(4, character_replacement("AAAA", 0))
end

def test_abbb
  assert_equal(4, character_replacement("ABBB", 2))
end`,
    solution: `def character_replacement(s, k)
  count = {}
  left = 0
  max_count = 0
  max_len = 0

  (0...s.length).each do |right|
    count[s[right]] = (count[s[right]] || 0) + 1
    max_count = [max_count, count[s[right]]].max

    window_size = right - left + 1
    if window_size - max_count > k
      count[s[left]] -= 1
      left += 1
    end

    max_len = [max_len, right - left + 1].max
  end

  max_len
end`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Minimum Window Substring",
    category: "string",
    language: "ruby",
    difficulty: "hard",
    description: `Given strings s and t, return the minimum window substring of s that contains all characters in t. Return "" if no such window exists.

Example:
Input: s="ADOBECODEBANC", t="ABC"
Output: "BANC"

Constraints:
- 1 <= s.length, t.length <= 10^5
- s and t consist of uppercase and lowercase English letters`,
    code: `def min_window(s, t)
  raise NotImplementedError
end`,
    testCode: `def test_basic
  assert_equal("BANC", min_window("ADOBECODEBANC", "ABC"))
end

def test_single_match
  assert_equal("a", min_window("a", "a"))
end

def test_no_match
  assert_equal("", min_window("a", "aa"))
end

def test_double_match
  assert_equal("aa", min_window("aa", "aa"))
end`,
    solution: `def min_window(s, t)
  return "" if t.empty? || s.empty?

  need = t.each_char.tally
  have = {}
  have_count = 0
  need_count = need.size

  left = 0
  result = ""
  result_len = Float::INFINITY

  (0...s.length).each do |right|
    char = s[right]
    have[char] = (have[char] || 0) + 1
    if need.key?(char) && have[char] == need[char]
      have_count += 1
    end

    while have_count == need_count
      window_len = right - left + 1
      if window_len < result_len
        result_len = window_len
        result = s[left..right]
      end
      left_char = s[left]
      have[left_char] -= 1
      if need.key?(left_char) && have[left_char] < need[left_char]
        have_count -= 1
      end
      left += 1
    end
  end

  result
end`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Valid Anagram",
    category: "string",
    language: "ruby",
    difficulty: "easy",
    description: `Given two strings s and t, return true if t is an anagram of s.

Example:
Input: s="anagram", t="nagaram"
Output: True

Constraints:
- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters`,
    code: `def is_anagram(s, t)
  raise NotImplementedError
end`,
    testCode: `def test_anagram
  assert_equal(true, is_anagram("anagram", "nagaram"))
end

def test_not_anagram
  assert_equal(false, is_anagram("rat", "car"))
end

def test_single_char
  assert_equal(true, is_anagram("a", "a"))
end

def test_two_chars
  assert_equal(true, is_anagram("ab", "ba"))
end`,
    solution: `# Classic: explicit character counts
def is_anagram(s, t)
  return false if s.length != t.length

  counts = Hash.new(0)
  s.each_char { |ch| counts[ch] += 1 }
  t.each_char { |ch| counts[ch] -= 1 }
  counts.values.all?(&:zero?)
end

# Idiomatic Ruby one-liner:
# def is_anagram(s, t)
#   s.each_char.tally == t.each_char.tally
# end`,
    usage: null,
    tags: ["string", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Group Anagrams",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Given an array of strings strs, group the anagrams together.

Example:
Input: strs=["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]] (order may vary)

Constraints:
- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters`,
    code: `def group_anagrams(strs)
  raise NotImplementedError
end`,
    testCode: `def test_standard
  result = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
  groups = result.map(&:sort)
  groups.sort!
  assert_equal([["ate", "eat", "tea"], ["bat"], ["nat", "tan"]], groups)
end

def test_empty_string
  result = group_anagrams([""])
  assert_equal([[""]], result)
end

def test_single
  result = group_anagrams(["a"])
  assert_equal([["a"]], result)
end

def test_all_unique
  result = group_anagrams(["abc", "def"])
  groups = result.map(&:sort)
  groups.sort!
  assert_equal([["abc"], ["def"]], groups)
end`,
    solution: `def group_anagrams(strs)
  groups = Hash.new { |h, k| h[k] = [] }
  strs.each do |word|
    key = word.chars.sort.join
    groups[key] << word
  end
  groups.values
end`,
    usage: null,
    tags: ["string", "hash-map", "blind75", "neetcode", "arrays-hashing"],
  },
  {
    name: "Valid Palindrome",
    category: "string",
    language: "ruby",
    difficulty: "easy",
    description: `A phrase is a palindrome if, after converting all uppercase to lowercase and removing non-alphanumeric characters, it reads the same forwards and backwards.

Example:
Input: s="A man, a plan, a canal: Panama"
Output: True

Constraints:
- 1 <= s.length <= 2 * 10^5
- s consists of printable ASCII characters`,
    code: `def is_palindrome(s)
  raise NotImplementedError
end`,
    testCode: `def test_classic
  assert_equal(true, is_palindrome("A man, a plan, a canal: Panama"))
end

def test_not_palindrome
  assert_equal(false, is_palindrome("race a car"))
end

def test_space_only
  assert_equal(true, is_palindrome(" "))
end

def test_with_punctuation
  assert_equal(true, is_palindrome("Was it a car or a cat I saw?"))
end`,
    solution: `def is_palindrome(s)
  filtered = s.chars.select { |c| c =~ /[a-zA-Z0-9]/ }.map(&:downcase)
  left = 0
  right = filtered.length - 1
  while left < right
    return false if filtered[left] != filtered[right]
    left += 1
    right -= 1
  end
  true
end`,
    usage: null,
    tags: ["string", "two-pointers", "blind75", "neetcode"],
  },
  {
    name: "Longest Palindromic Substring",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s, return the longest palindromic substring.

Example:
Input: s="babad"
Output: "bab" (or "aba")

Constraints:
- 1 <= s.length <= 1000
- s consists of digits and English letters`,
    code: `def longest_palindrome(s)
  raise NotImplementedError
end`,
    testCode: `def test_babad
  result = longest_palindrome("babad")
  assert_true(["bab", "aba"].include?(result))
end

def test_cbbd
  assert_equal("bb", longest_palindrome("cbbd"))
end

def test_single
  assert_equal("a", longest_palindrome("a"))
end

def test_racecar
  assert_equal("racecar", longest_palindrome("racecar"))
end`,
    solution: `def longest_palindrome(s)
  result = ""

  expand = lambda do |left, right|
    while left >= 0 && right < s.length && s[left] == s[right]
      left -= 1
      right += 1
    end
    s[(left + 1)...right]
  end

  (0...s.length).each do |i|
    odd = expand.call(i, i)
    even = expand.call(i, i + 1)
    result = odd if odd.length > result.length
    result = even if even.length > result.length
  end

  result
end`,
    usage: null,
    tags: ["string", "two-pointers", "dynamic-programming", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Palindromic Substrings",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Given a string s, return the number of palindromic substrings. A substring is a contiguous sequence of characters. Single characters count.

Example:
Input: s="abc"
Output: 3

Input: s="aaa"
Output: 6

Constraints:
- 1 <= s.length <= 1000
- s consists of lowercase English letters`,
    code: `def count_substrings(s)
  raise NotImplementedError
end`,
    testCode: `def test_abc
  assert_equal(3, count_substrings("abc"))
end

def test_aaa
  assert_equal(6, count_substrings("aaa"))
end

def test_single
  assert_equal(1, count_substrings("a"))
end

def test_abbc
  assert_equal(5, count_substrings("abbc"))
end`,
    solution: `def count_substrings(s)
  count = 0

  expand = lambda do |left, right|
    while left >= 0 && right < s.length && s[left] == s[right]
      count += 1
      left -= 1
      right += 1
    end
  end

  (0...s.length).each do |i|
    expand.call(i, i)
    expand.call(i, i + 1)
  end

  count
end`,
    usage: null,
    tags: ["string", "two-pointers", "blind75", "neetcode", "1d-dp"],
  },
  {
    name: "Encode and Decode Strings",
    category: "string",
    language: "ruby",
    difficulty: "medium",
    description: `Design an algorithm to encode a list of strings to a single string. The encoded string is then sent over the network and decoded back to the original list.

Format: length#string for each word

Example:
Input: ["hello","world"]
Encoded: "5#hello5#world"
Decoded: ["hello","world"]

Constraints:
- 0 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- strs[i] contains any possible characters`,
    code: `def encode(strs)
  raise NotImplementedError
end

def decode(s)
  raise NotImplementedError
end`,
    testCode: `def test_basic_roundtrip
  assert_equal(["hello", "world"], decode(encode(["hello", "world"])))
end

def test_empty_string_roundtrip
  assert_equal(["", "abc"], decode(encode(["", "abc"])))
end

def test_hash_in_strings
  assert_equal(["#", "##"], decode(encode(["#", "##"])))
end

def test_empty_list
  assert_equal([], decode(encode([])))
end`,
    solution: `def encode(strs)
  strs.map { |s| "#{s.length}#" + s }.join
end

def decode(s)
  result = []
  i = 0
  while i < s.length
    j = s.index("#", i)
    length = s[i...j].to_i
    result << s[(j + 1)...(j + 1 + length)]
    i = j + 1 + length
  end
  result
end`,
    usage: null,
    tags: ["string", "blind75", "neetcode", "arrays-hashing"],
  },
];

export { blind75Part6 };
