import { Binary } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureTip,
    LectureSectionHeading,
    LectureSubHeading,
    LectureP,
    LectureTerm,
} from '@/components/ui/lecture-typography';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week2Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={2}
                session="Lecture 2"
                title="Hash Maps, Complexity & Interview Patterns"
                description="Hash maps, Big-O analysis, two-pointer and sliding window patterns: the toolkit for turning O(n²) brute-force solutions into O(n) answers."
                icon={<Binary className="h-4 w-4" />}
            />

            {/* ── 01 HASH MAPS ─────────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Hash Maps: The O(1) Lookup" />

            <LectureP>
                A <LectureTip tip="Key-value store with O(1) average lookup, insert, and delete. Also called hash table, dictionary, or associative array. The single most useful data structure in programming.">hash map</LectureTip> (also called a hash table, dictionary, or associative array) stores key-value pairs and lets you look up any value by its key in <strong className="text-foreground">average O(1) time</strong>. This is the single most useful data structure in programming. It powers caches, database indexes, routers, compilers, and roughly half of all interview solutions.
            </LectureP>

            <LectureSubHeading title="How it works" />

            <LectureP>
                A hash map uses a <LectureTip tip="Converts a key into an array index (bucket number). Deterministic: same key always produces the same index. A good hash function distributes keys uniformly across buckets.">hash function</LectureTip> to convert a key into an array index (called a <LectureTerm>bucket</LectureTerm>). The value is stored at that index. When you look up a key, the hash function computes the same index, and retrieval is instant, with no searching required.
            </LectureP>
            <LectureP>
                When two different keys hash to the same bucket, that is a <LectureTip tip="Two different keys hash to the same bucket. Resolved by chaining (linked list per bucket) or open addressing (probe for the next open slot). Why O(1) is average, not guaranteed.">collision</LectureTip>. Hash maps resolve collisions through <em>chaining</em> (each bucket holds a linked list of entries) or <em>open addressing</em> (probe for the next available slot). You do not need to implement collision resolution (Python handles it), but understanding the mechanism explains why O(1) is the <em>average</em> case, not a guarantee. In the worst case (all keys collide), every operation degrades to O(n).
            </LectureP>

            <LectureSubHeading title="Python's dict and set" />

            <LectureP>
                Python's <LectureTip code tip="Python's built-in hash map. O(1) average lookup, insert, delete by key. The most-used data structure in Python, and you've been using it since day one.">dict</LectureTip> is a hash map. <LectureTip code tip="Python's hash set: stores unique keys only (no values). O(1) average membership test. Use for deduplication and fast 'have I seen this?' checks.">set</LectureTip> is a hash set (keys only, no values). You have been using hash maps since day one. The <LectureTip code tip="Membership operator. O(1) on dict/set (hash lookup). O(n) on list (linear scan). Always prefer set/dict for membership checks over list.">in</LectureTip> operator on a dict or set is O(1) average; on a list, it is O(n) because every element must be checked.
            </LectureP>

            <CodeBlock language="python"
                title="hash_map_basics.py · practical dict and set usage"
                lines={[
                    '# Frequency counting: how many times does each word appear?',
                    'words = ["apple", "banana", "apple", "cherry", "banana", "apple"]',
                    'freq = {}',
                    'for word in words:',
                    '    freq[word] = freq.get(word, 0) + 1',
                    'print(freq)  # {"apple": 3, "banana": 2, "cherry": 1}',
                    '',
                    '',
                    '# Membership check: O(1) with set vs O(n) with list',
                    'seen = set()',
                    'for word in words:',
                    '    if word in seen:',
                    '        print(f"Duplicate: {word}")',
                    '    seen.add(word)',
                    '# Output: Duplicate: apple, Duplicate: banana, Duplicate: apple',
                    '',
                    '',
                    '# Default values with .get(key, default)',
                    'config = {"host": "localhost", "port": 8080}',
                    'timeout = config.get("timeout", 30)   # 30: key missing, returns default',
                    'host = config.get("host", "0.0.0.0")  # "localhost": key found, returns value',
                ]}
            />

            <LectureCallout type="tip">
                When to reach for a hash map: <strong className="text-foreground">"Have I seen this before?"</strong> calls for a set. <strong className="text-foreground">"How many times does X appear?"</strong> calls for a dict and frequency counting. <strong className="text-foreground">"What is the complement of X?"</strong> calls for storing values in a dict and looking up complements in O(1). These three questions cover a massive portion of hash map interview problems.
            </LectureCallout>

            <LectureP>
                Try it yourself. The exercise below uses JavaScript, where a plain object works as a hash map exactly like Python's dict.
            </LectureP>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 1: frequency counting with a hash map"
                prompt={<>Complete the loop so that <code>freq</code> counts how many times each word appears, then let the program log <code>3</code> (the count for <code>"apple"</code>). The output must be exactly <code>3</code>.</>}
                starter={'const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];\nconst freq = {};\nfor (const word of words) {\n  // increment the count for word in freq\n  // hint shape: freq[word] = ...\n}\nconsole.log(freq["apple"]);'}
                expected="3"
                hint='Use (freq[word] || 0) + 1 so missing keys start at zero.'
            />

            {/* ── 02 BIG-O NOTATION ────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Big-O Notation" />

            <LectureP>
                <LectureTip tip="Describes how an algorithm's runtime or space grows with input size. Drop constants and lower-order terms: 2n + 5 is O(n). Focused on the growth rate, not the exact time.">Big-O notation</LectureTip> describes how an algorithm's runtime (or space usage) grows as the input size grows. We care about the <strong className="text-foreground">growth rate</strong>, not the exact time; we drop constants and lower-order terms because they become irrelevant at scale. An O(n) algorithm might be slower than O(n²) for n = 5, but for n = 1,000,000 the difference is between one second and eleven days.
            </LectureP>

            <LectureSubHeading title="The common complexities" />

            <div className="my-6 space-y-1.5">
                {[
                    { complexity: 'O(1)', name: 'Constant', example: 'Dict lookup, list access by index, stack push/pop' },
                    { complexity: 'O(log n)', name: 'Logarithmic', example: 'Binary search, balanced BST insert/search' },
                    { complexity: 'O(n)', name: 'Linear', example: 'Single for-loop, linear search, in-order traversal' },
                    { complexity: 'O(n log n)', name: 'Linearithmic', example: "Sorting (Python's Timsort, merge sort)" },
                    { complexity: 'O(n²)', name: 'Quadratic', example: 'Nested loops, brute-force pair checking, bubble sort' },
                    { complexity: 'O(2ⁿ)', name: 'Exponential', example: 'Naive recursive Fibonacci, generating all subsets' },
                ].map((row) => (
                    <div key={row.complexity} className="flex items-start gap-3 rounded-lg border border-border px-4 py-2.5">
                        <code className="text-xs font-bold text-primary shrink-0 w-20 mt-0.5">{row.complexity}</code>
                        <div>
                            <p className="text-xs font-semibold text-foreground">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.example}</p>
                        </div>
                    </div>
                ))}
            </div>

            <CodeBlock language="python"
                title="complexity_examples.py · same problem, three different Big-Os"
                lines={[
                    '# Problem: does the list contain a duplicate?',
                    '',
                    '',
                    '# O(n²) brute force: compare every pair',
                    'def has_duplicate_brute(nums):',
                    '    for i in range(len(nums)):',
                    '        for j in range(i + 1, len(nums)):',
                    '            if nums[i] == nums[j]:',
                    '                return True',
                    '    return False',
                    '',
                    '',
                    '# O(n log n): sort first, then check adjacent elements',
                    'def has_duplicate_sort(nums):',
                    '    nums_sorted = sorted(nums)',
                    '    for i in range(1, len(nums_sorted)):',
                    '        if nums_sorted[i] == nums_sorted[i - 1]:',
                    '            return True',
                    '    return False',
                    '',
                    '',
                    '# O(n): use a hash set',
                    'def has_duplicate_set(nums):',
                    '    seen = set()',
                    '    for num in nums:',
                    '        if num in seen:',
                    '            return True',
                    '        seen.add(num)',
                    '    return False',
                    '',
                    '',
                    '# All three return the same answer.',
                    '# For n = 100,000:',
                    '#   brute  ≈ 5,000,000,000 comparisons',
                    '#   sort   ≈ 1,700,000 comparisons',
                    '#   set    ≈ 100,000 lookups',
                ]}
            />

            <LectureSubHeading title="The n = 10⁵ rule" />

            <LectureP>
                In interviews and competitive programming, input size constraints tell you which complexity you need before writing a single line of code. If n ≤ 10³, O(n²) will probably work. If n is around 10⁵, you need O(n log n) or better. If n exceeds 10⁶, you almost certainly need O(n). When you see the constraints, this rule immediately narrows down your approach.
            </LectureP>

            <LectureSubHeading title="Space complexity" />

            <LectureP>
                Space complexity measures memory the same way Big-O measures time. A hash map storing n items is O(n) space. A single variable is O(1). Creating a copy of an array is O(n). Recursive DFS on a balanced tree uses O(log n) stack frames; on a degenerate tree, O(n). When analyzing an algorithm, always state both time and space complexity.
            </LectureP>

            {/* ── 03 ANALYZING YOUR DATA STRUCTURES ─────────────────────────── */}
            <LectureSectionHeading number="03" title="Analyzing Your Data Structures" />

            <LectureP>
                Now that you understand Big-O, apply it to every data structure from Lecture 1, plus the hash map you just learned. This table is one of the most referenced tools in interview prep. Know these cold.
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden text-xs">
                <div className="grid grid-cols-5 bg-muted/30 px-4 py-2.5 border-b border-border">
                    <span className="font-bold text-foreground">Structure</span>
                    <span className="font-bold text-foreground">Access</span>
                    <span className="font-bold text-foreground">Search</span>
                    <span className="font-bold text-foreground">Insert</span>
                    <span className="font-bold text-foreground">Delete</span>
                </div>
                {[
                    { name: 'Python list', access: 'O(1)', search: 'O(n)', insert: 'O(n)*', delete: 'O(n)' },
                    { name: 'Stack', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
                    { name: 'Queue', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
                    { name: 'BST (balanced)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
                    { name: 'BST (worst)', access: 'O(n)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
                    { name: 'Hash map (avg)', access: 'n/a', search: 'O(1)', insert: 'O(1)', delete: 'O(1)' },
                    { name: 'Hash map (worst)', access: 'n/a', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
                ].map((row) => (
                    <div key={row.name} className="grid grid-cols-5 px-4 py-2 border-b border-border last:border-b-0">
                        <span className="font-semibold text-foreground">{row.name}</span>
                        <span className="text-muted-foreground font-mono">{row.access}</span>
                        <span className="text-muted-foreground font-mono">{row.search}</span>
                        <span className="text-muted-foreground font-mono">{row.insert}</span>
                        <span className="text-muted-foreground font-mono">{row.delete}</span>
                    </div>
                ))}
            </div>

            <LectureP>
                <strong className="text-foreground">*</strong> Python list <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">append()</code> is O(1) amortized, but inserting at an arbitrary index is O(n) because elements must shift. Hash map "access" is marked "n/a" because hash maps do not support index-based access; you access by key, which is the search operation.
            </LectureP>

            <LectureCallout type="info">
                This table explains why interviewers love hash maps: O(1) for the operations you care about most (lookup and insert). It also explains why BSTs matter: they give O(log n) <em>ordered</em> access, something hash maps cannot do (hash maps have no inherent order). Each structure has a sweet spot; the skill is matching the structure to the problem.
            </LectureCallout>

            {/* ── 04 TWO-POINTER PATTERN ────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Two-Pointer Pattern" />

            <LectureP>
                The <LectureTip tip="Two indices moving through a data structure in coordinated fashion. Turns O(n²) pair-checking into O(n). Two variants: opposite ends (sorted input) and same direction (in-place manipulation).">two-pointer pattern</LectureTip> uses two indices that move through a data structure in a coordinated way, reducing what would be O(n²) brute-force (checking every pair) to O(n). It appears in dozens of interview problems and has two main variants.
            </LectureP>

            <LectureSubHeading title="Opposite ends" />

            <LectureP>
                Start one pointer at the beginning and one at the end. Move them toward each other based on a condition. This works when the input is sorted or when the problem lets you sort it first without losing information.
            </LectureP>

            <CodeBlock language="python"
                title="two_pointer_opposite.py · find pair that sums to target in sorted array"
                lines={[
                    'def pair_sum(sorted_arr, target):',
                    '    """Return indices of two numbers that sum to target.',
                    '    Input must be sorted. O(n) time, O(1) space."""',
                    '    left, right = 0, len(sorted_arr) - 1',
                    '',
                    '    while left < right:',
                    '        total = sorted_arr[left] + sorted_arr[right]',
                    '        if total == target:',
                    '            return [left, right]',
                    '        elif total < target:',
                    '            left += 1    # need a bigger sum: move left forward',
                    '        else:',
                    '            right -= 1   # need a smaller sum: move right backward',
                    '',
                    '    return []  # no pair found',
                    '',
                    '',
                    '# Example',
                    'nums = [1, 3, 5, 7, 11, 15]',
                    'print(pair_sum(nums, 12))  # [0, 4]: nums[0] + nums[4] = 1 + 11 = 12',
                    'print(pair_sum(nums, 8))   # [1, 2]: nums[1] + nums[2] = 3 + 5 = 8',
                ]}
            />

            <LectureSubHeading title="Same direction (slow/fast)" />

            <LectureP>
                Both pointers start at the beginning. One moves faster or conditionally, while the other trails behind. This variant is used for in-place array manipulation: removing duplicates, partitioning, or detecting cycles in linked lists.
            </LectureP>

            <CodeBlock language="python"
                title="two_pointer_same.py · remove duplicates from sorted array in-place"
                lines={[
                    'def remove_duplicates(sorted_arr):',
                    '    """Remove duplicates in-place, return new length.',
                    '    O(n) time, O(1) space."""',
                    '    if not sorted_arr:',
                    '        return 0',
                    '',
                    '    write = 1  # slow pointer: next position to write a unique value',
                    '',
                    '    for read in range(1, len(sorted_arr)):  # fast pointer',
                    '        if sorted_arr[read] != sorted_arr[read - 1]:',
                    '            sorted_arr[write] = sorted_arr[read]',
                    '            write += 1',
                    '',
                    '    return write  # number of unique elements',
                    '',
                    '',
                    '# Example',
                    'arr = [1, 1, 2, 3, 3, 3, 4]',
                    'length = remove_duplicates(arr)',
                    'print(arr[:length])  # [1, 2, 3, 4]',
                ]}
            />

            <LectureP>
                Recognize the pattern: <strong className="text-foreground">"given a sorted array, find a pair..."</strong> means opposite-end two pointers. <strong className="text-foreground">"reorganize an array in-place..."</strong> means same-direction two pointers.
            </LectureP>

            <LectureCallout type="tip">
                LeetCode practice for two-pointer: Two Sum II (opposite ends, sorted input), Container With Most Water (opposite ends, maximize area), Remove Duplicates from Sorted Array (same direction), and Move Zeroes (same direction).
            </LectureCallout>

            {/* ── 05 SLIDING WINDOW PATTERN ─────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Sliding Window Pattern" />

            <LectureP>
                The <LectureTip tip="A contiguous subarray or substring that slides across input. Each element enters and leaves the window exactly once, reducing O(n×k) recalculation to O(n). Fixed-size or variable-size.">sliding window pattern</LectureTip> maintains a "window" (a contiguous subarray or substring) and slides it across the input, updating a running state as elements enter and leave the window. This reduces O(n × k) brute-force recalculation to O(n) because each element is added and removed from the window exactly once.
            </LectureP>

            <LectureSubHeading title="Fixed-size window" />

            <LectureP>
                When the window size is fixed (e.g., "subarray of length k"), initialize the window with the first k elements, then slide: add the next element, remove the oldest, update the aggregate.
            </LectureP>

            <CodeBlock language="python"
                title="sliding_window_fixed.py · maximum sum subarray of size k"
                lines={[
                    'def max_sum_subarray(arr, k):',
                    '    """Find the maximum sum of any contiguous subarray of size k.',
                    '    O(n) time, O(1) space."""',
                    '    if len(arr) < k:',
                    '        return 0',
                    '',
                    '    # Initialize: sum of first window',
                    '    window_sum = sum(arr[:k])',
                    '    best = window_sum',
                    '',
                    '    # Slide the window: add next element, remove oldest',
                    '    for i in range(k, len(arr)):',
                    '        window_sum += arr[i] - arr[i - k]',
                    '        best = max(best, window_sum)',
                    '',
                    '    return best',
                    '',
                    '',
                    '# Example',
                    'arr = [2, 1, 5, 1, 3, 2]',
                    'print(max_sum_subarray(arr, 3))  # 9: subarray [5, 1, 3]',
                ]}
            />

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 2: fixed-size sliding window"
                prompt={<>Complete the loop so the program logs <code>9</code>, the maximum sum of any contiguous subarray of size 3 in <code>[2, 1, 5, 1, 3, 2]</code>. Slide the window by adding <code>arr[i]</code>, subtracting <code>arr[i - k]</code>, and keeping the best sum. The output must be exactly <code>9</code>.</>}
                starter={'const arr = [2, 1, 5, 1, 3, 2];\nconst k = 3;\nlet windowSum = arr[0] + arr[1] + arr[2]; // sum of the first window\nlet best = windowSum;\nfor (let i = k; i < arr.length; i++) {\n  // add arr[i], remove arr[i - k], update best\n}\nconsole.log(best);'}
                expected="9"
                hint="windowSum += arr[i] - arr[i - k]; then best = Math.max(best, windowSum);"
            />

            <LectureSubHeading title="Variable-size window" />

            <LectureP>
                When the window size is not fixed, use two pointers: expand the right boundary to include new elements, and shrink the left boundary when a constraint is violated. The window grows and shrinks as needed.
            </LectureP>

            <CodeBlock language="python"
                title="sliding_window_variable.py · longest substring without repeating characters"
                lines={[
                    'def longest_unique_substring(s):',
                    '    """Find the length of the longest substring with no repeating characters.',
                    '    O(n) time, O(min(n, alphabet)) space."""',
                    '    char_set = set()',
                    '    left = 0',
                    '    best = 0',
                    '',
                    '    for right in range(len(s)):',
                    '        # Shrink window until the duplicate is removed',
                    '        while s[right] in char_set:',
                    '            char_set.remove(s[left])',
                    '            left += 1',
                    '',
                    '        char_set.add(s[right])',
                    '        best = max(best, right - left + 1)',
                    '',
                    '    return best',
                    '',
                    '',
                    '# Example',
                    'print(longest_unique_substring("abcabcbb"))  # 3: "abc"',
                    'print(longest_unique_substring("bbbbb"))     # 1: "b"',
                    'print(longest_unique_substring("pwwkew"))     # 3: "wke"',
                ]}
            />

            <LectureP>
                Recognize the pattern: <strong className="text-foreground">"contiguous subarray of size k"</strong> means fixed sliding window. <strong className="text-foreground">"longest/shortest substring satisfying a condition"</strong> means variable sliding window.
            </LectureP>

            <LectureCallout type="tip">
                LeetCode practice for sliding window: Maximum Average Subarray I (fixed), Longest Substring Without Repeating Characters (variable), Minimum Size Subarray Sum (variable), and Minimum Window Substring (variable, hard).
            </LectureCallout>

            {/* ── 06 HASH MAP PATTERNS ──────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Hash Map Patterns in Interviews" />

            <LectureP>
                Hash maps appear in interviews more than any other data structure. Three patterns cover the vast majority of hash-map-based problems. Learn to recognize each one and the solution structure becomes automatic.
            </LectureP>

            <LectureSubHeading title="Pattern 1: complement lookup (Two Sum)" />

            <LectureP>
                For each element, compute its complement (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">target - element</code>), check if the complement exists in the map, and if not, store the current element. One pass, O(n) time, O(n) space. This is the single most-asked interview question.
            </LectureP>

            <CodeBlock language="python"
                title="two_sum.py · the canonical hash map problem"
                lines={[
                    'def two_sum(nums, target):',
                    '    """Return indices of two numbers that add up to target.',
                    '    O(n) time, O(n) space."""',
                    '    seen = {}  # value -> index',
                    '',
                    '    for i, num in enumerate(nums):',
                    '        complement = target - num',
                    '        if complement in seen:',
                    '            return [seen[complement], i]',
                    '        seen[num] = i',
                    '',
                    '    return []  # no solution',
                    '',
                    '',
                    '# Example',
                    'print(two_sum([2, 7, 11, 15], 9))   # [0, 1]: 2 + 7 = 9',
                    'print(two_sum([3, 2, 4], 6))         # [1, 2]: 2 + 4 = 6',
                ]}
            />

            <LectureSubHeading title="Pattern 2: frequency counting" />

            <LectureP>
                Count occurrences of each element with a dict, then use those counts to answer the question. This pattern solves: "is X an anagram of Y?", "what is the most frequent element?", "which elements appear exactly once?"
            </LectureP>

            <CodeBlock language="python"
                title="frequency.py · anagram check via frequency counting"
                lines={[
                    'def is_anagram(s, t):',
                    '    """Check if t is an anagram of s.',
                    '    O(n) time, O(1) space (bounded by alphabet size)."""',
                    '    if len(s) != len(t):',
                    '        return False',
                    '',
                    '    freq = {}',
                    '    for char in s:',
                    '        freq[char] = freq.get(char, 0) + 1',
                    '',
                    '    for char in t:',
                    '        if char not in freq or freq[char] == 0:',
                    '            return False',
                    '        freq[char] -= 1',
                    '',
                    '    return True',
                    '',
                    '',
                    '# Examples',
                    'print(is_anagram("listen", "silent"))  # True',
                    'print(is_anagram("hello", "world"))    # False',
                ]}
            />

            <LectureSubHeading title="Pattern 3: group by key" />

            <LectureP>
                Use a dict to bucket items by some derived key. Given a list of words, group all anagrams together by using the sorted characters as the key. Given a list of transactions, group by user ID. The pattern is always: compute a key, append to the list at that key.
            </LectureP>

            <CodeBlock language="python"
                title="group_anagrams.py · group by sorted characters"
                lines={[
                    'from collections import defaultdict',
                    '',
                    '',
                    'def group_anagrams(words):',
                    '    """Group words that are anagrams of each other.',
                    '    O(n * k log k) time where k = max word length."""',
                    '    groups = defaultdict(list)',
                    '',
                    '    for word in words:',
                    '        key = "".join(sorted(word))  # "eat" -> "aet", "tea" -> "aet"',
                    '        groups[key].append(word)',
                    '',
                    '    return list(groups.values())',
                    '',
                    '',
                    '# Example',
                    'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
                    'print(group_anagrams(words))',
                    '# [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
                ]}
            />

            <LectureCallout type="info">
                These three patterns (complement lookup, frequency counting, and group-by-key) cover an enormous fraction of hash-map interview questions. When you see a problem and think "I need fast lookup," start with one of these three.
            </LectureCallout>

            {/* ── 07 THE PROBLEM-SOLVING FRAMEWORK ──────────────────────────── */}
            <LectureSectionHeading number="07" title="The Problem-Solving Framework" />

            <LectureP>
                Knowing data structures and patterns is necessary but not sufficient. You also need a <strong className="text-foreground">systematic process</strong> for approaching unfamiliar problems. The following six steps work for interview problems, homework assignments, and real engineering tasks. The steps are always the same; only the problem changes.
            </LectureP>

            <div className="my-6 space-y-2">
                {[
                    { step: '1', title: 'Understand', desc: 'Restate the problem in your own words. Clarify inputs, outputs, and constraints. Ask: what are the edge cases? What is guaranteed?' },
                    { step: '2', title: 'Trace examples', desc: 'Walk through 2-3 concrete examples by hand before writing any code. This reveals patterns and catches misunderstandings early.' },
                    { step: '3', title: 'Brute force', desc: 'Write the simplest correct solution, even if it is O(n²) or worse. A working solution is better than no solution. Interviewers want to see you can produce correctness first.' },
                    { step: '4', title: 'Optimize', desc: 'Identify the bottleneck. Can a hash map eliminate a nested loop? Can two pointers replace brute-force pair checking? Can a sliding window avoid recomputation?' },
                    { step: '5', title: 'Code', desc: 'Translate the optimized approach into clean, readable code. Name variables clearly. Handle edge cases. Do not optimize prematurely; clarity first.' },
                    { step: '6', title: 'Test', desc: 'Run through edge cases: empty input, single element, all duplicates, negative numbers, maximum size. Trace your code on at least one non-trivial example.' },
                ].map((row) => (
                    <div key={row.step} className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
                        <span className="text-lg font-black text-primary/20 select-none shrink-0 w-6 text-right">{row.step}</span>
                        <div>
                            <p className="text-xs font-bold text-foreground">{row.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{row.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <LectureSubHeading title="Worked example: first repeating character" />

            <LectureP>
                <strong className="text-foreground">Problem:</strong> given a string, return the first character that appears more than once. Return <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">None</code> if all characters are unique. This is one of the Activity challenges, so let's walk through the framework.
            </LectureP>

            <LectureP>
                <strong className="text-foreground">1. Understand:</strong> Input is a string. Output is a single character (or None). "First repeating" means the first character we encounter <em>for the second time</em>, not the character with the smallest index of its first occurrence.
            </LectureP>
            <LectureP>
                <strong className="text-foreground">2. Trace:</strong> For <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">"abcadb"</code> → walk through: a (new), b (new), c (new), a (seen!) → return "a". For <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">"abcdef"</code> → all unique → return None.
            </LectureP>
            <LectureP>
                <strong className="text-foreground">3. Brute force:</strong> For each character, scan the rest of the string to check if it appears again. O(n²).
            </LectureP>
            <LectureP>
                <strong className="text-foreground">4. Optimize:</strong> The bottleneck is "have I seen this character before?", and that is a hash set lookup. One pass through the string, checking membership in a set at each step. O(n) time, O(1) space (alphabet is bounded).
            </LectureP>

            <CodeBlock language="python"
                title="first_repeat.py · applying the framework"
                lines={[
                    '# Step 5: Code',
                    'def first_repeat(s):',
                    '    """Return the first character that appears more than once.',
                    '    O(n) time, O(1) space (bounded alphabet)."""',
                    '    seen = set()',
                    '    for char in s:',
                    '        if char in seen:',
                    '            return char',
                    '        seen.add(char)',
                    '    return None',
                    '',
                    '',
                    '# Step 6: Test',
                    'print(first_repeat("abcadb"))   # "a"',
                    'print(first_repeat("abcdef"))   # None',
                    'print(first_repeat(""))          # None  (edge case: empty string)',
                    'print(first_repeat("aabb"))      # "a"  (first duplicate encountered)',
                ]}
            />

            <LectureCallout type="info">
                This framework is not just for interviews; it is how experienced engineers approach any unfamiliar problem. The difference between a junior and senior engineer is often not what they know, but that they follow a process instead of guessing. Build the habit now.
            </LectureCallout>


        </LectureLayout>
    );
}
