import { Workflow } from 'lucide-react';
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
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── Waterfall vs Agile ────────────────────────────────────────────────────────
const WaterfallVsAgile = () => (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 border-b border-border">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Waterfall: plan everything upfront</p>
            </div>
            <div className="p-4">
                <div className="space-y-1.5">
                    {['Requirements', 'Design', 'Implementation', 'Testing', 'Deployment'].map((phase, i, arr) => (
                        <div key={phase} className="space-y-1">
                            <div className="rounded-md px-3 py-2 text-xs font-medium text-white text-center"
                                style={{ backgroundColor: `hsl(${220 + i * 8}, 60%, ${40 + i * 4}%)` }}>
                                {phase}
                            </div>
                            {i < arr.length - 1 && (
                                <p className="text-center text-muted-foreground text-xs">↓</p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Each phase must complete before the next starts. Customer sees working software only at the very end, often a year later, often wrong.
                </p>
            </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-border">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Agile: ship small, learn fast</p>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {[
                        { label: 'Sprint 1', work: 'auth + dashboard', status: 'shipped ✓' },
                        { label: 'Sprint 2', work: 'search + filters', status: 'shipped ✓' },
                        { label: 'Sprint 3', work: 'notifications', status: 'in progress' },
                        { label: 'Sprint 4', work: 'mobile polish', status: 'planned' },
                    ].map((s) => (
                        <div key={s.label}
                            className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.work}</span>
                            <span className={`text-xs font-medium ${s.status.includes('✓') ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{s.status}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Working software ships every 1 to 2 weeks. Customer gives feedback after each sprint, and the plan adapts to what's actually needed.
                </p>
            </div>
        </div>
    </div>
);

// ── Sprint cycle diagram ──────────────────────────────────────────────────────
const SprintCycle = () => {
    const phases = [
        {
            title: 'Sprint Planning',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
            desc: 'Team pulls stories from the backlog, estimates effort, and commits to a sprint goal. Output: a sprint backlog the team believes they can ship.',
        },
        {
            title: 'Daily Standup',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
            desc: 'Three questions, 15 minutes max, every day: What did I do yesterday? What will I do today? Any blockers? Blockers get resolved offline; standup is synchronization, not problem solving.',
        },
        {
            title: 'Development',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
            desc: 'Build, test, and review code. Stories move through the board: To Do → In Progress → In Review → Done. "Done" means tested, reviewed, and deployable, not just coded.',
        },
        {
            title: 'Sprint Review',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
            desc: 'Demo working software to stakeholders. Gather real feedback. Update the backlog based on what you learned. This is the feedback loop that makes agile work.',
        },
        {
            title: 'Retrospective',
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800',
            desc: 'Internal team meeting: What went well? What didn\'t? What do we commit to changing next sprint? The retrospective is where teams improve; skip it and you stagnate.',
        },
    ];
    return (
        <div className="my-8 space-y-2">
            {phases.map((phase, i) => (
                <div key={phase.title} className="flex items-stretch gap-3">
                    <div className={`rounded-xl border flex-1 px-4 py-3 ${phase.bg}`}>
                        <p className={`text-xs font-bold ${phase.color}`}>{phase.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{phase.desc}</p>
                    </div>
                    {i < phases.length - 1 && (
                        <div className="flex items-end pb-3 text-muted-foreground text-sm select-none">↓</div>
                    )}
                </div>
            ))}
            <p className="text-center text-xs text-muted-foreground pt-1 select-none">↺ &nbsp; repeat every 1 to 2 weeks</p>
        </div>
    );
};

// ── Kanban board ──────────────────────────────────────────────────────────────
const KanbanBoard = () => {
    const columns = [
        {
            title: 'Backlog', color: 'text-muted-foreground', bg: 'bg-muted/30',
            cards: ['Add dark mode toggle', 'Improve search performance', 'Export to CSV'],
        },
        {
            title: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20',
            cards: ['User authentication', 'Dashboard layout'],
        },
        {
            title: 'In Review', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20',
            cards: ['Fix login redirect bug'],
        },
        {
            title: 'Done', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20',
            cards: ['Project scaffolding', 'CI pipeline setup', 'Database schema'],
        },
    ];
    return (
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {columns.map((col) => (
                <div key={col.title} className={`rounded-xl border border-border ${col.bg} p-3`}>
                    <p className={`text-xs font-bold mb-2 ${col.color}`}>{col.title} <span className="text-muted-foreground font-normal">({col.cards.length})</span></p>
                    <div className="space-y-2">
                        {col.cards.map((card) => (
                            <div key={card} className="rounded-lg border border-border bg-card px-2.5 py-2">
                                <p className="text-xs text-foreground leading-relaxed">{card}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function Week5Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={5}
                session="Lecture 1"
                title="Scrum, Kanban & Sprint Cycles"
                description="The ceremonies, artifacts, and mindset behind agile teams: user stories, sprint planning, standups, and retrospectives. You will plan the entire project in advance so every week maps to a clear set of issues."
                icon={<Workflow className="h-4 w-4" />}
            />

            {/* ── 01 WHY AGILE ────────────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Why Agile Exists" />

            <LectureP>
                Software is uniquely hard to plan. Unlike building a bridge, you can't fully specify what you're building before you start. Requirements change, users discover what they actually want only after using a prototype, and technology shifts under you mid-project. <LectureTerm>Waterfall</LectureTerm>, the dominant methodology before the 2000s, treated software like construction: plan everything, then execute. It failed constantly.
            </LectureP>
            <LectureP>
                In 2001, seventeen software practitioners wrote the <LectureTerm>Agile Manifesto</LectureTerm>, four values that reoriented the entire industry. The core insight: working software beats comprehensive documentation, customer collaboration beats contract negotiation, and responding to change beats following a plan.
            </LectureP>

            <WaterfallVsAgile />

            <LectureCallout type="info">
                Agile isn't a specific process; it's a set of values. <LectureTerm>Scrum</LectureTerm> and <LectureTerm>Kanban</LectureTerm> are concrete frameworks that implement those values. Most real teams blend both, picking the ceremonies and artifacts that actually help them ship.
            </LectureCallout>

            {/* ── 02 SCRUM ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Scrum" />

            <LectureP>
                <LectureTerm>Scrum</LectureTerm> organizes work into fixed-length iterations called <LectureTip tip="A fixed-length iteration (usually 1 to 2 weeks) in which a team plans, builds, and ships a set of features. At the end of each sprint the team demos, reflects, and plans the next one.">sprints</LectureTip>, typically 1 to 2 weeks. Each sprint is a complete loop: plan, build, ship, learn, repeat. The three roles in Scrum are the <LectureTip tip="Owns the product backlog and decides what to build next. Represents the customer/stakeholder. Does not tell the team how to build, only what and in what priority order.">Product Owner</LectureTip> (decides what to build and in what order), the <LectureTip tip="Facilitates Scrum ceremonies, removes blockers, and shields the team from interruptions. Not a manager but a servant-leader who keeps the process healthy.">Scrum Master</LectureTip> (removes blockers, protects the team), and the <LectureTerm>Development Team</LectureTerm> (builds the thing).
            </LectureP>

            <SprintCycle />

            <LectureP>
                Every sprint starts with a <LectureTip tip="A single sentence describing what the team aims to achieve by the end of the sprint. Keeps work focused: if a task doesn't serve the sprint goal, it goes back to the backlog.">sprint goal</LectureTip>, one sentence that describes what the team will achieve. "Users can search and filter the catalog" is a sprint goal; "work on stuff" is not. The goal keeps the team focused: if a task doesn't serve the sprint goal, it goes back to the backlog.
            </LectureP>

            <LectureSubHeading title="User Stories" />
            <LectureP>
                Work in Scrum is expressed as <LectureTip tip="A short, plain-language description of a feature from the end-user's perspective. Format: 'As a [user], I want [goal] so that [reason].' Keeps the team focused on value, not just code.">user stories</LectureTip>: short, plain-language descriptions of a feature from the perspective of the person who needs it. The canonical format: <em className="text-foreground">As a [type of user], I want [some goal] so that [some reason].</em> This keeps the team focused on value delivered to real people, not technical tasks divorced from purpose.
            </LectureP>

            <div className="my-6 space-y-2">
                {[
                    {
                        story: 'As a member, I want to search for books by title so that I can find what I\'m looking for without browsing the whole catalog.',
                        points: 3,
                        acceptance: ['Search returns results within 200ms', 'Partial matches are included', 'Results show availability status'],
                    },
                    {
                        story: 'As a librarian, I want to see all overdue loans in one view so that I can follow up with members who haven\'t returned items.',
                        points: 2,
                        acceptance: ['List shows patron name, item title, and days overdue', 'Sortable by days overdue descending', 'Exportable to CSV'],
                    },
                ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-3">
                            <p className="text-xs text-foreground leading-relaxed italic">"{s.story}"</p>
                            <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary shrink-0">{s.points} pts</div>
                        </div>
                        <div className="px-4 py-2.5">
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Acceptance criteria</p>
                            <div className="space-y-1">
                                {s.acceptance.map((a) => (
                                    <div key={a} className="flex items-start gap-2">
                                        <span className="text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
                                        <p className="text-xs text-muted-foreground">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <LectureCallout type="tip">
                <LectureTip tip="A unit of relative effort used to estimate work. Fibonacci scale (1, 2, 3, 5, 8). A 2-point story is roughly twice the complexity of a 1, and the team calibrates its own scale over time.">Story points</LectureTip> measure relative effort, not hours. A 2-point story is roughly twice as complex as a 1-point story; the team calibrates their own scale. Common sequences: 1, 2, 3, 5, 8 (Fibonacci). The key insight: estimate in points, not time. Teams are bad at estimating hours; they're better at estimating relative complexity.
            </LectureCallout>

            {/* ── 03 AGILE ARTIFACTS ──────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Agile Artifacts" />

            <LectureP>
                Three artifacts keep everyone aligned on what's being built and how much is left.
            </LectureP>

            <div className="my-6 space-y-3">
                {[
                    {
                        name: 'Product Backlog',
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                        desc: 'The master ordered list of everything that might go into the product. Owned by the Product Owner. Constantly refined: stories at the top are detailed and ready; stories at the bottom are rough ideas. The backlog is never "done."',
                        example: 'Everything from "add dark mode" to "rebuild the search engine", all in one prioritized list.',
                    },
                    {
                        name: 'Sprint Backlog',
                        color: 'text-orange-600 dark:text-orange-400',
                        bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
                        desc: 'The subset of the product backlog the team commits to completing in the current sprint. Owned by the team. Once the sprint starts, scope is locked; new requests go to the product backlog for the next sprint.',
                        example: 'The 5 to 8 stories the team pulled into Sprint 3, with tasks broken out under each.',
                    },
                    {
                        name: 'Burndown Chart',
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
                        desc: 'A graph showing remaining story points vs. days remaining in the sprint. The ideal line slopes from total points to zero. If the actual line is above the ideal, the team is behind. If below, they\'re ahead.',
                        example: 'Sprint starts with 24 points. By day 5, ideal = 12 remaining; actual = 15 remaining. Slightly behind, worth discussing in standup.',
                    },
                ].map((a) => (
                    <div key={a.name} className={`rounded-xl border ${a.bg} overflow-hidden`}>
                        <div className="px-4 py-2.5 border-b border-inherit">
                            <p className={`text-xs font-bold ${a.color}`}>{a.name}</p>
                        </div>
                        <div className="px-4 py-3 space-y-1.5">
                            <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                            <p className="text-xs text-foreground"><span className="font-semibold text-muted-foreground">Example: </span>{a.example}</p>
                        </div>
                    </div>
                ))}
            </div>

            <LectureP>
                After a few sprints, teams track their <LectureTip tip="The average number of story points a team completes per sprint. After 3 to 4 sprints the number stabilizes and becomes predictive, so the team can forecast how much work fits in a future sprint.">velocity</LectureTip>, the average story points completed per sprint. After three or four sprints, velocity stabilizes and becomes predictive: if your velocity is 20, you should pull roughly 20 points into each sprint. Without velocity, sprint planning is guesswork.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="text"
                title="Exercise 1: Plan with velocity"
                prompt={<>Your team completed 18 points in Sprint 1, 22 in Sprint 2, and 20 in Sprint 3. Using the team's average velocity, how many story points should you pull into Sprint 4? Answer with just the number.</>}
                expected={["20", "20 points", "20 story points"]}
                hint="Velocity is the average points completed per sprint: (18 + 22 + 20) / 3."
            />

            {/* ── 04 KANBAN ───────────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Kanban" />

            <LectureP>
                <LectureTerm>Kanban</LectureTerm> is a flow-based alternative to Scrum's sprints. Instead of time-boxed iterations, work flows continuously through a board of columns. The core principle is <LectureTip tip="Work In Progress limits: a cap on how many items can be in a board column at once. Forces the team to finish work before starting more. Prevents overload and exposes bottlenecks.">WIP limits</LectureTip> (Work In Progress limits). You cap how many items can be in each column at once. If "In Progress" is full, you can't start something new until you finish something in progress. This forces the team to finish work rather than start more.
            </LectureP>

            <KanbanBoard />

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border text-xs">
                    <div className="p-4">
                        <p className="font-semibold text-foreground mb-2">Choose Scrum when</p>
                        <div className="space-y-1.5">
                            {[
                                'Building a product with evolving requirements',
                                'Team is new and needs structure',
                                'Stakeholders want regular demos and feedback loops',
                                'Work can be broken into sprint-sized chunks',
                            ].map((point) => (
                                <div key={point} className="flex gap-2">
                                    <span className="text-blue-500 shrink-0">→</span>
                                    <p className="text-muted-foreground">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="font-semibold text-foreground mb-2">Choose Kanban when</p>
                        <div className="space-y-1.5">
                            {[
                                'Work arrives unpredictably (bug fixes, support tickets)',
                                'Team is experienced and self-organizing',
                                'Continuous delivery matters more than sprint goals',
                                'Items vary wildly in size and can\'t be sprint-scoped',
                            ].map((point) => (
                                <div key={point} className="flex gap-2">
                                    <span className="text-emerald-500 shrink-0">→</span>
                                    <p className="text-muted-foreground">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 05 GITHUB PROJECTS ──────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="GitHub Projects: Agile in Practice" />

            <LectureP>
                GitHub Projects is where most engineering teams actually live. It combines issues, pull requests, and project boards in the same tool as your code. No context switching between Jira and GitHub. For the club's projects and for your own work, GitHub Projects is the right default.
            </LectureP>

            <div className="my-6 space-y-3">
                {[
                    {
                        step: '01',
                        title: 'Create a Project',
                        desc: 'Go to your GitHub repo → Projects tab → New Project. Choose "Board" view for Kanban or "Roadmap" for timeline planning. Add columns: Backlog, Sprint, In Progress, In Review, Done.',
                    },
                    {
                        step: '02',
                        title: 'Write Issues as User Stories',
                        desc: 'Every feature is a GitHub Issue. Title: the story in one line. Body: full user story format + acceptance criteria. Add labels (feature, bug, chore) and estimates via custom fields.',
                    },
                    {
                        step: '03',
                        title: 'Link PRs to Issues',
                        desc: 'In your PR description, write "Closes #42" and GitHub auto-closes the issue and moves the card to Done when the PR merges. The board stays current with zero manual updates.',
                    },
                    {
                        step: '04',
                        title: 'Use Milestones for Sprints',
                        desc: 'Create a Milestone called "Sprint 1" with a due date. Assign issues to it. The milestone progress bar becomes your burndown chart: issues closed vs. total assigned.',
                    },
                ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                        <span className="text-2xl font-black text-primary/70 shrink-0 select-none">{item.step}</span>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <InteractiveExercise
                runtime="check"
                language="text"
                title="Exercise 2: Link a PR to its issue"
                prompt={<>You just opened a pull request that finishes the work tracked in issue <code>#42</code>. What exact phrase do you put in the PR description so GitHub automatically closes the issue (and moves its card to Done) when the PR merges?</>}
                expectedPattern={"^(?:[Cc]los(?:es|e|ed)|[Ff]ix(?:es|ed)?|[Rr]esolv(?:es|e|ed))\\s+#42$"}
                hint={'Use one of GitHub\'s closing keywords followed by the issue number, e.g. "Closes #42".'}
            />

            {/* ── 06 THE RETROSPECTIVE ────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="The Retrospective: How Teams Actually Improve" />

            <LectureP>
                The retrospective is the most skipped and most valuable ceremony in agile. Teams skip it when they feel busy, which is exactly when they need it most. Without retrospectives, teams repeat the same mistakes sprint after sprint.
            </LectureP>
            <LectureP>
                The classic format is <LectureTerm>Start / Stop / Continue</LectureTerm>: what should we start doing that we aren't? What should we stop doing that isn't working? What's working well that we should keep? Each item leads to a concrete action with an owner, not just a vague intention to "communicate better."
            </LectureP>

            <div className="my-6 rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border text-xs">
                    {[
                        { label: 'Start', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', items: ['Writing tests before code', 'PR descriptions with context', 'Dedicated code review time Fridays'] },
                        { label: 'Stop', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', items: ['Merging without review', 'Scope creep mid-sprint', 'Standup going 30+ minutes'] },
                        { label: 'Continue', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', items: ['Monday planning sessions', 'Pair programming on blockers', 'Friday demos to stakeholders'] },
                    ].map((col) => (
                        <div key={col.label} className={`p-4 ${col.bg}`}>
                            <p className={`font-bold mb-3 ${col.color}`}>{col.label}</p>
                            <div className="space-y-2">
                                {col.items.map((item) => (
                                    <div key={item} className="rounded-lg border border-border bg-card px-2.5 py-2">
                                        <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <LectureCallout type="tip">
                The best retrospectives are psychologically safe: team members can say what's actually wrong without fear of blame. If your retrospective only produces "good job everyone," something's wrong. The facilitator's job is to make it safe to say hard things.
            </LectureCallout>

            
        </LectureLayout>
    );
}