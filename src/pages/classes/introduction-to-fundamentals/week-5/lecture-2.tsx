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
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

const SPRINT_THEMES = [
    { week: 6, theme: 'Containers', issues: ['Dockerfile for backend', 'docker-compose for local run', 'Document run instructions'] },
    { week: 7, theme: 'Backend', issues: ['FastAPI app with 3+ endpoints', 'SQLite storage', 'Redis caching (optional)', 'Docker Compose'] },
    { week: 8, theme: 'Testing & CI/CD', issues: ['Unit/integration tests', 'GitHub Actions workflow', 'README: how to run tests'] },
    { week: 9, theme: 'Frontend', issues: ['React app with 3+ views', 'Tailwind styling', 'Fetch from API', 'Full-stack flow working'] },
    { week: 10, theme: 'Auth', issues: ['Login/signup endpoint', 'JWT or sessions', 'Protected route (API + UI)'] },
    { week: 11, theme: 'Deployment', issues: ['Deploy backend (e.g. Railway)', 'Deploy frontend (e.g. Vercel)', 'README: env vars and URLs'] },
];

export default function Week5Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={5}
                session="Lecture 2"
                title="Backlog Design & Issue Writing"
                description="How to write issues that map to real deliverables: Containers, Backend, Testing, Frontend, Auth, Deployment. One sprint per theme. You create the full roadmap now so execution is just 'pull the next issue.'"
                icon={<Workflow className="h-4 w-4" />}
            />

            {/* ── 01 ONE SPRINT PER WEEK ───────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="One Sprint Per Week, One Theme Per Sprint" />

            <LectureP>
                In this course, each week after Sprint Planning is a <LectureTerm>sprint</LectureTerm>: a single theme (Containers, Backend, Testing, Frontend, Auth, Deployment). You are not doing "Sprint 1" then "Sprint 2" as separate review ceremonies; you set up <strong className="text-foreground">all</strong> sprint issues in advance. When you start Week 6, you pull the Containers issues; when you start Week 7, you pull the Backend issues; and so on. The board is your roadmap.
            </LectureP>
            <LectureCallout type="info">
                Writing the full backlog now means you never have to "plan the next sprint" mid-course. You already know what each week ships. Execution is just: open the board, pick an issue for this week's theme, build it, open a PR, close the issue.
            </LectureCallout>

            {/* ── 02 MAP ISSUES TO COURSE WEEKS ────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Map Issues to Course Weeks" />

            <LectureP>
                Each of the next six weeks has a clear deliverable. Turn those deliverables into 2 to 4 GitHub issues per week. Use the table below as a template, and adapt the issue titles and acceptance criteria to your project domain.
            </LectureP>

            <div className="my-6 space-y-3">
                {SPRINT_THEMES.map((s) => (
                    <div key={s.week} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                            <span className="text-xs font-black text-primary">Week {s.week}</span>
                            <span className="text-xs font-semibold text-foreground">{s.theme}</span>
                        </div>
                        <div className="px-4 py-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Example issues</p>
                            <ul className="space-y-1">
                                {s.issues.map((issue) => (
                                    <li key={issue} className="flex items-start gap-2 text-xs text-foreground">
                                        <span className="text-muted-foreground shrink-0">•</span>
                                        <span>{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 03 ANATOMY OF A GREAT ISSUE ──────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Anatomy of a Great Issue" />

            <LectureP>
                The one-liner examples above are starting points, not finished issues. A real issue needs enough context that anyone on the team (including future-you, three weeks from now) can pick it up and know exactly what "done" looks like. Here is what a complete issue looks like in Markdown, the format GitHub uses for issue bodies.
            </LectureP>

            <CodeBlock
                language="markdown"
                title="GitHub Issue: example body"
                lines={[
                    '## User Story',
                    'As a user, I want to run the backend locally with one command',
                    'so that I can develop without installing Python or dependencies on my host.',
                    '',
                    '## Context',
                    'The backend is a FastAPI app (backend/main.py). We need a Dockerfile',
                    'that builds the image and a docker-compose.yml that starts the service',
                    'with a mounted volume for the SQLite database.',
                    '',
                    '## Acceptance Criteria',
                    '- [ ] `docker compose up` starts the API on http://localhost:8000',
                    '- [ ] GET /health returns 200',
                    '- [ ] SQLite data persists across container restarts (volume mount)',
                    '- [ ] README documents `docker compose up` as the way to run the backend',
                    '',
                    '## Labels',
                    'feature, week-6, containers',
                    '',
                    '## Milestone',
                    'Week 6: Containers',
                ]}
            />

            <LectureP>
                Notice the structure: a user story gives the <em className="text-foreground">why</em>, context gives the <em className="text-foreground">how</em> (enough to start, not a full spec), and acceptance criteria are checkboxes, which GitHub renders as a clickable checklist inside the issue. When all boxes are checked, the issue is done.
            </LectureP>

            <LectureCallout type="tip">
                GitHub Markdown checkboxes (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">- [ ]</code>) are interactive: you can check them off directly in the issue without editing the body. The issue list even shows a progress bar like "2/4 tasks complete."
            </LectureCallout>

            <LectureP>
                Try it yourself before moving on. This is the exact syntax you'll use in every issue body you write this semester.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="markdown"
                title="Exercise 1: Write a checklist item"
                prompt={<>Write the single line of GitHub Markdown for an <strong>unchecked</strong> acceptance-criteria checkbox with the text <code>Write tests</code>.</>}
                expected={["- [ ] write tests", "* [ ] write tests"]}
                hint="A checkbox line starts with a dash, then square brackets containing a space, then the text."
            />

            {/* ── 04 ACCEPTANCE CRITERIA ────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Acceptance Criteria: Vague vs. Testable" />

            <LectureP>
                Every issue should have <LectureTip tip="Concrete, testable conditions that must be true for an issue to be considered done. Written as checkboxes in the issue body. Without them, 'done' is a matter of opinion.">acceptance criteria</LectureTip>: a short list of conditions that must be true for the issue to be "done." The difference between a useful issue and a useless one almost always comes down to whether the criteria are testable.
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border text-xs">
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20">
                        <p className="font-bold text-rose-600 dark:text-rose-400 mb-3">Vague (avoid)</p>
                        <div className="space-y-2">
                            {[
                                'Backend has 3 endpoints',
                                'Tests pass',
                                'Frontend looks good',
                                'Docker works',
                            ].map((item) => (
                                <div key={item} className="rounded-lg border border-border bg-card px-2.5 py-2">
                                    <p className="text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-3">Testable (use these)</p>
                        <div className="space-y-2">
                            {[
                                'GET /items returns 200 and JSON array',
                                'pytest runs 10+ tests, all green in CI',
                                'Recipe list page renders 3 cards from API data',
                                'docker compose up starts app on :8000',
                            ].map((item) => (
                                <div key={item} className="rounded-lg border border-border bg-card px-2.5 py-2">
                                    <p className="text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <LectureP>
                The testable versions can be verified by running a command or opening a URL, so there is no ambiguity about whether they pass. Write 2 to 4 criteria per issue so you (and anyone reviewing your PR) know when to close it.
            </LectureP>

            <LectureSubHeading title="Link PRs to issues" />
            <LectureP>
                When you open a pull request, put <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Closes #42</code> in the PR description (replace 42 with the issue number). When the PR merges, GitHub will close the issue and move the card on your board automatically. Your board stays in sync with reality.
            </LectureP>
            <LectureCallout type="tip">
                You can create a Milestone per week (e.g. "Week 6: Containers") and assign issues to it. The milestone progress bar becomes a quick view of how much of that week's work is done.
            </LectureCallout>

            <InteractiveExercise
                runtime="check"
                language="markdown"
                title="Exercise 2: Link a PR to an issue"
                prompt={<>Your pull request implements issue number <strong>42</strong>. Write the line you put in the PR description so GitHub automatically closes that issue when the PR merges.</>}
                expected={["closes #42", "close #42", "closed #42", "fixes #42", "fix #42", "fixed #42", "resolves #42", "resolve #42", "resolved #42"]}
                hint="Use one of GitHub's closing keywords (closes, fixes, resolves) followed by the issue number with a # in front."
            />

            {/* ── 05 ESTIMATION IN PRACTICE ─────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Estimation in Practice" />

            <LectureP>
                In Lecture 1 you learned about story points. Now connect that to the issues you're about to create. The goal is not precision; it's relative sizing so you know roughly how much fits in a week.
            </LectureP>

            <div className="my-6 rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rough estimation guide</p>
                </div>
                {[
                    { points: '1', label: 'Trivial', examples: 'Update README, add .gitignore entry, fix a typo' },
                    { points: '2', label: 'Small', examples: 'Write a Dockerfile for an existing app, add one API endpoint, write a few unit tests' },
                    { points: '3', label: 'Medium', examples: 'Set up docker-compose with two services, build a React page connected to the API' },
                    { points: '5', label: 'Large', examples: 'Build a full FastAPI backend with 3+ endpoints and storage, implement JWT auth end-to-end' },
                    { points: '8', label: 'Very large', examples: 'Full-stack flow (backend + frontend + Docker + tests), deploy both services to production' },
                ].map((row) => (
                    <div key={row.points} className="flex items-start gap-4 px-4 py-3 border-b border-border last:border-b-0">
                        <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary shrink-0">{row.points} pt</div>
                        <div>
                            <p className="text-xs font-semibold text-foreground">{row.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{row.examples}</p>
                        </div>
                    </div>
                ))}
            </div>

            <LectureP>
                Add a point estimate to each issue you create, either in the issue title (e.g. "[3pt] Dockerfile for backend") or as a custom field in GitHub Projects. After a few weeks you'll see whether you're consistently finishing 8 points per week or 15, and you can plan accordingly.
            </LectureP>

            <LectureCallout type="info">
                If you're unsure whether something is a 3 or a 5, pick the higher number. Underestimating is the number one source of sprint failure. It's better to finish early than to carry unfinished work into the next week.
            </LectureCallout>

            {/* ── 06 ISSUE TEMPLATES ───────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Issue Templates" />

            <LectureP>
                Writing the same structure (user story, context, acceptance criteria, labels) for every issue gets repetitive. GitHub lets you create <LectureTerm>issue templates</LectureTerm>: Markdown files stored in your repo that pre-fill the body when someone opens a new issue. You set it up once and every issue starts with the right structure.
            </LectureP>
            <LectureP>
                Create a folder <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/ISSUE_TEMPLATE/</code> in your repo root and add a file like this:
            </LectureP>

            <CodeBlock
                language="markdown"
                title=".github/ISSUE_TEMPLATE/feature.md"
                lines={[
                    '---',
                    'name: Feature',
                    'about: Propose a new feature or enhancement',
                    'labels: feature',
                    '---',
                    '',
                    '## User Story',
                    'As a [user type], I want [goal] so that [reason].',
                    '',
                    '## Context',
                    'Describe what exists today and what needs to change.',
                    '',
                    '## Acceptance Criteria',
                    '- [ ] Criterion 1',
                    '- [ ] Criterion 2',
                    '- [ ] Criterion 3',
                    '',
                    '## Estimate',
                    'Story points: [1 / 2 / 3 / 5 / 8]',
                ]}
            />

            <LectureP>
                Once this file is committed, anyone clicking "New Issue" on your repo will see a "Feature" template option. The body is pre-filled with the headings and placeholders, so they just fill in the blanks. You can create additional templates for bug reports, chores, or any other issue type your project needs.
            </LectureP>

            <LectureCallout type="tip">
                Setting up an issue template is optional for this course but highly recommended. It takes five minutes and saves time on every issue you create for the rest of the project. It also demonstrates repo hygiene that employers look for in portfolio projects.
            </LectureCallout>

            
        </LectureLayout>
    );
}
