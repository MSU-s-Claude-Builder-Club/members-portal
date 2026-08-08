import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Zap, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCurrent } from '@/lib/semester';
import {
    INTRODUCTION_TO_FUNDAMENTALS_BASE,
    WEEKS,
    type FundamentalsSessionData,
} from './weeks';

// Week index follows club semester (Sunday week 0, then Sun–Sat weeks 1–12); getCurrent() clamps to published weeks below.
type Session = FundamentalsSessionData;

// ─── Session Row ──────────────────────────────────────────────────────────────

interface SessionCardProps {
    session: Session;
}

const SessionCard = ({ session }: SessionCardProps) => {
    const navigate = useNavigate();
    const basePath = `${INTRODUCTION_TO_FUNDAMENTALS_BASE}/${session.slug}`;
    const isActivity = session.type === 'activity';

    return (
        <button
            onClick={() => navigate(basePath)}
            className="w-full text-left group flex items-start gap-4 py-3.5 pr-2 hover:bg-tint hover:pl-2 transition-all duration-200 motion-reduce:transition-none"
        >
            {/* Session type label */}
            <span
                className={`flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] shrink-0 w-24 mt-0.5 ${
                    isActivity ? 'text-foreground' : 'text-muted-foreground'
                }`}
            >
                {isActivity ? <Zap className="h-3 w-3 shrink-0" /> : <BookOpen className="h-3 w-3 shrink-0" />}
                {isActivity ? 'Activity' : session.label}
            </span>

            <div className="flex-1 min-w-0">
                {/* Title */}
                <h4 className="font-mono text-sm font-bold tracking-[-0.01em] text-foreground leading-snug">
                    {session.title}
                </h4>

                {/* Description */}
                <p className="text-xs font-light text-muted-foreground leading-relaxed mt-1 line-clamp-2 max-w-[68ch]">
                    {session.description}
                </p>

                {/* Meta: duration + tags */}
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 font-mono text-[10px] text-grey-2 tabular-nums">
                    <span className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {session.duration}
                    </span>
                    <span className="text-grey-3 select-none">·</span>
                    <span className="text-grey-3">{session.tags.slice(0, 4).join(' · ')}</span>
                </p>
            </div>

            {/* Arrow */}
            <span
                className="font-mono text-sm text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all motion-reduce:transition-none"
                aria-hidden="true"
            >
                →
            </span>
        </button>
    );
};

// ─── Week Row ─────────────────────────────────────────────────────────────────

interface WeekFolderProps {
    week: (typeof WEEKS)[number];
    isOpen: boolean;
    onToggle: () => void;
    index: number;
    /** The ONE orange marker on this page: the current semester week. */
    isCurrent?: boolean;
}

