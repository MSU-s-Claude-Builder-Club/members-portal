import { Shield } from 'lucide-react';
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

export default function Week10Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={10}
                session="Lecture 2"
                title="Identity & User Context"
                description="User context across the stack, role-based access, and how to keep your project secure as you add more features."
                icon={<Shield className="h-4 w-4" />}
            />

            <LectureSectionHeading number="01" title="User Context Across the Stack" />

            <LectureP>
                Once authenticated, the user's identity flows through the whole app. The backend reads it from the validated JWT (user id, email, roles). The frontend gets it from auth state, typically by calling <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">GET /me</code> after login and storing the result in React context so any component can access it.
            </LectureP>

            <LectureCallout type="info">
                The pattern: login → store token → fetch <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/me</code> to get the user profile → put it in context. When the token expires or the user logs out, clear context and redirect to login.
            </LectureCallout>

            <LectureSectionHeading number="02" title="Role-Based Access" />

            <LectureP>
                <LectureTip tip="Restricting actions by role. For example, only admins can delete users; only the owner can edit a resource. Implement after authentication.">Role-based access control</LectureTip> (RBAC) means different users have different permissions: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">admin</code> can do everything, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">user</code> can only edit their own data, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">guest</code> can only read. Store the role in both the user record and the JWT payload.
            </LectureP>

            <LectureCallout type="warning">
                On the frontend you can hide or disable buttons based on role, but the <strong>backend must enforce it</strong>. Never trust the client. Always check the role server-side before performing the action.
            </LectureCallout>

            <LectureSubHeading title="Backend: auth dependencies" />
            <CodeBlock
                language="python"
                title="auth.py · get current user and require admin"
                lines={[
                    'from fastapi import Depends, HTTPException, status',
                    'from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials',
                    '',
                    'security = HTTPBearer()',
                    '',
                    '',
                    'def get_current_user(',
                    '    credentials: HTTPAuthorizationCredentials = Depends(security)',
                    ') -> dict:',
                    '    token = credentials.credentials',
                    '    try:',
                    '        payload = decode_jwt(token)  # your decode function',
                    '        user_id = payload.get("sub")',
                    '        email = payload.get("email")',
                    '        role = payload.get("role", "user")',
                    '        if not user_id:',
                    '            raise HTTPException(status_code=401, detail="Invalid token")',
                    '        return {"id": user_id, "email": email, "role": role}',
                    '    except Exception:',
                    '        raise HTTPException(',
                    '            status_code=status.HTTP_401_UNAUTHORIZED,',
                    '            detail="Invalid or expired token"',
                    '        )',
                    '',
                    '',
                    'def require_admin(user: dict = Depends(get_current_user)) -> dict:',
                    '    """Chain on top of get_current_user to restrict to admins."""',
                    '    if user.get("role") != "admin":',
                    '        raise HTTPException(status_code=403, detail="Admin only")',
                    '    return user',
                ]}
            />

            <LectureSubHeading title="Using the dependencies in routes" />
            <CodeBlock
                language="python"
                title="main.py · protected routes"
                lines={[
                    '@app.get("/me")',
                    'def get_me(user: dict = Depends(get_current_user)):',
                    '    return user  # frontend calls this to get current user profile',
                    '',
                    '',
                    '@app.delete("/users/{user_id}")',
                    'def delete_user(user_id: str, user: dict = Depends(require_admin)):',
                    '    # Only admins reach here',
                    '    ...',
                    '',
                    '',
                    '# Resource-level: only owner can update their note',
                    '@app.patch("/notes/{note_id}")',
                    'def update_note(note_id: int, data: NoteUpdate, user: dict = Depends(get_current_user)):',
                    '    note = get_note_or_404(note_id)',
                    '    if str(note.owner_id) != str(user["id"]):',
                    '        raise HTTPException(status_code=403, detail="Not the owner")',
                    '    ...',
                ]}
            />

            <LectureCallout type="info">
                For resource-level permissions ("only the owner can edit this note"), compare <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">user["id"]</code> to the resource's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">owner_id</code>. Return 403 if they don't match. This is finer-grained than RBAC, and both patterns work together.
            </LectureCallout>

            <LectureSubHeading title="Frontend: user context" />
            <LectureP>
                After login, store the token and fetch the current user. Put the user and a logout function in React context so any component can show "Logged in as …" or conditionally render by role.
            </LectureP>
            <CodeBlock
                language="tsx"
                title="AuthContext.tsx · minimal pattern"
                lines={[
                    'const [user, setUser] = useState(null);',
                    'const [token, setToken] = useState(localStorage.getItem("token"));',
                    '',
                    'useEffect(() => {',
                    '    if (!token) { setUser(null); return; }',
                    '    fetch(API_URL + "/me", {',
                    '        headers: { Authorization: "Bearer " + token },',
                    '    })',
                    '        .then((r) => r.ok ? r.json() : Promise.reject())',
                    '        .then(setUser)',
                    '        .catch(() => { setToken(null); setUser(null); });',
                    '}, [token]);',
                    '',
                    'const logout = () => {',
                    '    localStorage.removeItem("token");',
                    '    setToken(null);',
                    '    setUser(null);',
                    '};',
                    '',
                    '// In components: const { user } = useAuth(); then user?.email, user?.role',
                ]}
            />

            <LectureSectionHeading number="03" title="Logout and Token Expiration" />

            <LectureP>
                With stateless JWTs, the backend doesn't need a "logout" endpoint. Logging out is a frontend concern: delete the token from storage and clear user context. The next API call will lack the header and get a 401.
            </LectureP>

            <LectureCallout type="info">
                Use <strong>short-lived access tokens</strong> (15 to 30 minutes). When the token expires the API returns 401 and the frontend redirects to login. This limits the damage window if a token is stolen. In production, you'll often pair short-lived access tokens with a <LectureTip tip="A longer-lived token stored in an HTTP-only cookie. The server uses it to silently issue new access tokens without forcing the user to re-login. Keeps the access token short-lived while avoiding constant re-authentication.">refresh token</LectureTip> that silently issues new access tokens. That's beyond this course, but know the pattern exists.
            </LectureCallout>

            <LectureSectionHeading number="04" title="Keeping Secrets Safe" />

            <LectureP>
                Your JWT secret, database URL, and API keys must never end up in code or in the repo. Use <LectureTerm>environment variables</LectureTerm> (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> locally, host config in production). Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.env</code> to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.gitignore</code> and document required variable names in the README.
            </LectureP>

            <LectureSubHeading title="Password handling" />
            <LectureP>
                Never log or return passwords. Hash them with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">bcrypt</code> before storing. Use HTTPS in production so credentials and tokens aren't sent in the clear.
            </LectureP>

            <LectureCallout type="warning">
                <strong>Don't roll your own auth library.</strong> Use battle-tested libraries like <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">python-jose</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">passlib</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">bcrypt</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">jsonwebtoken</code>. Cryptography is easy to get wrong in subtle, exploitable ways.
            </LectureCallout>

            <LectureSubHeading title="Testing protected routes" />
            <TerminalBlock
                title="bash · verify auth from the terminal"
                lines={[
                    { comment: 'no token, should get 401', cmd: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/me' },
                    { comment: 'with token, replace YOUR_JWT with a real token', cmd: 'curl -s -H "Authorization: Bearer YOUR_JWT" http://localhost:8000/me' },
                ]}
            />

            <LectureSectionHeading number="05" title="Scaling Auth as You Add Features" />

            <LectureP>
                Keep one place that validates the JWT and loads the user (a FastAPI dependency or Express middleware). Every route that needs auth declares that dependency. If you later add OAuth (Google, GitHub login), the only change is how you create the user and issue the first token. The rest of the pipeline stays the same.
            </LectureP>
            <LectureCallout type="tip">
                Document your auth flow in the README: how to get a token (endpoint, body params), how to send it (header format), and which routes require it. That helps you and reviewers when debugging.
            </LectureCallout>

            
        </LectureLayout>
    );
}
