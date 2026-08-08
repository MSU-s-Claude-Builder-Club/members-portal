/**
 * Introduction to Fundamentals — week/session curriculum (icons + per-week accent colors).
 * Used by the class index page and by lecture layout footer navigation.
 */

import type { ReactNode } from 'react';
import {
    Binary,
    Cpu,
    GitBranch,
    Globe,
    Package,
    Rocket,
    Server,
    Shield,
    Terminal,
    TestTube,
    Trophy,
    Workflow,
} from 'lucide-react';

export type FundamentalsSessionType = 'lecture' | 'activity';

/** Tailwind class bundles for week folder header and activity cards on the index page. */
export interface FundamentalsWeekAccent {
    color: string;
    bg: string;
    text: string;
    border: string;
    badge: string;
    dot: string;
}

export interface FundamentalsSessionData {
    type: FundamentalsSessionType;
    label: string;
    title: string;
    description: string;
    duration: string;
    /** Path segment after /classes/introduction-to-fundamentals/ */
    slug: string;
    tags: string[];
}

export interface FundamentalsWeekData {
    number: number;
    title: string;
    subtitle: string;
    icon: ReactNode;
    accent: FundamentalsWeekAccent;
    sessions: FundamentalsSessionData[];
}

/**
 * Reusable accents — assign per week in WEEKS; override any field inline for one-offs.
 * The system speaks in ink: every week carries the same paper/ink/hairline bundle
 * (tokens only — see DESIGN.md §2). Emphasis, when earned, is the one orange.
 */
const ACCENT_INK: FundamentalsWeekAccent = {
    color: 'ink',
    bg: 'bg-page',
    text: 'text-foreground',
    border: 'border-border',
    badge: 'border border-border text-foreground',
    dot: 'bg-foreground',
};

/** Base URL path for this class (no trailing slash). */
export const INTRODUCTION_TO_FUNDAMENTALS_BASE = '/classes/introduction-to-fundamentals';