const WeekFolder = ({ week, isOpen, onToggle, index, isCurrent }: WeekFolderProps) => (
    <motion.div
        id={`fundamentals-week-${week.number}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3 }}
        className="border-b border-border scroll-my-6"
    >
        {/* Header / Toggle */}
        <button
            onClick={onToggle}
            className="w-full flex items-center gap-4 py-4 pr-1 hover:bg-tint transition-colors duration-200 text-left group"
        >
            {/* Week number */}
            <span className="font-mono text-sm font-extrabold tabular-nums text-grey-3 w-8 shrink-0 text-right select-none group-hover:text-foreground transition-colors">
                {String(week.number).padStart(2, '0')}
            </span>

            {/* Icon */}
            <span className="text-muted-foreground shrink-0 [&_svg]:h-4 [&_svg]:w-4">{week.icon}</span>

            {/* Title block */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-mono text-base font-extrabold tracking-[-0.02em] text-foreground truncate">
                        {week.title}
                    </h3>
                    {isCurrent && <span className="w-2 h-2 bg-primary shrink-0" aria-label="Current week" />}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-0.5 truncate">
                    {week.subtitle}
                </p>
            </div>

            {/* Session count */}
            <span className="hidden md:inline font-mono text-[11px] text-muted-foreground tabular-nums shrink-0">
                {week.sessions.length} sessions
            </span>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
        </button>

        {/* Sessions */}
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="pb-4 pl-12 border-t border-hairline-faint divide-y divide-hairline-faint">
                        {week.sessions.map((session) => (
                            <SessionCard key={session.slug} session={session} />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const VALID_WEEK_NUMBERS = WEEKS.map((w) => w.number);

/** After opening a folder, match WeekFolder session panel motion (0.25s) before scrolling. */
const SCROLL_AFTER_FOLDER_EXPAND_MS = 280;

function scrollFundamentalsWeekIntoView(weekNumber: number) {
    document
        .getElementById(`fundamentals-week-${weekNumber}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getWeekFromSearchParams(searchParams: URLSearchParams): number | null {
    const s = searchParams.get('s');
    const n = s ? parseInt(s, 10) : NaN;
    return Number.isInteger(n) && VALID_WEEK_NUMBERS.includes(n) ? n : null;
}

const SESSION_COUNT = WEEKS.reduce((n, w) => n + w.sessions.length, 0);
const LECTURE_COUNT = WEEKS.reduce(
    (n, w) => n + w.sessions.filter((s) => s.type === 'lecture').length,
    0
);
const ACTIVITY_COUNT = SESSION_COUNT - LECTURE_COUNT;

export default function IntroductionToFundamentals() {
    const [searchParams] = useSearchParams();
    const weekFromUrl = getWeekFromSearchParams(searchParams);
    const [openWeeks, setOpenWeeks] = useState<Set<number>>(() =>
        weekFromUrl !== null ? new Set([weekFromUrl]) : new Set()
    );
    const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null);
    const navigate = useNavigate();

    // When URL ?s= changes (e.g. breadcrumb link), expand that week and scroll after panel opens
    useEffect(() => {
        if (weekFromUrl === null) return;
        setOpenWeeks((prev) => new Set(prev).add(weekFromUrl));
        const scrollTimeoutId = window.setTimeout(() => {
            scrollFundamentalsWeekIntoView(weekFromUrl);
        }, SCROLL_AFTER_FOLDER_EXPAND_MS);
        return () => window.clearTimeout(scrollTimeoutId);
    }, [weekFromUrl]);

    // Auto-expand current week on load when no URL week is specified
    useEffect(() => {
        if (weekFromUrl !== null) return;
        let cancelled = false;
        let scrollTimeoutId: number | undefined;
        getCurrent()
            .then((week) => {
                if (cancelled) return;
                const clamped = Math.min(Math.max(week, 1), 12);
                setCurrentWeekNumber(clamped);
                setOpenWeeks((prev) => new Set(prev).add(clamped));
                scrollTimeoutId = window.setTimeout(() => {
                    if (cancelled) return;
                    scrollFundamentalsWeekIntoView(clamped);
                }, SCROLL_AFTER_FOLDER_EXPAND_MS);
            })
            .catch(() => { });
        return () => {
            cancelled = true;
            if (scrollTimeoutId !== undefined) window.clearTimeout(scrollTimeoutId);
        };
    }, [weekFromUrl]);

    const toggleWeek = (n: number) => {
        setOpenWeeks((prev) => {
            const next = new Set(prev);
            if (next.has(n)) {
                next.delete(n);
            } else {
                next.add(n);
            }
            return next;
        });
    };

    const expandAll = () => setOpenWeeks(new Set(WEEKS.map((w) => w.number)));
    const collapseAll = () => setOpenWeeks(new Set());

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-6">
                    <BookOpen className="h-3.5 w-3.5" />
                    <button
                        onClick={() => navigate('/classes')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        Classes
                    </button>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground font-semibold">Introduction to Fundamentals</span>
                </div>

                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    Course
                </p>
                <h1 className="font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground">
                    Introduction to Fundamentals
                </h1>
                <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {WEEKS.length} weeks · {LECTURE_COUNT} lectures · {ACTIVITY_COUNT} activities
                </p>
                <p className="mt-4 text-[15px] leading-relaxed font-light text-ink-soft max-w-[68ch]">
                    A 36-session journey from zero to full-stack. Terminal fluency, version control,
                    containers, React, backend APIs, algorithms, auth, testing, deployment — everything
                    you need to contribute to real projects.
                </p>

                {/* Topic pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                    {[
                        'Linux',
                        'Git & Agile',
                        'Docker',
                        'FastAPI',
                        'Redis',
                        'React',
                        'C++ & DSA',
                        'Linux',
                        'Git & Agile',
                        'Docker',
                        'FastAPI',
                        'Redis',
                        'React',
                        'SQL',
                        'C++ & DSA',
                        'Sprint Review',
                        'Project Management',
                    ].map((topic, topicIndex) => (
                        <Badge
                            key={`${topic}-${topicIndex}`}
                            variant="secondary"
                            className="rounded-none border bg-page border-border font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground"
                        >
                            {topic}
                        </Badge>
                    ))}
                </div>
            </motion.div>

            {/* ── Course content: ruled list ── */}
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Course content
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={expandAll}
                            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-primary transition-colors"
                        >
                            Expand all
                        </button>
                        <span className="text-grey-3 text-xs select-none" aria-hidden="true">/</span>
                        <button
                            onClick={collapseAll}
                            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-primary transition-colors"
                        >
                            Collapse all
                        </button>
                    </div>
                </div>

                {/* ── Week rows ── */}
                <div>
                    {WEEKS.map((week, i) => (
                        <WeekFolder
                            key={week.number}
                            week={week}
                            isOpen={openWeeks.has(week.number)}
                            onToggle={() => toggleWeek(week.number)}
                            index={i}
                            isCurrent={currentWeekNumber === week.number}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
