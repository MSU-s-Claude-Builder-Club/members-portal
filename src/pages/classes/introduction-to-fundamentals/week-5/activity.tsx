import { Workflow } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import { ActivityHint } from '@/components/ui/activity-hint';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week5Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={5}
                    session="Activity"
                    title="Set Up Your Entire Sprint Roadmap"
                    description="Create issues on your GitHub Project board for all remaining sprints: Week 6 (Containers), Week 7 (Backend), Week 8 (Testing & CI/CD), Week 9 (Frontend), Week 10 (Auth), Week 11 (Deployment). Each sprint gets 2 to 4 issues that match that week's deliverables. From here on you just pull issues and ship."
                    icon={<Workflow className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    You already have a repo and GitHub Project board from Week 4 (Project Kickoff). This activity is about populating the board with issues for <strong className="text-foreground">every</strong> remaining week, so when you start Week 6, you're just pulling the Containers issues; when you start Week 7, the Backend issues; and so on. No mid-course sprint planning needed.
                </LectureCallout>

                {/* ── ISSUE QUALITY GUIDANCE ────────────────────────────────────── */}
                <LectureSectionHeading number="01" title="Before You Start: What a Good Issue Looks Like" />

                <LectureP>
                    Every issue you create should be clear enough that someone with no context can pick it up and know exactly what to build and when it's done. Use the structure from Lecture 2: user story, context, and testable acceptance criteria as checkboxes.
                </LectureP>

                <div className="my-6 rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-border text-xs">
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/20">
                            <p className="font-bold text-rose-600 dark:text-rose-400 mb-2">Bad issue</p>
                            <p className="font-semibold text-foreground">Set up Docker</p>
                            <p className="text-muted-foreground mt-1">No body, no criteria, no context.</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20">
                            <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">Good issue</p>
                            <p className="font-semibold text-foreground">feat: Dockerfile for backend</p>
                            <p className="text-muted-foreground mt-1">User story, context, 3 checkboxes:<br />
                                ✓ docker compose up starts API on :8000<br />
                                ✓ GET /health returns 200<br />
                                ✓ README documents how to run</p>
                        </div>
                    </div>
                </div>

                <LectureCallout type="tip">
                    Add a story point estimate to each issue, either in the title (e.g. "[3pt] Dockerfile for backend") or via a custom field in GitHub Projects. This connects your planning to the estimation concepts from Lecture 1.
                </LectureCallout>

                <LectureP>
                    Before you start filling the board, warm up with two quick checks on the sprint planning concepts from this week's lectures.
                </LectureP>

                <InteractiveExercise
                    runtime="check"
                    language="text"
                    title="Exercise 1: Plan With Velocity"
                    prompt={<>Your team completed <strong>8</strong>, <strong>10</strong>, and <strong>12</strong> story points in its last three sprints. Using average velocity, how many story points should you plan for the next sprint? Answer with just the number.</>}
                    expected={["10", "10 points", "10 story points"]}
                    hint="Velocity is the average of recent sprints: (8 + 10 + 12) / 3."
                />

                <InteractiveExercise
                    runtime="check"
                    language="bash"
                    title="Exercise 2: Issues From the Terminal"
                    prompt={<>You'll be creating a lot of issues this week. Write the GitHub CLI command that lists the open issues in the current repository.</>}
                    expected={["gh issue list", "gh issue list --state open", "gh issue list -s open"]}
                    hint="The GitHub CLI is gh, and issue subcommands follow the pattern: gh issue <action>."
                />

                {/* ── CREATE ISSUES ─────────────────────────────────────────────── */}
                <LectureSectionHeading number="02" title="Create Issues for Each Sprint Theme" />

                <ActivityChallenge
                    number="2.1"
                    title="Week 6: Containers"
                    description="2 to 4 issues for Docker/containerization week."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues such as: Dockerfile for backend (or stub), docker-compose for local run, document how to build and run with Docker</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes to each issue (e.g. "docker compose up starts API on :8000")</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 6: Containers" and assign these issues to it</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.2"
                    title="Week 7: Backend"
                    description="2 to 4 issues for FastAPI, SQLite, Docker Compose."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues for: FastAPI app with 3+ endpoints, SQLite storage, optional Redis/caching, Docker Compose wiring</ActivityTask>
                        <ActivityTask>Tailor titles and criteria to your project domain (e.g. "GET /recipes returns JSON array", "POST /recipes creates a new record")</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes to each issue</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 7: Backend" and assign these issues to it</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.3"
                    title="Week 8: Testing & CI/CD"
                    description="2 to 4 issues for tests and GitHub Actions."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues for: unit or integration tests (backend and/or frontend), GitHub Actions workflow that runs tests on push, README section on how to run tests locally</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes (e.g. "pytest runs 10+ tests, all green", "GitHub Actions badge shows passing")</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 8: Testing & CI/CD" and assign these issues to it</ActivityTask>
                    </div>

                    <ActivityHint label="what counts as a test">
                        At minimum, test your API endpoints: does GET return the right shape? Does POST reject invalid input? Framework-specific UI tests (e.g. React Testing Library) are a bonus. The CI workflow just runs the same tests automatically on every push.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.4"
                    title="Week 9: Frontend"
                    description="2 to 4 issues for React, Tailwind, API connection."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues for: React app scaffolding with 3+ views/pages, Tailwind styling, fetch data from your live API, full-stack flow working end to end</ActivityTask>
                        <ActivityTask>Tailor to your domain (e.g. "Recipe list page renders cards from GET /recipes", "Recipe detail page shows full recipe")</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes to each issue</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 9: Frontend" and assign these issues to it</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.5"
                    title="Week 10: Auth"
                    description="2 to 4 issues for login and protected routes."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues for: login/signup API endpoint, JWT or session handling, at least one protected API route, at least one protected frontend route</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes (e.g. "POST /login returns JWT", "unauthenticated GET /recipes/mine returns 401")</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 10: Auth" and assign these issues to it</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.6"
                    title="Week 11: Deployment"
                    description="2 to 4 issues for production deploy."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create issues for: deploy backend (e.g. Railway, Render), deploy frontend (e.g. Vercel, Netlify), README with required env var names and live URLs</ActivityTask>
                        <ActivityTask>Add acceptance criteria as checkboxes (e.g. "Backend reachable at https://...", "Frontend fetches from production API")</ActivityTask>
                        <ActivityTask>Create a Milestone "Week 11: Deployment" and assign these issues to it</ActivityTask>
                    </div>

                    <ActivityHint label="which hosting providers">
                        Railway and Render both have free tiers that work for FastAPI + SQLite. Vercel and Netlify have free tiers for React frontends. You don't need to pick now; just write the issues. You'll choose a provider when you get to Week 11.
                    </ActivityHint>
                </ActivityChallenge>

                {/* ── VERIFICATION ──────────────────────────────────────────────── */}
                <LectureSectionHeading number="03" title="Verify Your Board" />

                <ActivityChallenge
                    number="3.1"
                    title="Board Check"
                    description="Confirm your sprint roadmap is complete."
                >
                    <div className="space-y-1">
                        <ActivityTask>Confirm your board has at least 12 issues total across Weeks 6 to 11 (2 to 4 per week)</ActivityTask>
                        <ActivityTask>Confirm you have 6 Milestones (one per sprint week) with issues assigned to each</ActivityTask>
                        <ActivityTask>Confirm every issue has acceptance criteria (at least 2 checkboxes each)</ActivityTask>
                        <ActivityTask>Confirm every issue has a descriptive title (not just "Set up Docker")</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureCallout type="tip">
                    You don't have to complete every issue in the week it's assigned. The board is a roadmap, not a contract. But having the issues written now means you always know what "done" looks like for each week. From Week 6 on, execution is: pull an issue, build it, open a PR, close the issue, repeat.
                </LectureCallout>

                <LectureCallout type="info">
                    <strong className="text-foreground">Week 12</strong> is Demo Prep: polishing your app and preparing a short presentation. You don't need formal issues for it, but if you want to track polish tasks (fix styling, write a better README, record a demo video), feel free to create a "Week 12: Demo Prep" milestone with a few issues now.
                </LectureCallout>

                
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