export const WEEKS: FundamentalsWeekData[] = [
    {
        number: 1,
        title: 'Linux & The Command Line',
        subtitle: 'Your new home base',
        icon: <Terminal className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Linux & The Command Line',
                description:
                    'Every server, container, and cloud environment runs Linux underneath. Learn to navigate, manipulate files, manage processes, and install software without touching a mouse.',
                duration: '90 min',
                slug: 'week-1/lecture-1',
                tags: ['terminal basics', 'grep', 'apt', 'Homebrew', 'pathnames'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Shell Scripting & Permissions',
                description:
                    'Automate repetitive tasks with bash scripts and understand the Unix permission model that controls who can read, write, and execute everything on the system.',
                duration: '90 min',
                slug: 'week-1/lecture-2',
                tags: ['bash', 'chmod', 'chown', 'shebang', 'cron automation'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'The Linux Gauntlet',
                description:
                    'Navigate, manipulate, script, and automate — 90 minutes of terminal challenges that cover everything from Week 1. No walkthroughs, just commands and results.',
                duration: '90 min',
                slug: 'week-1/activity',
                tags: ['filesystem', 'shell scripting', 'permissions', 'find', 'pipes'],
            },
        ],
    },
    {
        number: 2,
        title: 'Data Structures & Algorithms',
        subtitle: 'Go deeper',
        icon: <Binary className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Trees, Stacks & Queues',
                description:
                    'Binary trees, BSTs, in-order traversal, stacks, and queues — the non-linear structures that show up in databases, compilers, and every technical interview you will ever take.',
                duration: '90 min',
                slug: 'week-2/lecture-1',
                tags: ['binary tree', 'in-order', 'BFS', 'DFS', 'stack frames'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Hash Maps, Complexity & Interview Patterns',
                description:
                    'Hash maps, Big-O analysis, two-pointer and sliding window patterns — the toolkit for turning O(n²) brute-force solutions into O(n) answers.',
                duration: '90 min',
                slug: 'week-2/lecture-2',
                tags: ['queues', 'hash map', 'Big-O', 'two pointers', 'sliding window'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Data Structures in Practice',
                description:
                    'Implement a BST, a MinStack, and hash-map patterns in Python — no new language, just the concepts from this week. Prep for applying the same ideas in C++ next week.',
                duration: '90 min',
                slug: 'week-2/activity',
                tags: ['MinStack', 'two sum', 'valid BST', 'patterns', 'Python'],
            },
        ],
    },
    {
        number: 3,
        title: 'C++ & Object-Oriented Programming',
        subtitle: 'Design software, not just functions',
        icon: <Cpu className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Classes, Encapsulation & Inheritance',
                description:
                    'C++ OOP from the ground up — classes, access modifiers, constructors, inheritance chains, and the virtual keyword that makes polymorphism possible.',
                duration: '90 min',
                slug: 'week-3/lecture-1',
                tags: ['classes', 'encapsulation', 'inheritance', 'virtual', 'constructors'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Polymorphism, STL & System Design',
                description:
                    'Abstract base classes, pure virtual methods, and STL containers — the tools you need to design a real system where types can be extended without rewriting the core.',
                duration: '90 min',
                slug: 'week-3/lecture-2',
                tags: ['polymorphism', 'pure virtual', 'vector', 'unordered_map', 'iterators'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'CLI Phonebook',
                description:
                    'Full C++ capstone: Part 1 — Contact and PhoneBook (add/delete/list). Part 2 — BST for sorted order, stack-based undo, and hash map for O(1) search by phone.',
                duration: '90 min',
                slug: 'week-3/activity',
                tags: ['CLI', 'BST', 'stack', 'undo', 'CRUD'],
            },
        ],
    },
    {
        number: 4,
        title: 'Git & Agile Engineering',
        subtitle: 'How real teams work',
        icon: <GitBranch className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Version Control with Git',
                description:
                    'Git is the foundation of every professional software team. Learn not just the commands, but why it works the way it does — commits, branches, merges, and how to recover from mistakes.',
                duration: '90 min',
                slug: 'week-4/lecture-1',
                tags: ['git init', 'commits', 'branching', 'merge conflicts', 'origin'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'GitHub, Agile & Project Management',
                description:
                    'Pull requests, GitHub Projects, issues, and the Agile workflow that connects them. This is how every team in industry tracks work from idea to shipped feature.',
                duration: '90 min',
                slug: 'week-4/lecture-2',
                tags: ['pull requests', 'GitHub Projects', 'Scrum', 'Kanban', 'epics'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Project Kickoff',
                description:
                    'Choose your project domain, scaffold your repo, and create your GitHub Project board. In Week 5 (Sprint Planning) you will create issues for every sprint in advance — Containers, Backend, Testing, Frontend, Auth, Deployment. Every deliverable from here ships through this board.',
                duration: '90 min',
                slug: 'week-4/activity',
                tags: ['issues', 'README', 'templates', 'repo setup', 'git clone'],
            },
        ],
    },
    {
        number: 5,
        title: 'Sprint Planning',
        subtitle: 'Set up all sprints in advance',
        icon: <Workflow className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Scrum, Kanban & Sprint Cycles',
                description:
                    'The ceremonies, artifacts, and mindset behind agile teams — user stories, sprint planning, standups, and retrospectives. You will plan the entire project in advance so every week maps to a clear set of issues.',
                duration: '90 min',
                slug: 'week-5/lecture-1',
                tags: ['Scrum', 'Kanban', 'user stories', 'sprints', 'sprint review'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Backlog Design & Issue Writing',
                description:
                    'How to write issues that map to real deliverables: Containers, Backend, Testing, Frontend, Auth, Deployment. One sprint per theme — you create the full roadmap now so execution is just "pull the next issue."',
                duration: '90 min',
                slug: 'week-5/lecture-2',
                tags: ['backlog', 'acceptance criteria', 'labels', 'milestones', 'WIP limits'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Set Up Your Entire Sprint Roadmap',
                description:
                    'Create issues on your GitHub Project board for all remaining sprints: Week 6 (Containers), Week 7 (Backend), Week 8 (Testing & CI/CD), Week 9 (Frontend), Week 10 (Auth), Week 11 (Deployment). Each sprint gets 2–4 issues that match that week\'s deliverables. From here on you just pull issues and ship.',
                duration: '90 min',
                slug: 'week-5/activity',
                tags: ['issues', 'goals', 'templates', 'board', 'deps'],
            },
        ],
    },
    {
        number: 6,
        title: 'Containerization with Docker',
        subtitle: 'Build once, run anywhere',
        icon: <Package className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Package Managers & Environments',
                description:
                    'Every language has a package manager. Learn how they resolve dependencies, why virtual environments exist, and how to never pollute your system Python again.',
                duration: '90 min',
                slug: 'week-6/lecture-1',
                tags: ['apt', 'npm', 'pip', 'venv', 'dependency resolution'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Docker & Containerization',
                description:
                    '"It works on my machine" ends here. Docker packages your app and everything it needs into a single portable unit that runs identically everywhere.',
                duration: '90 min',
                slug: 'week-6/lecture-2',
                tags: ['Dockerfile', 'docker run', 'image layers', 'COPY', 'CMD'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Containerize Your Backend Stub',
                description:
                    'Write a Dockerfile for a provided Python stub, mount a volume to persist data between runs, and compare image sizes between base images. Your container is ready for Week 7 (Backend).',
                duration: '90 min',
                slug: 'week-6/activity',
                tags: ['volumes', 'docker images', 'base images', 'ports', 'layer caching'],
            },
        ],
    },
    {
        number: 7,
        title: 'Backend Development',
        subtitle: 'The engine under the hood',
        icon: <Server className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'FastAPI & Python Backends',
                description:
                    'Real apps need a server — for auth, shared state, and business logic that cannot run in the browser. FastAPI is the fastest path from zero to a documented, production-ready Python API.',
                duration: '90 min',
                slug: 'week-7/lecture-1',
                tags: ['FastAPI', 'Pydantic', 'REST', 'type hints', 'docstrings'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Databases: SQL, SQLite & Redis',
                description:
                    'SQLite for relational persistent storage, Redis for fast caching. Learn when to use each, how they work together, and how Docker Compose wires both services into one command.',
                duration: '90 min',
                slug: 'week-7/lecture-2',
                tags: ['SQLite', 'SQL joins', 'Redis', 'caching', 'docker-compose'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Build Your Backend',
                description:
                    'Build the FastAPI backend for your chosen project domain — 3+ endpoints, SQLite storage, Redis caching layer, all running via Docker Compose. Deliverable ships as a PR.',
                duration: '90 min',
                slug: 'week-7/activity',
                tags: ['pull request', 'OpenAPI', 'health', 'migrations', 'seed data'],
            },
        ],
    },
    {
        number: 8,
        title: 'Testing & CI/CD',
        subtitle: 'Ship with confidence',
        icon: <TestTube className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Vitest & Testing Your Project',
                description:
                    'Unit and integration testing with Vitest: testing your API, components, and critical paths so refactors don\'t break your fundamentals project.',
                duration: '90 min',
                slug: 'week-8/lecture-1',
                tags: ['Vitest', 'unit tests', 'integration tests', 'mocks', 'watch'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'GitHub Actions & Coverage',
                description:
                    'CI/CD with GitHub Actions: run tests on every push, enforce coverage, and automate checks so the team stays in sync.',
                duration: '90 min',
                slug: 'week-8/lecture-2',
                tags: ['GitHub Actions', 'CI/CD', 'coverage', 'automation', 'matrix'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Pipeline for Your Repo',
                description:
                    'Add a GitHub Actions workflow to your project that runs tests and reports coverage. Fix any failing tests and document how to run them locally.',
                duration: '90 min',
                slug: 'week-8/activity',
                tags: ['workflows', 'YAML', 'artifacts', 'README', 'local dev'],
            },
        ],
    },
    {
        number: 9,
        title: 'Frontend Development',
        subtitle: 'Build interfaces people actually use',
        icon: <Globe className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'React Components & Hooks',
                description:
                    'React is the most widely used frontend library in the world. Learn the mental model, components, props, state, and the hooks you will use every single day.',
                duration: '90 min',
                slug: 'week-9/lecture-1',
                tags: ['useState', 'useEffect', 'props', 'JSX', 'component model'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Tailwind CSS & Connecting to Your API',
                description:
                    'Style your UI with utility classes that do exactly one thing, then wire your React frontend to the FastAPI backend you built using fetch.',
                duration: '90 min',
                slug: 'week-9/lecture-2',
                tags: ['Tailwind', 'flexbox', 'CSS Grid', 'fetch API', 'loading states'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Build Your Frontend',
                description:
                    'Build the React + Tailwind frontend for your project — 3+ views, real data flowing from your API, fully styled. By the end you have a live full-stack end to end.',
                duration: '90 min',
                slug: 'week-9/activity',
                tags: ['React', 'composition', 'client routing', 'views', 'E2E flow'],
            },
        ],
    },
    {
        number: 10,
        title: 'Auth & Identity',
        subtitle: 'Secure your project',
        icon: <Shield className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'JWT, Sessions & Protecting Routes',
                description:
                    'Authentication and authorization on your fundamentals project: JWTs, session management, and protecting API and frontend routes so only the right users see the right data.',
                duration: '90 min',
                slug: 'week-10/lecture-1',
                tags: ['JWT', 'sessions', 'auth middleware', 'route guards', 'tokens'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Identity & User Context',
                description:
                    'User context across the stack, role-based access, and how to keep your project secure as you add more features.',
                duration: '90 min',
                slug: 'week-10/lecture-2',
                tags: ['user context', 'roles', 'authorization', 'least privilege', 'OWASP'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Auth on Your Project',
                description:
                    'Implement login, session handling, and at least one protected route on your fundamentals project. Bring your code to Coworking for review.',
                duration: '90 min',
                slug: 'week-10/activity',
                tags: ['login', 'OAuth', 'E2E', 'checklist', 'peer review'],
            },
        ],
    },
    {
        number: 11,
        title: 'Deployment',
        subtitle: 'From local to production',
        icon: <Rocket className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'Vercel, Railway & What Production Means',
                description:
                    'Deploy your fundamentals project: frontend on Vercel, backend on Railway (or similar), env vars, and what "production" actually means for config, secrets, and domains.',
                duration: '90 min',
                slug: 'week-11/lecture-1',
                tags: ['Vercel', 'Railway', 'deployment', 'env vars', 'preview deployments'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Databases & Persistence in Production',
                description:
                    'Production databases, connection strings, migrations, and keeping your project\'s data safe and consistent when you ship.',
                duration: '90 min',
                slug: 'week-11/lecture-2',
                tags: ['production DB', 'migrations', 'secrets', 'backups', 'replication'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Ship Your Project',
                description:
                    'Deploy your fundamentals project end-to-end. Document your deployment steps and env vars (without secrets) in your README. Demo the live app.',
                duration: '90 min',
                slug: 'week-11/activity',
                tags: ['deploy', 'README', 'demo', 'production', 'smoke'],
            },
        ],
    },
    {
        number: 12,
        title: 'Final Sprint',
        subtitle: 'README, final demo, and celebration',
        icon: <Trophy className="h-5 w-5" />,
        accent: ACCENT_INK,
        sessions: [
            {
                type: 'lecture',
                label: 'Lecture 1',
                title: 'README, Docs & Open Source Habits',
                description:
                    'How to write a README that makes your project understandable and runnable. Docs, contributing guidelines, and habits that scale when others join.',
                duration: '90 min',
                slug: 'week-12/lecture-1',
                tags: ['README', 'documentation', 'open source', 'contributing', 'LICENSE'],
            },
            {
                type: 'lecture',
                label: 'Lecture 2',
                title: 'Demo Prep & Retrospective',
                description:
                    'Prepare a short demo of your fundamentals project: what you built, what you\'d do next, and one lesson you\'re taking forward. Run a lightweight retrospective.',
                duration: '90 min',
                slug: 'week-12/lecture-2',
                tags: ['retrospective', 'showcase', 'lessons', 'slides', 'narrative'],
            },
            {
                type: 'activity',
                label: 'Activity',
                title: 'Final Demo & Celebration',
                description:
                    'Present your project in a final sprint review. Share your README, live app, and one takeaway. Celebrate the 36-session journey from zero to full-stack.',
                duration: '90 min',
                slug: 'week-12/activity',
                tags: ['demo', 'celebration', 'handoff', 'ship', 'live app'],
            },
        ],
    },
];

