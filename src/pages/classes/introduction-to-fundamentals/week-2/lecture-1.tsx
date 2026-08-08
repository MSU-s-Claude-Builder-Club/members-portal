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

// ── BFS vs DFS comparison diagram ────────────────────────────────────────────
const BfsDfsDiagram = () => (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
            {
                label: 'BFS: Breadth-First Search',
                color: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800',
                header: 'bg-blue-50 dark:bg-blue-950/30',
                order: ['Visit root (level 0)', 'Visit all children (level 1)', 'Visit all grandchildren (level 2)'],
                orderLabel: 'Visit order by level',
                structure: 'Queue (FIFO)',
                use: 'Shortest path, level-order traversal, "nearest" problems',
                note: 'Explores all nodes at depth d before any node at depth d+1.',
            },
            {
                label: 'DFS: Depth-First Search',
                color: 'text-orange-600 dark:text-orange-400',
                border: 'border-orange-200 dark:border-orange-800',
                header: 'bg-orange-50 dark:bg-orange-950/30',
                order: ['Visit root', 'Go all the way down the left branch', 'Backtrack and explore the right branch'],
                orderLabel: 'Visit order (pre-order)',
                structure: 'Stack / call stack (recursion)',
                use: 'Path existence, backtracking, tree serialization',
                note: 'Goes as deep as possible down one branch before backtracking.',
            },
        ].map((item) => (
            <div key={item.label} className={`rounded-xl border ${item.border} overflow-hidden`}>
                <div className={`px-4 py-2.5 ${item.header}`}>
                    <p className={`text-xs font-bold ${item.color}`}>{item.label}</p>
                </div>
                <div className="p-4 space-y-2.5">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">{item.orderLabel}</p>
                        <div className="space-y-1">
                            {item.order.map((step, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className={`text-xs font-mono font-bold w-4 shrink-0 ${item.color}`}>{i + 1}.</span>
                                    <code className="text-xs text-foreground">{step}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-1 border-t border-border space-y-1">
                        <p className="text-xs"><span className="text-muted-foreground">Data structure: </span><span className="font-semibold text-foreground">{item.structure}</span></p>
                        <p className="text-xs"><span className="text-muted-foreground">Best for: </span><span className="text-foreground">{item.use}</span></p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default function Week2Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={2}
                session="Lecture 1"
                title="Trees, Stacks & Queues"
                description="Binary trees, BSTs, in-order traversal, stacks, and queues: the non-linear structures that show up in databases, compilers, and every technical interview you will ever take."
                icon={<Binary className="h-4 w-4" />}
            />

            {/* ── 01 WHAT IS A DATA STRUCTURE? ──────────────────────────────── */}
            <LectureSectionHeading number="01" title="What Is a Data Structure?" />

            <LectureP>
                You have already used data structures. Python's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">list</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">dict</code> are data structures. A <LectureTip tip="A way of organizing data so that specific operations (insert, search, delete) are efficient. The right choice depends on which operations your problem needs to be fast.">data structure</LectureTip> is a way of organizing data so that specific operations (insert, search, delete, sort) are efficient. Different structures optimize for different operations, and choosing the right one is often the difference between a solution that works and one that's fast.
            </LectureP>
            <LectureP>
                Data structures fall into two families. <LectureTerm>Linear</LectureTerm> structures arrange elements in a sequence: arrays, linked lists, stacks, and queues. <LectureTerm>Non-linear</LectureTerm> structures arrange elements in hierarchies or networks: trees and graphs. This lecture covers the core structures from both families that appear in virtually every technical interview and production codebase.
            </LectureP>

            <LectureCallout type="info">
                The theme of this week: the right data structure turns an O(n²) solution into an O(n) one. Every section below introduces a structure, explains <em>what</em> it's good at, and shows <em>when</em> to reach for it. Lecture 2 formalizes this with Big-O notation.
            </LectureCallout>

            {/* ── 02 STACKS ────────────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Stacks: Last In, First Out" />

            <LectureP>
                A <LectureTip tip="LIFO (Last In, First Out). Like a stack of plates. push, pop, peek, is_empty are all O(1). Used for undo systems, expression parsing, DFS, and call stacks.">stack</LectureTip> works like a stack of plates: you can only add to the top and remove from the top. The last item you put on is the first item you take off, <LectureTip tip="Last In, First Out. The most recently added item is the first one removed. Think: stack of plates, browser back button, Ctrl+Z undo.">LIFO</LectureTip> (Last In, First Out). There are four operations, and all of them are O(1):
            </LectureP>
            <LectureP>
                <strong className="text-foreground">push</strong> adds an element to the top. <strong className="text-foreground">pop</strong> removes and returns the top element. <strong className="text-foreground">peek</strong> returns the top element without removing it. <strong className="text-foreground">is_empty</strong> checks whether the stack has any elements.
            </LectureP>

            <CodeBlock language="python"
                title="stack.py · stack implementation using a Python list"
                lines={[
                    'class Stack:',
                    '    def __init__(self):',
                    '        self._items = []',
                    '',
                    '    def push(self, val):',
                    '        self._items.append(val)',
                    '',
                    '    def pop(self):',
                    '        if self.is_empty():',
                    '            raise IndexError("pop from empty stack")',
                    '        return self._items.pop()',
                    '',
                    '    def peek(self):',
                    '        if self.is_empty():',
                    '            raise IndexError("peek at empty stack")',
                    '        return self._items[-1]',
                    '',
                    '    def is_empty(self):',
                    '        return len(self._items) == 0',
                    '',
                    '    def __len__(self):',
                    '        return len(self._items)',
                    '',
                    '',
                    '# Usage',
                    's = Stack()',
                    's.push(10)',
                    's.push(20)',
                    's.push(30)',
                    'print(s.peek())   # 30, top of stack',
                    'print(s.pop())    # 30, removed from top',
                    'print(s.peek())   # 20, new top',
                ]}
            />

            <LectureSubHeading title="The call stack" />

            <LectureP>
                Your program already uses a stack. Every time Python calls a function, it pushes a <LectureTerm>stack frame</LectureTerm> onto the <LectureTip tip="The runtime stack that tracks function calls. Each call pushes a frame (local variables + return address); each return pops one. Overflow causes RecursionError in Python.">call stack</LectureTip>, containing the function's local variables, parameters, and the return address. When the function returns, the frame is popped. This is why recursion works: each recursive call adds a frame, and each return removes one. It is also why infinite recursion crashes with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">RecursionError: maximum recursion depth exceeded</code>: the stack ran out of space.
            </LectureP>

            <LectureCallout type="tip">
                Real-world stacks: your browser's back button is a stack of visited pages. An undo system (Ctrl+Z) is a stack of actions. Expression parsers use a stack to match opening and closing brackets. Any time you need "most recent first," think stack.
            </LectureCallout>

            <LectureP>
                Try it yourself. In JavaScript a plain array works as a stack: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push()</code> adds to the top and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pop()</code> removes from the top.
            </LectureP>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 1: Pop the Stack"
                prompt={<>Three values are pushed onto the stack: 10, 20, then 30. Pop the top element exactly once, then log the new top of the stack. Your code must log exactly <code>20</code>.</>}
                starter={"const stack = [];\nstack.push(10);\nstack.push(20);\nstack.push(30);\n\n// 1. Pop the top element off the stack\n// 2. Then this line should log the new top: 20\nconsole.log(stack[stack.length - 1]);"}
                expected="20"
                hint="Call stack.pop() once before the console.log. LIFO: 30 went on last, so it comes off first, leaving 20 on top."
            />

            {/* ── 03 QUEUES ────────────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Queues: First In, First Out" />

            <LectureP>
                A <LectureTip tip="FIFO (First In, First Out). Like a line at a store. enqueue, dequeue, peek, is_empty are all O(1) with deque. Used for BFS, task scheduling, message queues.">queue</LectureTip> works like a line at a coffee shop: the first person in line is the first person served, <LectureTip tip="First In, First Out. Items are processed in the order they arrive. Think: checkout line, print queue, BFS traversal.">FIFO</LectureTip> (First In, First Out). Like stacks, queues have four core operations, all O(1) when implemented correctly:
            </LectureP>
            <LectureP>
                <strong className="text-foreground">enqueue</strong> adds an element to the back. <strong className="text-foreground">dequeue</strong> removes and returns the front element. <strong className="text-foreground">peek</strong> returns the front element without removing it. <strong className="text-foreground">is_empty</strong> checks whether the queue has any elements.
            </LectureP>

            <CodeBlock language="python"
                title="queue.py · queue implementation using collections.deque"
                lines={[
                    'from collections import deque',
                    '',
                    '',
                    'class Queue:',
                    '    def __init__(self):',
                    '        self._items = deque()',
                    '',
                    '    def enqueue(self, val):',
                    '        self._items.append(val)',
                    '',
                    '    def dequeue(self):',
                    '        if self.is_empty():',
                    '            raise IndexError("dequeue from empty queue")',
                    '        return self._items.popleft()',
                    '',
                    '    def peek(self):',
                    '        if self.is_empty():',
                    '            raise IndexError("peek at empty queue")',
                    '        return self._items[0]',
                    '',
                    '    def is_empty(self):',
                    '        return len(self._items) == 0',
                    '',
                    '    def __len__(self):',
                    '        return len(self._items)',
                    '',
                    '',
                    '# Usage',
                    'q = Queue()',
                    'q.enqueue("Alice")',
                    'q.enqueue("Bob")',
                    'q.enqueue("Charlie")',
                    'print(q.dequeue())  # "Alice", first in, first out',
                    'print(q.peek())     # "Bob", next in line',
                ]}
            />

            <LectureCallout type="warning">
                Do not use <LectureTip code tip="Removes the first element of a list. O(n) because every remaining element must shift left by one index. Never use as a queue; use deque.popleft() instead." warn>list.pop(0)</LectureTip> as a queue: it is O(n) because every remaining element must shift left by one index. Python's <LectureTip code tip="Double-ended queue from collections. O(1) append and popleft. Backed by a doubly-linked list. The correct way to implement queues in Python.">collections.deque</LectureTip> gives O(1) <LectureTip code tip="Remove and return the leftmost element in O(1). The correct dequeue operation. list.pop(0) does the same thing but in O(n).">popleft()</LectureTip> using a doubly-linked list internally. Always use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deque</code> for queues.
            </LectureCallout>

            <LectureP>
                Real-world queues: task schedulers process jobs in order. BFS uses a queue to explore level-by-level (you will see this later in this lecture). Print queues, message queues (Kafka, RabbitMQ), and HTTP request pipelines are all FIFO structures.
            </LectureP>

            <LectureP>
                Your turn. In JavaScript you can model a queue with an array: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push()</code> enqueues at the back and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">shift()</code> dequeues from the front.
            </LectureP>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 2: Serve the Queue"
                prompt={<>Three people join the line: Alice, Bob, then Charlie. Dequeue (serve) the person at the front exactly once, then log the name of the new front of the queue. Your code must log exactly <code>Bob</code>.</>}
                starter={"const queue = [];\nqueue.push(\"Alice\");\nqueue.push(\"Bob\");\nqueue.push(\"Charlie\");\n\n// 1. Dequeue the front person from the queue\n// 2. Then this line should log the new front: Bob\nconsole.log(queue[0]);"}
                expected="Bob"
                hint="Call queue.shift() once before the console.log. FIFO: Alice arrived first, so she is served first, leaving Bob at the front."
            />

            {/* ── 04 TREES FROM FIRST PRINCIPLES ───────────────────────────── */}
            <LectureSectionHeading number="04" title="Trees From First Principles" />

            <LectureP>
                A <LectureTip tip="Hierarchical data structure with a root node at the top. Each node has zero or more children. No cycles. File systems, the HTML DOM, and JSON are all trees.">tree</LectureTip> is a non-linear data structure where elements are arranged in a hierarchy. Every tree has a single <LectureTerm>root</LectureTerm> node at the top. Each node can have zero or more <LectureTerm>children</LectureTerm>. A node with no children is called a <LectureTerm>leaf</LectureTerm>. The connection between a parent and child is called an <LectureTerm>edge</LectureTerm>.
            </LectureP>

            <LectureSubHeading title="Key terminology" />

            <LectureP>
                The <LectureTerm>depth</LectureTerm> of a node is how many edges separate it from the root (the root has depth 0). The <LectureTerm>height</LectureTerm> of a tree is the depth of its deepest leaf. A <LectureTerm>subtree</LectureTerm> is a node plus all of its descendants; every node in a tree is the root of its own subtree. Nodes that share the same parent are <LectureTerm>siblings</LectureTerm>.
            </LectureP>

            <LectureSubHeading title="Binary trees" />

            <LectureP>
                A <LectureTerm>binary tree</LectureTerm> is a tree where every node has at most two children: a <strong className="text-foreground">left</strong> child and a <strong className="text-foreground">right</strong> child. Binary trees are the most commonly tested tree structure in interviews. Not all trees are binary: file systems are n-ary trees (folders contain any number of subfolders), the HTML DOM is a tree where each element can have many children, and JSON is a tree-structured format.
            </LectureP>

            <CodeBlock language="python"
                title="tree_node.py · binary tree node"
                lines={[
                    'class TreeNode:',
                    '    def __init__(self, val):',
                    '        self.val = val',
                    '        self.left = None',
                    '        self.right = None',
                    '',
                    '',
                    '# Build a small tree by hand:',
                    '#        5',
                    '#       / \\',
                    '#      3    8',
                    '#     / \\',
                    '#    1   4',
                    'root = TreeNode(5)',
                    'root.left = TreeNode(3)',
                    'root.right = TreeNode(8)',
                    'root.left.left = TreeNode(1)',
                    'root.left.right = TreeNode(4)',
                ]}
            />

            <LectureCallout type="info">
                Trees are everywhere: your file system is a tree (directories contain subdirectories). The HTML DOM is a tree. Databases use B-trees for indexing. Compilers parse code into an Abstract Syntax Tree (AST). JSON and XML are tree-structured. When you see nested, hierarchical relationships, think tree.
            </LectureCallout>

            {/* ── 05 BINARY SEARCH TREES ────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Binary Search Trees" />

            <LectureP>
                A <LectureTip tip="A binary tree where left < parent < right for every node. Enables O(log n) search, insert, and delete; each step eliminates half the remaining values.">Binary Search Tree</LectureTip> (BST) is a binary tree with one critical rule: for every node, all values in the left subtree are <strong className="text-foreground">smaller</strong> and all values in the right subtree are <strong className="text-foreground">larger</strong>. This invariant turns search from O(n) to O(log n): at each node you eliminate half the remaining values, just like binary search on a sorted array.
            </LectureP>

            <LectureSubHeading title="Insertion" />

            <LectureP>
                To insert a value, start at the root and compare. If the value is less than the current node, go left. If greater, go right. When you reach <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">None</code>, that is where the new node goes. This is naturally recursive: each step reduces the problem to "insert into the left or right subtree."
            </LectureP>

            <LectureSubHeading title="Search" />

            <LectureP>
                Search follows the exact same pattern: compare, go left or right, repeat. If you reach <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">None</code>, the value is not in the tree. If you find a match, return it. The BST invariant guarantees you never need to search both subtrees.
            </LectureP>

            <CodeBlock language="python"
                title="bst.py · binary search tree with insert and search"
                lines={[
                    'class TreeNode:',
                    '    def __init__(self, val):',
                    '        self.val = val',
                    '        self.left = None',
                    '        self.right = None',
                    '',
                    '',
                    'class BST:',
                    '    def __init__(self):',
                    '        self.root = None',
                    '',
                    '    def insert(self, val):',
                    '        if self.root is None:',
                    '            self.root = TreeNode(val)',
                    '        else:',
                    '            self._insert(self.root, val)',
                    '',
                    '    def _insert(self, node, val):',
                    '        if val < node.val:',
                    '            if node.left is None:',
                    '                node.left = TreeNode(val)',
                    '            else:',
                    '                self._insert(node.left, val)',
                    '        else:',
                    '            if node.right is None:',
                    '                node.right = TreeNode(val)',
                    '            else:',
                    '                self._insert(node.right, val)',
                    '',
                    '    def search(self, val):',
                    '        return self._search(self.root, val)',
                    '',
                    '    def _search(self, node, val):',
                    '        if node is None:',
                    '            return False',
                    '        if val == node.val:',
                    '            return True',
                    '        if val < node.val:',
                    '            return self._search(node.left, val)',
                    '        return self._search(node.right, val)',
                    '',
                    '',
                    '# Usage',
                    'tree = BST()',
                    'for v in [5, 2, 8, 1, 3]:',
                    '    tree.insert(v)',
                    '',
                    'print(tree.search(3))   # True',
                    'print(tree.search(7))   # False',
                ]}
            />

            <LectureCallout type="warning">
                If you insert already-sorted data (1, 2, 3, 4, 5), the BST degrades into a linked list: every node has only a right child. Search becomes O(n) instead of O(log n). Self-balancing BSTs (AVL trees, Red-Black trees) automatically restructure after insertion to prevent this. They are beyond this course, but databases and language standard libraries use them internally.
            </LectureCallout>

            {/* ── 06 TREE TRAVERSALS ────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Tree Traversals" />

            <LectureP>
                <LectureTip tip="Visiting every node in a tree exactly once. Four standard orders: in-order (sorted for BST), pre-order (copy/serialize), post-order (delete/cleanup), level-order (BFS).">Traversal</LectureTip> means visiting every node in the tree exactly once. There are four standard traversals, and each produces a different ordering. The first three are depth-first (they go deep before going wide); the fourth is breadth-first (level by level).
            </LectureP>

            <LectureSubHeading title="In-order (left → node → right)" />
            <LectureP>
                Visit the left subtree, then the current node, then the right subtree. For a BST, in-order traversal always produces values in <strong className="text-foreground">sorted ascending order</strong>. This is the most important traversal for BSTs and the one the Activity will ask you to implement.
            </LectureP>

            <LectureSubHeading title="Pre-order (node → left → right)" />
            <LectureP>
                Visit the current node first, then the left subtree, then the right subtree. Pre-order is useful for <strong className="text-foreground">copying or serializing</strong> a tree: recording values in pre-order lets you reconstruct the exact tree shape later.
            </LectureP>

            <LectureSubHeading title="Post-order (left → right → node)" />
            <LectureP>
                Visit both subtrees first, then the current node. Post-order is useful for <strong className="text-foreground">deletion or cleanup</strong>: you process all children before the parent, ensuring nothing references deleted data.
            </LectureP>

            <LectureSubHeading title="Level-order / BFS (breadth-first)" />
            <LectureP>
                Visit all nodes at depth 0, then all at depth 1, then depth 2, and so on. This is a breadth-first traversal and it uses a <strong className="text-foreground">queue</strong>: enqueue the root, then repeatedly dequeue a node, process it, and enqueue its children.
            </LectureP>

            <CodeBlock language="python"
                title="traversals.py · all four tree traversals"
                lines={[
                    'from collections import deque',
                    '',
                    '',
                    'def inorder(node):',
                    '    """Left -> Node -> Right. Produces sorted order for BST."""',
                    '    if node is None:',
                    '        return []',
                    '    return inorder(node.left) + [node.val] + inorder(node.right)',
                    '',
                    '',
                    'def preorder(node):',
                    '    """Node -> Left -> Right. Good for copying/serializing."""',
                    '    if node is None:',
                    '        return []',
                    '    return [node.val] + preorder(node.left) + preorder(node.right)',
                    '',
                    '',
                    'def postorder(node):',
                    '    """Left -> Right -> Node. Good for deletion/cleanup."""',
                    '    if node is None:',
                    '        return []',
                    '    return postorder(node.left) + postorder(node.right) + [node.val]',
                    '',
                    '',
                    'def level_order(root):',
                    '    """Level by level using a queue (BFS)."""',
                    '    if root is None:',
                    '        return []',
                    '    result = []',
                    '    queue = deque([root])',
                    '    while queue:',
                    '        node = queue.popleft()',
                    '        result.append(node.val)',
                    '        if node.left:',
                    '            queue.append(node.left)',
                    '        if node.right:',
                    '            queue.append(node.right)',
                    '    return result',
                    '',
                    '',
                    '# Given BST with inserts [5, 2, 8, 1, 3]:',
                    '#        5',
                    '#       / \\',
                    '#      2    8',
                    '#     / \\',
                    '#    1   3',
                    'print(inorder(tree.root))      # [1, 2, 3, 5, 8], sorted!',
                    'print(preorder(tree.root))     # [5, 2, 1, 3, 8]',
                    'print(postorder(tree.root))    # [1, 3, 2, 8, 5]',
                    'print(level_order(tree.root))  # [5, 2, 8, 1, 3], level by level',
                ]}
            />

            <LectureCallout type="tip">
                The key insight: in-order traversal of a BST always produces sorted output. This is why BSTs power database indexes: an in-order scan gives you all records in sorted order without a separate sort step. When an interviewer asks you to "print a BST in sorted order," the answer is always in-order traversal.
            </LectureCallout>

            {/* ── 07 BFS VS DFS ─────────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="BFS vs. DFS: Choosing the Right One" />

            <LectureP>
                BFS and DFS are the two fundamental traversal strategies. They apply to trees, graphs, and any structure you can explore by "visiting neighbors." The choice between them is determined by the <strong className="text-foreground">shape of the answer</strong> you are looking for.
            </LectureP>

            <BfsDfsDiagram />

            <LectureP>
                <strong className="text-foreground">Use BFS</strong> when you need the <em>shortest</em> or <em>nearest</em> something: shortest path, minimum depth, nearest node satisfying a condition. BFS explores level by level, so the first match it finds is guaranteed to be the closest.
            </LectureP>
            <LectureP>
                <strong className="text-foreground">Use DFS</strong> when you need to explore <em>all possibilities</em> or check if <em>any path</em> satisfies a condition: "does a path from root to leaf sum to target?", "enumerate all combinations." DFS is also the natural choice when the problem is recursive: "solve the left subtree, solve the right subtree, combine results."
            </LectureP>

            <CodeBlock language="python"
                title="bfs_vs_dfs.py · same tree, different traversal order"
                lines={[
                    'from collections import deque',
                    '',
                    '',
                    'def dfs_iterative(root):',
                    '    """DFS using an explicit stack (pre-order)."""',
                    '    if root is None:',
                    '        return []',
                    '    result = []',
                    '    stack = [root]',
                    '    while stack:',
                    '        node = stack.pop()',
                    '        result.append(node.val)',
                    '        if node.right:              # push right first so left',
                    '            stack.append(node.right) # is processed first',
                    '        if node.left:',
                    '            stack.append(node.left)',
                    '    return result',
                    '',
                    '',
                    'def bfs(root):',
                    '    """BFS using a queue (level-order)."""',
                    '    if root is None:',
                    '        return []',
                    '    result = []',
                    '    queue = deque([root])',
                    '    while queue:',
                    '        node = queue.popleft()',
                    '        result.append(node.val)',
                    '        if node.left:',
                    '            queue.append(node.left)',
                    '        if node.right:',
                    '            queue.append(node.right)',
                    '    return result',
                    '',
                    '',
                    '# Same tree, different order',
                    'print(dfs_iterative(tree.root))  # [5, 2, 1, 3, 8], depth first',
                    'print(bfs(tree.root))            # [5, 2, 8, 1, 3], breadth first',
                ]}
            />

            <LectureCallout type="tip">
                Every recursive solution is implicitly DFS: it uses the call stack. Converting recursive DFS to iterative DFS means replacing the call stack with an explicit <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">stack</code> data structure. The logic is identical; only the mechanism changes. This is a common interview follow-up: "can you do it without recursion?"
            </LectureCallout>

            <LectureCallout type="info">
                Trees are a special case of a more general structure called a <LectureTip tip="Nodes connected by edges. Unlike trees, cycles are allowed and any node can connect to any other. Social networks, road maps, and dependency systems are graphs.">graph</LectureTip>. In a graph, nodes can connect to any other nodes, not just parents and children, and cycles are allowed. Social networks, road maps, and dependency systems are all graphs. The same BFS and DFS strategies you learned above apply to graphs, with one addition: a "visited" set to prevent infinite loops on cycles. You will encounter graph algorithms in dedicated algorithms coursework and in later weeks of this course.
            </LectureCallout>


        </LectureLayout>
    );
}
