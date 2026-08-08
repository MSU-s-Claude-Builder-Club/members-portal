import { GitBranch } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week4Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={4}
                    session="Activity"
                    title="Project Kickoff"
                    description="This is where your project starts. Choose your domain, scaffold the repo, and create your GitHub Project board. In Week 5 (Sprint Planning) you will create issues for every sprint in advance: Containers, Backend, Testing, Frontend, Auth, Deployment."
                    icon={<GitBranch className="h-4 w-4" />}
                />

                {/* ── 01 CHOOSE YOUR DOMAIN ───────────────────────────────────────── */}
                <LectureSectionHeading number="01" title="Choose Your Domain" />

                <LectureP>
                    This project runs from now through the end of the course. By the end you will have a live, deployed full-stack web app. Choose one domain now and commit to it; you are building this all the way through.
                </LectureP>

                <LectureCallout type="info">
                    The ten ideas below are <strong className="text-foreground">examples to inspire you</strong>, not a fixed menu. Take one and make it your own: change the scope, rename features, or combine concepts so the result is <strong className="text-foreground">unique and resume-worthy</strong>. If you have a different idea entirely, ask your teacher to confirm it's feasible for the course timeline before you commit.
                </LectureCallout>

                {/* Domain selection grid: examples to customize */}
                <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { num: 1, name: 'Recipe Book', desc: 'Save, browse, and search your personal recipe collection.' },
                        { num: 2, name: 'Study Planner', desc: 'Track courses, assignments, and upcoming deadlines.' },
                        { num: 3, name: 'Expense Tracker', desc: 'Log expenses by category and view spending history.' },
                        { num: 4, name: 'Event Board', desc: 'Create events, browse upcoming ones, and RSVP.' },
                        { num: 5, name: 'Habit Tracker', desc: 'Define habits, log daily completions, and track streaks.' },
                        { num: 6, name: 'Trivia Game', desc: 'Build question banks, play rounds, and track a live leaderboard.' },
                        { num: 7, name: 'Movie Recommender', desc: 'Rate watched movies and get recommendations based on your taste.' },
                        { num: 8, name: 'Book Log', desc: 'Track books you read, rate them, and maintain a reading list.' },
                        { num: 9, name: 'Workout Logger', desc: 'Log exercises, sets, and reps; view progress over time.' },
                        { num: 10, name: 'Link Saver', desc: 'Save and tag links with notes; search and filter your collection.' },
                    ].map((domain) => (
                        <div
                            key={domain.num}
                            className="rounded-xl border border-border bg-card p-4"
                        >
                            <p className="font-semibold text-sm text-foreground">{domain.num}. {domain.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{domain.desc}</p>
                        </div>
                    ))}
                </div>

                <LectureCallout type="warning">
                    Pick something you would actually want to use. You are going to be inside this codebase for four weeks. Apathy is the main reason projects don't get finished.
                </LectureCallout>

                {/* ── 02 SCAFFOLD YOUR REPOSITORY ─────────────────────────────────── */}
                <LectureSectionHeading number="02" title="Scaffold Your Repository" />

                <ActivityChallenge
                    number="2.1"
                    title="Create the Repo"
                    description="Start with the foundation: a GitHub repo with a README."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a new public GitHub repo named after your project domain (<span title="A naming convention where words are lowercase and separated by hyphens. Example: my-project-name. Common for repo names and URLs.">kebab-case</span>)</ActivityTask>
                        <ActivityTask>Clone it locally</ActivityTask>
                        <ActivityTask>Create a README.md with: project name, your chosen domain, and a 2 to 3 sentence description of what it will do when finished</ActivityTask>
                        <ActivityTask>Commit and push</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.2"
                    title="Set Up Your Folder Structure"
                    description="Create the directories that will hold your backend and frontend code."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create two folders at the root: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/backend</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/frontend</code></ActivityTask>
                        <ActivityTask>Inside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/backend</code> create a placeholder main.py with a single comment: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border"># Week 7: FastAPI backend goes here</code></ActivityTask>
                        <ActivityTask>Inside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/frontend</code> create a placeholder index.html with a comment: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">&lt;!-- Week 9: React frontend goes here --&gt;</code></ActivityTask>
                        <ActivityTask>Create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code> in the project root with entries for <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node_modules/</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">__pycache__/</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.DS_Store</code></ActivityTask>
                        <ActivityTask>Commit with message: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">chore: scaffold project structure</code></ActivityTask>
                    </div>

                    <TerminalBlock
                        title="bash · your-project"
                        lines={[
                            { cmd: 'mkdir backend frontend' },
                            { cmd: 'echo "# Week 7: FastAPI backend goes here" > backend/main.py' },
                            { cmd: 'echo "<!-- Week 9: React frontend goes here -->" > frontend/index.html' },
                            { cmd: 'printf "node_modules/\\n.env\\n__pycache__/\\n.DS_Store\\n" > .gitignore' },
                            { cmd: 'git add . && git commit -m "chore: scaffold project structure"' },
                        ]}
                    />
                </ActivityChallenge>

                {/* ── 03 SET UP YOUR GITHUB PROJECT BOARD ──────────────────────────── */}
                <LectureSectionHeading number="03" title="Set Up Your GitHub Project Board" />

                <LectureP>
                    Every deliverable for this project ships as a pull request that closes a GitHub issue. Set your board up now and you will not have to think about process again. You can just work.
                </LectureP>

                <ActivityChallenge
                    number="3.1"
                    title="Create the Board"
                    description="Get your Kanban board ready to track work."
                >
                    <div className="space-y-1">
                        <ActivityTask>Go to your GitHub repo → <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Projects</code> → <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">New Project</code></ActivityTask>
                        <ActivityTask>Choose the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Board</code> template (Kanban)</ActivityTask>
                        <ActivityTask>Name it after your project</ActivityTask>
                        <ActivityTask>Add three columns: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Backlog</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">In Progress</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Done</code></ActivityTask>
                    </div>

                    <LectureCallout type="info">
                        <span title="A workflow management method where work items move across columns representing their current status. Originated at Toyota in the 1950s as a manufacturing scheduling system.">Kanban</span> keeps you focused. You never ask "what should I work on?" because you just move the next thing from Backlog to In Progress.
                    </LectureCallout>
                </ActivityChallenge>

                <ActivityChallenge
                    number="3.2"
                    title="Write Your Issues"
                    description="Create three initial issues that will track your upcoming work."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Issue 1</code> title: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feat: containerize backend stub</code> with body: "Write a Dockerfile for the backend stub created during project scaffolding. Mount a volume for data persistence. Verify the container runs."</ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Issue 2</code> title: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feat: build FastAPI backend</code> with body: "Implement the FastAPI backend with 3+ endpoints, SQLite storage, and a Redis caching layer running via Docker Compose."</ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Issue 3</code> title: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feat: build React frontend</code> with body: "Build the React + Tailwind frontend with 3+ views connected to the live API."</ActivityTask>
                        <ActivityTask>Add all three issues to your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Backlog</code> column</ActivityTask>
                    </div>

                    <LectureCallout type="tip">
                        Write issues like you are writing them for a teammate who has no context. Clear title, clear acceptance criteria. You will thank yourself in three weeks.
                    </LectureCallout>
                </ActivityChallenge>

                {/* ── 04 OPEN YOUR FIRST PULL REQUEST ─────────────────────────────── */}
                <LectureSectionHeading number="04" title="Open Your First Pull Request" />

                <ActivityChallenge
                    number="4.1"
                    title="Branch, Push, and PR"
                    description="Practice the Git workflow you'll use for every feature."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a new branch: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git checkout -b feat/project-scaffold</code></ActivityTask>
                        <ActivityTask>Make one small change (add your name to the README)</ActivityTask>
                        <ActivityTask>Commit: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git add . && git commit -m "chore: add my name to README"</code></ActivityTask>
                        <ActivityTask>Push the branch: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git push origin feat/project-scaffold</code></ActivityTask>
                        <ActivityTask>Open a pull request from that branch into <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                        <ActivityTask>In the PR description write: what your project does, which domain you chose, and mention all three issues using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Related: #1, #2, #3</code></ActivityTask>
                    </div>

                    <LectureCallout type="warning">
                        Do <strong className="text-foreground">not</strong> write "Closes #1" here, because that keyword auto-closes the issue when the PR merges. This scaffold PR doesn't complete any of those issues; it just sets up the repo. Save "Closes #N" for the future PRs that actually deliver each feature.
                    </LectureCallout>

                    <ActivityHint label="why not push to main directly">
                        In industry, nobody pushes to main directly. All changes go through pull requests so they can be reviewed, discussed, and reverted if needed. You are building this habit now.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="4.2"
                    title="Verify Your Setup"
                    description="Confirm everything is in place."
                >
                    <div className="space-y-1">
                        <ActivityTask>Confirm your GitHub Project board shows 3 issues in Backlog</ActivityTask>
                        <ActivityTask>Confirm your PR is open against <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                        <ActivityTask>Confirm your repo has <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend/</code>, and a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code></ActivityTask>
                        <ActivityTask>Share your PR link in the club Slack; this is how your progress gets tracked each week</ActivityTask>
                    </div>
                </ActivityChallenge>

                {/* ── 05 CHECK YOUR GIT WORKFLOW ──────────────────────────────────── */}
                <LectureSectionHeading number="05" title="Check Your Git Workflow" />

                <LectureP>
                    Before you leave, prove you can run the branch-and-push workflow from memory. These two quick checks cover the exact commands you just used and will use for every feature from here on.
                </LectureP>

                <InteractiveExercise
                    runtime="check"
                    language="bash"
                    title="Exercise 1"
                    prompt={<>Write the single command that <strong>creates</strong> a new branch named <code>feat/login</code> <strong>and switches</strong> to it in one step.</>}
                    expected={["git checkout -b feat/login", "git switch -c feat/login", "git switch --create feat/login"]}
                    hint="Either git checkout with -b, or the newer git switch with -c."
                />

                <InteractiveExercise
                    runtime="check"
                    language="bash"
                    title="Exercise 2"
                    prompt={<>You are on the branch <code>feat/login</code>. Write the command that pushes it to the remote named <code>origin</code> for the first time.</>}
                    expectedPattern={"^git\\s+push\\s+(-u\\s+|--set-upstream\\s+)?origin\\s+feat/login$"}
                    hint="git push, the remote name, then the branch name. Adding -u also sets the upstream."
                />

            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