/** Ordered flat list of sessions for linear prev/next navigation in lecture pages. */
export function getFundamentalsSessionNavOrder(): { slug: string; title: string }[] {
    const out: { slug: string; title: string }[] = [];
    for (const week of WEEKS) {
        for (const s of week.sessions) {
            out.push({ slug: s.slug, title: s.title });
        }
    }
    return out;
}

/**
 * Resolve prev/next footer targets for a fundamentals lesson URL, or null if not a session path.
 */
export function getFundamentalsFooterNavFromPathname(pathname: string): {
    prev?: { title: string; path: string };
    next?: { title: string; path: string };
} | null {
    const normalized = pathname.replace(/\/+$/, '');
    const prefix = INTRODUCTION_TO_FUNDAMENTALS_BASE + '/';
    if (!normalized.startsWith(prefix)) return null;
    const slug = normalized.slice(prefix.length);
    if (!slug || slug.includes('..')) return null;

    const order = getFundamentalsSessionNavOrder();
    const idx = order.findIndex((e) => e.slug === slug);
    if (idx === -1) return null;

    const prev = idx > 0 ? order[idx - 1] : undefined;
    const next = idx < order.length - 1 ? order[idx + 1] : undefined;

    return {
        ...(prev
            ? {
                  prev: {
                      title: prev.title,
                      path: `${INTRODUCTION_TO_FUNDAMENTALS_BASE}/${prev.slug}`,
                  },
              }
            : {}),
        ...(next
            ? {
                  next: {
                      title: next.title,
                      path: `${INTRODUCTION_TO_FUNDAMENTALS_BASE}/${next.slug}`,
                  },
              }
            : {}),
    };
}
