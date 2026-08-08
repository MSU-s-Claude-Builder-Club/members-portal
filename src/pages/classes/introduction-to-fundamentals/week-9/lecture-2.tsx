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
import InteractiveExercise from '@/components/ui/interactive-exercise';

// Tailwind default palette (hex) so dynamic color swatches render without purging
const TAILWIND_PALETTE: Record<string, Record<number, string>> = {
    slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
    orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
    emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
    rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
    amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
};

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const PALETTE_COLORS = ['slate', 'orange', 'blue', 'emerald', 'rose', 'amber'] as const;

import { CodeBlock } from '@/components/ui/code-block';

const CODE_INLINE = 'text-xs bg-muted px-1.5 py-0.5 rounded border';

// ── Live class preview card ───────────────────────────────────────────────────
const TailwindPreview = ({
    label,
    className,
    code,
}: {
    label: string;
    className: string;
    code: string;
}) => (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-6 flex items-center justify-center bg-muted/30 min-h-[80px]">
            <div className={className}>{label}</div>
        </div>
        <div className="px-4 py-2 border-t border-border bg-zinc-950">
            <code className="text-xs text-emerald-400 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                {code}
            </code>
        </div>
    </div>
);

export default function Week9Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={9}
                session="Lecture 2"
                title="Tailwind CSS & Connecting to Your API"
                description="Style your UI with utility classes that do exactly one thing, then wire your React frontend to the FastAPI backend you built last week using fetch."
                icon={<Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
            />

            {/* ── 01 THE UTILITY CLASS MODEL ──────────────────────────────────── */}
            <LectureSectionHeading number="01" title="The Utility Class Model" />

            <LectureP>
                In traditional CSS, you write a class name, define it in a stylesheet, and apply it to elements. <LectureTip tip="A utility-first CSS framework. Instead of writing custom CSS, you compose styles from small, single-purpose classes applied directly in your markup. Tailwind scans your source files at build time and generates only the CSS you actually use.">Tailwind CSS</LectureTip> inverts this: instead of writing custom CSS, you compose styles by applying small, single-purpose utility classes directly to your HTML elements.
            </LectureP>
            <LectureP>
                Every Tailwind class does exactly one thing. <code className={CODE_INLINE}>p-4</code> adds padding. <code className={CODE_INLINE}>text-blue-500</code> sets the text color. <code className={CODE_INLINE}>rounded-lg</code> rounds the corners. You describe a component's appearance by stacking these utilities together.
            </LectureP>

            <CodeBlock
                language="css"
                title="traditional CSS vs Tailwind"
                lines={[
                    '/* Traditional: write CSS in a separate file, apply a class name */',
                    '.card {',
                    '    background: white;',
                    '    border-radius: 8px;',
                    '    padding: 16px;',
                    '    box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
                    '}',
                    '/* applied as: <div class="card">...</div> */',
                    '',
                    '/* Tailwind: styles live directly in the element */',
                    '<div class="bg-white rounded-lg p-4 shadow-sm">...</div>',
                ]}
            />

            <LectureP>
                The tradeoff is real: Tailwind markup is more verbose. But you get enormous benefits in return. No naming things (notoriously hard). No stylesheet bloat, because unused classes are automatically purged from your production build. No context-switching between files. And no specificity wars: utility classes have the same specificity, so the one you write last wins.
            </LectureP>

            <LectureCallout type="info">
                Tailwind generates CSS at build time by scanning your source files for class names and including only the ones you actually use. A production Tailwind CSS bundle is typically just a few KB regardless of how many utilities you use.
            </LectureCallout>

            <TerminalBlock
                title="bash · install Tailwind in a Vite project"
                lines={[
                    { comment: 'install Tailwind and the Vite plugin', cmd: 'npm install -D tailwindcss @tailwindcss/vite' },
                    { comment: 'add @import "tailwindcss" to your main CSS file', cmd: 'echo \'@import "tailwindcss";\' > src/index.css' },
                ]}
            />

            <LectureCallout type="tip">
                The Activity walks through the full setup step by step. For now, just know that installation is two commands, and the rest is automatic.
            </LectureCallout>

            {/* ── 02 THE SCALE SYSTEM ─────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="The Scale System" />

            <LectureP>
                Tailwind uses a consistent numeric scale for spacing, sizing, and more. The base unit is <strong className="text-foreground">4px</strong>, so <code className={CODE_INLINE}>1 = 4px</code>, <code className={CODE_INLINE}>2 = 8px</code>, <code className={CODE_INLINE}>4 = 16px</code>, <code className={CODE_INLINE}>8 = 32px</code>, and so on. This gives your UI inherent visual consistency, since everything aligns to the same grid.
            </LectureP>

            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { category: 'Spacing (padding / margin)', classes: ['p-1 (4px)', 'p-2 (8px)', 'p-4 (16px)', 'p-8 (32px)', 'p-16 (64px)'], prefix: 'p- / m- / gap-' },
                    { category: 'Font size', classes: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'], prefix: 'text-' },
                    { category: 'Border radius', classes: ['rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'], prefix: 'rounded-' },
                    { category: 'Font weight', classes: ['font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-black'], prefix: 'font-' },
                ].map((group) => (
                    <div key={group.category} className="rounded-lg border border-border bg-card p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.category}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-mono mb-2">{group.prefix}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {group.classes.map((cls) => (
                                <code key={cls} className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                                    {cls}
                                </code>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 03 COLOR SYSTEM ─────────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="The Color System" />

            <LectureP>
                Tailwind ships with a comprehensive color palette. Every color has a name and a numeric shade from <code className={CODE_INLINE}>50</code> (near-white) to <code className={CODE_INLINE}>950</code> (near-black). Colors can be applied to text (<code className={CODE_INLINE}>text-</code>), backgrounds (<code className={CODE_INLINE}>bg-</code>), borders (<code className={CODE_INLINE}>border-</code>), and more.
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                {PALETTE_COLORS.map((color) => (
                    <div key={color} className="flex items-center border-b border-border last:border-b-0">
                        <div className="w-20 px-3 py-2 text-xs font-mono text-muted-foreground shrink-0">{color}</div>
                        <div className="flex flex-1">
                            {SHADES.map((shade) => (
                                <div
                                    key={shade}
                                    className="flex-1 h-8 min-w-0"
                                    style={{ backgroundColor: TAILWIND_PALETTE[color][shade] }}
                                    title={`${color}-${shade}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <LectureP>
                For any color you want to apply, the formula is <code className={CODE_INLINE}>{'{property}-{color}-{shade}'}</code>. For example: <code className={CODE_INLINE}>text-blue-600</code>, <code className={CODE_INLINE}>bg-orange-100</code>, <code className={CODE_INLINE}>border-slate-200</code>. You can also add opacity with a slash: <code className={CODE_INLINE}>bg-blue-500/20</code> gives you blue at 20% opacity.
            </LectureP>

            {/* ── 04 LAYOUT: FLEXBOX AND GRID ─────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Layout: Flexbox & Grid" />

            <LectureP>
                The two layout systems you'll use for 95% of layouts in Tailwind are <LectureTerm>Flexbox</LectureTerm> and <LectureTerm>CSS Grid</LectureTerm>. Tailwind makes both extremely easy to work with.
            </LectureP>

            <LectureSubHeading title="Flexbox" />

            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TailwindPreview
                    label="flex items-center justify-between"
                    className="flex items-center justify-between w-full bg-muted rounded p-3 text-xs font-mono"
                    code="flex items-center justify-between"
                />
                <TailwindPreview
                    label="flex flex-col gap-2"
                    className="flex flex-col gap-2 text-xs font-mono"
                    code="flex flex-col gap-2"
                />
            </div>

            <CodeBlock
                language="text"
                title="common flexbox classes"
                lines={[
                    'flex                 enable flexbox',
                    'flex-col             stack vertically',
                    'items-center         align on cross axis',
                    'justify-center       align on main axis',
                    'justify-between      space between items',
                    'gap-4                gap between items (16px)',
                    'flex-1               grow to fill available space',
                    'shrink-0             prevent shrinking',
                    'flex-wrap            wrap to next line',
                    'items-start          align to start of cross axis',
                ]}
            />

            <LectureSubHeading title="Grid" />
            <LectureP>
                CSS Grid is perfect for two-dimensional layouts. Tailwind's grid utilities map directly to <code className={CODE_INLINE}>grid-template-columns</code> and related properties.
            </LectureP>

            <CodeBlock
                language="text"
                title="grid classes"
                lines={[
                    'grid grid-cols-3 gap-4                         3 equal columns with 16px gap',
                    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 responsive: 1→2→3 columns',
                    'col-span-2                                     span 2 columns',
                    'grid-cols-[1fr_2fr]                            custom column widths (arbitrary value)',
                ]}
            />

            {/* ── 05 RESPONSIVE DESIGN ────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Responsive Design" />

            <LectureP>
                Tailwind is <LectureTip tip="A design approach where you build the mobile layout first (no prefix), then layer on styles for larger screens using breakpoint prefixes (sm:, md:, lg:). This ensures your app works on the smallest screens by default.">mobile-first</LectureTip>. Classes without a prefix apply to all screen sizes. Breakpoint prefixes (<code className={CODE_INLINE}>sm:</code>, <code className={CODE_INLINE}>md:</code>, <code className={CODE_INLINE}>lg:</code>) apply the style <em>only at that size and above</em>. You build the mobile layout first, then add overrides for larger screens.
            </LectureP>

            <div className="my-6 rounded-xl border border-border bg-muted/30 p-5">
                <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                    {[
                        { prefix: '(none)', min: '0px', label: 'All screens', color: 'text-foreground' },
                        { prefix: 'sm:', min: '640px', label: 'Small+', color: 'text-blue-600 dark:text-blue-400' },
                        { prefix: 'md:', min: '768px', label: 'Medium+', color: 'text-emerald-600 dark:text-emerald-400' },
                        { prefix: 'lg:', min: '1024px', label: 'Large+', color: 'text-orange-600 dark:text-orange-400' },
                    ].map((bp) => (
                        <div key={bp.prefix} className="rounded-lg border border-border bg-card p-3">
                            <code className={`font-bold ${bp.color}`}>{bp.prefix}</code>
                            <p className="text-muted-foreground mt-1">{bp.min}</p>
                            <p className="text-muted-foreground text-xs">{bp.label}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-xs text-emerald-400 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    {`<div class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">`}
                </div>
                <p className="text-xs text-muted-foreground mt-2">1 column on mobile → 2 on small → 4 on large</p>
            </div>

            <LectureCallout type="tip">
                Resize your browser window while building and check your layout at every breakpoint. Tailwind's breakpoints map closely to real device widths: <code className={CODE_INLINE}>sm</code> ≈ landscape phone, <code className={CODE_INLINE}>md</code> ≈ tablet, <code className={CODE_INLINE}>lg</code> ≈ laptop.
            </LectureCallout>

            {/* ── 06 STATE VARIANTS ───────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="State Variants" />

            <LectureP>
                Tailwind can apply styles conditionally based on element state using <LectureTerm>variants</LectureTerm>, which are prefixes that correspond to CSS pseudo-classes. The pattern is the same as responsive prefixes: <code className={CODE_INLINE}>variant:class</code>.
            </LectureP>

            <CodeBlock
                language="text"
                title="common state variants"
                lines={[
                    'hover:bg-blue-600                              apply on mouse hover',
                    'focus:ring-2 focus:ring-blue-500               apply when element is focused',
                    'active:scale-95                                apply while being clicked',
                    'disabled:opacity-50 disabled:cursor-not-allowed  apply when disabled',
                    'dark:bg-zinc-900                               apply in dark mode',
                    'group-hover:text-blue-500                      apply when parent "group" is hovered',
                ]}
            />

            <LectureP>
                The <LectureTip code tip="group in Tailwind: add 'group' to a parent element, then use 'group-hover:' on children to apply styles when the parent is hovered. Useful for cards where hovering the card changes the appearance of text inside it.">group</LectureTip> pattern is particularly powerful for cards. Add <code className={CODE_INLINE}>group</code> to the card container, then use <code className={CODE_INLINE}>group-hover:</code> on any child elements you want to change when the card is hovered.
            </LectureP>

            {/* ── 07 DYNAMIC CLASSES IN REACT ─────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Dynamic Classes in React" />

            <LectureP>
                Combining Tailwind with React state lets you style components dynamically. The key rule: <strong className="text-foreground">always write complete class names</strong>. Don't try to construct them from fragments at runtime. Tailwind's build tool scans for complete class strings, and if it never sees <code className={CODE_INLINE}>text-red-500</code> written out fully, it won't include it in the output.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="dynamic classes: right vs wrong"
                lines={[
                    '// ❌ Broken: Tailwind never sees the full class name',
                    "const color = isError ? 'red' : 'green'",
                    '<p className={`text-${color}-500`}>',
                    '// ✅ Correct: full class names are always present in source',
                    "<p className={isError ? 'text-red-500' : 'text-green-500'}>",
                    '// ✅ Also correct: use cn() for complex conditional merging',
                    "import { cn } from '@/lib/utils'",
                    '<button className={cn(',
                    "    'px-4 py-2 rounded font-medium',",
                    "    variant === 'primary' && 'bg-orange-500 text-white',",
                    "    variant === 'ghost' && 'bg-transparent hover:bg-muted',",
                    "    disabled && 'opacity-50 cursor-not-allowed'",
                    ')}>',
                ]}
            />

            <LectureP>
                The <LectureTip code tip="cn() is a utility function from @/lib/utils that combines clsx (conditional class joining) and tailwind-merge (deduplication of conflicting Tailwind classes). The standard pattern for dynamic Tailwind classes in a React + shadcn project.">cn()</LectureTip> function (from <code className={CODE_INLINE}>@/lib/utils</code>) is already in this project and is the standard way to handle dynamic classes. It merges class strings and intelligently resolves conflicts, so if you pass both <code className={CODE_INLINE}>px-4</code> and <code className={CODE_INLINE}>px-8</code>, <code className={CODE_INLINE}>px-8</code> wins.
            </LectureP>

            <LectureP>
                Time to write the JS logic yourself. The heart of <code className={CODE_INLINE}>cn()</code> is simple: take a list of values, keep only the truthy ones, and join them with spaces. Build a tiny version of it below.
            </LectureP>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 1: Build a Mini cn()"
                prompt={<>Complete <code>classNames(...args)</code> so it keeps only the truthy arguments and joins them with a single space. When you run the starter code, it should log exactly <code>px-4 rounded bg-orange-500</code>.</>}
                starter={"function classNames(...args) {\n  // keep only the truthy values, then join them with a single space\n  return '';\n}\n\nconsole.log(classNames('px-4', false, 'rounded', null, 'bg-orange-500'));"}
                expected="px-4 rounded bg-orange-500"
                hint="args.filter(Boolean) removes falsy values; .join(' ') glues the rest together."
            />

            {/* ── 08 BUILDING A COMPONENT ─────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Putting It Together: A Task Card" />

            <LectureP>
                Here's what a fully styled task card looks like combining everything from this lecture. Study the class breakdown before the activity.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="TaskCard.tsx · fully styled with Tailwind"
                lines={[
                    'interface TaskCardProps { title: string; done: boolean; onToggle: () => void }',
                    'export function TaskCard({ title, done, onToggle }: TaskCardProps) {',
                    '    return (',
                    '        {/* card container */}',
                    '        <div className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">',
                    '            {/* checkbox */}',
                    '            <button',
                    '                onClick={onToggle}',
                    '                className="w-5 h-5 rounded border-2 border-muted-foreground/30 shrink-0 flex items-center justify-center hover:border-orange-500 transition-colors"',
                    '            >',
                    '                {done && <Check className="h-3 w-3 text-orange-500" />}',
                    '            </button>',
                    '            {/* title */}',
                    "            <p className={cn('text-sm flex-1', done && 'line-through text-muted-foreground')}>",
                    '                {title}',
                    '            </p>',
                    '        </div>',
                    '    )',
                    '}',
                ]}
            />

            <LectureP>
                Notice how each class is purposeful: <code className={CODE_INLINE}>group</code> enables child hover targeting, <code className={CODE_INLINE}>flex items-center gap-3</code> lays out the row, <code className={CODE_INLINE}>transition-shadow</code> makes the hover effect smooth, and <code className={CODE_INLINE}>cn()</code> handles the conditional strikethrough. No custom CSS written anywhere.
            </LectureP>

            <LectureCallout type="tip">
                Install the <strong className="text-foreground">Tailwind CSS IntelliSense</strong> extension in VS Code. It autocompletes class names, shows the underlying CSS on hover, and highlights invalid classes. It's effectively required for productive Tailwind development.
            </LectureCallout>

            {/* ── 09 CONNECTING TO YOUR API ────────────────────────────────────── */}
            <LectureSectionHeading number="09" title="Connecting to Your API" />

            <LectureP>
                Your React app runs in the browser; your FastAPI backend runs on a server. To get data, the frontend sends an <LectureTerm>HTTP request</LectureTerm> (usually with <code className={CODE_INLINE}>fetch</code>) and the backend returns JSON. You trigger the request when the component mounts using <code className={CODE_INLINE}>useEffect</code>, store the result in <code className={CODE_INLINE}>useState</code>, and render it.
            </LectureP>

            <CodeBlock
                language="tsx"
                title="fetching data on mount"
                lines={[
                    'const [tasks, setTasks] = useState<Task[]>([])',
                    'useEffect(() => {',
                    "    fetch('http://localhost:8000/api/tasks')",
                    '        .then(res => res.json())',
                    '        .then(setTasks)',
                    '}, [])',
                ]}
            />

            <LectureCallout type="info">
                If your API is on a different origin (e.g. frontend on <code className={CODE_INLINE}>localhost:5173</code>, backend on <code className={CODE_INLINE}>localhost:8000</code>), the browser enforces <LectureTerm>CORS</LectureTerm>. Your FastAPI app must send <code className={CODE_INLINE}>Access-Control-Allow-Origin</code> (e.g. via <code className={CODE_INLINE}>CORSMiddleware</code>). Otherwise the browser will block the response.
            </LectureCallout>

            <InteractiveExercise
                runtime="js"
                language="javascript"
                title="Exercise 2: Work With API JSON"
                prompt={<>An API responded with the JSON string below. Parse it with <code>JSON.parse</code>, count how many tasks are <strong>not</strong> done, and log that count. Your code should log exactly <code>1</code>.</>}
                starter={"const response = '{\"tasks\":[{\"title\":\"Style the card\",\"done\":true},{\"title\":\"Wire up fetch\",\"done\":false},{\"title\":\"Add CORS\",\"done\":true}]}';\n\n// 1. parse the JSON string into an object\n// 2. count the tasks whose done property is false\n// 3. log the count\n"}
                expected="1"
                hint="const data = JSON.parse(response); then data.tasks.filter(t => !t.done).length is your answer."
            />

            <LectureCallout type="warning">
                Never put API keys or secrets in frontend code. Anything in your React bundle can be read by anyone. Use environment variables (e.g. <code className={CODE_INLINE}>VITE_API_URL</code>) only for non-secret configuration like the base URL; sensitive operations must go through your backend.
            </LectureCallout>

            <LectureSubHeading title="Deploy your frontend" />
            <LectureP>
                When you're ready to ship, run <code className={CODE_INLINE}>npm run build</code>. Vite compiles and bundles your app into a <code className={CODE_INLINE}>dist/</code> folder of static files. Use <code className={CODE_INLINE}>VITE_API_URL</code> (and other <code className={CODE_INLINE}>VITE_*</code> env vars) for the production API base URL; Vite inlines them at build time. Services like Vercel or Netlify can deploy from your repo and run the build step in CI. We cover pipelines in Week 8.
            </LectureP>


        </LectureLayout>
    );
}