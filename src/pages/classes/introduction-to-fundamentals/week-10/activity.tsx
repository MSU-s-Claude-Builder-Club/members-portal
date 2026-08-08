import { Shield } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week10Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={10}
                    session="Activity"
                    title="Auth on Your Project"
                    description="Implement login, session handling, and at least one protected route on your fundamentals project. Bring your code to Coworking for review."
                    icon={<Shield className="h-4 w-4" />}
                />

                <LectureCallout type="info">
                    Use the same full-stack project you've been building in previous weeks. Add authentication so that one or more routes are only accessible after login. You can use JWT (recommended) or session cookies; document your choice in the README.
                </LectureCallout>

                <LectureSectionHeading number="01" title="Backend: Users and Login" />

                <ActivityChallenge
                    number="1.1"
                    title="User model and storage"
                    description="Store users with hashed passwords."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">users</code> table (or equivalent) with at least: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">id</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">email</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">password_hash</code></ActivityTask>
                        <ActivityTask>Use bcrypt (or your stack's standard) to hash passwords before storing; never store plain text</ActivityTask>
                        <ActivityTask>Add a way to create one user (e.g. register endpoint or seed script) so you can log in during testing</ActivityTask>
                    </div>
                    <ActivityHint label="Seed script shortcut">
                        If you don't want a full register endpoint yet, create a small script that inserts a test user directly:
                    </ActivityHint>
                    <CodeBlock
                        language="python"
                        title="seed_user.py · create a test user"
                        lines={[
                            'from passlib.context import CryptContext',
                            '',
                            'pwd = CryptContext(schemes=["bcrypt"])',
                            'hashed = pwd.hash("testpassword")',
                            '',
                            '# Insert into your database:',
                            '# create_user(email="test@test.com", hashed_password=hashed)',
                            'print(f"Hashed password: {hashed}")',
                        ]}
                    />
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.2"
                    title="Login endpoint and JWT"
                    description="Accept email/password, return a JWT."
                >
                    <div className="space-y-1">
                        <ActivityTask>Implement <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">POST /login</code> (or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/auth/login</code>): body with email and password</ActivityTask>
                        <ActivityTask>Check credentials: find user by email, verify password against stored hash</ActivityTask>
                        <ActivityTask>If valid, create a JWT with at least <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">sub</code> (user id) and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">exp</code> (expiration); return <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{"{ \"token\": \"...\" }"}</code></ActivityTask>
                        <ActivityTask>Store JWT secret in an env var; document it in README (e.g. "Set JWT_SECRET for auth")</ActivityTask>
                    </div>
                    <ActivityHint label="JWT creation">
                        Use <code className="bg-muted px-1 rounded text-xs">python-jose</code> to sign the token. Your <code className="bg-muted px-1 rounded text-xs">create_access_token</code> function from Lecture 1 is the exact pattern. Copy it and adjust the payload to include your user's id and email.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="1.3"
                    title="Protected route"
                    description="One endpoint that requires a valid token."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a dependency (or middleware) that reads <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Authorization: Bearer &lt;token&gt;</code>, verifies the JWT, and returns the current user (or 401)</ActivityTask>
                        <ActivityTask>Apply it to at least one existing endpoint (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">GET /me</code> or a list endpoint) so that without a valid token the API returns 401</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureP>
                    Before moving to the frontend, verify the backend works from the terminal:
                </LectureP>
                <TerminalBlock
                    title="bash · verify backend auth"
                    lines={[
                        { comment: 'register (if you added a register endpoint)', cmd: 'curl -X POST http://localhost:8000/register -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"secret"}\'' },
                        { comment: 'login, then copy the token from the response', cmd: 'curl -X POST http://localhost:8000/login -d "username=test@test.com&password=secret"' },
                        { comment: 'test protected route without token: expect 401', cmd: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/me' },
                        { comment: 'test with token: expect 200 + user data', cmd: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/me' },
                    ]}
                />

                <LectureP>
                    Before you wire this into your project, warm up with the two core ideas behind backend auth: comparing password hashes and reading a token payload. Both run right here in the browser.
                </LectureP>

                <InteractiveExercise
                    runtime="python"
                    language="python"
                    title="Exercise 1: Verify a password hash"
                    prompt={<>The database stores the SHA-256 hash of a user's password, never the password itself. Complete <code>hash_password</code> so it returns the hex digest of the password. If the attempt hashes to the stored value, the script prints exactly <code>login ok</code>.</>}
                    starter={"import hashlib\n\ndef hash_password(password):\n    # return the sha256 hex digest of the password string\n    # hint: encode the string first\n    return \"\"\n\nstored_hash = \"2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b\"\nattempt = \"secret\"\n\nif hash_password(attempt) == stored_hash:\n    print(\"login ok\")\nelse:\n    print(\"login failed\")"}
                    expected="login ok"
                    hint='hashlib.sha256(password.encode()).hexdigest()'
                />

                <InteractiveExercise
                    runtime="python"
                    language="python"
                    title="Exercise 2: Decode a token payload"
                    prompt={<>A JWT's payload is just base64-encoded JSON. Decode the segment below, parse it, and print the value of its <code>sub</code> claim (the user id). The output should be exactly <code>42</code>.</>}
                    starter={"import base64\nimport json\n\npayload_segment = \"eyJzdWIiOiA0MiwgInJvbGUiOiAibWVtYmVyIn0=\"\n\n# 1. base64-decode payload_segment\n# 2. parse the resulting bytes as JSON\n# 3. print the value stored under the \"sub\" key\n"}
                    expected="42"
                    hint='data = json.loads(base64.b64decode(payload_segment)); then print(data["sub"])'
                />

                <LectureSectionHeading number="02" title="Frontend: Login and Protected Page" />

                <ActivityChallenge
                    number="2.1"
                    title="Login flow"
                    description="Call login API and store token."
                >
                    <div className="space-y-1">
                        <ActivityTask>Add a login page or form: email and password inputs, submit calls your login API</ActivityTask>
                        <ActivityTask>On success, store the returned token (e.g. in state/context or localStorage) and redirect to a dashboard or home page</ActivityTask>
                        <ActivityTask>On every API request to your backend, send <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Authorization: Bearer &lt;token&gt;</code></ActivityTask>
                    </div>
                    <ActivityHint label="Token storage and redirect">
                        Store the token in your <code className="bg-muted px-1 rounded text-xs">AuthContext</code> from Week 9. After <code className="bg-muted px-1 rounded text-xs">setToken(access_token)</code>, use <code className="bg-muted px-1 rounded text-xs">navigate("/dashboard")</code> from react-router-dom to redirect. Create a small <code className="bg-muted px-1 rounded text-xs">apiFetch</code> helper that reads the token from context and attaches the header automatically.
                    </ActivityHint>
                </ActivityChallenge>

                <ActivityChallenge
                    number="2.2"
                    title="Protected route (UI)"
                    description="At least one route that requires login."
                >
                    <div className="space-y-1">
                        <ActivityTask>Implement a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">ProtectedRoute</code> component: if there is no stored user/token, redirect to login</ActivityTask>
                        <ActivityTask>Ensure that the protected page calls your protected API endpoint and displays data only when the user is authenticated</ActivityTask>
                        <ActivityTask>Add a logout button that clears the token and redirects to the login page</ActivityTask>
                    </div>
                </ActivityChallenge>

                <LectureSectionHeading number="03" title="Ship It" />

                <LectureP>
                    Auth is a feature, so ship it like one. Create an issue, open a PR, and update your project board.
                </LectureP>

                <ActivityChallenge
                    number="3.1"
                    title="Close an issue from a PR"
                    description="Track the auth feature on your project board."
                >
                    <div className="space-y-1">
                        <ActivityTask>Create a GitHub issue titled "Add authentication to project" with acceptance criteria (e.g. login works, protected routes return 401 without token, frontend redirects to login)</ActivityTask>
                        <ActivityTask>Open a PR from your auth branch that includes <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Closes #N</code> in the description (where N is the issue number)</ActivityTask>
                        <ActivityTask>Merge the PR and verify the issue is automatically closed</ActivityTask>
                        <ActivityTask>Move the card to "Done" on your project board</ActivityTask>
                    </div>
                </ActivityChallenge>

                <ActivityChallenge
                    number="3.2"
                    title="Update README"
                    description="Document the auth flow so anyone can set up and test."
                >
                    <div className="space-y-1">
                        <ActivityTask>Document how to register or seed a test user</ActivityTask>
                        <ActivityTask>Document how to get a token (endpoint, request body, response shape)</ActivityTask>
                        <ActivityTask>List which routes require authentication</ActivityTask>
                        <ActivityTask>List required environment variables (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">JWT_SECRET</code>), names only, no values</ActivityTask>
                    </div>
                    <ActivityHint label="README structure">
                        A simple "Authentication" section in your README is enough. Include a curl example so a reviewer can test login without spinning up the frontend.
                    </ActivityHint>
                </ActivityChallenge>

                <LectureCallout type="tip">
                    Bring your project to Coworking and walk through: register/seed → login → protected API call → protected page. A classmate or instructor can review your PR, check your project board, and sanity-check security (no secrets in frontend code, hashed passwords, env for JWT secret).
                </LectureCallout>

                
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
