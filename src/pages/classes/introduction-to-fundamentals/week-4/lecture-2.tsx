import { GitBranch } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureSubHeading,
    LectureP,
    LectureTerm,
    LectureTip,
} from '@/components/ui/lecture-typography';
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── PR workflow diagram ──────────────────────────────────────────────────────
const PRWorkflow = () => (
    <div className="my-8 rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex flex-wrap items-center gap-2 justify-center text-xs">
            {[
                { label: 'Branch', sub: 'git checkout -b feature/x', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { label: '→', sub: '', color: 'text-muted-foreground', bg: '' },
                { label: 'Code', sub: 'edit, commit', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
                { label: '→', sub: '', color: 'text-muted-foreground', bg: '' },
                { label: 'Push', sub: 'git push origin feature/x', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                { label: '→', sub: '', color: 'text-muted-foreground', bg: '' },
                { label: 'Open PR', sub: 'GitHub UI', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20' },
                { label: '→', sub: '', color: 'text-muted-foreground', bg: '' },
                { label: 'Review', sub: 'approve / request changes', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                { label: '→', sub: '', color: 'text-muted-foreground', bg: '' },
                { label: 'Merge', sub: 'main gets the code', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            ].map((step, i) => (
                <div key={i} className={step.bg ? `rounded-lg border border-border px-3 py-2 ${step.bg}` : 'px-1'}>
                    <span className={`font-semibold ${step.color}`}>{step.label}</span>
                    {step.sub && <p className="text-muted-foreground mt-0.5 font-mono">{step.sub}</p>}
                </div>
            ))}
        </div>
    </div>
);

// ── Kanban board ──────────────────────────────────────────────────────────────
const KanbanBoard = () => {
    const columns = [
        { title: 'Backlog', color: 'text-muted-foreground', bg: 'bg-muted/30', cards: ['Add dark mode', 'Export to CSV'] },
        { title: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', cards: ['User auth', 'Dashboard'] },
        { title: 'In Review', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20', cards: ['Login bug fix'] },
        { title: 'Done', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', cards: ['Scaffolding', 'CI setup'] },
    ];
    return (
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {columns.map((col) => (
                <div key={col.title} className={`rounded-xl border border-border ${col.bg} p-3`}>
                    <p className={`text-xs font-bold mb-2 ${col.color}`}>{col.title}</p>
                    <div className="space-y-2">
                        {col.cards.map((card) => (
                            <div key={card} className="rounded-lg border border-border bg-card px-2.5 py-2">
                                <p className="text-xs text-foreground">{card}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function Week4Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={4}
                session="Lecture 2"
                title="GitHub, Agile & Project Management"
                description="Pull requests, GitHub Projects, issues, and the Agile workflow that connects them. This is how every team in industry tracks work from idea to shipped feature."
                icon={<GitBranch className="h-4 w-4" />}
            />

            {/* ── 01 FROM GIT TO COLLABORATION ───────────────────────────────── */}
            <LectureSectionHeading number="01" title="From Git to Collaboration" />

            <LectureP>
                You now know how to branch, commit, and merge locally. In practice, teams don't merge by running <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git merge</code> on each other's branches. They use <LectureTip tip="A proposal to merge your branch into another (usually main). Includes a description, discussion thread, and optional required approvals before merge.">pull requests</LectureTip> (PRs): you push your branch to GitHub, open a PR to propose merging it into <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>, someone reviews your code, and then the merge happens. The PR is the unit of review and the audit trail for every change.
            </LectureP>
            <LectureP>
                Pull requests connect Git (the mechanics) to how work actually gets done: an issue describes what to build, a branch holds the code, and the PR ties them together so that when the PR merges, the issue closes and the board updates. That loop (idea → issue → branch → PR → merge → done) is the Agile workflow in practice.
            </LectureP>

            <LectureCallout type="info">
                "Pull request" and "merge request" (GitLab) mean the same thing: a request to merge your branch into the target branch, with a discussion thread and optional required approvals. GitHub calls them PRs; GitLab calls them MRs.
            </LectureCallout>

            {/* ── 02 THE PULL REQUEST WORKFLOW ────────────────────────────────── */}
            <LectureSectionHeading number="02" title="The Pull Request Workflow" />

            <PRWorkflow />

            <LectureP>
                After you push your branch, go to your repo on GitHub. You'll often see a yellow banner: "feature/add-login had recent pushes" with a button <strong className="text-foreground">Compare & pull request</strong>. Click it. Add a title and a description: what does this PR do? Why? How can a reviewer test it? Link the issue it addresses with "Closes #42" so GitHub auto-closes the issue when the PR merges.
            </LectureP>

            <LectureSubHeading title="What to put in a PR description" />
            <LectureP>
                Good PR descriptions save reviewers time and leave a record for the future. Include: a short summary of the change, what problem it solves, how to test it (steps or a checklist), and any screenshots or notes for reviewers. In industry, PR templates (stored in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/PULL_REQUEST_TEMPLATE.md</code>) standardize this so every PR has the same structure.
            </LectureP>

            <LectureCallout type="tip">
                Write "Closes #123" or "Fixes #123" in the PR description. When the PR is merged, GitHub automatically closes that issue and moves it to Done on your project board. No manual dragging required: the board stays in sync with the code.
            </LectureCallout>

            <LectureSubHeading title="Review and merge" />
            <LectureP>
                Reviewers comment on specific lines or the whole PR. They can approve, request changes, or suggest edits. Once the branch is approved (and any required checks pass, e.g. CI), someone merges the PR. GitHub offers merge options: create a merge commit, squash all commits into one, or rebase. Teams usually choose one and stick to it so history is consistent.
            </LectureP>

            <LectureCallout type="warning">
                Don't merge your own PR without review unless your team explicitly allows it. The whole point is a second set of eyes: catching bugs, suggesting cleaner approaches, and sharing context. Skipping review is a common source of regressions and technical debt.
            </LectureCallout>

            <LectureSubHeading title="Try it: the commands behind a PR" />
            <LectureP>
                Before a pull request ever exists on GitHub, two git commands set it up: one to create your branch, one to push it. Practice both below.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 1: Start a feature branch"
                prompt={<>You are on <code>main</code> and about to work on issue #42, a login form. Write the single git command that <strong>creates and switches to</strong> a new branch named <code>feature/login</code>.</>}
                expected={[
                    'git checkout -b feature/login',
                    'git switch -c feature/login',
                    'git switch --create feature/login',
                ]}
                hint="Both git checkout and git switch can create a branch and move onto it in one step. Look for the -b or -c flag."
            />

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 2: Push the branch for a PR"
                prompt={<>Your commits on <code>feature/login</code> are ready. Write the git command that pushes the branch to the <code>origin</code> remote so you can open a pull request on GitHub.</>}
                expected={[
                    'git push origin feature/login',
                    'git push -u origin feature/login',
                    'git push --set-upstream origin feature/login',
                ]}
                hint="git push takes the remote name first, then the branch name. Adding -u also sets the upstream so future pushes are just git push."
            />

            {/* ── 03 ISSUES AS THE SOURCE OF WORK ──────────────────────────────── */}
            <LectureSectionHeading number="03" title="Issues as the Source of Work" />

            <LectureP>
                Every piece of work should start as an <LectureTip tip="A single unit of work in GitHub: bug report, feature request, or task. Has a title, description, labels, and can be linked to PRs.">issue</LectureTip>: a bug report, a feature request, or a task. Issues live in the <LectureTip tip="The ordered list of work that might get done. Items sit here until the team pulls them into the current sprint or cycle.">backlog</LectureTip> until the team decides to do them. When you're ready to work on something, you assign yourself (or get it assigned), create a branch, and when you open a PR you link it to the issue. That way the issue tracks the work from "to do" to "in progress" to "done."
            </LectureP>
            <LectureP>
                Issues don't have to be huge. "Add a README section for setup" is a valid issue. "Fix typo in login error message" is too. The goal is traceability: every change is tied to a reason, and every reason is visible in the backlog and on the board.
            </LectureP>

            <LectureCallout type="tip">
                Use issue templates (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/ISSUE_TEMPLATE/bug_report.md</code>) so reporters fill in the right fields: steps to reproduce, expected vs actual behavior, environment. It keeps issues actionable instead of vague.
            </LectureCallout>

            {/* ── 04 AGILE IN ONE PAGE ───────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Agile in One Page" />

            <LectureP>
                <LectureTip tip="A mindset and set of practices: deliver working software in small increments, get feedback early, and adapt. Emphasizes people and flexibility over rigid plans.">Agile</LectureTip> means shipping small increments, getting feedback, and adapting. Instead of planning a whole product upfront and building it in one shot (waterfall), teams work in short cycles: pick a chunk of work from the backlog, build it, ship it, learn from it, then repeat. The backlog is the ordered list of everything that might get built; the current cycle (sprint or just "in progress") is what the team is doing now.
            </LectureP>
            <LectureP>
                Two common ways to run this: <LectureTip tip="A framework with fixed-length iterations (sprints), planning at the start, and a retrospective at the end. Roles include Scrum Master and Product Owner.">Scrum</LectureTip> (fixed-length sprints, e.g. 2 weeks, with planning and retro at the boundaries) and <LectureTip tip="A flow-based method. Work moves across columns (e.g. To Do → In Progress → Done). No fixed sprint length; optional WIP limits per column.">Kanban</LectureTip> (continuous flow with a board and optional WIP limits). Many teams mix both: a board with columns like Backlog → In Progress → In Review → Done, and optional time-boxed sprints for planning and demos.
            </LectureP>

            <KanbanBoard />

            <LectureCallout type="info">
                The backlog is never "finished"; it's a living list. New ideas and bugs get added; priorities change. The sprint (or current work) is a commitment: we will finish these items by the end of the cycle. That tension between an infinite backlog and a finite sprint is what keeps agile focused.
            </LectureCallout>

            {/* ── 05 GITHUB PROJECTS ─────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="GitHub Projects: Your Board in the Repo" />

            <LectureP>
                <LectureTip tip="GitHub's built-in project management: boards or tables linked to your repo. Issues become cards; PRs that close issues update the board automatically.">GitHub Projects</LectureTip> gives you a board (Kanban or table view) tied directly to your repo. Create a project from the repo's Projects tab, add columns like Backlog, In Progress, In Review, Done, and add your issues as cards. When you open a PR that "Closes #5," the issue card can move to Done automatically. No separate Jira or Trello; the board lives next to the code.
            </LectureP>
            <LectureP>
                For this course, you'll create a GitHub Project for your capstone repo, add issues for the work you plan across the remaining weeks, and ship every deliverable via a PR that closes an issue. By the end you'll have a real workflow: idea → issue → branch → PR → review → merge → done.
            </LectureP>

            <div className="my-6 space-y-2">
                {[
                    { step: '1', title: 'Create a Project', desc: 'Repo → Projects → New project. Choose Board. Add columns: Backlog, Sprint, In Progress, In Review, Done.' },
                    { step: '2', title: 'Add issues', desc: 'Create issues for each feature or task. Add them to the project so they show as cards in Backlog.' },
                    { step: '3', title: 'Move work into the sprint', desc: 'Drag issues from Backlog into Sprint or In Progress when you start them.' },
                    { step: '4', title: 'Open PRs that close issues', desc: 'In the PR description write "Closes #N". When the PR merges, the issue closes and the card moves to Done.' },
                ].map((item) => (
                    <div key={item.step} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                        <span className="text-xl font-black text-primary/70 shrink-0">{item.step}</span>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <LectureCallout type="tip">
                Use labels on issues (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">bug</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">feature</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">good first issue</code>) so you can filter the board and reports. Milestones (e.g. "Sprint 1") group issues by time so you can see sprint scope and progress at a glance.
            </LectureCallout>

            {/* ── 06 CODE REVIEW ────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Code Review Best Practices" />

            <LectureP>
                Code review is not about finding fault. It's about catching bugs early, sharing context across the team, and collectively improving code quality. Every PR you open will be reviewed, and you'll review others'. Doing this well is a career-long skill.
            </LectureP>

            <LectureSubHeading title="As a reviewer" />
            <LectureP>
                Read the PR description first so you understand the intent. Then look at the diff: does the code do what the description says? Are there edge cases? Is anything confusing? Leave comments on specific lines; GitHub lets you click a line number in the diff to start a comment thread. Be constructive: explain <em>why</em> something should change, not just <em>that</em> it should.
            </LectureP>
            <LectureP>
                GitHub offers a <LectureTip tip="Click the ± icon on a line in a PR diff and write a code suggestion in a fenced code block. The author can accept with one click and it creates a commit automatically. Faster than describing the change in words.">Suggest changes</LectureTip> feature: click the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">±</code> icon on a line, write your proposed code, and the author can accept it with one click. This is faster than describing a change in words.
            </LectureP>
            <LectureP>
                When you're done, submit your review with one of three statuses: <LectureTerm>Approve</LectureTerm> (looks good, merge it), <LectureTerm>Request changes</LectureTerm> (needs work before merging), or <LectureTerm>Comment</LectureTerm> (feedback without a blocking verdict).
            </LectureP>

            <LectureSubHeading title="As an author" />
            <LectureP>
                Keep PRs small and focused: one logical change per PR. A 50-line PR gets careful review; a 500-line PR gets a rubber stamp. Respond to every comment: either make the change or explain why you disagree. Don't take feedback personally. Your reviewer is reviewing the code, not you.
            </LectureP>

            <LectureCallout type="tip">
                The best PRs are boring to review. If your reviewer has to spend 20 minutes understanding the change, the PR is too big or the description is too sparse. Make it easy for them and you'll get faster, better reviews.
            </LectureCallout>

            {/* ── 07 BRANCH PROTECTION ────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Branch Protection" />

            <LectureP>
                In industry, nobody can push directly to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>; it's protected. <LectureTip tip="Repository settings that prevent direct pushes to a branch. Typically require a PR with at least one approval, passing CI checks, and an up-to-date branch before merge is allowed.">Branch protection rules</LectureTip> enforce that every change goes through a PR, gets at least one approval, and passes automated checks (like tests or linting) before it can be merged.
            </LectureP>
            <LectureP>
                You can set this up in your GitHub repo right now: go to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Settings → Branches → Add rule</code>, select <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>, and enable "Require a pull request before merging." For solo projects, you can still enable this and approve your own PRs. The habit of never pushing to main directly is worth building early.
            </LectureP>

            <LectureCallout type="info">
                When you see a green checkmark on a PR, that's <LectureTerm>CI</LectureTerm> (Continuous Integration): automated scripts that run your tests, linter, and build on every push. You'll set this up with GitHub Actions later in the course. For now, just know it exists and that teams rely on it to catch problems before they reach <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>.
            </LectureCallout>

            {/* ── 08 WHAT YOU WILL DO IN THE ACTIVITY ─────────────────────────── */}
            <LectureSectionHeading number="08" title="What You'll Do in the Activity" />

            <LectureP>
                The Week 4 activity is <strong className="text-foreground">Project Kickoff</strong>: choose your project domain, create the repo, set up a GitHub Project board, write your initial issues, and open your first PR. From here on, every deliverable in the course ships through this board, same as in industry.
            </LectureP>

            
        </LectureLayout>
    );
}
