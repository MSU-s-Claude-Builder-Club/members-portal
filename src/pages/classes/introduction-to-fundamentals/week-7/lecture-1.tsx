import { Server } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureSubHeading,
    LectureP,
    LectureTip,
    LectureTerm,
} from '@/components/ui/lecture-typography';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── Request/Response cycle diagram ────────────────────────────────────────────
const RequestCycleDiagram = () => {
    const steps = [
        { label: 'Browser', sub: 'sends HTTP request', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
        { label: 'FastAPI', sub: 'routes & validates', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
        { label: 'Database', sub: 'reads / writes data', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
        { label: 'FastAPI', sub: 'serializes response', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
        { label: 'Browser', sub: 'receives JSON', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
    ];
    return (
        <div className="my-8 rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                        <div className={`rounded-lg border px-3 py-2.5 text-center min-w-[90px] ${step.bg}`}>
                            <p className={`text-xs font-bold ${step.color}`}>{step.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                        </div>
                        {i < steps.length - 1 && (
                            <span className="text-muted-foreground select-none">
                                {i < 2 ? '→' : '←'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── HTTP methods table ────────────────────────────────────────────────────────
const HttpMethodsTable = () => (
    <div className="my-6 rounded-xl border border-border overflow-hidden">
        {[
            { method: 'GET', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', purpose: 'Read data. Never modifies anything. Safe to call multiple times.', example: 'GET /notes: list all notes' },
            { method: 'POST', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', purpose: 'Create a new resource. Body contains the data to create.', example: 'POST /notes: create a note' },
            { method: 'PUT', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', purpose: 'Replace a resource entirely. Body contains the full replacement.', example: 'PUT /notes/1: replace note 1' },
            { method: 'PATCH', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20', purpose: 'Partially update a resource. Body contains only the changed fields.', example: 'PATCH /notes/1: update title only' },
            { method: 'DELETE', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', purpose: 'Remove a resource. Usually no body.', example: 'DELETE /notes/1: delete note 1' },
        ].map((row) => (
            <div key={row.method} className="flex items-start gap-4 px-4 py-3 border-b border-border last:border-b-0">
                <span className={`text-xs font-black w-14 shrink-0 select-none rounded px-1.5 py-0.5 ${row.color} ${row.bg}`}>
                    {row.method}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{row.purpose}</p>
                    <code className="text-xs text-muted-foreground mt-0.5 block">{row.example}</code>
                </div>
            </div>
        ))}
    </div>
);

export default function Week7Lecture1() {
    return (
        <LectureLayout>
            <LectureHeader
                week={7}
                session="Lecture 1"
                title="FastAPI & Python Backends"
                description="Real apps need a server for auth, shared state, and business logic that cannot run in the browser. FastAPI is the fastest path from zero to a documented, production-ready Python API."
                icon={<Server className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
            />

            <LectureCallout type="info">
                Last week you containerized a Flask stub with a single <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/health</code> endpoint. This week you replace that stub with a real FastAPI backend: full CRUD, Pydantic validation, and auto-generated docs. The Dockerfile structure stays the same; only the framework and the CMD change.
            </LectureCallout>

            {/* ── 01 HOW THE WEB WORKS ────────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="How the Web Actually Works" />

            <LectureP>
                Every time your React app fetches data, it's making an <LectureTip tip="A message from client to server: method (GET, POST, etc.), URL, headers, and optional body. Sent over TCP, usually on port 80 (HTTP) or 443 (HTTPS).">HTTP request</LectureTip> to a server. The server receives the request, does some work, and sends back an <LectureTip tip="The server's reply: status code (200, 404, etc.), headers, and body (often JSON). The browser or client uses this to update the UI.">HTTP response</LectureTip>. This request/response cycle is the foundation of everything on the web.
            </LectureP>

            <RequestCycleDiagram />

            <LectureP>
                A <LectureTip tip="Representational State Transfer. An API design style: resources as URLs, CRUD via HTTP methods, stateless requests. Common and well-understood.">REST API</LectureTip> is a server that exposes data through a predictable set of URLs called <LectureTip tip="A URL path + HTTP method that the server handles. e.g. GET /notes returns the list; POST /notes creates one.">endpoints</LectureTip>. Each endpoint responds to specific HTTP methods. The convention maps methods to CRUD operations: Create → POST, Read → GET, Update → PUT/PATCH, Delete → DELETE.
            </LectureP>

            <HttpMethodsTable />

            <LectureCallout type="info">
                HTTP responses include a <LectureTip tip="A number that indicates result: 2xx success, 3xx redirect, 4xx client error (e.g. 404), 5xx server error. FastAPI sets these for you.">status code</LectureTip> that tells the client what happened. The ranges: 2xx = success (200 OK, 201 Created, 204 No Content), 3xx = redirect, 4xx = client error (400 Bad Request, 401 Unauthorized, 404 Not Found, 422 Validation Error), 5xx = server error (500 Internal Server Error). FastAPI handles most of these automatically.
            </LectureCallout>

            <LectureP>
                Before writing any FastAPI code, make sure the request/response mapping is second nature. A route handler is just a Python function that turns a request into a response, so let's practice that logic in plain Python.
            </LectureP>

            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 1: Map status codes to messages"
                prompt={<>Complete <code>status_message(code)</code> so it returns <code>"OK"</code> for 200, <code>"Not Found"</code> for 404, and <code>"Server Error"</code> for anything else. The three print calls must output exactly:<br /><code>OK</code><br /><code>Not Found</code><br /><code>Server Error</code></>}
                starter={"def status_message(code):\n    # return \"OK\" for 200, \"Not Found\" for 404,\n    # and \"Server Error\" for anything else\n    pass\n\nprint(status_message(200))\nprint(status_message(404))\nprint(status_message(500))"}
                expected={"OK\nNot Found\nServer Error"}
                hint='Use if / elif / else and return the matching string, e.g. if code == 200: return "OK".'
            />

            {/* ── 02 WHAT IS FASTAPI ───────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="What is FastAPI?" />

            <LectureP>
                <LectureTip tip="A Python web framework for APIs. Uses type hints for validation, auto-generates OpenAPI docs, and supports async. Built on Starlette and Pydantic.">FastAPI</LectureTip> is a modern Python web framework for building APIs. It's built on two things: <LectureTip tip="A lightweight ASGI framework. FastAPI wraps it to add validation, docs, and dependency injection.">Starlette</LectureTip> (an async web framework) and <LectureTip tip="A library for data validation using Python type hints. FastAPI uses it for request/response bodies and settings.">Pydantic</LectureTip> (a data validation library). Together they give you automatic request validation, automatic response serialization, automatic API documentation, and excellent performance, all with minimal boilerplate.
            </LectureP>
            <LectureP>
                FastAPI uses Python type hints to do all of this. You annotate your function parameters with types, and FastAPI figures out the rest: where each value comes from (URL, query string, request body), how to validate it, and how to document it.
            </LectureP>

            <TerminalBlock
                title="bash · from a new project folder"
                lines={[
                    { comment: 'create a project folder and go into it', cmd: 'mkdir myapi && cd myapi' },
                    { comment: 'create and activate a virtual environment', cmd: 'python3 -m venv .venv && source .venv/bin/activate' },
                    { comment: 'install FastAPI and uvicorn (the server that runs it)', cmd: 'pip install fastapi uvicorn[standard]' },
                    { comment: 'save dependencies', cmd: 'pip freeze > requirements.txt' },
                ]}
            />

            <LectureSubHeading title="Your first FastAPI app" />

            <CodeBlock
                language="python"
                title="main.py · a complete FastAPI application"
                lines={[
                    'from fastapi import FastAPI',
                    'from pydantic import BaseModel',
                    '',
                    'app = FastAPI()',
                    '',
                    '# A Pydantic model defines the shape of request/response bodies',
                    'class Note(BaseModel):',
                    '    title: str',
                    '    content: str',
                    '    published: bool = False',
                    '',
                    '# In-memory store (replaced by a real DB later)',
                    'notes = []',
                    '',
                    '# Route decorator tells FastAPI which method + path triggers this function',
                    '@app.get("/notes")',
                    'def get_notes():',
                    '    return notes',
                    '',
                    '@app.post("/notes", status_code=201)',
                    'def create_note(note: Note):  # FastAPI sees Note and reads the body',
                    '    notes.append(note)',
                    '    return note',
                ]}
            />

            <LectureP>
                Save the code above as <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main.py</code> in your project root (the <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">myapi</code> folder). Then, from that folder with your venv activated, run:
            </LectureP>
            <TerminalBlock
                title="bash · project root, venv activated"
                lines={[
                    { comment: 'start the development server with auto-reload', cmd: 'uvicorn main:app --reload' },
                    { comment: 'open the auto-generated interactive docs (macOS); on Windows use start or just visit in browser', cmd: 'open http://localhost:8000/docs' },
                ]}
            />

            <LectureCallout type="tip">
                Go to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">http://localhost:8000/docs</code> the moment you start your server. FastAPI generates a fully interactive Swagger UI from your code, so you can send real requests to your API right from the browser, with no curl or Postman needed. The schema is also available at <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/openapi.json</code> for generating clients or API gateways.
            </LectureCallout>

            {/* ── 03 PYDANTIC MODELS ──────────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Pydantic Models" />

            <LectureP>
                <LectureTerm>Pydantic</LectureTerm> is FastAPI's validation engine. When you define a class that inherits from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">BaseModel</code>, Pydantic automatically validates any data passed to it, coercing types where possible, and raising clear validation errors when data doesn't match.
            </LectureP>

            <CodeBlock
                language="python"
                title="Pydantic models · validation and serialization"
                lines={[
                    'from pydantic import BaseModel, Field',
                    'from datetime import datetime',
                    '',
                    '# Request model: what the client sends',
                    'class NoteCreate(BaseModel):',
                    '    title: str = Field(min_length=1, max_length=100)',
                    '    content: str = Field(min_length=1)',
                    '    tags: list[str] = []  # optional, defaults to empty list',
                    '',
                    '# Response model: what the server sends back',
                    'class NoteResponse(BaseModel):',
                    '    id: int',
                    '    title: str',
                    '    content: str',
                    '    created_at: datetime',
                    '',
                    '# Using response_model ensures the response is filtered and validated',
                    '@app.post("/notes", response_model=NoteResponse, status_code=201)',
                    'def create_note(note: NoteCreate):',
                    '    ...',
                ]}
            />

            <LectureP>
                Separating <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">NoteCreate</code> (what comes in) from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">NoteResponse</code> (what goes out) is a critical pattern. The create model has no <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">id</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">created_at</code>; those are assigned by the server. The response model ensures you never accidentally leak sensitive fields (like a password hash) back to the client.
            </LectureP>

            {/* ── 04 PATH AND QUERY PARAMS ────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Path Parameters & Query Strings" />

            <LectureP>
                FastAPI reads parameters from three places: the URL path, the query string, and the request body. Declaring them in your function signature is all you need; FastAPI handles the rest.
            </LectureP>

            <CodeBlock
                language="python"
                title="path params, query params, body · all at once"
                lines={[
                    '# Path param: curly brace in the route, matching param name in function',
                    '@app.get("/notes/{note_id}")',
                    'def get_note(note_id: int):  # FastAPI extracts from URL and converts to int',
                    '    return notes[note_id]',
                    '',
                    '# Query param: any param not in the path and not a Pydantic model',
                    '@app.get("/notes")',
                    'def get_notes(skip: int = 0, limit: int = 10, search: str | None = None):',
                    '    # GET /notes?skip=20&limit=5&search=python',
                    '    return notes[skip : skip + limit]',
                    '',
                    '# Path param + body: update a specific resource',
                    '@app.patch("/notes/{note_id}")',
                    'def update_note(note_id: int, updates: NoteCreate):',
                    '    # note_id from path, updates from request body',
                    '    return {...}',
                ]}
            />

            {/* ── 05 ERROR HANDLING ───────────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Error Handling" />

            <LectureP>
                When something goes wrong (a note isn't found, a user isn't authorized) you raise an <LectureTip tip="FastAPI's way to return an error response. You set status_code and detail; FastAPI serializes it to JSON and sends the right status.">HTTPException</LectureTip>. FastAPI catches it and returns a properly formatted JSON error response with the correct status code.
            </LectureP>

            <CodeBlock
                language="python"
                title="HTTPException · the standard way to return errors"
                lines={[
                    'from fastapi import FastAPI, HTTPException',
                    '',
                    '@app.get("/notes/{note_id}")',
                    'def get_note(note_id: int):',
                    '    if note_id >= len(notes):',
                    '        raise HTTPException(',
                    '            status_code=404,',
                    '            detail="Note not found"',
                    '        )',
                    '    return notes[note_id]',
                    '',
                    '# FastAPI returns: {"detail": "Note not found"} with status 404',
                ]}
            />

            <LectureP>
                The heart of that endpoint is a plain lookup with a guard clause. Practice the same logic in pure Python: check the index first, and only touch the list when it's safe.
            </LectureP>

            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 2: Guard the lookup"
                prompt={<>Complete <code>get_note(notes, note_id)</code> so it returns the note at index <code>note_id</code> when the index is valid, and the string <code>"404: Note not found"</code> otherwise. The two print calls must output exactly:<br /><code>groceries</code><br /><code>404: Note not found</code></>}
                starter={"def get_note(notes, note_id):\n    # if note_id is a valid index, return notes[note_id]\n    # otherwise return \"404: Note not found\"\n    pass\n\nnotes = [\"groceries\", \"homework\"]\nprint(get_note(notes, 0))\nprint(get_note(notes, 5))"}
                expected={"groceries\n404: Note not found"}
                hint='Check if 0 <= note_id < len(notes) before indexing; return "404: Note not found" in the else branch.'
            />

            {/* ── 06 CORS ─────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="CORS: Letting Your Frontend Talk to Your Backend" />

            <LectureP>
                When your React app (running on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">localhost:5173</code>) tries to fetch from your FastAPI server (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">localhost:8000</code>), the browser blocks it. This is the <LectureTip tip="Browser rule: a page can only freely request to the same origin (scheme + host + port). Different port or domain is 'cross-origin' and restricted.">Same-Origin Policy</LectureTip>, a security feature that prevents one website from making requests to a different domain without permission.
            </LectureP>
            <LectureP>
                You grant permission with <LectureTip tip="Cross-Origin Resource Sharing. HTTP headers that tell the browser which origins may call your API. The server sends Allow-Origin and related headers.">CORS</LectureTip> (Cross-Origin Resource Sharing) headers. FastAPI includes middleware to handle this:
            </LectureP>

            <CodeBlock
                language="python"
                title="main.py · adding CORS middleware"
                lines={[
                    'from fastapi.middleware.cors import CORSMiddleware',
                    '',
                    'app.add_middleware(',
                    '    CORSMiddleware,',
                    '    allow_origins=["http://localhost:5173"],  # your React dev server',
                    '    allow_credentials=True,',
                    '    allow_methods=["*"],',
                    '    allow_headers=["*"],',
                    ')',
                    '',
                    '# In production: replace localhost with your deployed frontend URL',
                    '# allow_origins=["https://myapp.vercel.app"]',
                ]}
            />

            <LectureCallout type="warning">
                Never use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">allow_origins=["*"]</code> in production, because this allows any website on the internet to make requests to your API. Always list the specific origins you trust.
            </LectureCallout>

            {/* ── 07 ASYNC ────────────────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Async Endpoints" />

            <LectureP>
                FastAPI supports Python's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">async/await</code> natively. When your endpoint does I/O (hitting a database, calling another API), making it async lets FastAPI handle other requests while it waits instead of blocking the entire server.
            </LectureP>

            <CodeBlock
                language="python"
                title="sync vs async endpoints"
                lines={[
                    '# Sync: fine for CPU-bound work or when using a sync DB driver',
                    '@app.get("/notes")',
                    'def get_notes():',
                    '    return notes',
                    '',
                    '# Async: required when awaiting DB calls, HTTP requests, etc.',
                    '@app.get("/notes")',
                    'async def get_notes():',
                    '    results = await db.fetch_all(query)',
                    '    return results',
                ]}
            />

            <LectureCallout type="info">
                FastAPI runs sync endpoints in a thread pool so they don't block the event loop, but <strong className="text-foreground">async</strong> endpoints are more efficient under load: while one request is waiting on the database or another API, the server can handle other requests. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">async def</code> when your endpoint does I/O.
            </LectureCallout>

            <LectureCallout type="warning">
                Avoid long-running sync work (e.g. a slow database call with a sync driver) in sync endpoints, because it blocks the server from handling other requests. For database access, prefer an async driver and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">async def</code> so the event loop can stay responsive.
            </LectureCallout>

            {/* ── 08 TESTING WITH CURL ────────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Testing Your API" />

            <LectureP>
                You'll test your API in two ways: the interactive docs at <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">curl</code> from the terminal. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">curl</code> is the universal HTTP client: available everywhere, no installation needed, scriptable.
            </LectureP>

            <TerminalBlock
                lines={[
                    { comment: 'GET request: list all notes', cmd: 'curl http://localhost:8000/notes' },
                    { comment: 'POST request: create a note (send JSON body)', cmd: 'curl -X POST http://localhost:8000/notes \\' },
                    { cmd: '  -H "Content-Type: application/json" \\' },
                    { cmd: '  -d \'{"title": "My first note", "content": "Hello FastAPI"}\'' },
                    { comment: 'GET request with query params', cmd: 'curl "http://localhost:8000/notes?skip=0&limit=5"' },
                    { comment: 'DELETE request', cmd: 'curl -X DELETE http://localhost:8000/notes/1' },
                    { comment: 'pretty-print JSON response', cmd: 'curl http://localhost:8000/notes | python3 -m json.tool' },
                ]}
            />

            <LectureCallout type="tip">
                For more complex API testing, install <strong className="text-foreground">Bruno</strong> (free, open-source, stores requests as files in your repo) or use the built-in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code> page. Both are better than Postman for most use cases and don't require an account.
            </LectureCallout>

            
        </LectureLayout>
    );
}