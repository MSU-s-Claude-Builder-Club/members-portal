import { TestTube } from 'lucide-react';
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
import { CodeBlock } from '@/components/ui/code-block';
import { TerminalBlock } from '@/components/ui/terminal-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week8Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={8}
                    session="Activity"
                    title="Pipeline for Your Repo"
                    description="Add automated tests and a GitHub Actions CI workflow to your project. Enable branch protection and close an issue from a PR."
                    icon={<TestTube className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    Use the same fundamentals project repo. By the end of this activity you'll have at least one backend test, one frontend test, a CI workflow that runs on every push, and branch protection enforcing green checks before merge.
                </LectureCallout>

                <LectureCallout type="tip">
                    <strong>Where do test files go?</strong> Backend: create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/</code> directory next to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main.py</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">conftest.py</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test_*.py</code> files. Frontend: co-locate tests next to the component, so <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/App.test.tsx</code> lives beside <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/App.tsx</code>. Pytest and Vitest both auto-discover files matching these patterns.
                </LectureCallout>

                <LectureSectionHeading number="01" title="Backend Tests" />

                <ActivityChallenge
                    number="1.1"
                    title="Set up pytest"
                    description="Install dependencies and create the test directory."
                >
                    <div className="space-y-1">
                        <ActivityTask>Install test dependencies: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pip install pytest httpx pytest-cov</code></ActivityTask>
                        <ActivityTask>Create a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/tests/</code> directory (or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/</code> at your backend root)</ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/conftest.py</code> with a test database fixture (see Lecture 1 for the full example)</ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pytest -v</code> and confirm it discovers (and passes) 0 tests with no errors</ActivityTask>
                    </div>
                    <ActivityHint label="conftest.py fixture">
                        Your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">conftest.py</code> should override <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_db</code> with a test session and use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">autouse=True</code> to create/drop tables around each test. Copy the example from Lecture 1 and adjust the import paths for your project.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.2"
                    title="Write backend tests"
                    description="At least two passing tests."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/test_main.py</code></ActivityTask>
                        <ActivityTask>Write a test that hits your main GET endpoint (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/notes</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/items</code>) and asserts status 200</ActivityTask>
                        <ActivityTask>Write a test that creates a resource via POST and asserts the response contains the new record</ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pytest -v</code> and confirm both tests pass</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureP>
                    Before moving on, warm up with the core idea behind every unit test: call a function, compare the result to what you expect, and report pass or fail.
                </LectureP>

                <InteractiveExercise
                    runtime="python"
                    language="python"
                    title="Exercise 1: A Tiny Unit Test"
                    prompt={<>Fix <code>add(a, b)</code> so the check passes. Your program must print exactly <code>PASS</code>.</>}
                    starter={"def add(a, b):\n    return 0  # bug: fix this so it returns the sum\n\nif add(2, 3) == 5:\n    print(\"PASS\")\nelse:\n    print(\"FAIL\")"}
                    expected="PASS"
                    hint="Return a + b instead of 0. The if-check works just like an assert in pytest."
                />

                <LectureSectionHeading number="02" title="Frontend Tests" />

                <LectureP>
                    Before writing tests, make sure your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">package.json</code> has a test script and a coverage script.
                </LectureP>
                <CodeBlock
                    language="json"
                    title="package.json · scripts section"
                    lines={[
                        '{',
                        '  "scripts": {',
                        '    "dev": "vite",',
                        '    "build": "tsc && vite build",',
                        '    "test": "vitest",',
                        '    "test:coverage": "vitest run --coverage"',
                        '  }',
                        '}',
                    ]}
                />

                <ActivityChallenge
                    number="2.1"
                    title="Set up Vitest"
                    description="Config and setup file."
                >
                    <div className="space-y-1">
                        <ActivityTask>Ensure <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vitest</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">@testing-library/react</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">@testing-library/jest-dom</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">jsdom</code> are in devDependencies</ActivityTask>
                        <ActivityTask>Add the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test</code> block to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vite.config.ts</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">globals: true</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">environment: "jsdom"</code> (see Lecture 1)</ActivityTask>
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/test/setup.ts</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">import "@testing-library/jest-dom"</code></ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm test</code> and confirm Vitest starts without errors</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.2"
                    title="Write a component test"
                    description="At least one passing frontend test."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a test file (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">src/App.test.tsx</code>) next to the component</ActivityTask>
                        <ActivityTask>Write a test that renders a component and asserts on visible text or a button using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">screen.getByText</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">screen.getByRole</code></ActivityTask>
                        <ActivityTask>If your component calls <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fetch</code>, mock it with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vi.stubGlobal</code> and add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">afterEach(() =&gt; vi.restoreAllMocks())</code></ActivityTask>
                        <ActivityTask>Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm test</code> and confirm all tests pass</ActivityTask>
                    </div>
                    <ActivityHint label="mocking fetch">
                        Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vi.fn().mockResolvedValue(&#123; ok: true, json: () =&gt; yourData &#125;)</code> and pass it to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vi.stubGlobal("fetch", mockFetch)</code>. This replaces the real fetch for the duration of the test.
                    </ActivityHint>
                </ActivityChallenge>

                <LectureSectionHeading number="03" title="CI Pipeline" />

                <ActivityChallenge
                    number="3.1"
                    title="Create a GitHub Actions workflow"
                    description="Run tests on every push and PR."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.github/workflows/test.yml</code></ActivityTask>
                        <ActivityTask>Trigger on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">push</code> to main and on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pull_request</code> to main</ActivityTask>
                        <ActivityTask>Add steps: checkout, set up Node (and Python if you have a backend), install dependencies, run tests</ActivityTask>
                        <ActivityTask>If you have both frontend and backend, use two parallel jobs (see Lecture 2's multi-job example)</ActivityTask>
                        <ActivityTask>Commit and push the workflow file to a branch</ActivityTask>
                    </div>
                    <ActivityHint label="first-run failures">
                        If the workflow fails on the first run, click the failed job in the Actions tab and read the error log. The most common issues: wrong Node/Python version, missing <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">package-lock.json</code> (needed by <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">npm ci</code>), or a test that depends on a local <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> file that isn't committed.
                    </ActivityHint>
                </ActivityChallenge>

                <InteractiveExercise
                    runtime="check"
                    language="yaml"
                    title="Exercise 2: Know Your Workflow Keys"
                    prompt={<>In a GitHub Actions job, what value do you give the <code>runs-on</code> key to use the latest Ubuntu runner?</>}
                    expected={["ubuntu-latest", "runs-on: ubuntu-latest"]}
                    hint="It is the same value used in both lecture workflow examples: the OS name, a hyphen, then 'latest'."
                />

                <ActivityChallenge
                    number="3.2"
                    title="Verify the green check"
                    description="Confirm CI passes on a PR."
                >
                    <div className="space-y-1">
                        <ActivityTask>Open a pull request from your branch to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                        <ActivityTask>Confirm the workflow triggers and shows a green check on the PR (not just in the Actions tab)</ActivityTask>
                        <ActivityTask>If the check is red, read the logs, fix the issue, push again, and verify it turns green</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="3.3"
                    title="Coverage (optional)"
                    description="Add coverage reporting to CI."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">vitest run --coverage</code> and/or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">pytest --cov=app --cov-report=term-missing</code> to your workflow</ActivityTask>
                        <ActivityTask>Optionally set a minimum coverage threshold that fails the job if coverage drops below it</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureSectionHeading number="04" title="Branch Protection & Agile" />

                <ActivityChallenge
                    number="4.1"
                    title="Enable branch protection"
                    description="Require CI to pass before merging."
                >
                    <div className="space-y-1">
                        <ActivityTask>Go to your repo's Settings → Branches → Add branch protection rule</ActivityTask>
                        <ActivityTask>Set branch name pattern to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main</code></ActivityTask>
                        <ActivityTask>Check "Require status checks to pass before merging" and select your workflow job (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">frontend</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend</code>)</ActivityTask>
                        <ActivityTask>Verify: open a PR and confirm the merge button is blocked until the check passes</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="4.2"
                    title="Close an issue from a PR"
                    description="Reconnect with the Agile workflow."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create an issue titled "Add automated tests and CI pipeline" on your project board</ActivityTask>
                        <ActivityTask>In the PR description, add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Closes #N</code> (replacing N with the issue number)</ActivityTask>
                        <ActivityTask>Merge the PR and verify the issue auto-closes</ActivityTask>
                        <ActivityTask>Move the issue to "Done" on your project board</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureSectionHeading number="05" title="Document and Verify" />

                <ActivityChallenge
                    number="5.1"
                    title="README testing section"
                    description="Document how to run tests."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add a "Testing" section to your README with exact commands to run backend and frontend tests</ActivityTask>
                        <ActivityTask>Include the coverage command(s) if you added them</ActivityTask>
                        <ActivityTask>Note that CI runs automatically via GitHub Actions on every push and PR</ActivityTask>
                    </div>
                </ActivityChallenge>

                <TerminalBlock
                    title="bash · verify everything works"
                    lines={[
                        { comment: 'backend tests', cmd: 'cd backend && pytest -v' },
                        { comment: 'frontend tests', cmd: 'cd frontend && npm test' },
                        { comment: 'check git status is clean', cmd: 'git status' },
                    ]}
                />

                <LectureCallout type="tip">
                    After this activity, your repo has: passing tests, CI that runs on every push, branch protection that prevents merging broken code, and a closed issue documenting the work. This is the workflow you'll use for every feature going forward.
                </LectureCallout>

                
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
