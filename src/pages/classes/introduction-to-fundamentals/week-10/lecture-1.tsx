import { Shield } from 'lucide-react';
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

export default function Week10Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={10}
                session="Lecture 1"
                title="JWT, Sessions & Protecting Routes"
                description="Authentication and authorization on your fundamentals project: JWTs, session management, and protecting API and frontend routes so only the right users see the right data."
                icon={<Shield className="h-4 w-4" />}
            />

            <LectureSectionHeading number="01" title="Why Authentication?" />

            <LectureP>
                So far your app has been open: anyone can read or change data. Real apps need to know <em>who</em> is making the request. <LectureTerm>Authentication</LectureTerm> answers "who are you?" (login). <LectureTerm>Authorization</LectureTerm> answers "what are you allowed to do?" (permissions). The backend issues a credential after login; the frontend sends it on every request; the backend validates it before responding.
            </LectureP>

            <LectureCallout type="info">
                <LectureTip tip="A string the server creates after a successful login. The client stores it (e.g. in memory or localStorage) and sends it in the Authorization header on every request. The server verifies it without storing session state.">JWT</LectureTip> (JSON Web Token) is the most common approach for APIs: stateless, works across servers, and easy to use from React. Session cookies are an alternative for traditional server-rendered apps.
            </LectureCallout>

            <LectureSectionHeading number="02" title="How JWTs Work" />

            <LectureP>
                A JWT has three parts separated by dots: <strong className="text-foreground">header.payload.signature</strong>. The <LectureTerm>payload</LectureTerm> is a JSON object that can hold user id, email, roles, and an <LectureTip code tip="Expiration time as a Unix timestamp. Tokens should have a short lifetime (e.g. 15 minutes to 1 hour) to limit damage if one is stolen.">exp</LectureTip> (expiration) claim. The server signs it with a secret so it can later verify the token wasn't tampered with.
            </LectureP>

            <LectureCallout type="info">
                <strong>The JWT flow:</strong> user logs in → backend verifies credentials → backend creates a signed JWT with user id and exp → returns the token → frontend stores it and sends <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Authorization: Bearer &lt;token&gt;</code> on every API call → backend validates the token and attaches the user to the request.
            </LectureCallout>

            <LectureSubHeading title="Never put secrets in the payload" />
            <LectureP>
                The payload is <LectureTip tip="Base64 encoding is reversible: anyone can decode it and read the contents. So never put passwords or secrets inside. Only put non-sensitive identifiers and claims.">base64-encoded</LectureTip>, not encrypted, so anyone can decode it. Only put non-sensitive data there (user id, email, roles). Never passwords or API keys.
            </LectureP>

            <LectureP>
                Prove it to yourself. The exercise below encodes a JWT-style payload with base64, exactly like the middle part of a real token. Your job is to decode it back, showing that anyone holding the token can read the payload without knowing any secret.
            </LectureP>
            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 1"
                prompt={<>The payload of a JWT is just base64. Decode <code>encoded</code> back to the original string and print it. The exact output must be <code>{'{"sub": "42"}'}</code>.</>}
                starter={'import base64\n\npayload = \'{"sub": "42"}\'\nencoded = base64.urlsafe_b64encode(payload.encode())\n\n# Decode `encoded` back to a string and print it.\n# Use base64.urlsafe_b64decode(...) and .decode()\n'}
                expected={'{"sub": "42"}'}
                hint="print(base64.urlsafe_b64decode(encoded).decode())"
            />

            <LectureSectionHeading number="03" title="Backend: Login and Token Issuance" />

            <TerminalBlock
                title="bash · install JWT and password hashing libs"
                lines={[
                    { cmd: 'pip install python-jose[cryptography] passlib[bcrypt]' },
                ]}
            />

            <LectureSubHeading title="Login endpoint" />
            <LectureP>
                The login endpoint receives credentials, verifies the password hash with <LectureTip code tip="A password hashing library for Python. bcrypt is the recommended scheme: it's slow by design, making brute-force attacks impractical. Never store plain-text passwords.">bcrypt</LectureTip>, and returns a signed JWT. Store your JWT secret in an environment variable, never in code.
            </LectureP>
            <CodeBlock
                language="python"
                title="auth.py · login and create token"
                lines={[
                    'import os',
                    'from datetime import datetime, timedelta',
                    'from jose import jwt',
                    'from passlib.context import CryptContext',
                    '',
                    'pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")',
                    'SECRET_KEY = os.environ["JWT_SECRET"]',
                    'ALGORITHM = "HS256"',
                    'ACCESS_TOKEN_EXPIRE_MINUTES = 30',
                    '',
                    '',
                    'def create_access_token(data: dict) -> str:',
                    '    to_encode = data.copy()',
                    '    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)',
                    '    to_encode.update({"exp": expire})',
                    '    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)',
                    '',
                    '',
                    '@app.post("/login")',
                    'def login(form: OAuth2PasswordRequestForm = Depends()):',
                    '    user = get_user_by_email(form.username)  # your DB lookup',
                    '    if not user or not pwd_context.verify(form.password, user.hashed_password):',
                    '        raise HTTPException(status_code=401, detail="Invalid credentials")',
                    '    token = create_access_token({"sub": str(user.id), "email": user.email})',
                    '    return {"access_token": token, "token_type": "bearer"}',
                ]}
            />
            <LectureP>
                Use <LectureTip code tip="Python: python-jose or PyJWT. Never roll your own crypto.">python-jose</LectureTip> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">PyJWT</code> to create and verify tokens. <LectureTip code tip="A FastAPI convenience class that extracts username and password from form data (application/x-www-form-urlencoded). Use it as a dependency in your login endpoint.">OAuth2PasswordRequestForm</LectureTip> is a FastAPI convenience that extracts <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">username</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">password</code> from form data.
            </LectureP>

            <LectureSubHeading title="Registration: creating test users" />
            <LectureCallout type="info">
                Before you can log in, you need at least one user. Add a registration endpoint or a seed script:
            </LectureCallout>
            <CodeBlock
                language="python"
                title="POST /register · minimal user creation"
                lines={[
                    'from pydantic import BaseModel',
                    '',
                    'class UserCreate(BaseModel):',
                    '    email: str',
                    '    password: str',
                    '',
                    '',
                    '@app.post("/register", status_code=201)',
                    'def register(data: UserCreate):',
                    '    if get_user_by_email(data.email):',
                    '        raise HTTPException(status_code=400, detail="Email already registered")',
                    '    hashed = pwd_context.hash(data.password)',
                    '    user = create_user(email=data.email, hashed_password=hashed)  # your DB insert',
                    '    return {"id": user.id, "email": user.email}',
                ]}
            />

            <LectureSubHeading title="Verify with curl" />
            <TerminalBlock
                title="bash · test registration and login"
                lines={[
                    { comment: 'register a test user', cmd: 'curl -X POST http://localhost:8000/register -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"secret"}\''},
                    { comment: 'login and get a token', cmd: 'curl -X POST http://localhost:8000/login -d "username=test@test.com&password=secret"' },
                    { comment: 'copy the access_token and test /me', cmd: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/me' },
                ]}
            />

            <LectureSectionHeading number="04" title="Protecting API Routes" />

            <LectureP>
                For each endpoint that requires login, add a dependency that extracts and validates the JWT. Missing or invalid tokens get <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">401 Unauthorized</code>; valid tokens yield the current user.
            </LectureP>
            <CodeBlock
                language="python"
                title="get_current_user dependency · use on any protected route"
                lines={[
                    'from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials',
                    '',
                    'security = HTTPBearer(auto_error=False)',
                    '',
                    '',
                    'def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):',
                    '    if not credentials:',
                    '        raise HTTPException(status_code=401, detail="Not authenticated")',
                    '    try:',
                    '        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])',
                    '        user_id = payload.get("sub")',
                    '        if not user_id:',
                    '            raise HTTPException(status_code=401, detail="Invalid token")',
                    '        return {"id": user_id, "email": payload.get("email")}',
                    '    except jwt.ExpiredSignatureError:',
                    '        raise HTTPException(status_code=401, detail="Token expired")',
                    '    except jwt.JWTError:',
                    '        raise HTTPException(status_code=401, detail="Invalid token")',
                    '',
                    '',
                    '@app.get("/me")',
                    'def get_me(user: dict = Depends(get_current_user)):',
                    '    return user',
                ]}
            />
            <LectureCallout type="tip">
                Keep a clear separation: <strong>authentication</strong> = "is this a valid user?" and <strong>authorization</strong> = "is this user allowed to do this action?" Implement auth first; add role or resource checks (Lecture 2) where needed.
            </LectureCallout>

            <LectureSectionHeading number="05" title="Frontend: Storing and Sending the Token" />

            <LectureP>
                After login, the frontend receives the JWT. Store it in <LectureTip tip="Survives page refresh but is visible to any script on the page — acceptable for learning apps; prefer memory + refresh token for higher security.">localStorage</LectureTip>, in memory (React state/context), or in an HTTP-only cookie. For this course, localStorage or in-memory is fine.
            </LectureP>
            <CodeBlock
                language="javascript"
                title="Frontend — login and attach token to fetch"
                lines={[
                    '// After login response: { access_token: "eyJ..." }',
                    'const res = await fetch(API_URL + "/login", {',
                    '  method: "POST",',
                    '  headers: { "Content-Type": "application/x-www-form-urlencoded" },',
                    '  body: new URLSearchParams({ username: email, password }),',
                    '});',
                    'const { access_token } = await res.json();',
                    'localStorage.setItem("token", access_token);',
                    '',
                    '// For every API request after that:',
                    'const token = localStorage.getItem("token");',
                    'fetch(API_URL + "/notes", {',
                    '  headers: { Authorization: "Bearer " + token },',
                    '});',
                ]}
            />
            <LectureCallout type="info">
                You built an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">AuthContext</code> in Week 9, and this is where you'll use it. It holds the token and user info, exposes <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">login</code>/<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">logout</code>, and a helper that attaches the token to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fetch</code> requests.
            </LectureCallout>

            <LectureCallout type="warning">
                <strong>When the token expires</strong>, the API returns 401. Your frontend should catch this, clear the stored token, and redirect to login. A common pattern: wrap <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fetch</code> in a helper that checks for 401 and calls <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">logout()</code> automatically.
            </LectureCallout>

            <LectureSectionHeading number="06" title="Protected Routes in React" />

            <LectureP>
                A <LectureTerm>protected route</LectureTerm> only renders when the user is authenticated. Wrap such routes in a component that reads your auth context: no user → redirect to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/login</code>; user present → render the child route.
            </LectureP>
            <CodeBlock
                language="tsx"
                title="ProtectedRoute.tsx — wrap routes that require login"
                lines={[
                    'import { Navigate, Outlet } from "react-router-dom";',
                    'import { useAuth } from "./AuthContext";',
                    '',
                    'export function ProtectedRoute() {',
                    '    const { user } = useAuth();',
                    '    if (!user) {',
                    '        return <Navigate to="/login" replace />;',
                    '    }',
                    '    return <Outlet />;',
                    '}',
                    '',
                    '// In your router:',
                    '// <Route element={<ProtectedRoute />}>',
                    '//     <Route path="dashboard" element={<Dashboard />} />',
                    '// </Route>',
                ]}
            />
            <LectureCallout type="warning">
                Protecting the frontend route only hides the UI; it does <strong>not</strong> secure the API. Always enforce auth on the backend. Anyone can call your API directly and bypass the frontend.
            </LectureCallout>

            
        </LectureLayout>
    );
}
