import { Server } from 'lucide-react';
import {
    LectureLayout,
    LectureHeader,
    LectureCallout,
    LectureSectionHeading,
    LectureP,
} from '@/components/ui/lecture-typography';
import { TerminalBlock } from '@/components/ui/terminal-block';
import { CodeBlock } from '@/components/ui/code-block';
import { ActivityHint } from '@/components/ui/activity-hint';
import { ActivityChallenge } from '@/components/ui/activity-challenge';
import { ActivityTask, ActivityTaskListProvider } from '@/components/ui/activity-task';
import InteractiveExercise from '@/components/ui/interactive-exercise';

export default function Week7Activity() {
    return (
        <ActivityTaskListProvider>
            <LectureLayout>
                <LectureHeader
                    week={7}
                    session="Activity"
                    title="Build Your Backend"
                    description="The Dockerfile exists. Now fill it in: a real FastAPI backend with SQLite storage and Redis caching, all running via Docker Compose. By the end you have a documented API you can hand off to your frontend next week."
                    icon={<Server className="h-4 w-4" />}
                />

            <LectureCallout type="info">
                You are building the backend for the domain you chose in the Week 4 project kickoff. Use FastAPI's <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code> page to verify everything as you go.
            </LectureCallout>

            {/* ── 01 PROJECT REQUIREMENTS ──────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Project Requirements" />

            <LectureP>
                Before writing code, understand what you are shipping. Every backend this week must meet these requirements regardless of domain.
            </LectureP>

            <div className="my-4 space-y-2">
                {[
                    '3 or more REST endpoints (at minimum: create one resource, list all resources, get one resource by ID)',
                    'SQLite database using SQLAlchemy for all persistent data',
                    'At least one Redis-cached endpoint: a read that is expensive enough to be worth caching (e.g., aggregate, filtered list, recommendation computation)',
                    'Docker Compose file that starts FastAPI + Redis with one command: docker compose up',
                    'FastAPI /docs page fully documents all endpoints with correct schemas',
                ].map((req, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">✓</span>
                        <p className="text-sm text-foreground">{req}</p>
                    </div>
                ))}
            </div>

            <LectureCallout type="warning">
                Redis is a cache, not your primary database. Every piece of data must live in SQLite first. Redis holds computed results that are expensive to recompute on every request. If Redis goes down, your app should still work.
            </LectureCallout>

            {/* ── 02 SET UP DOCKER COMPOSE ────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Set Up Docker Compose" />

            <ActivityChallenge
                number="2.1"
                title="Update Requirements and Write docker-compose.yml"
                description="Install all needed packages and define FastAPI + Redis services."
            >
                <div className="space-y-1">
                    <ActivityTask>Update <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/requirements.txt</code> to include: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">fastapi</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">uvicorn[standard]</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">sqlalchemy</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">redis</code></ActivityTask>
                    <ActivityTask>Update your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Dockerfile</code> CMD to start FastAPI: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]</code></ActivityTask>
                    <ActivityTask>In your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code> folder, create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker-compose.yml</code></ActivityTask>
                    <ActivityTask>Define an <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">api</code> service: build from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">.</code>, ports <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">8000:8000</code>, depends_on <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">redis</code></ActivityTask>
                    <ActivityTask>Define a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">redis</code> service: image <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">redis:7-alpine</code>, no extra config needed</ActivityTask>
                    <ActivityTask>Verify with: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker compose up</code></ActivityTask>
                </div>

                <TerminalBlock
                    title="bash · backend"
                    lines={[
                        { cmd: 'docker compose up --build' },
                    ]}
                />

                <LectureCallout type="info">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">depends_on</code> ensures Redis starts first, but doesn't wait for it to be ready, only for the container to start. Your code should handle the case where Redis is temporarily unavailable.
                </LectureCallout>
            </ActivityChallenge>

            {/* ── 03 BUILD YOUR ENDPOINTS ─────────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Build Your Endpoints" />

            <ActivityChallenge
                number="3.1"
                title="Database Models and Schemas"
                description="Set up SQLAlchemy, define your data schema, and create Pydantic models."
            >
                <div className="space-y-1">
                    <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">database.py</code> with engine setup and a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_db</code> dependency (copy the pattern from Lecture 2)</ActivityTask>
                    <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">models.py</code> with your SQLAlchemy model(s) representing your chosen domain</ActivityTask>
                    <ActivityTask>Create <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">schemas.py</code> with Pydantic models for each endpoint: a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Create</code> model (what the client sends) and a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Response</code> model (what the server returns)</ActivityTask>
                    <ActivityTask>Update your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">main.py</code> to create tables on startup with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Base.metadata.create_all(bind=engine)</code></ActivityTask>
                </div>

                <ActivityHint label="SQLAlchemy quickstart">
                    <code className="bg-muted px-1 rounded text-xs">from sqlalchemy import create_engine; from sqlalchemy.orm import sessionmaker, DeclarativeBase</code>, then define your Base class and models that inherit from it. For Pydantic schemas, use <code className="bg-muted px-1 rounded text-xs">model_config = ConfigDict(from_attributes=True)</code> so Pydantic can read SQLAlchemy objects directly.
                </ActivityHint>
            </ActivityChallenge>

            <ActivityChallenge
                number="3.2"
                title="Core Endpoints"
                description="Implement your 3 required REST endpoints."
            >
                <div className="space-y-1">
                    <ActivityTask>Implement your 3 required endpoints. Each must use a Pydantic schema for request/response validation</ActivityTask>
                    <ActivityTask>Test each one through <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code> before moving on</ActivityTask>
                </div>

                <LectureCallout type="tip">
                    Write one endpoint, test it in <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code>, then write the next. Do not write all three and then test, because you will not know which one is broken.
                </LectureCallout>
            </ActivityChallenge>

            <ActivityChallenge
                number="3.3"
                title="Redis Caching Layer"
                description="Add caching to your most expensive read operation."
            >
                <div className="space-y-1">
                    <ActivityTask>Connect to Redis: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">r = redis.Redis(host="redis", port=6379, decode_responses=True)</code></ActivityTask>
                    <ActivityTask>Pick the most read-heavy endpoint, the one that does the most computation or hits the most rows</ActivityTask>
                    <ActivityTask>Cache its result in Redis with a 60-second TTL using <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">r.setex()</code></ActivityTask>
                    <ActivityTask>On each request: check Redis first (cache hit), fall back to SQLite if not found (cache miss), then store the result in Redis</ActivityTask>
                </div>

                <CodeBlock
                    language="python"
                    title="cache hit/miss pattern"
                    lines={[
                        '# Cache hit/miss pattern:',
                        'result = r.get("cache_key")',
                        'if result:',
                        '    return json.loads(result)  # cache hit',
                        'else:',
                        '    result = compute_expensive_query()',
                        '    r.setex("cache_key", 60, json.dumps(result))',
                        '    return result  # cache miss, but now cached',
                    ]}
                />

                <LectureCallout type="info">
                    The host <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">"redis"</code> works because Docker Compose creates a network where each service name resolves to that container's IP. Your API connects to the Redis container by its service name, not <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">localhost</code>.
                </LectureCallout>

                <LectureCallout type="tip">
                    TTL (Time To Live) is the expiration time in seconds. After 60 seconds the next request will recompute the value and re-cache it. Start with 60 seconds and adjust based on how stale your data can tolerate being.
                </LectureCallout>
            </ActivityChallenge>

            <LectureP>
                Before you ship, prove to yourself that you understand the two core patterns from this week: shaping a response the way a FastAPI endpoint would, and the cache hit/miss logic you just wrote. Both exercises below run pure Python, no server needed.
            </LectureP>

            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 1: Build the Response Body"
                prompt={<>A FastAPI endpoint returns a dict that gets serialized to JSON. Complete <code>get_item</code> so it returns a dict with the keys <code>id</code> and <code>name</code>, where <code>name</code> is looked up from the <code>DB</code> dict by id. The final print must output exactly <code>{'{'}'id': 2, 'name': 'redis'{'}'}</code>.</>}
                starter={"DB = {1: 'fastapi', 2: 'redis', 3: 'sqlite'}\n\ndef get_item(item_id):\n    # return a dict: {'id': item_id, 'name': <lookup in DB>}\n    return {}\n\nprint(get_item(2))"}
                expected="{'id': 2, 'name': 'redis'}"
                hint="return {'id': item_id, 'name': DB[item_id]}"
            />

            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 2: Cache Hit or Miss"
                prompt={<>Implement the cache hit/miss pattern from Challenge 3.3 with a plain dict standing in for Redis. Complete <code>get_report</code> so it returns a <code>(status, value)</code> tuple: if <code>key</code> is in <code>cache</code>, return <code>('HIT', cache[key])</code>; otherwise call <code>compute()</code>, store the result in <code>cache</code> under <code>key</code>, and return <code>('MISS', value)</code>. The two prints must output exactly <code>MISS 42</code> then <code>HIT 42</code> on separate lines.</>}
                starter={"cache = {}\n\ndef compute():\n    return 42\n\ndef get_report(key):\n    # cache hit: return ('HIT', cached_value)\n    # cache miss: compute, store in cache, return ('MISS', value)\n    pass\n\nstatus, value = get_report('report')\nprint(status, value)\nstatus, value = get_report('report')\nprint(status, value)"}
                expected={"MISS 42\nHIT 42"}
                hint="Check `if key in cache:` first. On a miss, do cache[key] = compute() before returning."
            />

            {/* ── 04 SHIP IT ──────────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="Ship It" />

            <ActivityChallenge
                number="4.1"
                title="Verify and Document"
                description="Finalize your API documentation."
            >
                <div className="space-y-1">
                    <ActivityTask>Open <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code> and confirm all endpoints appear with correct schemas</ActivityTask>
                    <ActivityTask>Test the cached endpoint twice in quick succession and confirm the second response is faster</ActivityTask>
                    <ActivityTask>Write a short <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">API.md</code> in your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">backend/</code> folder documenting each endpoint: method, path, what it does, example request/response</ActivityTask>
                </div>
            </ActivityChallenge>

            <ActivityChallenge
                number="4.2"
                title="PR and Board Update"
                description="Finalize and ship Issue #2."
            >
                <div className="space-y-1">
                    <ActivityTask>Commit everything</ActivityTask>
                    <ActivityTask>Push</ActivityTask>
                    <ActivityTask>Open a PR that closes Issue #2 from your GitHub Project board</ActivityTask>
                    <ActivityTask>Move Issue #2 to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">Done</code></ActivityTask>
                    <ActivityTask>Your PR description should include: a screenshot of your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">/docs</code> page, confirmation that <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker compose up</code> works, and which endpoint is Redis-cached and why you chose it</ActivityTask>
                </div>
            </ActivityChallenge>

            
            </LectureLayout>
        </ActivityTaskListProvider>
    );
}
