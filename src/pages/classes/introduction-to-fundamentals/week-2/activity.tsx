import { Binary } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week2Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={2}
                    session="Activity"
                    title="Data Structures in Practice"
                    description="Implement core data structures and patterns in Python. No new language, just the concepts from this week's lectures. BST, stack, and hash map; you'll use these in C++ next week (Week 3)."
                    icon={<Binary className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    Use Python (or JavaScript if you prefer). Create a folder <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">week2-dsa</code> and one file per challenge. Run with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python bst.py</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python min_stack.py</code>, etc.
                </LectureCallout>

                {/* ── 01 BINARY SEARCH TREE ───────────────────────────────────── */}
                <LectureSectionHeading number="01" title="Binary Search Tree" />

                <LectureP>
                    Implement a BST that stores integers. You need insert and in-order traversal. No standard-library tree; build the nodes and links yourself so the structure is explicit.
                </LectureP>

                <ActivityChallenge
                    number="1.1"
                    title="Node and Tree"
                    description="Define the structure."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">bst.py</code> with a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Node</code> class: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">val</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">left</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">right</code> (all <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">None</code> by default)</ActivityTask>
                        <ActivityTask>Create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">BST</code> class with a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">root</code> attribute (initially <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">None</code>)</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.2"
                    title="Insert"
                    description="Recursive insert: smaller values go left, larger go right."
                >
                    <div className="space-y-1">
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">insert(self, val)</code> on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">BST</code></ActivityTask>
                        <ActivityTask>If <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">root is None</code>, set <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">root = Node(val)</code></ActivityTask>
                        <ActivityTask>Otherwise call a helper <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">_insert(node, val)</code>: if <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">val &lt; node.val</code> go left (create node if <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node.left is None</code>), else go right</ActivityTask>
                        <ActivityTask>Test: insert 5, 2, 8, 1, 3 and verify the tree shape in the debugger or with a small print helper</ActivityTask>
                    </div>

                    <ActivityHint label="recursive insert">
                        <code className="bg-muted px-1 rounded text-xs">def _insert(node, val): if val &lt; node.val: node.left = Node(val) if node.left is None else _insert(node.left, val). Else same for right.</code>
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.3"
                    title="In-Order Traversal"
                    description="Left → root → right gives sorted order."
                >
                    <div className="space-y-1">
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">inorder(self)</code> that returns a list of values in ascending order</ActivityTask>
                        <ActivityTask>Use a helper <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">_inorder(node, result)</code>: if node is None return; recurse left; append node.val; recurse right</ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">print(bst.inorder())</code> after inserts; you should see <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">[1, 2, 3, 5, 8]</code></ActivityTask>
                    </div>
                </ActivityChallenge>

                {/* ── 02 MIN STACK ────────────────────────────────────────────── */}
                <LectureSectionHeading number="02" title="Min Stack" />

                <LectureP>
                    A stack that supports <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pop</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">top</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_min</code>, all in O(1) time. The trick: a second stack (or list) that tracks the minimum at each level.
                </LectureP>

                <ActivityChallenge
                    number="2.1"
                    title="Implement MinStack"
                    description="Use two lists: one for values, one for minimums."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">min_stack.py</code> with a class <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">MinStack</code></ActivityTask>
                        <ActivityTask>Internal: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">self.stack = []</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">self.mins = []</code></ActivityTask>
                        <ActivityTask><code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push(val)</code>: append to stack. If mins is empty or val &lt;= mins[-1], append val to mins</ActivityTask>
                        <ActivityTask><code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pop()</code>: pop from stack; if that value equals mins[-1], pop from mins</ActivityTask>
                        <ActivityTask><code className="text-xs bg-muted px-1.5 py-0.5 rounded border">top()</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_min()</code>: return stack[-1] and mins[-1] (handle empty if you want)</ActivityTask>
                        <ActivityTask>Test: push 3, 1, 2; get_min → 1; pop; get_min → 1; pop; get_min → 3</ActivityTask>
                    </div>

                    <ActivityHint label="why track mins">
                        When you pop, you need to know what the minimum was before the value you added. The mins stack mirrors the minimum at each stack level.
                    </ActivityHint>
                </ActivityChallenge>

                <LectureP>
                    Before moving on, prove the MinStack logic works. This one runs right in the browser (JavaScript instead of Python, same idea).
                </LectureP>

                <InteractiveExercise
                    runtime="js"
                    language="javascript"
                    title="Exercise 1: Min Stack, live"
                    prompt={<>Complete <code>pop()</code> so the mins list stays in sync: when the popped value equals the current minimum, pop it from <code>mins</code> too. The script pushes 3, 1, 2, then pops twice. It must log exactly <code>3</code>.</>}
                    starter={"const stack = [];\nconst mins = [];\n\nfunction push(val) {\n  stack.push(val);\n  if (mins.length === 0 || val <= mins[mins.length - 1]) {\n    mins.push(val);\n  }\n}\n\nfunction pop() {\n  const val = stack.pop();\n  // if val equals the current minimum, pop from mins too\n}\n\nfunction getMin() {\n  return mins[mins.length - 1];\n}\n\npush(3);\npush(1);\npush(2);\npop();\npop();\nconsole.log(getMin());"}
                    expected="3"
                    hint="Inside pop(): if (val === mins[mins.length - 1]) mins.pop();"
                />

                {/* ── 03 HASH MAP PATTERNS ────────────────────────────────────── */}
                <LectureSectionHeading number="03" title="Hash Map Practice" />

                <LectureP>
                    Two classic problems that rely on hash maps for O(n) time. Implement both in a file <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">hashing.py</code>.
                </LectureP>

                <ActivityChallenge
                    number="3.1"
                    title="Two Sum"
                    description="Return indices of two numbers that add up to target."
                >
                    <div className="space-y-1">
                        <ActivityTask>Function <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">two_sum(nums: list[int], target: int) -&gt; list[int]</code></ActivityTask>
                        <ActivityTask>Use a dict mapping <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">value → index</code></ActivityTask>
                        <ActivityTask>One pass: for each <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">num</code>, check if <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">target - num</code> is in the dict; if yes return [that index, current index]; else store num and its index</ActivityTask>
                        <ActivityTask>Assume exactly one solution exists</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="3.2"
                    title="First Repeating Character"
                    description="Return the first character that appears more than once."
                >
                    <div className="space-y-1">
                        <ActivityTask>Function <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">first_repeat(s: str) -&gt; str | None</code></ActivityTask>
                        <ActivityTask>Use a set (or dict) to record characters seen so far</ActivityTask>
                        <ActivityTask>First pass: count occurrences (or use a set and check "if char in seen" then return char; else add char)</ActivityTask>
                        <ActivityTask>Return the first character that has count &gt; 1 (or that you see again)</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureP>
                    Now verify the hash map pattern itself. Same one-pass Two Sum idea, runnable here in JavaScript.
                </LectureP>

                <InteractiveExercise
                    runtime="js"
                    language="javascript"
                    title="Exercise 2: Two Sum, live"
                    prompt={<>Finish the loop body of <code>twoSum</code> using the one-pass dictionary approach. For <code>[2, 7, 11, 15]</code> with target <code>9</code> the answer is indices 0 and 1, so the script must log exactly <code>0,1</code>.</>}
                    starter={"function twoSum(nums, target) {\n  const seen = {}; // value -> index\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    // if need is in seen, return [seen[need], i]\n    // otherwise record nums[i] -> i in seen\n  }\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9).join(\",\"));"}
                    expected="0,1"
                    hint="if (need in seen) return [seen[need], i]; then seen[nums[i]] = i;"
                />

                <LectureCallout type="info">
                    You have completed the Activity when all six challenges produce correct output: (1) BST insert builds the correct tree shape, (2) in-order traversal prints <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">[1, 2, 3, 5, 8]</code>, (3) MinStack returns the correct minimum after each push/pop, (4) Two Sum returns valid index pairs, (5) First Repeating Character returns the correct character (or None), and (6) all edge cases pass (empty inputs, single elements, no solution).
                </LectureCallout>

                <LectureP>
                    To demonstrate completion, run each file and paste the output. Your instructor or TA will verify the results match the expected values listed in each challenge. If you finish early, try adding BST deletion or implementing the challenges in a second language.
                </LectureP>

                <LectureCallout type="tip">
                    These patterns (BST, stack-with-extra-invariant, and hash map for O(1) lookup) show up in Week 3 when you build the C++ Phonebook. Here you get the logic without the syntax; next week you apply the same ideas in C++.
                </LectureCallout>

                
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
