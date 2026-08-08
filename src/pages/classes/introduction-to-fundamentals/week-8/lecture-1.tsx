import { TestTube } from 'lucide-react';
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
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week8Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={8}
                session="Lecture 1"
                title="Vitest & Testing Your Project"
                description="Unit and integration testing with Vitest: testing your API, components, and critical paths so refactors don't break your fundamentals project."
                icon={<TestTube className="h-4 w-4" />}
            />

            <LectureSectionHeading number="01" title="Why Test?" />

            <LectureP>
                Without tests, every change is a gamble: did you break the login flow? The list endpoint? You find out when a user (or you, later) hits the bug. <LectureTerm>Automated tests</LectureTerm> run in seconds and tell you exactly what still works and what broke. They're the safety net that makes refactoring and adding features less scary.
            </LectureP>
            <LectureP>
                You don't need to test every line. Focus on: (1) critical paths, such as login, creating/editing the main resource, and any payment or auth logic; (2) edge cases, like an empty list, invalid input, or unauthorized access; (3) the contract of your API and key components. One good test per important behavior is worth more than dozens of trivial tests.
            </LectureP>

            <LectureCallout type="info">
                <LectureTip tip="A test runner and assertion library for JavaScript/TypeScript. Fast, Vite-native, and familiar if you've used Jest. Works for unit and integration tests.">Vitest</LectureTip> is the default choice for Vite-based React projects. It uses the same describe/it/expect style as Jest and runs in the same process as your app, so it's fast. We'll use it for both frontend and (with a small setup) for calling your API in tests.
            </LectureCallout>

            <LectureSectionHeading number="02" title="Unit vs Integration Tests" />

            <LectureP>
                <LectureTerm>Unit tests</LectureTerm> isolate one function or component: you call the function with inputs and assert on the output, or render a component and assert on the DOM or behavior. Dependencies are often <LectureTip tip="A fake implementation used in tests so you control inputs and don't hit the real API or database.">mocked</LectureTip> (e.g. replace <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fetch</code> with a stub that returns fixed data).
            </LectureP>
            <LectureP>
                <LectureTerm>Integration tests</LectureTerm> test several pieces together, e.g. your FastAPI endpoint plus the database, or your React app calling the real (or test) API. They're slower but catch more real-world bugs because they exercise the same paths your users actually hit.
            </LectureP>

            <LectureCallout type="tip">
                Think of it like testing a car. A unit test checks that one gear spins correctly in isolation. An integration test starts the engine and drives around the block. You need both: the gear test catches manufacturing defects, and the drive test catches problems that only appear when everything is connected.
            </LectureCallout>

            <LectureP>
                For your fundamentals project: write a few unit tests for pure logic (e.g. a formatter or validator) and for React components that have clear behavior (e.g. "when user is null, show Login button"). Write integration tests for at least one API route (e.g. GET /items returns 200 and a list) and one full flow (e.g. login then fetch protected data) so you know the stack works together.
            </LectureP>

            <LectureSectionHeading number="03" title="Testing the Backend (FastAPI)" />

            <LectureP>
                FastAPI provides a <LectureTerm>TestClient</LectureTerm> that calls your app without running a server. You get request/response objects and can assert status codes, JSON body, and headers. Under the hood, TestClient uses <LectureTip code tip="An async HTTP client for Python. FastAPI's TestClient wraps it so you can call your endpoints without starting a real server process.">httpx</LectureTip> to make requests.
            </LectureP>
            <TerminalBlock
                title="bash · backend project root"
                lines={[
                    { comment: 'install pytest and httpx (FastAPI uses httpx under the hood)', cmd: 'pip install pytest httpx' },
                    { comment: 'run tests', cmd: 'pytest' },
                    { comment: 'run with verbose output', cmd: 'pytest -v' },
                ]}
            />

            <LectureCallout type="warning">
                Never test against your real database. Use a separate test database (or SQLite in-memory) so tests can create, modify, and delete data freely without affecting production. The fixture below handles this automatically.
            </LectureCallout>

            <LectureSubHeading title="Shared fixtures with conftest.py" />
            <LectureP>
                <LectureTip code tip="A special pytest file that holds shared fixtures and configuration. pytest loads it automatically, so any fixture defined here is available to every test file in the same directory (and subdirectories) without importing it.">conftest.py</LectureTip> is where you put <LectureTip tip="Reusable setup/teardown logic for tests. A fixture runs before (and optionally after) each test. Common fixtures: test database sessions, authenticated clients, sample data.">test fixtures</LectureTip>, which are reusable setup and teardown logic. <LectureTip code tip="Python's standard test runner. Auto-discovers files named test_*.py, runs functions starting with test_, and reports pass/fail. Extensible with plugins like pytest-cov.">pytest</LectureTip> loads this file automatically, so every test file gets access to the fixtures without importing them.
            </LectureP>
            <CodeBlock
                language="python"
                title="tests/conftest.py"
                lines={[
                    'import pytest',
                    'from fastapi.testclient import TestClient',
                    'from sqlalchemy import create_engine',
                    'from sqlalchemy.orm import sessionmaker',
                    'from main import app',
                    'from database import Base, get_db',
                    '',
                    'TEST_DB = "sqlite:///./test.db"',
                    'engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})',
                    'TestSession = sessionmaker(bind=engine)',
                    '',
                    '',
                    '@pytest.fixture(autouse=True)',
                    'def test_db():',
                    '    """Create tables before each test, drop them after."""',
                    '    Base.metadata.create_all(bind=engine)',
                    '    db = TestSession()',
                    '',
                    '    def override():',
                    '        try:',
                    '            yield db',
                    '        finally:',
                    '            db.close()',
                    '',
                    '    app.dependency_overrides[get_db] = override',
                    '    yield',
                    '    Base.metadata.drop_all(bind=engine)',
                    '    app.dependency_overrides.clear()',
                    '',
                    '',
                    '@pytest.fixture()',
                    'def client():',
                    '    """A TestClient instance for making requests."""',
                    '    return TestClient(app)',
                ]}
            />
            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">autouse=True</code> on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test_db</code> means every test automatically gets a fresh database: tables are created before the test and dropped after. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">client</code> fixture gives each test a ready-to-use TestClient without repeating the setup.
            </LectureP>

            <LectureSubHeading title="Writing your first test file" />
            <LectureP>
                Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">tests/test_main.py</code> next to your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">conftest.py</code>. The example below tests a public endpoint and a protected one. Replace the routes and login logic with your own.
            </LectureP>
            <CodeBlock
                language="python"
                title="tests/test_main.py"
                lines={[
                    'def test_read_notes_empty(client):',
                    '    response = client.get("/notes")',
                    '    assert response.status_code == 200',
                    '    assert response.json() == []',
                    '',
                    '',
                    'def test_create_note(client):',
                    '    response = client.post(',
                    '        "/notes",',
                    '        json={"title": "Test", "content": "Hello", "published": False},',
                    '    )',
                    '    assert response.status_code == 201',
                    '    data = response.json()',
                    '    assert data["title"] == "Test"',
                    '    assert "id" in data',
                    '',
                    '',
                    'def test_protected_route_without_token(client):',
                    '    response = client.get("/me")',
                    '    assert response.status_code == 401',
                    '',
                    '',
                    'def test_protected_route_with_token(client):',
                    '    login = client.post("/login", json={"email": "test@test.com", "password": "test"})',
                    '    assert login.status_code == 200',
                    "    token = login.json().get('access_token')",
                    '    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})',
                    '    assert response.status_code == 200',
                ]}
            />

            <LectureSubHeading title="Testing auth" />
            <LectureP>
                For protected endpoints, get a token first (e.g. call your login endpoint with test credentials) and pass it in the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Authorization</code> header. Assert that without the token you get 401, and with it you get the expected 200 and data.
            </LectureP>
            <LectureCallout type="info">
                A common pattern is to create an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">auth_client</code> fixture in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">conftest.py</code> that logs in a test user and returns a TestClient with the token already set. This avoids repeating login logic in every auth test.
            </LectureCallout>

            <LectureSubHeading title="Try it yourself" />
            <LectureP>
                The heart of every test is the same idea: run some code, compare the result to what you expected, and report pass or fail. The two exercises below have you build that pattern by hand in pure Python, exactly what pytest does for you under the hood.
            </LectureP>
            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 1: Write a tiny test"
                prompt={<>Implement <code>add(a, b)</code> so it returns the sum of its arguments. The test below it prints <code>PASS</code> when <code>add(2, 3)</code> equals <code>5</code>, and <code>FAIL</code> otherwise. Your output must be exactly <code>PASS</code>.</>}
                starter={"def add(a, b):\n    return 0  # fix this\n\n# a hand-rolled test, just like pytest does internally\nif add(2, 3) == 5:\n    print(\"PASS\")\nelse:\n    print(\"FAIL\")"}
                expected="PASS"
                hint="add should return a + b."
            />
            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 2: Validate like an endpoint"
                prompt={<>Write <code>create_note(title)</code> that returns the status code <code>201</code> when <code>title</code> is a non-empty string, and <code>422</code> when it is empty. Then print <code>create_note(&quot;Test&quot;)</code> on one line and <code>create_note(&quot;&quot;)</code> on the next, so the output is exactly <code>201</code> then <code>422</code>.</>}
                starter={"def create_note(title):\n    # return 201 if title is non-empty, else 422\n    return 0  # fix this\n\nprint(create_note(\"Test\"))\nprint(create_note(\"\"))"}
                expected={"201\n422"}
                hint="Check the title with an if: an empty string is falsy in Python, so `if title:` works."
            />

            <LectureSectionHeading number="04" title="Testing React with Vitest" />

            <LectureP>
                Install Vitest and a DOM environment. <LectureTip tip="A JavaScript implementation of the browser DOM that runs in Node.js. Lets you render React components in tests without a real browser.">jsdom</LectureTip> simulates a browser in Node.js so your components can render. <LectureTip tip="A testing utility that renders React components and provides queries (getByText, getByRole, etc.) that mirror how users find elements on screen. Encourages testing behavior, not internals.">@testing-library/react</LectureTip> gives you utilities to render components and query the DOM the way a user would.
            </LectureP>
            <TerminalBlock
                title="bash · frontend project root"
                lines={[
                    { comment: 'install Vitest and testing library', cmd: 'npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom' },
                    { comment: 'run tests once', cmd: 'npm run test' },
                    { comment: 'run tests in watch mode (re-run on file change)', cmd: 'npm run test -- --watch' },
                ]}
            />

            <LectureSubHeading title="Vitest configuration" />
            <LectureP>
                Vitest reads its config from your Vite config. Add a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">test</code> block that tells Vitest to use jsdom and enables global test functions so you don't need to import <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">describe</code>/<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">it</code>/<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">expect</code> in every file.
            </LectureP>
            <CodeBlock
                language="typescript"
                title="vite.config.ts"
                lines={[
                    '/// <reference types="vitest" />',
                    'import { defineConfig } from "vite";',
                    'import react from "@vitejs/plugin-react";',
                    '',
                    'export default defineConfig({',
                    '  plugins: [react()],',
                    '  test: {',
                    '    globals: true,',
                    '    environment: "jsdom",',
                    '    setupFiles: "./src/test/setup.ts",',
                    '  },',
                    '});',
                ]}
            />
            <LectureP>
                The <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">setupFiles</code> entry points to a file that runs before every test suite. Use it to load custom matchers like <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">toBeInTheDocument()</code>.
            </LectureP>
            <CodeBlock
                language="typescript"
                title="src/test/setup.ts"
                lines={[
                    'import "@testing-library/jest-dom";',
                ]}
            />

            <LectureSubHeading title="A component test you can copy" />
            <CodeBlock
                language="tsx"
                title="src/App.test.tsx"
                lines={[
                    'import { describe, it, expect, vi } from "vitest";',
                    'import { render, screen, fireEvent } from "@testing-library/react";',
                    'import App from "./App";',
                    '',
                    'describe("App", () => {',
                    '  it("renders the app title", () => {',
                    '    render(<App />);',
                    '    expect(screen.getByText(/my app/i)).toBeInTheDocument();',
                    '  });',
                    '',
                    '  it("shows login when user is null", () => {',
                    '    render(<App />);',
                    '    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();',
                    '  });',
                    '',
                    '  it("calls API when submit is clicked", () => {',
                    '    const mockFetch = vi.fn().mockResolvedValue({',
                    '      ok: true,',
                    '      json: () => ({ token: "fake" }),',
                    '    });',
                    '    vi.stubGlobal("fetch", mockFetch);',
                    '',
                    '    render(<App />);',
                    '    fireEvent.click(screen.getByRole("button", { name: /log in/i }));',
                    '    expect(mockFetch).toHaveBeenCalledWith(',
                    '      expect.any(String),',
                    '      expect.objectContaining({ method: "POST" }),',
                    '    );',
                    '  });',
                    '});',
                ]}
            />

            <LectureSubHeading title="Cleaning up mocks" />
            <LectureP>
                When you mock globals like <LectureTip code tip="vi.stubGlobal() replaces a global variable (like fetch or localStorage) with a mock for the duration of the test. Pairs with vi.restoreAllMocks() to clean up.">vi.stubGlobal</LectureTip>, the mock persists across tests unless you explicitly restore it. Add an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">afterEach</code> block to prevent stale mocks from leaking between tests.
            </LectureP>
            <CodeBlock
                language="typescript"
                title="src/App.test.tsx · add at the top level"
                lines={[
                    'import { afterEach, vi } from "vitest";',
                    '',
                    'afterEach(() => {',
                    '  vi.restoreAllMocks();',
                    '});',
                ]}
            />

            <LectureCallout type="tip">
                Test behavior, not implementation. Prefer "user sees a success message after submitting" over "setState was called with X." That way refactoring internals doesn't break tests as long as behavior stays the same.
            </LectureCallout>

            <LectureSectionHeading number="05" title="What to Test First" />

            <LectureP>
                You can't test everything at once, and you shouldn't try. Start with the tests that protect the most important behavior, then expand coverage as the project grows.
            </LectureP>

            <LectureCallout type="info">
                <strong>Priority order:</strong> (1) one happy-path test for your main API endpoint (e.g. GET list, POST create); (2) one auth test (login returns token; protected route without token returns 401); (3) one frontend test (e.g. login form submits, or list page renders items). Add edge-case tests (empty list, 404, invalid input) as you go.
            </LectureCallout>

            <LectureP>
                Document how to run tests in your README so teammates (and your future self) can verify the project works with a single command.
            </LectureP>

            <TerminalBlock
                title="bash · run before every push"
                lines={[
                    { comment: 'backend', cmd: 'cd backend && pytest -v' },
                    { comment: 'frontend', cmd: 'cd frontend && npm test' },
                ]}
            />

            <LectureCallout type="tip">
                Make it a habit: run your test suite before every <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">git push</code>. Next lecture we'll automate this with GitHub Actions so even if you forget, CI has your back.
            </LectureCallout>


        </LectureLayout>
    );
}
