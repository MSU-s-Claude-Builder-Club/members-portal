import { TestTube } from 'lucide-react';
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

export default function Week8Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={8}
                session="Lecture 2"
                title="GitHub Actions & Coverage"
                description="CI/CD with GitHub Actions: run tests on every push, enforce coverage, and automate checks so the team stays in sync."
                icon={<TestTube className="h-4 w-4" />}
            />

            <LectureSectionHeading number="01" title="What is CI/CD?" />

            <LectureP>
                <LectureTip tip="Continuous Integration: every time someone pushes code, the project is built and tested automatically. Catches breakage before it reaches production.">CI</LectureTip> (Continuous Integration) means your tests and build run automatically on every push or pull request. <LectureTip tip="Continuous Deployment/Delivery: automatically deploy when tests pass. For this course we focus on CI; deployment comes later.">CD</LectureTip> can mean automatically deploying when tests pass. For now we'll focus on CI: run tests and report results so no one merges broken code.
            </LectureP>
            <LectureP>
                <LectureTip tip="GitHub's built-in CI/CD platform. Runs workflows in disposable VMs triggered by repo events (push, PR, schedule). Free for public repos; generous free tier for private.">GitHub Actions</LectureTip> is GitHub's built-in CI. You add a <LectureTerm>workflow</LectureTerm> file (YAML) to your repo that defines when to run (e.g. on push to main, on every PR) and what steps to execute (checkout code, install deps, run tests). Each run happens in a fresh virtual machine, and you see pass/fail and logs directly on the PR.
            </LectureP>

            <LectureCallout type="info">
                GitHub Actions is free for public repos and gives private repos 2,000 minutes/month on the free tier. That's more than enough for a class project.
            </LectureCallout>

            <LectureSectionHeading number="02" title="A Minimal Workflow" />

            <LectureP>
                Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/workflows/test.yml</code>. The typical structure: (1) trigger on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pull_request</code> to main; (2) checkout the repo; (3) set up the runtime (Node, Python, etc.); (4) install dependencies; (5) run tests. If any step fails, the workflow fails and the PR shows a red X.
            </LectureP>

            <LectureSubHeading title="Workflow file you can copy" />
            <LectureP>
                Put this file at <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/workflows/test.yml</code>. It runs on every push and pull request to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>. Adjust <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node-version</code> and the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">run</code> commands to match your project.
            </LectureP>
            <CodeBlock
                language="yaml"
                title=".github/workflows/test.yml"
                lines={[
                    'name: Test',
                    '',
                    'on:',
                    '  push:',
                    '    branches: [main]',
                    '  pull_request:',
                    '    branches: [main]',
                    '',
                    'jobs:',
                    '  test:',
                    '    runs-on: ubuntu-latest',
                    '    steps:',
                    '      - uses: actions/checkout@v4',
                    '',
                    '      - name: Setup Node',
                    '        uses: actions/setup-node@v4',
                    '        with:',
                    '          node-version: "20"',
                    '          cache: "npm"',
                    '',
                    '      - name: Install dependencies',
                    '        run: npm ci',
                    '',
                    '      - name: Run tests',
                    '        run: npm test',
                ]}
            />
            <TerminalBlock
                title="bash · create the workflow file"
                lines={[
                    { comment: 'create the workflows directory', cmd: 'mkdir -p .github/workflows' },
                    { comment: 'create test.yml (paste the YAML above), then commit and push', cmd: 'git add .github/workflows/test.yml && git commit -m "Add CI workflow" && git push' },
                ]}
            />

            <LectureCallout type="info">
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">cache: "npm"</code> line tells GitHub to save the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">node_modules</code> cache between runs. On the first run GitHub installs everything from scratch. On subsequent runs it restores the cache, making <LectureTip code tip="npm ci installs exactly what's in package-lock.json. Faster and more reproducible than npm install. Use in CI for deterministic builds.">npm ci</LectureTip> near-instant. Always use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm ci</code> (not <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm install</code>) in CI so the install is deterministic and matches your lockfile.
            </LectureCallout>

            <LectureP>
                Quick check before we move on. Look back at the workflow file above and answer without scrolling if you can.
            </LectureP>
            <InteractiveExercise
                runtime="check"
                language="yaml"
                title="Exercise 1"
                prompt={<>In a GitHub Actions workflow file, which <strong>top-level YAML key</strong> defines the events (like <code>push</code> or <code>pull_request</code>) that trigger the workflow? Type just the key name.</>}
                expected={["on", "on:"]}
                hint="It's the shortest key in the whole file, sitting right under name:."
            />

            <LectureSectionHeading number="03" title="Coverage" />

            <LectureP>
                <LectureTerm>Coverage</LectureTerm> measures which lines (or branches) of your code were actually executed during tests. High coverage doesn't guarantee good tests, but low coverage means large chunks of code are never exercised, and untested code is where bugs hide.
            </LectureP>

            <LectureSubHeading title="Running coverage locally" />
            <TerminalBlock
                title="bash · frontend coverage with Vitest"
                lines={[
                    { comment: 'install the coverage provider', cmd: 'npm install -D @vitest/coverage-v8' },
                    { comment: 'run tests with coverage report', cmd: 'npx vitest run --coverage' },
                ]}
            />
            <TerminalBlock
                title="bash · backend coverage with pytest"
                lines={[
                    { comment: 'install pytest-cov', cmd: 'pip install pytest-cov' },
                    { comment: 'run with coverage, show missing lines', cmd: 'pytest --cov=app --cov-report=term-missing' },
                ]}
            />
            <LectureP>
                <LectureTip code tip="A pytest plugin that measures which lines of your Python code are executed during tests. Wraps coverage.py. The --cov flag specifies which package to measure; --cov-report controls the output format.">pytest-cov</LectureTip> wraps Python's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">coverage.py</code> library and integrates directly with pytest. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">--cov-report=term-missing</code> flag shows exactly which lines are uncovered in the terminal output, so you know where to add tests next.
            </LectureP>

            <LectureCallout type="tip">
                Aim for 70 to 80% coverage as a starting point. 100% coverage is a trap: it incentivizes writing meaningless tests for getters and configuration code. The goal is to cover behavior that matters, not to hit a number.
            </LectureCallout>

            <InteractiveExercise
                runtime="check"
                language="bash"
                title="Exercise 2"
                prompt={<>Write the full pytest command that measures coverage for the <code>app</code> package <strong>and</strong> shows which lines are missing in the terminal output. (It's the same command the backend job runs in CI.)</>}
                expected={[
                    "pytest --cov=app --cov-report=term-missing",
                    "pytest --cov-report=term-missing --cov=app",
                ]}
                hint="Combine the --cov=<package> flag with --cov-report=term-missing."
            />

            <LectureSectionHeading number="04" title="Multi-Job Workflows" />

            <LectureP>
                If your frontend and backend live in the same repo, you can run them as separate jobs that execute in parallel on different machines. Each job has its own setup, dependencies, and test commands. If either job fails, the overall workflow fails.
            </LectureP>
            <CodeBlock
                language="yaml"
                title=".github/workflows/test.yml (multi-job)"
                lines={[
                    'name: Test',
                    '',
                    'on:',
                    '  push:',
                    '    branches: [main]',
                    '  pull_request:',
                    '    branches: [main]',
                    '',
                    'jobs:',
                    '  frontend:',
                    '    runs-on: ubuntu-latest',
                    '    defaults:',
                    '      run:',
                    '        working-directory: frontend',
                    '    steps:',
                    '      - uses: actions/checkout@v4',
                    '      - uses: actions/setup-node@v4',
                    '        with:',
                    '          node-version: "20"',
                    '          cache: "npm"',
                    '          cache-dependency-path: frontend/package-lock.json',
                    '      - run: npm ci',
                    '      - run: npm test',
                    '',
                    '  backend:',
                    '    runs-on: ubuntu-latest',
                    '    defaults:',
                    '      run:',
                    '        working-directory: backend',
                    '    steps:',
                    '      - uses: actions/checkout@v4',
                    '      - uses: actions/setup-python@v5',
                    '        with:',
                    '          python-version: "3.12"',
                    '      - run: pip install -r requirements.txt',
                    '      - run: pip install pytest httpx pytest-cov',
                    '      - run: pytest --cov=app --cov-report=term-missing',
                ]}
            />
            <LectureCallout type="info">
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend</code> jobs start at the same time on separate VMs. A monorepo with both stacks gets tested in roughly the time of the slowest job, not the sum of both.
            </LectureCallout>

            <LectureSectionHeading number="05" title="Secrets in CI" />

            <LectureP>
                Use <LectureTerm>GitHub Secrets</LectureTerm> for any environment variables your tests need: a test database URL, a test JWT secret, or API keys for third-party services. Never commit real secrets to your code.
            </LectureP>
            <CodeBlock
                language="yaml"
                title="referencing secrets in a workflow"
                lines={[
                    '      - name: Run tests',
                    '        run: pytest',
                    '        env:',
                    '          DATABASE_URL: sqlite:///./test.db',
                    '          JWT_SECRET: ${{ secrets.JWT_SECRET }}',
                ]}
            />
            <LectureP>
                Add secrets in your repo's Settings → Secrets and variables → Actions → New repository secret. They're encrypted at rest and masked in logs. For public repos, never use production secrets; only use test/demo values in Actions.
            </LectureP>

            <LectureSectionHeading number="06" title="Branch Protection Rules" />

            <LectureP>
                Having CI is only half the story. Without <LectureTip tip="A GitHub repository setting that prevents direct pushes to a branch and requires conditions (passing CI, code review, etc.) before a PR can be merged. The strongest guard against broken main.">branch protection</LectureTip>, anyone can still merge a PR with failing tests, or even push directly to main. Branch protection rules enforce that CI must pass before a PR can be merged.
            </LectureP>

            <LectureCallout type="info">
                <strong>Enable branch protection:</strong> Go to your repo's Settings → Branches → Add branch protection rule. Set the branch name pattern to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code>. Check "Require status checks to pass before merging" and select your workflow job name (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend</code> / <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend</code>). Optionally check "Require a pull request before merging" to prevent direct pushes.
            </LectureCallout>

            <LectureP>
                Once enabled, PRs show a "required" badge next to the CI check. The merge button stays disabled (grayed out) until all required checks are green. This is the single most effective guardrail for keeping main stable.
            </LectureP>

            <LectureCallout type="tip">
                A green check on the PR means "tests passed." Get in the habit of not merging until the check is green. That single habit prevents most "it worked on my machine" breakages.
            </LectureCallout>

            <LectureSectionHeading number="07" title="When a Workflow Fails" />

            <LectureP>
                Your first few CI runs will probably fail. That's normal; the point of CI is to catch problems early. Here's how to debug a failed workflow.
            </LectureP>

            <LectureCallout type="warning">
                <strong>Common first-run failures:</strong> (1) wrong Node or Python version, so match what you use locally; (2) missing environment variable, so check if your app reads from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> which isn't committed; (3) test that passes locally but fails in CI because it depends on local data, a running server, or a different OS; (4) wrong <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">working-directory</code>, so make sure the job runs from the right folder.
            </LectureCallout>

            <LectureP>
                Click the failed job in the Actions tab to see the full log. Each step has expandable output: find the red X and read the error. Most failures are one-line fixes: a missing dependency, a typo in the test command, or a version mismatch.
            </LectureP>

            <LectureCallout type="tip">
                If a test passes locally but fails in CI, the difference is usually the environment. CI runs on a fresh Ubuntu VM with no state from previous runs. Check for hardcoded paths, missing env vars, or tests that depend on execution order.
            </LectureCallout>


        </LectureLayout>
    );
}
