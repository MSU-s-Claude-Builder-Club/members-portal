import { Server } from 'lucide-react';
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
import { CodeBlock } from '@/components/ui/code-block';
import { TerminalBlock } from '@/components/ui/terminal-block';
import InteractiveExercise from '@/components/ui/interactive-exercise';

// ── Relational table diagram ──────────────────────────────────────────────────
const RelationalDiagram = () => (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
            {
                table: 'users',
                color: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800',
                header: 'bg-blue-50 dark:bg-blue-950/30',
                rows: [
                    { id: '1', name: 'Alice', email: 'alice@msu.edu' },
                    { id: '2', name: 'Bob', email: 'bob@msu.edu' },
                ],
                cols: ['id', 'name', 'email'],
            },
            {
                table: 'notes',
                color: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-200 dark:border-emerald-800',
                header: 'bg-emerald-50 dark:bg-emerald-950/30',
                rows: [
                    { id: '1', user_id: '1', title: 'FastAPI intro' },
                    { id: '2', user_id: '1', title: 'SQL basics' },
                    { id: '3', user_id: '2', title: 'React hooks' },
                ],
                cols: ['id', 'user_id', 'title'],
            },
        ].map((t) => (
            <div key={t.table} className={`rounded-xl border ${t.border} overflow-hidden`}>
                <div className={`px-4 py-2 ${t.header}`}>
                    <code className={`text-xs font-bold ${t.color}`}>{t.table}</code>
                </div>
                <table className="w-full text-xs font-mono">
                    <thead>
                        <tr className="border-b border-border">
                            {t.cols.map((c) => (
                                <th key={c} className="px-3 py-1.5 text-left text-muted-foreground font-normal">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {t.rows.map((row, i) => (
                            <tr key={i} className="border-b border-border last:border-b-0">
                                {t.cols.map((c) => (
                                    <td key={c} className={`px-3 py-1.5 ${c === 'user_id' ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                                        {(row as Record<string, string>)[c]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
        <div className="sm:col-span-2 text-xs text-muted-foreground">
            <code>notes.user_id</code> is a foreign key that references <code>users.id</code>. The relationship: one user has many notes.
        </div>
    </div>
);


export default function Week7Lecture2() {
    return (
        <LectureLayout>
            <LectureHeader
                week={7}
                session="Lecture 2"
                title="Databases: SQL, SQLite & Redis"
                description="SQLite for relational persistent storage, Redis for fast caching. Learn when to use each, how they work together, and how Docker Compose wires both services into one command."
                icon={<Server className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
            />

            {/* ── 01 RELATIONAL DATABASES ─────────────────────────────────────── */}
            <LectureSectionHeading number="01" title="Relational Databases" />

            <LectureP>
                A <LectureTip tip="Data stored in tables (rows and columns) with relationships between tables. You query with SQL. Examples: SQLite, PostgreSQL, MySQL.">relational database</LectureTip> stores data in <LectureTip tip="A set of rows with the same columns. Like a spreadsheet sheet; each row is one record, each column is an attribute.">tables</LectureTip>: rows and columns, like a spreadsheet. Each table represents one type of thing (users, notes, orders). Rows are individual records. Columns are the attributes of those records.
            </LectureP>
            <LectureP>
                What makes relational databases powerful is the ability to <LectureTip tip="Combine rows from two or more tables based on a related column. SQL JOIN clauses (INNER, LEFT, etc.) do this in a single query.">join</LectureTip> tables together. Instead of duplicating user data into every note, you store users in one table and notes in another, linked by a <LectureTip tip="A column that references the primary key of another table. Enforces referential integrity and enables joins.">foreign key</LectureTip>. When you need the full picture, you join them in your query.
            </LectureP>

            <RelationalDiagram />

            <LectureCallout type="info">
                <strong className="text-foreground">SQLite</strong> stores the database in a single file on disk with zero configuration, perfect for development and small apps. <strong className="text-foreground">PostgreSQL</strong> is a full server, handles concurrent writes, supports advanced types, and is what you use in production. Start with SQLite, switch to Postgres when you need it. FastAPI + SQLAlchemy makes this switch trivial.
            </LectureCallout>

            {/* ── 02 CORE SQL ─────────────────────────────────────────────────── */}
            <LectureSectionHeading number="02" title="Core SQL" />

            <LectureP>
                SQL (Structured Query Language) is the language you use to talk to relational databases. The same syntax works across SQLite, PostgreSQL, MySQL, and most others with minor variations. Learn it once, use it everywhere.
            </LectureP>

            <LectureSubHeading title="Creating tables" />

            <CodeBlock
                language="sql"
                title="DDL: defining the schema"
                lines={[
                    '-- CREATE TABLE defines the structure. Run once when setting up.',
                    'CREATE TABLE users (',
                    '    id         INTEGER PRIMARY KEY AUTOINCREMENT,',
                    '    name       TEXT    NOT NULL,',
                    '    email      TEXT    NOT NULL UNIQUE,',
                    "    created_at TEXT    NOT NULL DEFAULT (datetime('now'))",
                    ');',
                    '',
                    'CREATE TABLE notes (',
                    '    id         INTEGER PRIMARY KEY AUTOINCREMENT,',
                    '    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,',
                    '    title      TEXT    NOT NULL,',
                    '    content    TEXT    NOT NULL,',
                    "    created_at TEXT    NOT NULL DEFAULT (datetime('now'))",
                    ');',
                ]}
            />

            <LectureSubHeading title="Reading data with SELECT" />

            <CodeBlock
                language="sql"
                title="SELECT: the most important SQL statement"
                lines={[
                    '-- Get everything from a table',
                    'SELECT * FROM notes;',
                    '-- Get specific columns',
                    'SELECT id, title FROM notes;',
                    '-- Filter with WHERE',
                    'SELECT * FROM notes WHERE user_id = 1;',
                    '-- Multiple conditions',
                    "SELECT * FROM notes WHERE user_id = 1 AND title LIKE '%SQL%';",
                    '-- Sort results',
                    'SELECT * FROM notes ORDER BY created_at DESC;',
                    '-- Limit results (pagination)',
                    'SELECT * FROM notes ORDER BY created_at DESC LIMIT 10 OFFSET 20;',
                    '-- Count rows',
                    'SELECT COUNT(*) FROM notes WHERE user_id = 1;',
                ]}
            />

            <LectureSubHeading title="JOIN: combining tables" />

            <LectureP>
                A <LectureTerm>JOIN</LectureTerm> combines rows from two tables based on a related column. The most common kind is <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">INNER JOIN</code>, which returns only rows where the join condition matches in both tables.
            </LectureP>

            <CodeBlock
                language="sql"
                title="JOIN: get notes with their author's name"
                lines={[
                    'SELECT',
                    '    notes.id,',
                    '    notes.title,',
                    '    users.name AS author_name,',
                    '    notes.created_at',
                    'FROM notes',
                    'INNER JOIN users ON notes.user_id = users.id',
                    "WHERE users.email = 'alice@msu.edu'",
                    'ORDER BY notes.created_at DESC;',
                ]}
            />

            <LectureSubHeading title="Writing data: INSERT, UPDATE, DELETE" />

            <CodeBlock
                language="sql"
                title="DML: modifying data"
                lines={[
                    '-- INSERT adds a new row',
                    "INSERT INTO notes (user_id, title, content) VALUES (1, 'New note', 'Hello SQL');",
                    '-- UPDATE modifies existing rows (ALWAYS include WHERE or you update everything)',
                    "UPDATE notes SET title = 'Updated title' WHERE id = 3;",
                    '-- DELETE removes rows (ALWAYS include WHERE or you delete everything)',
                    'DELETE FROM notes WHERE id = 3;',
                ]}
            />

            <LectureCallout type="warning">
                Every <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">UPDATE</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">DELETE</code> without a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">WHERE</code> clause affects every row in the table. This is the most common way to accidentally destroy production data. Before running any destructive query, run the equivalent <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">SELECT</code> first to see exactly which rows you're about to modify.
            </LectureCallout>

            {/* ── 03 GROUP BY AND AGGREGATES ──────────────────────────────────── */}
            <LectureSectionHeading number="03" title="Aggregates & GROUP BY" />

            <LectureP>
                Aggregate functions compute a single value from a set of rows. Combined with <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">GROUP BY</code>, you can compute statistics per group: notes per user, revenue per product, signups per day.
            </LectureP>

            <CodeBlock
                language="sql"
                title="aggregates with GROUP BY"
                lines={[
                    '-- Count notes per user',
                    'SELECT user_id, COUNT(*) AS note_count',
                    'FROM notes',
                    'GROUP BY user_id',
                    'ORDER BY note_count DESC;',
                    '',
                    '-- Only include users with more than 5 notes (HAVING filters groups, WHERE filters rows)',
                    'SELECT user_id, COUNT(*) AS note_count',
                    'FROM notes',
                    'GROUP BY user_id',
                    'HAVING COUNT(*) > 5;',
                ]}
            />

            <LectureP>
                Time to write some SQL yourself. Use the tables from this lecture: <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">users</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">notes</code>.
            </LectureP>

            <InteractiveExercise
                runtime="check"
                language="sql"
                title="Exercise 1: filter with WHERE"
                prompt={<>Write the SQL query that selects <strong>all columns</strong> from the <code>notes</code> table where <code>user_id</code> equals <code>2</code>.</>}
                expected={[
                    'select * from notes where user_id = 2;',
                    'select * from notes where user_id = 2',
                    'select * from notes where user_id=2;',
                    'select * from notes where user_id=2',
                ]}
                hint="SELECT * FROM <table> WHERE <column> = <value>;"
            />

            {/* ── 04 SQLALCHEMY ───────────────────────────────────────────────── */}
            <LectureSectionHeading number="04" title="SQLAlchemy: Python's Database Toolkit" />

            <LectureP>
                Writing raw SQL strings in Python works but gets messy fast: no type safety, no autocomplete, and SQL injection risk if you're not careful. <LectureTip tip="A Python library for talking to databases. Provides an ORM (map classes to tables) and a Core API for raw SQL. Works with SQLite, PostgreSQL, MySQL, etc.">SQLAlchemy</LectureTip> is Python's most widely used database library. It can be used as a pure query builder (Core) or as a full <LectureTip tip="Object Relational Mapper. Maps Python classes to tables; you work with objects and the ORM generates SQL. Reduces boilerplate and helps avoid SQL injection.">ORM</LectureTip> (Object Relational Mapper) that maps Python classes to database tables.
            </LectureP>
            <LectureP>
                With the ORM, you define your tables as Python classes. SQLAlchemy translates operations on those classes into SQL. You interact with Python objects, and SQLAlchemy handles the database communication.
            </LectureP>

            <CodeBlock
                language="python"
                title="database.py · connection setup"
                lines={[
                    'from sqlalchemy import create_engine',
                    'from sqlalchemy.orm import sessionmaker, DeclarativeBase',
                    '',
                    '# SQLite for development: just a file, zero config',
                    'DATABASE_URL = "sqlite:///./notes.db"',
                    '# Switch to Postgres in production; only this line changes',
                    '# DATABASE_URL = "postgresql://user:pass@localhost/notesdb"',
                    '',
                    'engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})  # SQLite only',
                    'SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)',
                    '',
                    'class Base(DeclarativeBase): pass',
                    '',
                    '# Dependency: gives each request its own DB session, then closes it',
                    'def get_db():',
                    '    db = SessionLocal()',
                    '    try:',
                    '        yield db',
                    '    finally:',
                    '        db.close()',
                ]}
            />

            <LectureCallout type="tip">
                In production with Postgres or MySQL, use <LectureTerm>connection pooling</LectureTerm> (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">create_engine(..., pool_size=10, max_overflow=20)</code>) so the app reuses connections instead of opening a new one per request. SQLite doesn't need pooling for typical dev use.
            </LectureCallout>

            <CodeBlock
                language="python"
                title="models.py · SQLAlchemy ORM models"
                lines={[
                    'from sqlalchemy import Integer, String, Boolean, ForeignKey, func',
                    'from sqlalchemy.orm import mapped_column, Mapped, relationship',
                    'from .database import Base',
                    '',
                    'class User(Base):',
                    '    __tablename__ = "users"',
                    '    id: Mapped[int] = mapped_column(Integer, primary_key=True)',
                    '    name: Mapped[str] = mapped_column(String, nullable=False)',
                    '    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)',
                    '    notes: Mapped[list["Note"]] = relationship(back_populates="author")',
                    '',
                    'class Note(Base):',
                    '    __tablename__ = "notes"',
                    '    id: Mapped[int] = mapped_column(Integer, primary_key=True)',
                    '    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))',
                    '    title: Mapped[str] = mapped_column(String, nullable=False)',
                    '    content: Mapped[str] = mapped_column(String, nullable=False)',
                    '    author: Mapped["User"] = relationship(back_populates="notes")',
                ]}
            />

            {/* ── 05 FASTAPI + SQLALCHEMY ─────────────────────────────────────── */}
            <LectureSectionHeading number="05" title="Wiring FastAPI to SQLAlchemy" />

            <LectureP>
                FastAPI uses <LectureTerm>Depends</LectureTerm> to inject dependencies into route handlers. The database session is a perfect use case: each request gets its own session (from <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_db</code>), uses it, and the session is closed after the response is sent.
            </LectureP>

            <CodeBlock
                language="python"
                title="main.py · full CRUD with SQLAlchemy"
                lines={[
                    'from fastapi import FastAPI, Depends, HTTPException',
                    'from sqlalchemy.orm import Session',
                    'from . import models, schemas',
                    'from .database import engine, get_db',
                    '',
                    "models.Base.metadata.create_all(bind=engine)  # create tables if they don't exist",
                    'app = FastAPI()',
                    '',
                    '@app.get("/notes", response_model=list[schemas.NoteResponse])',
                    'def get_notes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):',
                    '    return db.query(models.Note).offset(skip).limit(limit).all()',
                    '',
                    '@app.post("/notes", response_model=schemas.NoteResponse, status_code=201)',
                    'def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):',
                    '    db_note = models.Note(**note.model_dump())',
                    '    db.add(db_note)',
                    '    db.commit()',
                    '    db.refresh(db_note)  # load the auto-generated id from DB',
                    '    return db_note',
                    '',
                    '@app.delete("/notes/{note_id}", status_code=204)',
                    'def delete_note(note_id: int, db: Session = Depends(get_db)):',
                    '    note = db.query(models.Note).filter(models.Note.id == note_id).first()',
                    '    if not note:',
                    '        raise HTTPException(status_code=404, detail="Note not found")',
                    '    db.delete(note)',
                    '    db.commit()',
                ]}
            />

            <LectureP>
                The <LectureTip code tip="Depends() is FastAPI's dependency injection system. Pass a function to Depends() and FastAPI will call it for you and inject the result as the parameter value. Used for database sessions, authentication, config, and any shared logic that routes need.">Depends(get_db)</LectureTip> annotation is FastAPI's dependency injection system. FastAPI calls <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">get_db()</code> before the handler runs, injects the session, and runs the generator's cleanup (<code className="text-xs bg-muted px-1.5 py-0.5 rounded border">db.close()</code>) after the response is sent. You never manage session lifecycle manually.
            </LectureP>

            <LectureCallout type="warning">
                When using the ORM with relationships, avoid the <LectureTerm>N+1 query problem</LectureTerm>: loading a list of notes and then accessing <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">note.author</code> for each one triggers a separate query per note. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">joinedload()</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">selectinload()</code> to eager-load related data in one (or two) queries.
            </LectureCallout>

            {/* ── 06 INDEXING ─────────────────────────────────────────────────── */}
            <LectureSectionHeading number="06" title="Indexing: Making Queries Fast" />

            <LectureP>
                Without an index, a database has to scan every row to find matching records, a <LectureTerm>full table scan</LectureTerm>. For a table with 1M rows, that's 1M comparisons per query. An <LectureTerm>index</LectureTerm> is a data structure (usually a B-tree) that lets the database jump directly to matching rows. The cost: more disk space and slightly slower writes. The benefit: reads that would take seconds become milliseconds.
            </LectureP>

            <CodeBlock
                language="sql"
                title="indexing common query patterns"
                lines={[
                    '-- Add an index on any column you filter by frequently',
                    'CREATE INDEX idx_notes_user_id ON notes(user_id);',
                    '-- Unique index: enforces uniqueness AND speeds up lookups',
                    'CREATE UNIQUE INDEX idx_users_email ON users(email);',
                    '-- Composite index: useful when you always filter by both columns together',
                    'CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);',
                    '-- Check if a query is using an index (SQLite)',
                    'EXPLAIN QUERY PLAN SELECT * FROM notes WHERE user_id = 1;',
                ]}
            />

            <LectureCallout type="tip">
                A good rule of thumb: index every foreign key column and every column that appears in a <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">WHERE</code> clause in a frequently-run query. Don't index everything, though. Each index adds overhead to inserts and updates.
            </LectureCallout>

            <LectureSubHeading title="SQLite CLI: quick debugging" />
            <LectureP>
                SQLite ships with a command-line tool that lets you inspect your database directly. Useful when you need to check whether your tables exist, what schema they have, or run a quick query outside of Python.
            </LectureP>

            <TerminalBlock
                lines={[
                    { comment: 'open the database file', cmd: 'sqlite3 notes.db' },
                    { comment: 'list all tables', cmd: '.tables' },
                    { comment: 'show the CREATE TABLE statement for a table', cmd: '.schema notes' },
                    { comment: 'turn on column headers for readability', cmd: '.headers on' },
                    { comment: 'run a quick query', cmd: 'SELECT * FROM notes LIMIT 5;' },
                    { comment: 'exit', cmd: '.quit' },
                ]}
            />

            {/* ── 07 NORMALIZATION ────────────────────────────────────────────── */}
            <LectureSectionHeading number="07" title="Normalization: Designing Good Schemas" />

            <LectureP>
                <LectureTerm>Normalization</LectureTerm> is the practice of organizing data to eliminate redundancy. The core idea: store each piece of information in exactly one place. If you need to update it, you update it once.
            </LectureP>

            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border bg-rose-50 dark:bg-rose-950/20">
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">❌ Denormalized: data repeated</p>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-1 text-muted-foreground">
                        <p className="text-foreground font-semibold">notes table</p>
                        <p>id, title, content</p>
                        <p className="text-rose-500">author_name, author_email ← repeated for every note</p>
                        <p className="mt-2 text-rose-400 text-xs">If Alice changes her email, you update every note she wrote.</p>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border bg-emerald-50 dark:bg-emerald-950/20">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✅ Normalized: data stored once</p>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-1 text-muted-foreground">
                        <p className="text-foreground font-semibold">users</p>
                        <p>id, name, email ← stored once</p>
                        <p className="text-foreground font-semibold mt-2">notes</p>
                        <p>id, user_id, title, content ← references users</p>
                        <p className="mt-2 text-emerald-400 text-xs">Update email in one place. All notes reflect it automatically.</p>
                    </div>
                </div>
            </div>

            {/* ── 08 REDIS ──────────────────────────────────────────────────── */}
            <LectureSectionHeading number="08" title="Redis: An In-Memory Data Store" />

            <LectureP>
                <LectureTip tip="Remote Dictionary Server. An in-memory key-value store. Data lives in RAM, so reads and writes are sub-millisecond. Used for caching, sessions, rate limiting, and queues.">Redis</LectureTip> is an in-memory key-value store. Unlike SQLite or Postgres, Redis keeps all data in RAM, which makes it extraordinarily fast (sub-millisecond reads) but means data is lost when Redis restarts unless you configure persistence.
            </LectureP>
            <LectureP>
                Use SQL for your source of truth, the authoritative, persistent copy of your data. Use Redis as a <LectureTerm>cache</LectureTerm> layer on top: expensive query results, session tokens, rate limit counters, or any data that is read frequently and expensive to compute but acceptable if slightly stale.
            </LectureP>

            <LectureSubHeading title="Installing redis-py" />
            <TerminalBlock
                lines={[
                    { comment: 'install the Python Redis client', cmd: 'pip install redis' },
                    { comment: 'add it to requirements.txt', cmd: 'pip freeze > requirements.txt' },
                ]}
            />

            <LectureSubHeading title="Connecting and using Redis" />
            <CodeBlock
                language="python"
                title="redis_client.py · connection setup"
                lines={[
                    'import redis',
                    'import json',
                    '',
                    '# In Docker Compose, the service name IS the hostname',
                    '# If running locally without Docker, use host="localhost"',
                    'r = redis.Redis(host="redis", port=6379, decode_responses=True)',
                    '',
                    '# SET stores a string value under a key',
                    'r.set("greeting", "hello")',
                    '',
                    '# GET retrieves it',
                    'value = r.get("greeting")  # "hello"',
                    '',
                    '# SETEX stores with a TTL (auto-deletes after N seconds)',
                    'r.setex("temp_data", 60, "expires in 60 seconds")',
                    '',
                    '# DELETE removes a key',
                    'r.delete("greeting")',
                    '',
                    '# Store complex data as JSON',
                    'notes = [{"id": 1, "title": "Hello"}, {"id": 2, "title": "World"}]',
                    'r.setex("all_notes", 60, json.dumps(notes))',
                    'cached = json.loads(r.get("all_notes"))  # back to a Python list',
                ]}
            />

            <LectureP>
                The <LectureTip tip="Time To Live. How long a cached value stays in Redis before it is automatically deleted. After the TTL expires, the next read returns None (cache miss) and your code recomputes and re-caches the value.">TTL</LectureTip> (Time To Live) is the expiration time in seconds. After the TTL passes, Redis automatically deletes the key. This prevents your cache from serving stale data indefinitely. After expiration, the next request recomputes the value and stores it again.
            </LectureP>

            <LectureSubHeading title="The cache hit/miss pattern" />
            <LectureP>
                The fundamental caching pattern: check Redis first. If the key exists (cache hit), return it immediately. If not (cache miss), compute the result from the database, store it in Redis with a TTL, and return it.
            </LectureP>

            <CodeBlock
                language="python"
                title="cache hit/miss pattern in a FastAPI endpoint"
                lines={[
                    'import json',
                    'import redis',
                    'from fastapi import Depends',
                    'from sqlalchemy.orm import Session',
                    '',
                    'r = redis.Redis(host="redis", port=6379, decode_responses=True)',
                    '',
                    '@app.get("/notes")',
                    'def get_notes(db: Session = Depends(get_db)):',
                    '    # 1. Check the cache',
                    '    cached = r.get("all_notes")',
                    '    if cached:',
                    '        return json.loads(cached)  # cache hit, fast',
                    '',
                    '    # 2. Cache miss: query the database',
                    '    notes = db.query(models.Note).all()',
                    '    result = [schemas.NoteResponse.model_validate(n).model_dump() for n in notes]',
                    '',
                    '    # 3. Store in cache with 60-second TTL',
                    '    r.setex("all_notes", 60, json.dumps(result, default=str))',
                    '',
                    '    return result',
                ]}
            />

            <LectureP>
                The cache hit/miss pattern is pure logic: check a store, fall back to computing, save the result. Try implementing it yourself with a plain Python dictionary standing in for Redis.
            </LectureP>

            <InteractiveExercise
                runtime="python"
                language="python"
                title="Exercise 2: implement the cache hit/miss pattern"
                prompt={<>Complete <code>get_value(key)</code>. On a cache hit (the key is already in the <code>cache</code> dict), return the stored value. On a miss, compute <code>key.upper()</code>, store it in <code>cache</code> under <code>key</code>, and return it. The last line must print exactly <code>NOTES 1</code> (the cached value, then the number of keys in the cache).</>}
                starter={'cache = {}\n\ndef get_value(key):\n    # 1. Cache hit: if key is in cache, return cache[key]\n    # 2. Cache miss: compute key.upper(), store it in cache, return it\n    pass\n\nget_value("notes")  # first call: miss, fills the cache\nprint(get_value("notes"), len(cache))  # second call: hit'}
                expected="NOTES 1"
                hint="if key in cache: return cache[key]. Otherwise cache[key] = key.upper() and return cache[key]."
            />

            <LectureCallout type="info">
                In Docker Compose, services on the same network can reach each other by service name. If your <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">docker-compose.yml</code> defines a service called <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">redis</code>, your Python code connects to <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">host="redis"</code>, not <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">localhost</code>. Docker Compose creates a virtual network and maps each service name to the container's IP address.
            </LectureCallout>

            <LectureCallout type="warning">
                Redis is a cache, not your primary database. Every piece of data must live in SQL first. If Redis goes down or a key expires, your app should still work; it just falls back to querying the database directly (slower, but correct).
            </LectureCallout>

        </LectureLayout>
    );
}