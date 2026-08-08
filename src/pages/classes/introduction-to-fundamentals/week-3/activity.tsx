import { Cpu } from 'lucide-react';
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

export default function Week3Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={3}
                    session="Activity"
                    title="CLI Phonebook"
                    description="Build a full CLI Phonebook in C++ in two parts: Part 1 is the OOP foundation (Contact, PhoneBook, add/delete/list). Part 2 adds data structures: BST for sorted order, stack for undo, and a hash map for O(1) search by phone."
                    icon={<Cpu className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    Use one codebase for the whole activity. Compile after every challenge: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">g++ -std=c++17 -Wall phonebook.cpp -o phonebook && ./phonebook</code>. Fix errors as they appear.
                </LectureCallout>

                {/* ── PART 1: OOP FOUNDATION ─────────────────────────────────── */}
                <LectureSectionHeading number="01" title="Part 1: Contact and PhoneBook" />

                <LectureP>
                    Create the Contact class and a PhoneBook manager that stores contacts in a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vector</code>. You'll replace the vector with a BST in Part 2.
                </LectureP>

                <ActivityChallenge
                    number="1.1"
                    title="Contact Class"
                    description="A simple struct or class to hold one contact."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">phonebook.cpp</code> with includes: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">iostream</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vector</code></ActivityTask>
                        <ActivityTask>Define <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">struct Contact</code> (or class) with: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string firstName</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string lastName</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string phone</code></ActivityTask>
                        <ActivityTask>Add a constructor and a helper to print the contact (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">void print() const</code>)</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.2"
                    title="PhoneBook with vector"
                    description="Manager class with add, delete, list."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">class PhoneBook</code> with private <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vector&lt;Contact&gt; contacts</code> (or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vector&lt;Contact*&gt;</code> if you prefer)</ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">void addContact(Contact c)</code> that pushes onto the vector</ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">void listAll()</code> that loops and prints each contact</ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">void deleteContact(size_t index)</code> (or delete by name/phone) to remove from the vector</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.3"
                    title="Interactive Menu"
                    description="Wire Part 1 together."
                >
                    <div className="space-y-1">
                        <ActivityTask>In <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main()</code>, create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PhoneBook</code> and loop on a menu</ActivityTask>
                        <ActivityTask>Menu: (1) Add contact, (2) Delete contact, (3) List all, (0) Quit</ActivityTask>
                        <ActivityTask>For add: read first name, last name, phone from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cin</code> and call <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">addContact</code></ActivityTask>
                        <ActivityTask>For delete: list with indices and ask for index to delete (or search by name), then call <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deleteContact</code></ActivityTask>
                        <ActivityTask>Compile and run; verify add, list, and delete work before moving to Part 2</ActivityTask>
                    </div>

                    <ActivityHint label="cin and getline">
                        After <code className="bg-muted px-1 rounded">cin &gt;&gt; choice</code>, call <code className="bg-muted px-1 rounded">cin.ignore()</code> before <code className="bg-muted px-1 rounded">getline(cin, name)</code> so the newline isn't consumed as the name.
                    </ActivityHint>
                </ActivityChallenge>

                {/* ── PART 2: BST FOR ALPHABETICAL STORAGE ────────────────────── */}
                <LectureSectionHeading number="02" title="Part 2: BST for Alphabetical Storage" />

                <LectureP>
                    Replace the vector with a BST so that listing all contacts always comes out alphabetically (by last name) without sorting.
                </LectureP>

                <ActivityChallenge
                    number="2.1"
                    title="BST Node"
                    description="Create the tree structure."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ContactNode</code> struct with: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Contact* data</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ContactNode* left</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ContactNode* right</code>, and a constructor</ActivityTask>
                        <ActivityTask>In <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PhoneBook</code>, replace <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vector&lt;Contact&gt;</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ContactNode* root = nullptr</code></ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureCallout type="warning">
                    <strong className="text-foreground">Memory management with raw pointers:</strong> When you use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Contact*</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">new Contact(...)</code>, you own that memory. Every <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">new</code> must eventually have a matching <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">delete</code>. When you remove a node from the BST, delete both the Contact and the ContactNode. A production codebase would use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">unique_ptr</code> (covered in Lecture 2, section 06) to avoid manual memory management. For this activity, raw pointers are fine; just be mindful of cleanup.
                </LectureCallout>

                <ActivityChallenge
                    number="2.2"
                    title="BST Insert and In-Order List"
                    description="Recursive insert and traversal."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add private <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">insert(ContactNode* node, Contact* contact)</code>: compare by last name (case-insensitive); go left if smaller, right if larger; create new node at nullptr</ActivityTask>
                        <ActivityTask>Update <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">addContact</code> to call <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">insert(root, ...)</code> and update root if needed</ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">inOrder(ContactNode* node)</code>: left, visit (print contact), right</ActivityTask>
                        <ActivityTask>Call <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">inOrder(root)</code> from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">listAll()</code>; verify contacts print alphabetically</ActivityTask>
                    </div>

                    <ActivityHint label="recursive insert">
                        Base case: if (node == nullptr) return new ContactNode(contact). Else if (name &lt; node's name) node-&gt;left = insert(node-&gt;left, contact); else node-&gt;right = insert(node-&gt;right, contact). Return node.
                    </ActivityHint>
                </ActivityChallenge>

                <LectureP>
                    Quick check before you move on: make sure you can predict what an in-order traversal prints.
                </LectureP>

                <InteractiveExercise
                    runtime="check"
                    language="cpp"
                    title="Exercise 1: In-Order Traversal"
                    prompt={<>You insert three contacts into your BST in this order: last names <code>Smith</code>, then <code>Jones</code>, then <code>Adams</code>. Your <code>listAll()</code> runs an in-order traversal. Which last name is printed <strong>first</strong>?</>}
                    expected={["adams", "Adams"]}
                    hint="In-order traversal visits left subtree first, and smaller names go left. Which of the three names is alphabetically smallest?"
                />

                <ActivityChallenge
                    number="2.3"
                    title="BST Deletion"
                    description="Remove a contact from the BST by name."
                >
                    <div className="space-y-1">
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ContactNode* remove(ContactNode* node, string lastName)</code>, a recursive function that finds and removes the node</ActivityTask>
                        <ActivityTask>Handle all three cases: leaf node, node with one child, node with two children</ActivityTask>
                        <ActivityTask>For two children: find the in-order successor (smallest node in the right subtree), copy its data, then recursively delete the successor</ActivityTask>
                        <ActivityTask>Update <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deleteContact</code> to call <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">root = remove(root, lastName)</code></ActivityTask>
                        <ActivityTask>Test: add three contacts, delete the middle one (alphabetically), then list and verify the remaining two are still sorted</ActivityTask>
                    </div>

                    <ActivityHint label="BST deletion: the three cases">
                        <strong>Case 1 (leaf node):</strong> The node has no children. Just delete it and return nullptr.{' '}
                        <strong>Case 2 (one child):</strong> The node has exactly one child (left or right). Replace the node with its child by returning the non-null child.{' '}
                        <strong>Case 3 (two children):</strong> Find the <em>in-order successor</em> (go right once, then go left as far as possible). Copy the successor's contact data into the current node, then recursively delete the successor from the right subtree. Pseudocode: <code className="bg-muted px-1 rounded">node-&gt;data = successor-&gt;data; node-&gt;right = remove(node-&gt;right, successor-&gt;data-&gt;lastName);</code>
                    </ActivityHint>
                </ActivityChallenge>

                {/* ── PART 2: STACK UNDO ──────────────────────────────────────── */}
                <LectureSectionHeading number="03" title="Part 2: Stack-Based Undo" />

                <LectureP>
                    Record every add and delete on a stack so the last action can be undone.
                </LectureP>

                <ActivityChallenge
                    number="3.1"
                    title="Action Stack"
                    description="Record and undo."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#include &lt;stack&gt;</code></ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">struct Action</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">string type</code> ("add" or "delete") and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Contact contactSnapshot</code></ActivityTask>
                        <ActivityTask>Add private <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">stack&lt;Action&gt; history</code> to PhoneBook</ActivityTask>
                        <ActivityTask>In <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">addContact</code>: after inserting, push <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{"Action{\"add\", *contact}"}</code></ActivityTask>
                        <ActivityTask>In <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deleteContact</code>: before deleting, push <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{"Action{\"delete\", *contact}"}</code></ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">void undo()</code>: if history empty print "Nothing to undo."; else pop top: if "add" remove that contact, if "delete" re-add from snapshot</ActivityTask>
                        <ActivityTask>Add "Undo" as a menu option</ActivityTask>
                    </div>

                    <ActivityHint label="undo logic">
                        Pop the top Action. Check its <code className="bg-muted px-1 rounded">type</code> string: if it's <code className="bg-muted px-1 rounded">"add"</code>, the undo is a delete: find and remove that contact from the BST. If it's <code className="bg-muted px-1 rounded">"delete"</code>, the undo is a re-add: create a new Contact from the snapshot and insert it back into the BST. Print what was undone so the user gets confirmation. Don't forget to update the phoneIndex (Part 4) in both cases.
                    </ActivityHint>
                </ActivityChallenge>

                {/* ── PART 2: HASH MAP FOR O(1) SEARCH ─────────────────────────── */}
                <LectureSectionHeading number="04" title="Part 2: Hash Map for O(1) Search by Phone" />

                <LectureP>
                    Add a secondary index: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">unordered_map&lt;string, Contact*&gt;</code> keyed by phone number so lookup by phone is O(1).
                </LectureP>

                <ActivityChallenge
                    number="4.1"
                    title="Phone Index and Search"
                    description="Maintain the index and add search by phone."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">#include &lt;unordered_map&gt;</code></ActivityTask>
                        <ActivityTask>Add private <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">unordered_map&lt;string, Contact*&gt; phoneIndex</code> to PhoneBook</ActivityTask>
                        <ActivityTask>In <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">addContact</code>, insert into <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">phoneIndex[phone] = pointer</code>; in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">deleteContact</code>, erase from phoneIndex</ActivityTask>
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Contact* findByPhone(string number)</code> that returns phoneIndex[number] or nullptr</ActivityTask>
                        <ActivityTask>Add "Search by phone" to the menu; print contact or "Not found."</ActivityTask>
                    </div>

                    <ActivityHint label="unordered_map basics">
                        Use <code className="bg-muted px-1 rounded">phoneIndex[phone] = contactPtr</code> to insert. Use <code className="bg-muted px-1 rounded">phoneIndex.count(phone)</code> to check if a key exists (returns 0 or 1). Use <code className="bg-muted px-1 rounded">phoneIndex.erase(phone)</code> to remove. Remember to update the map in <em>both</em> addContact and deleteContact, and also in undo: if you undo an add, erase the phone; if you undo a delete, re-insert it.
                    </ActivityHint>
                </ActivityChallenge>

                <LectureP>
                    One more check: can you write the member declaration for the phone index from memory?
                </LectureP>

                <InteractiveExercise
                    runtime="check"
                    language="cpp"
                    title="Exercise 2: Declare the Phone Index"
                    prompt={<>Type the C++ member declaration for the phone index: an <code>unordered_map</code> from a phone number (<code>string</code>) to a <code>Contact*</code>, named <code>phoneIndex</code>. Assume <code>using namespace std;</code> is in effect, so no <code>std::</code> prefix is needed.</>}
                    expectedPattern={"^(std::)?unordered_map\\s*<\\s*(std::)?string\\s*,\\s*Contact\\s*\\*\\s*>\\s*phoneIndex\\s*;?$"}
                    hint={'The shape is unordered_map<KeyType, ValueType> name; with string as the key and Contact* as the value.'}
                />

                <ActivityChallenge
                    number="4.2"
                    title="Final Menu"
                    description="All options in one place."
                >
                    <div className="space-y-1">
                        <ActivityTask>Menu: (1) Add contact, (2) Delete contact, (3) List all (alphabetical), (4) Search by phone, (5) Undo, (0) Quit</ActivityTask>
                        <ActivityTask>Compile and run through all options to verify the full phonebook works</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureSectionHeading number="05" title="Expected Output" />

                <LectureP>
                    A complete phonebook session should look something like this. Your formatting can differ, but the behavior should match:
                </LectureP>

                <div className="my-4 rounded-xl border border-border bg-zinc-950 p-4 font-mono text-xs text-green-400 space-y-0.5 overflow-x-auto">
                    <p>=== Phonebook Menu ===</p>
                    <p>1) Add contact</p>
                    <p>2) Delete contact</p>
                    <p>3) List all (alphabetical)</p>
                    <p>4) Search by phone</p>
                    <p>5) Undo</p>
                    <p>0) Quit</p>
                    <p className="text-white">&gt; 1</p>
                    <p>First name: <span className="text-white">Alice</span></p>
                    <p>Last name: <span className="text-white">Smith</span></p>
                    <p>Phone: <span className="text-white">555-1234</span></p>
                    <p>✓ Added Alice Smith.</p>
                    <p />
                    <p className="text-white">&gt; 1</p>
                    <p>First name: <span className="text-white">Bob</span></p>
                    <p>Last name: <span className="text-white">Jones</span></p>
                    <p>Phone: <span className="text-white">555-5678</span></p>
                    <p>✓ Added Bob Jones.</p>
                    <p />
                    <p className="text-white">&gt; 3</p>
                    <p>--- All Contacts (alphabetical) ---</p>
                    <p>  Jones, Bob · 555-5678</p>
                    <p>  Smith, Alice · 555-1234</p>
                    <p />
                    <p className="text-white">&gt; 4</p>
                    <p>Phone number: <span className="text-white">555-1234</span></p>
                    <p>Found: Smith, Alice · 555-1234</p>
                    <p />
                    <p className="text-white">&gt; 5</p>
                    <p>Undid: add Bob Jones</p>
                    <p />
                    <p className="text-white">&gt; 3</p>
                    <p>--- All Contacts (alphabetical) ---</p>
                    <p>  Smith, Alice · 555-1234</p>
                    <p />
                    <p className="text-white">&gt; 0</p>
                    <p>Goodbye!</p>
                </div>

                <LectureCallout type="info">
                    <strong className="text-foreground">Success criteria: your phonebook is complete when:</strong>
                    <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                        <li>Add, delete, and list work correctly with the BST (contacts listed alphabetically).</li>
                        <li>BST deletion handles all three cases: leaf, one child, two children (in-order successor).</li>
                        <li>Undo reverses the last add (by deleting) or last delete (by re-adding) using the stack.</li>
                        <li>Search by phone returns the correct contact in O(1) using the unordered_map.</li>
                        <li>The phone index stays in sync: adding inserts into the map, deleting erases from it, undo updates it.</li>
                        <li>The program compiles with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">g++ -std=c++17 -Wall</code> with zero warnings.</li>
                    </ul>
                </LectureCallout>

                <LectureP>
                    To demonstrate your completed phonebook: run it and walk through the full cycle: add two or three contacts, list them (verify alphabetical order), search by phone, delete one, undo the delete, list again. Paste the terminal session as your submission.
                </LectureP>

                
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
