import { Globe } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
} from '@/components/ui/lecture-typography';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week9Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={9}
                    session="Activity"
                    title="Build Your Frontend"
                    description="Your API is live. Now build the interface: React components, Tailwind styling, and real data flowing from your backend. By the end of this session you have a complete full-stack app you built from scratch."
                    icon={<Globe className="h-4 w-4" />}
                />

            <LectureCallout type="info">
                Your backend must be running locally (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker compose up</code> in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code> folder) before starting this activity. All data in the UI comes from the live API.
            </LectureCallout>

            {/* ── 01 SCAFFOLD THE FRONTEND ────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Scaffold the Frontend" />

            <ActivityChallenge
                number="1.1"
                title="Vite + React + Tailwind"
                description="Set up the modern React development environment."
            >
                <div className="space-y-1">
                    <ActivityTask>Navigate to your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend/</code> folder</ActivityTask>
                    <ActivityTask>Delete the placeholder <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">index.html</code></ActivityTask>
                    <ActivityTask>Run: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm create vite@latest . -- --template react-ts</code></ActivityTask>
                    <ActivityTask>Install dependencies: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install</code></ActivityTask>
                    <ActivityTask>Install Tailwind: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p</code></ActivityTask>
                    <ActivityTask>Configure <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tailwind.config.js</code> content paths and add the Tailwind directives to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">index.css</code></ActivityTask>
                    <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm run dev</code> and verify the default Vite page loads</ActivityTask>
                </div>

                <TerminalBlock
                    title="bash · frontend"
                    lines={[
                        { cmd: 'npm create vite@latest . -- --template react-ts' },
                        { cmd: 'npm install' },
                        { cmd: 'npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p' },
                        { cmd: 'npm run dev' },
                    ]}
                />

                <LectureCallout type="info">
                    Vite is incredibly fast. Changes appear instantly in your browser during development.
                </LectureCallout>

                <ActivityHint label="Tailwind configuration">
                    Replace the contents of <code className="bg-muted px-1 rounded text-xs">src/index.css</code> with the single Tailwind import. That's all you need; Tailwind's build plugin handles the rest.
                </ActivityHint>

                <CodeBlock
                    language="css"
                    title="src/index.css · replace all existing content with this"
                    lines={[
                        '@import "tailwindcss";',
                    ]}
                />
            </ActivityChallenge>

            {/* ── 02 PROJECT REQUIREMENTS ─────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Project Requirements" />

            <div className="my-4 space-y-2">
                {[
                    '3 or more views/pages (use React Router for navigation between them)',
                    'All data fetched from your live FastAPI backend using fetch + useEffect',
                    'No hardcoded mock data: if the backend is down, the UI should show an error state',
                    'Fully styled with Tailwind (no inline styles, no separate CSS files)',
                    'Loading and error states handled for every fetch call',
                ].map((req, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0">✓</span>
                        <p className="text-sm text-foreground">{req}</p>
                    </div>
                ))}
            </div>

            <LectureCallout type="warning">
                Handle loading and error states on every fetch. An app that crashes silently when the API is unreachable is not a finished app.
            </LectureCallout>

            {/* ── 03 BUILD YOUR VIEWS ─────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Build Your Views" />

            <ActivityChallenge
                number="3.1"
                title="Set Up React Router"
                description="Create navigation between your views."
            >
                <div className="space-y-1">
                    <ActivityTask>Install React Router: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install react-router-dom</code></ActivityTask>
                    <ActivityTask>Wrap your app in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">BrowserRouter</code></ActivityTask>
                    <ActivityTask>Define at least 3 routes</ActivityTask>
                    <ActivityTask>Build a minimal nav component that links between them</ActivityTask>
                </div>

                <ActivityHint label="basic router setup">
                    <code className="bg-muted px-1 rounded text-xs">{'<BrowserRouter><Routes><Route path="/" element={<Home />} />...'}</code>, then use <code className="bg-muted px-1 rounded text-xs">Link</code> components in your nav to navigate.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="3.2"
                title="Fetch Real Data"
                description="Build your primary list view with live API data."
            >
                <div className="space-y-1">
                    <ActivityTask>In your primary list view, fetch data from your backend using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useEffect</code> and store it in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useState</code></ActivityTask>
                    <ActivityTask>Show a loading state (a simple "Loading..." text is fine) while the fetch is in progress</ActivityTask>
                    <ActivityTask>Show an error message if the fetch fails</ActivityTask>
                    <ActivityTask>Display the data once it arrives</ActivityTask>
                </div>

                <LectureCallout type="info">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">useEffect</code> is where you fetch data. The empty dependency array <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">[]</code> runs it once on mount.
                </LectureCallout>

                <CodeBlock
                    language="tsx"
                    title="fetch pattern with loading and error states"
                    lines={[
                        'const [items, setItems] = useState<Item[]>([])',
                        'const [loading, setLoading] = useState(true)',
                        'const [error, setError] = useState<string | null>(null)',
                        '',
                        'useEffect(() => {',
                        '    fetch("http://localhost:8000/api/items")',
                        '        .then(res => {',
                        '            if (!res.ok) throw new Error(`HTTP ${res.status}`)',
                        '            return res.json()',
                        '        })',
                        '        .then(setItems)',
                        '        .catch(err => setError(err.message))',
                        '        .finally(() => setLoading(false))',
                        '}, [])',
                        '',
                        'if (loading) return <p>Loading...</p>',
                        'if (error) return <p className="text-red-500">{error}</p>',
                    ]}
                />
            </ActivityChallenge>

            <LectureCallout type="info">
                Before you build the remaining views, prove you have the two core pieces of React logic down: immutable state updates and conditional rendering. Both exercises run real JavaScript right here in the page.
            </LectureCallout>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 1: Immutable State Updates"
                prompt={<>React state must never be mutated in place. Given the <code>items</code> array below, create a <strong>new</strong> array named <code>next</code> that contains all existing items plus <code>"dates"</code> at the end, without calling <code>push</code> on <code>items</code>. Then log <code>next.length</code> so the output is exactly <code>4</code>.</>}
                starter={'const items = ["apple", "banana", "cherry"];\n// Build a NEW array with "dates" appended (no items.push!)\nconst next = items; // fix this line\nconsole.log(next.length);'}
                expected="4"
                hint='Use the spread operator: [...items, "dates"] creates a fresh array, exactly what you pass to a setState function.'
            />

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 2: Conditional Rendering Logic"
                prompt={<>Every fetch has three states. Complete <code>render(state)</code> so it returns <code>"Loading..."</code> when <code>state.loading</code> is true, <code>"Error: "</code> plus the message when <code>state.error</code> is set, and otherwise the number of items followed by <code>" items"</code>. The test call must log exactly <code>3 items</code>.</>}
                starter={'function render(state) {\n  // 1. if state.loading is true, return "Loading..."\n  // 2. if state.error is set, return "Error: " + state.error\n  // 3. otherwise return state.items.length + " items"\n}\n\nconsole.log(render({ loading: false, error: null, items: ["a", "b", "c"] }));'}
                expected="3 items"
                hint="Check loading first, then error, then fall through to the success case. This is the same if/return ladder as in the fetch pattern above."
            />

            <ActivityChallenge
                number="3.3"
                title="Build the Remaining Views"
                description="Implement your remaining 2+ views with full styling."
            >
                <div className="space-y-1">
                    <ActivityTask>Implement your remaining 2+ views</ActivityTask>
                    <ActivityTask>Each must fetch from or post to your API</ActivityTask>
                    <ActivityTask>Style everything with Tailwind, paying attention to spacing, color, and responsive layout</ActivityTask>
                </div>

                <ActivityHint label="project structure">
                    Each view should be its own component file. A common pattern is <code className="bg-muted px-1 rounded text-xs">src/pages/Home.tsx</code>, <code className="bg-muted px-1 rounded text-xs">src/pages/Detail.tsx</code>, etc. Keep shared UI (nav, layout wrapper) in <code className="bg-muted px-1 rounded text-xs">src/components/</code>.
                </ActivityHint>
            </ActivityChallenge>

            {/* ── 04 SHIP IT ──────────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Ship It" />

            <ActivityChallenge
                number="4.1"
                title="End-to-End Test"
                description="Verify the full stack works together."
            >
                <div className="space-y-1">
                    <ActivityTask>With <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker compose up</code> running in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code> folder and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm run dev</code> running in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend/</code> folder:</ActivityTask>
                    <ActivityTask>Create a new resource through your UI</ActivityTask>
                    <ActivityTask>Verify it appears in the list</ActivityTask>
                    <ActivityTask>Verify it is stored by checking your API <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code></ActivityTask>
                </div>
            </ActivityChallenge>

            <ActivityChallenge
                number="4.2"
                title="PR and Board Update"
                description="Finalize and ship Issue #3."
            >
                <div className="space-y-1">
                    <ActivityTask>Commit everything</ActivityTask>
                    <ActivityTask>Push</ActivityTask>
                    <ActivityTask>Open a PR that closes Issue #3 from your GitHub Project board</ActivityTask>
                    <ActivityTask>Move Issue #3 to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Done</code></ActivityTask>
                    <ActivityTask>Your PR description must include: a screenshot of the running app, confirmation that data persists across page refreshes, and the URL of your running local app</ActivityTask>
                    <ActivityTask>All 3 issues should now be in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Done</code> on your board</ActivityTask>
                </div>
            </ActivityChallenge>

            
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
