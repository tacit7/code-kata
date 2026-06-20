import type { SeedKata } from "../types/editor";

const blind75Part6: SeedKata[] = [
  {
    name: "Longest Substring Without Repeating Characters",
    category: "string",
    language: "python",
    difficulty: "medium",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces`,
    code: `def length_of_longest_substring(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_abcabcbb():
    assert length_of_longest_substring("abcabcbb") == 3

def test_bbbbb():
    assert length_of_longest_substring("bbbbb") == 1

def test_empty():
    assert length_of_longest_substring("") == 0

def test_pwwkew():
    assert length_of_longest_substring("pwwkew") == 3`,
    solution: `def length_of_longest_substring(s: str) -> int:
    char_index = {}
    left = 0
    max_len = 0

    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Longest Repeating Character Replacement",
    category: "string",
    language: "python",
    difficulty: "medium",
    description: `Given a string s and integer k, you can replace any k characters. Find the length of the longest substring containing the same letter after replacements.

Example:
Input: s="AABABBA", k=1
Output: 4

Constraints:
- 1 <= s.length <= 10^5
- s consists of uppercase English letters
- 0 <= k <= s.length`,
    code: `def character_replacement(s: str, k: int) -> int:
    raise NotImplementedError`,
    testCode: `def test_aababba():
    assert character_replacement("AABABBA", 1) == 4

def test_abab():
    assert character_replacement("ABAB", 2) == 4

def test_aaaa():
    assert character_replacement("AAAA", 0) == 4

def test_abbb():
    assert character_replacement("ABBB", 2) == 4`,
    solution: `def character_replacement(s: str, k: int) -> int:
    count = {}
    left = 0
    max_count = 0
    max_len = 0

    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        max_count = max(max_count, count[s[right]])

        window_size = right - left + 1
        if window_size - max_count > k:
            count[s[left]] -= 1
            left += 1

        max_len = max(max_len, right - left + 1)

    return max_len`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Minimum Window Substring",
    category: "string",
    language: "python",
    difficulty: "hard",
    description: `Given strings s and t, return the minimum window substring of s that contains all characters in t. Return "" if no such window exists.

Example:
Input: s="ADOBECODEBANC", t="ABC"
Output: "BANC"

Constraints:
- 1 <= s.length, t.length <= 10^5
- s and t consist of uppercase and lowercase English letters`,
    code: `def min_window(s: str, t: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_basic():
    assert min_window("ADOBECODEBANC", "ABC") == "BANC"

def test_single_match():
    assert min_window("a", "a") == "a"

def test_no_match():
    assert min_window("a", "aa") == ""

def test_double_match():
    assert min_window("aa", "aa") == "aa"`,
    solution: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or not s:
        return ""

    need = Counter(t)
    have = {}
    have_count = 0
    need_count = len(need)

    left = 0
    result = ""
    result_len = float("inf")

    for right in range(len(s)):
        char = s[right]
        have[char] = have.get(char, 0) + 1
        if char in need and have[char] == need[char]:
            have_count += 1

        while have_count == need_count:
            window_len = right - left + 1
            if window_len < result_len:
                result_len = window_len
                result = s[left:right + 1]
            left_char = s[left]
            have[left_char] -= 1
            if left_char in need and have[left_char] < need[left_char]:
                have_count -= 1
            left += 1

    return result`,
    usage: null,
    tags: ["string", "sliding-window", "blind75"],
  },
  {
    name: "Valid Anagram",
    category: "string",
    language: "python",
    difficulty: "easy",
    description: `Given two strings s and t, return true if t is an anagram of s.

Example:
Input: s="anagram", t="nagaram"
Output: True

Constraints:
- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters`,
    code: `def is_anagram(s: str, t: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_anagram():
    assert is_anagram("anagram", "nagaram") == True

def test_not_anagram():
    assert is_anagram("rat", "car") == False

def test_single_char():
    assert is_anagram("a", "a") == True

def test_two_chars():
    assert is_anagram("ab", "ba") == True`,
    solution: `from collections import Counter

def is_anagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)`,
    usage: null,
    tags: ["string", "hash-map", "blind75"],
  },
  {
    name: "Group Anagrams",
    category: "string",
    language: "python",
    difficulty: "medium",
    description: `Given an array of strings strs, group the anagrams together.

Example:
Input: strs=["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]] (order may vary)

Constraints:
- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters`,
    code: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    raise NotImplementedError`,
    testCode: `def test_standard():
    result = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    groups = [sorted(g) for g in result]
    groups.sort()
    assert groups == [["bat"], ["ate", "eat", "tea"], ["nat", "tan"]]

def test_empty_string():
    result = group_anagrams([""])
    assert result == [[""]]

def test_single():
    result = group_anagrams(["a"])
    assert result == [["a"]]

def test_all_unique():
    result = group_anagrams(["abc", "def"])
    groups = [sorted(g) for g in result]
    groups.sort()
    assert groups == [["abc"], ["def"]]`,
    solution: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for word in strs:
        key = tuple(sorted(word))
        groups[key].append(word)
    return list(groups.values())`,
    usage: null,
    tags: ["string", "hash-map", "blind75"],
  },
  {
    name: "Valid Palindrome",
    category: "string",
    language: "python",
    difficulty: "easy",
    description: `A phrase is a palindrome if, after converting all uppercase to lowercase and removing non-alphanumeric characters, it reads the same forwards and backwards.

Example:
Input: s="A man, a plan, a canal: Panama"
Output: True

Constraints:
- 1 <= s.length <= 2 * 10^5
- s consists of printable ASCII characters`,
    code: `def is_palindrome(s: str) -> bool:
    raise NotImplementedError`,
    testCode: `def test_classic():
    assert is_palindrome("A man, a plan, a canal: Panama") == True

def test_not_palindrome():
    assert is_palindrome("race a car") == False

def test_space_only():
    assert is_palindrome(" ") == True

def test_with_punctuation():
    assert is_palindrome("Was it a car or a cat I saw?") == True`,
    solution: `def is_palindrome(s: str) -> bool:
    filtered = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(filtered) - 1
    while left < right:
        if filtered[left] != filtered[right]:
            return False
        left += 1
        right -= 1
    return True`,
    usage: null,
    tags: ["string", "two-pointers", "blind75"],
  },
  {
    name: "Longest Palindromic Substring",
    category: "string",
    language: "python",
    difficulty: "medium",
    description: `Given a string s, return the longest palindromic substring.

Example:
Input: s="babad"
Output: "bab" (or "aba")

Constraints:
- 1 <= s.length <= 1000
- s consists of digits and English letters`,
    code: `def longest_palindrome(s: str) -> str:
    raise NotImplementedError`,
    testCode: `def test_babad():
    assert longest_palindrome("babad") in ("bab", "aba")

def test_cbbd():
    assert longest_palindrome("cbbd") == "bb"

def test_single():
    assert longest_palindrome("a") == "a"

def test_racecar():
    assert longest_palindrome("racecar") == "racecar"`,
    solution: `def longest_palindrome(s: str) -> str:
    result = ""

    def expand(left: int, right: int) -> str:
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    for i in range(len(s)):
        odd = expand(i, i)
        even = expand(i, i + 1)
        if len(odd) > len(result):
            result = odd
        if len(even) > len(result):
            result = even

    return result`,
    usage: null,
    tags: ["string", "two-pointers", "dynamic-programming", "blind75"],
  },
  {
    name: "Palindromic Substrings",
    category: "string",
    language: "python",
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
    code: `def count_substrings(s: str) -> int:
    raise NotImplementedError`,
    testCode: `def test_abc():
    assert count_substrings("abc") == 3

def test_aaa():
    assert count_substrings("aaa") == 6

def test_single():
    assert count_substrings("a") == 1

def test_abbc():
    assert count_substrings("abbc") == 5`,
    solution: `def count_substrings(s: str) -> int:
    count = 0

    def expand(left: int, right: int) -> None:
        nonlocal count
        while left >= 0 and right < len(s) and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1

    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)

    return count`,
    usage: null,
    tags: ["string", "two-pointers", "blind75"],
  },
  {
    name: "Encode and Decode Strings",
    category: "string",
    language: "python",
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
    code: `def encode(strs: list[str]) -> str:
    raise NotImplementedError

def decode(s: str) -> list[str]:
    raise NotImplementedError`,
    testCode: `def test_basic_roundtrip():
    assert decode(encode(["hello", "world"])) == ["hello", "world"]

def test_empty_string_roundtrip():
    assert decode(encode(["", "abc"])) == ["", "abc"]

def test_hash_in_strings():
    assert decode(encode(["#", "##"])) == ["#", "##"]

def test_empty_list():
    assert decode(encode([])) == []`,
    solution: `def encode(strs: list[str]) -> str:
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(s: str) -> list[str]:
    result = []
    i = 0
    while i < len(s):
        j = s.index("#", i)
        length = int(s[i:j])
        result.append(s[j + 1:j + 1 + length])
        i = j + 1 + length
    return result`,
    usage: null,
    tags: ["string", "blind75"],
  },
];

export { blind75Part6 };
