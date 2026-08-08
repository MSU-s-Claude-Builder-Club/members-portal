import { Globe } from 'lucide-react';
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
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── Props flow diagram ────────────────────────────────────────────────────────
const PropsFlowDiagram = () => (
    <div className="my-8 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="p-5 space-y-2">
            {[
                { label: '<App />', indent: 0, note: 'owns the data: tasks = [...]', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' },
                { label: '<TaskList tasks={tasks} />', indent: 1, note: 'receives tasks, passes each down', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' },
                { label: '<TaskItem task={task} />', indent: 2, note: 'receives one task, renders it', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' },
            ].map((item) => (
                <div
                    key={item.label}
                    className={`rounded-lg border px-4 py-2.5 ${item.bg}`}
                    style={{ marginLeft: `${item.indent * 2}rem` }}
                >
                    <code className={`text-xs font-bold ${item.color}`}>{item.label}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                </div>
            ))}
        </div>
        <div className="px-5 pb-4 text-xs text-muted-foreground">
            Data flows <strong className="text-foreground">down</strong> via props. Events flow <strong className="text-foreground">up</strong> via callback functions passed as props.
        </div>
    </div>
);

// ── useState lifecycle diagram ────────────────────────────────────────────────
const UseStateDiagram = () => (
    <div className="my-6 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border text-center text-xs">
            {[
                { step: '1', label: 'Render', desc: 'React calls your component function. useState returns the current value.', color: 'text-orange-600 dark:text-orange-400' },
                { step: '2', label: 'Event', desc: 'User clicks a button. Your event handler calls setState(newValue).', color: 'text-blue-600 dark:text-blue-400' },
                { step: '3', label: 'Re-render', desc: 'React calls your component again with the new state value. UI updates.', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((item) => (
                <div key={item.step} className="p-4">
                    <div className={`text-2xl font-black ${item.color}`}>{item.step}</div>
                    <div className={`font-bold mt-1 ${item.color}`}>{item.label}</div>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

export default function Week9Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={9}
                session="Lecture 1"
                title="React Components & Hooks"
                description="React is the most widely used frontend library in the world. Learn the mental model, components, props, state, and the hooks you will use every single day."
                icon={<Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
            />

            {/* ── 01 THE REACT MENTAL MODEL ───────────────────────────────────── */}
            <LectureSectionHeading number="01" title="The React Mental Model" />

            <LectureP>
                Before writing a single line of React, you need to understand the core idea: <strong className="text-foreground">your UI is a function of your state.</strong> Given the same data, your UI always looks the same. When the data changes, React re-runs your functions and updates only the parts of the page that changed.
            </LectureP>
            <LectureP>
                This is a fundamentally different model from jQuery-era web development, where you'd manually find a DOM element and change it. In React, you never touch the DOM directly. You describe what the UI should look like for any given state, and React figures out how to get there efficiently.
            </LectureP>
            <LectureP>
                The practical implication: stop thinking about "what do I need to change when the user clicks this button" and start thinking about "what does the page look like when <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">isLoggedIn</code> is <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">true</code>?"
            </LectureP>

            <LectureCallout type="info">
                React doesn't update the real DOM directly. Instead, it maintains a <LectureTip tip="A lightweight copy of the DOM in memory. React compares the new virtual DOM to the previous one and updates only what changed in the real DOM.">Virtual DOM</LectureTip>, a lightweight in-memory representation of the UI. When state changes, React builds a new virtual DOM tree, compares it to the previous one (called <LectureTip tip="The algorithm that compares two virtual DOM trees and computes the minimal set of real DOM updates. Makes React efficient.">diffing</LectureTip>), and applies only the minimal set of real DOM changes needed. This is why React is fast even for complex UIs.
            </LectureCallout>

            {/* ── 02 COMPONENTS ───────────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Components" />

            <LectureP>
                A <LectureTip tip="A reusable piece of UI: a function that returns JSX. Components can receive props and hold state. You compose them to build the full interface.">component</LectureTip> is a JavaScript function that returns JSX, a syntax that looks like HTML but is actually JavaScript. Components are the building blocks of every React application. You compose them together like Lego pieces to build complex UIs.
            </LectureP>
            <LectureP>
                Every React component follows two rules: the function name must start with a capital letter, and it must return something React can render (JSX, a string, a number, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">null</code>).
            </LectureP>

            <CodeBlock
                language="tsx"
                title="Button.tsx · a minimal component"
                lines={[
                    '// A component is just a function that returns JSX',
                    'export function Button() {',
                    '    return (',
                    '        <button className="bg-orange-500 text-white px-4 py-2 rounded">',
                    '            Click me',
                    '        </button>',
                    '    )',
                    '}',
                    '// Use it like an HTML tag in other components',
                    'export function App() {',
                    '    return <div><Button /><Button /></div>',
                    '}',
                ]}
            />

            <LectureSubHeading title="JSX rules" />
            <LectureP>
                JSX looks like HTML but has a few important differences. Every element must be closed. Multiple elements must be wrapped in a single parent (or a <LectureTip tip="A React built-in that groups children without adding an extra DOM node. Syntax: <>...</> or <React.Fragment>.">Fragment</LectureTip>: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{'<> </>'}</code>). JavaScript expressions go inside curly braces. And <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">class</code> becomes <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">className</code> because <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">class</code> is a reserved word in JavaScript.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="JSX · key differences from HTML"
                lines={[
                    '// ✅ className, not class',
                    '<div className="container">',
                    '// ✅ JS expressions in curly braces',
                    '<p>Hello, {name}</p>',
                    '// ✅ self-closing tags must close',
                    '<img src={url} alt="photo" />',
                    '// ✅ wrap multiple elements in a fragment',
                    'return (',
                    '    <>',
                    '        <h1>Title</h1>',
                    '        <p>Body</p>',
                    '    </>',
                    ')',
                ]}
            />

            {/* ── 03 PROPS ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Props" />

            <LectureP>
                <LectureTip tip="Inputs to a component, passed as attributes. Read-only; the parent owns the data. Props flow down the component tree.">Props</LectureTip> (short for properties) are how you pass data into a component. They're the arguments to your component function. A component with no props is a static piece of UI, the same every time. A component that accepts props is configurable and reusable.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="Button.tsx · props make components reusable"
                lines={[
                    '// Define the shape of the props with a TypeScript interface',
                    'interface ButtonProps {',
                    '    label: string',
                    '    onClick: () => void',
                    "    variant?: 'primary' | 'danger'  // optional prop",
                    '}',
                    "export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {",
                    "    const styles = variant === 'danger' ? 'bg-red-500' : 'bg-orange-500'",
                    '    return <button onClick={onClick} className={`${styles} text-white px-4 py-2 rounded`}>',
                    '        {label}',
                    '    </button>',
                    '}',
                    '// Now you can use it in different ways',
                    '<Button label="Save" onClick={handleSave} />',
                    '<Button label="Delete" onClick={handleDelete} variant="danger" />',
                ]}
            />

            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">?</code> in the TypeScript interface marks a prop as optional. When a prop is optional, you can provide a default value in the function signature using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">= 'primary'</code>. This is a pattern you'll use constantly.
            </LectureP>

            <LectureSubHeading title="The data flow rule" />
            <LectureP>
                Props flow <strong className="text-foreground">down</strong>, from parent to child. A parent component owns its data and passes relevant pieces to its children. Children can never directly modify their parent's data. To communicate back up, the parent passes a <em>callback function</em> as a prop, and the child calls it when something happens.
            </LectureP>

            <PropsFlowDiagram />

            <LectureCallout type="tip">
                The "data down, events up" pattern is the foundation of React architecture. If you find yourself trying to pass data upward through props, that's a sign the state should be lifted to a common ancestor, or moved into a global state solution like Context.
            </LectureCallout>

            {/* ── 04 STATE WITH USESTATE ──────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="State with useState" />

            <LectureP>
                <LectureTip tip="Data owned by the component that can change. When state updates (via useState setter), React re-renders the component and updates the UI.">State</LectureTip> is data that can change over time and, when it changes, causes the component to re-render. The <LectureTip code tip="useState — the most fundamental React hook. Takes an initial value and returns a pair: the current state value and a setter function. When you call the setter, React re-renders the component with the new value.">useState</LectureTip> hook is how you add state to a functional component.
            </LectureP>

            <UseStateDiagram />

            <CodeBlock
                language="tsx"
                title="Counter.tsx · useState in action"
                lines={[
                    "import { useState } from 'react'",
                    'export function Counter() {',
                    '    // [currentValue, setterFunction] = useState(initialValue)',
                    '    const [count, setCount] = useState(0)',
                    '    return (',
                    '        <div>',
                    '            <p>Count: {count}</p>',
                    '            <button onClick={() => setCount(count + 1)}>+</button>',
                    '            <button onClick={() => setCount(count - 1)}>-</button>',
                    '        </div>',
                    '    )',
                    '}',
                ]}
            />

            <LectureP>
                A critical rule: <strong className="text-foreground">never mutate state directly.</strong> Always use the setter function. React needs to know state changed in order to re-render. If you do <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">count++</code> directly, React has no idea the value changed and the UI won't update.
            </LectureP>

            <LectureCallout type="warning">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">setState</code> is asynchronous: React may batch multiple updates into one re-render. Don't read state immediately after calling the setter and expect the new value — use the value from the next render or the functional form: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">setCount(c =&gt; c + 1)</code> when the new state depends on the previous one.
            </LectureCallout>

            <LectureSubHeading title="State with arrays and objects" />
            <LectureP>
                When your state is an array or object, you need to create a new one instead of modifying the existing one. React uses reference equality to detect changes: if the reference is the same object, it assumes nothing changed.
            </LectureP>

            <CodeBlock
                language="javascript"
                title="state mutations · right vs wrong"
                lines={[
                    "// ❌ Wrong: mutates the existing array",
                    "tasks.push(newTask)  // React doesn't see this change",
                    "setTasks(tasks)      // same reference, no re-render",
                    '',
                    '// ✅ Right: creates a new array',
                    'setTasks([...tasks, newTask])  // spread creates a new array',
                    '',
                    '// ❌ Wrong: mutates the existing object',
                    'user.name = "Alice"',
                    'setUser(user)',
                    '',
                    '// ✅ Right: creates a new object',
                    'setUser({ ...user, name: "Alice" })  // spread + override',
                ]}
            />

            <LectureSubHeading title="Try it yourself" />
            <LectureP>
                This is exactly the JavaScript you would write inside a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">setTasks</code> call. Practice the immutable update pattern:
            </LectureP>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 1: immutable array update"
                prompt={<>Using the spread operator (not <code>push</code>), create a <strong>new</strong> array called <code>updated</code> that contains everything in <code>tasks</code> plus the string <code>'Do laundry'</code> at the end. The code then logs the new length, so a correct solution logs exactly <code>3</code>.</>}
                starter={"const tasks = ['Buy groceries', 'Walk the dog'];\n\n// Create a NEW array with 'Do laundry' added to the end.\n// Do not use push. Fix the line below using the spread operator.\nconst updated = tasks;\n\nconsole.log(updated.length);"}
                expected="3"
                hint="const updated = [...tasks, 'Do laundry']"
            />

            {/* ── 05 USEEFFECT ────────────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Side Effects with useEffect" />

            <LectureP>
                <LectureTip code tip="useEffect — runs code after React renders the component. Used for anything that needs to happen 'outside' of rendering: fetching data, setting up subscriptions, updating the document title, timers. Takes a function and a dependency array.">useEffect</LectureTip> runs code after a component renders. It's how you handle <LectureTip tip="Anything that affects the outside world: API calls, timers, subscriptions, DOM updates. Not part of the render; run after render via useEffect.">side effects</LectureTip>, meaning anything that reaches outside the component: fetching data from an API, setting up a timer, syncing with localStorage.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="useEffect · three forms"
                lines={[
                    '// 1. No dependency array: runs after every render',
                    'useEffect(() => {',
                    "    console.log('rendered')",
                    '})',
                    '// 2. Empty array: runs once, on mount only',
                    'useEffect(() => {',
                    '    fetchData()  // like componentDidMount',
                    '}, [])',
                    '// 3. Dependency array: runs when listed values change',
                    'useEffect(() => {',
                    '    document.title = `Tasks: ${tasks.length}`',
                    '}, [tasks])  // re-runs whenever tasks changes',
                    '// Cleanup: return a function to clean up when component unmounts',
                    'useEffect(() => {',
                    '    const timer = setInterval(tick, 1000)',
                    '    return () => clearInterval(timer)',
                    '}, [])',
                ]}
            />

            <LectureCallout type="warning">
                The dependency array is not optional; it controls when the effect runs. Omitting it means the effect runs after every render (usually not what you want). An empty array <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">[]</code> means run once. Listing values means run when those values change. Getting this wrong is the most common source of infinite loops and stale data bugs in React.
            </LectureCallout>

            {/* ── 06 CUSTOM HOOKS ─────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Custom Hooks" />

            <LectureP>
                A <LectureTerm>custom hook</LectureTerm> is just a function whose name starts with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">use</code> and that calls other hooks inside it. Custom hooks let you extract and reuse stateful logic across components without duplicating code.
            </LectureP>
            <LectureP>
                A classic example: you need to fetch data in multiple components. Instead of copy-pasting the same <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useState</code> + <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useEffect</code> pattern everywhere, you extract it into a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useFetch</code> hook.
            </LectureP>

            <CodeBlock
                language="typescript"
                title="useLocalStorage.ts · a practical custom hook"
                lines={[
                    "import { useState } from 'react'",
                    'export function useLocalStorage<T>(key: string, initialValue: T) {',
                    '    const [stored, setStored] = useState<T>(() => {',
                    '        const item = localStorage.getItem(key)',
                    '        return item ? JSON.parse(item) : initialValue',
                    '    })',
                    '    const setValue = (value: T) => {',
                    '        setStored(value)',
                    '        localStorage.setItem(key, JSON.stringify(value))',
                    '    }',
                    '    return [stored, setValue] as const',
                    '}',
                    '// Use it exactly like useState, but it persists to localStorage',
                    "const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])",
                ]}
            />

            <LectureCallout type="tip">
                You'll use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useLocalStorage</code> exactly like this in the Task Tracker activity. It's one of the most practical custom hooks you can write: persist state with zero extra effort.
            </LectureCallout>

            {/* ── 07 CONDITIONAL RENDERING AND LISTS ──────────────────────────── */}
            <LectureSectionHeading number="07" title="Conditional Rendering & Lists" />

            <LectureSubHeading title="Conditional rendering" />
            <LectureP>
                JSX is just JavaScript, so you use regular JS to conditionally show or hide elements. The two patterns you'll use most:
            </LectureP>

            <CodeBlock
                language="tsx"
                title="conditional rendering patterns"
                lines={[
                    '// Ternary: when you need to show one thing OR another',
                    '{isLoggedIn ? <Dashboard /> : <LoginPage />}',
                    '// && operator: when you only need to show something OR nothing',
                    '{error && <ErrorMessage message={error} />}',
                ]}
            />

            <LectureSubHeading title="Rendering lists" />
            <LectureP>
                To render a list of items, use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.map()</code> to transform an array of data into an array of JSX elements. Each element in the list needs a unique <LectureTip tip="A special prop (string or number) that identifies each list item. Helps React match items across re-renders so it can update only what changed. Use a stable ID, not the array index.">key</LectureTip> prop — React uses this to efficiently update the DOM when the list changes.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="rendering a list with .map()"
                lines={[
                    'const tasks = [',
                    "    { id: 1, title: 'Buy groceries', done: false },",
                    "    { id: 2, title: 'Walk the dog', done: true },",
                    ']',
                    'return (',
                    '    <ul>',
                    '        {tasks.map(task => (',
                    '            // key must be unique and stable: use an id, not an index',
                    "            <li key={task.id} className={task.done ? 'line-through' : ''}>",
                    '                {task.title}',
                    '            </li>',
                    '        ))}',
                    '    </ul>',
                    ')',
                ]}
            />

            <LectureCallout type="warning">
                The same <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.map()</code> you use in JSX is plain JavaScript. Prove it to yourself:
            </LectureCallout>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 2: map data to output"
                prompt={<>Use <code>.map()</code> to turn the <code>tasks</code> array into an array of just the <code>title</code> strings, stored in <code>titles</code>. The code then logs the titles joined with a comma and a space, so a correct solution logs exactly <code>Buy groceries, Walk the dog</code>.</>}
                starter={"const tasks = [\n  { id: 1, title: 'Buy groceries', done: false },\n  { id: 2, title: 'Walk the dog', done: true },\n];\n\n// Use .map() to build an array of just the titles.\n// Fix the line below.\nconst titles = [];\n\nconsole.log(titles.join(', '));"}
                expected="Buy groceries, Walk the dog"
                hint="tasks.map(task => task.title)"
            />

            <LectureP>
                Don't use array index as the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">key</code> prop if the list can be reordered or filtered. If the item at index 0 changes, React gets confused. Always use a stable, unique identifier from your data, like an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">id</code> field.
            </LectureP>

            {/* ── 08 SHARING STATE WITH USECONTEXT ──────────────────────────── */}
            <LectureSectionHeading number="08" title="Sharing State with useContext" />

            <LectureP>
                As your app grows, you'll find some data (like the logged-in user, a theme preference, or a language setting) needs to be accessed by many components at different levels of the tree. Passing it through every intermediate component via props is tedious and fragile. This is called <LectureTerm>prop drilling</LectureTerm>, and React's answer to it is <LectureTip code tip="useContext — a React hook that reads a value from a Context. Any component wrapped in a Provider can call useContext to access the shared value without prop drilling.">useContext</LectureTip>.
            </LectureP>
            <LectureP>
                A <LectureTip tip="A React mechanism for sharing values across the component tree without passing props at every level. You create a Context, wrap a subtree in a Provider, and any descendant can read the value with useContext.">Context</LectureTip> is a way to broadcast data to an entire subtree. You create the context, wrap your app (or a section of it) in a <LectureTerm>Provider</LectureTerm> that supplies the value, and any descendant component can read it with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useContext</code>.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="auth-context.tsx · creating and providing context"
                lines={[
                    "import { createContext, useContext, useState, ReactNode } from 'react'",
                    '',
                    'interface AuthContextType {',
                    '    user: string | null',
                    '    login: (name: string) => void',
                    '    logout: () => void',
                    '}',
                    '',
                    'const AuthContext = createContext<AuthContextType | null>(null)',
                    '',
                    'export function AuthProvider({ children }: { children: ReactNode }) {',
                    '    const [user, setUser] = useState<string | null>(null)',
                    '    return (',
                    '        <AuthContext.Provider value={{',
                    '            user,',
                    '            login: (name) => setUser(name),',
                    '            logout: () => setUser(null),',
                    '        }}>',
                    '            {children}',
                    '        </AuthContext.Provider>',
                    '    )',
                    '}',
                    '',
                    'export function useAuth() {',
                    '    const ctx = useContext(AuthContext)',
                    "    if (!ctx) throw new Error('useAuth must be used within AuthProvider')",
                    '    return ctx',
                    '}',
                ]}
            />

            <LectureP>
                To use it, wrap your app in the provider and call the custom hook from any descendant:
            </LectureP>

            <CodeBlock
                language="tsx"
                title="using the AuthContext"
                lines={[
                    '// main.tsx: wrap the app',
                    '<AuthProvider>',
                    '    <App />',
                    '</AuthProvider>',
                    '',
                    '// any component deep in the tree',
                    'function Navbar() {',
                    '    const { user, logout } = useAuth()',
                    '    return (',
                    '        <nav>',
                    '            {user ? (',
                    '                <>',
                    '                    <span>Hello, {user}</span>',
                    '                    <button onClick={logout}>Log out</button>',
                    '                </>',
                    '            ) : (',
                    '                <Link to="/login">Log in</Link>',
                    '            )}',
                    '        </nav>',
                    '    )',
                    '}',
                ]}
            />

            <LectureCallout type="tip">
                Use Context for truly global state that many components need (auth, theme, language). For data that only two or three nearby components share, lifting state to a common parent and passing props is simpler and easier to follow. Don't reach for Context just to avoid one level of prop passing.
            </LectureCallout>

            {/* ── 09 COMPONENT COMPOSITION ────────────────────────────────────── */}
            <LectureSectionHeading number="09" title="Component Composition" />

            <LectureP>
                The most important skill in React isn't knowing the APIs. It's knowing how to break a UI into the right components. A good rule of thumb: a component should do one thing. If it's getting long or complex, split it up.
            </LectureP>

            <TerminalBlock
                lines={[
                    { comment: 'create a new Vite + React + TypeScript project', cmd: 'npm create vite@latest my-app -- --template react-ts' },
                    { cmd: 'cd my-app && npm install' },
                    { cmd: 'npm run dev' },
                ]}
            />

            <LectureP>
                This scaffolds a complete project with React, TypeScript, and Vite already configured. Open <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/App.tsx</code> and start there. Delete the boilerplate and build your own component tree. In the activity, you'll build a full Task Tracker from scratch using exactly the concepts covered today.
            </LectureP>

            <LectureCallout type="tip">
                A good exercise before the activity: sketch your component tree on paper first. What are the top-level components? What data does each one need? What events does each one emit? Planning the structure before coding saves enormous time.
            </LectureCallout>


        </LectureLayout>
    );
}
