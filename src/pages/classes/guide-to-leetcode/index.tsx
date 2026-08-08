import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Zap,
    BookOpen,
    Trophy,
    FileText,
    Timer,
    Crown,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import { WEEKS, getCurrent, type Question } from './weeks';
import { getActiveSemesterStartIso, getNextDropDeadline } from '@/lib/semester';

/** Difficulty reads as weight, not hue: easy = faint outline, medium = ink outline, hard = ink flood. */
const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Easy',
        className: 'border-grey-3 text-grey-2',
    },
    medium: {
        label: 'Medium',
        className: 'border-border text-foreground',
    },
    hard: {
        label: 'Hard',
        className: 'bg-foreground text-page border-foreground',
    },
};

/** Mono status-chip base (DESIGN.md §5). */
const CHIP_BASE =
    'inline-flex items-center rounded-none font-mono text-[10px] uppercase tracking-[0.08em] font-semibold px-2 py-0.5 border';

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(getTarget: () => Date) {
    const calc = useCallback(() => {
        const target = getTarget();
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
            done: false,
        };
    }, [getTarget]);

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);

    return time;
}

// ─── Countdown (inline, tooltips only) ───────────────────────────────

function CountdownInline() {
    const [startIso, setStartIso] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        void getActiveSemesterStartIso().then((iso) => {
            if (!cancelled) setStartIso(iso);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const getTarget = useCallback(
        () => getNextDropDeadline(startIso === undefined ? null : startIso, new Date()),
        [startIso]
    );

    const countdown = useCountdown(getTarget);

    if (countdown.done) {
        return (
            <div className="flex items-center gap-2 px-2.5 py-1 border border-primary text-primary">
                <Zap className="h-3.5 w-3.5" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em]">Live now</span>
            </div>
        );
    }

    const units = [
        { value: countdown.days, label: 'Days', pad: false },
        { value: countdown.hours, label: 'Hours', pad: true },
        { value: countdown.minutes, label: 'Minutes', pad: true },
        { value: countdown.seconds, label: 'Seconds', pad: true },
    ];

    return (
        <div className="flex items-center gap-1">
            {units.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-9 h-8 bg-page border border-border flex items-center justify-center cursor-default font-mono tabular-nums min-w-[2.25rem]">
                                <span className="text-sm font-bold text-foreground">
                                    {unit.pad ? String(unit.value).padStart(2, '0') : String(unit.value)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>{unit.label}</p>
                        </TooltipContent>
                    </Tooltip>
                    {i < units.length - 1 && (
                        <span className="font-mono text-sm font-bold text-grey-3 select-none">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Markdown Renderer ───────────────────────────────────────────────────────

function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;
    let keyCounter = 0;
    const key = () => `md-${keyCounter++}`;

    const renderInline = (text: string) => {
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={idx} className="px-1.5 py-0.5 font-mono text-[0.85em] border border-hairline-faint bg-tint text-foreground rounded-none">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('```')) {
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={key()} className="mb-4 mt-1 p-4 border border-border bg-page overflow-x-auto">
                    <code className="font-mono text-[12.5px] leading-[1.6] text-foreground whitespace-pre">
                        {codeLines.join('\n')}
                    </code>
                </pre>
            );
            i++;
            continue;
        }

        if (line.startsWith('## ')) {
            elements.push(
                <p key={key()} className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground mb-1.5 mt-2">
                    {line.slice(3)}
                </p>
            );
            i++;
            continue;
        }

        if (line.startsWith('---')) {
            elements.push(<hr key={key()} className="border-hairline-faint my-4" />);
            i++;
            continue;
        }

        if (line.startsWith('- ')) {
            elements.push(
                <li key={key()} className="text-sm font-light text-ink-soft leading-loose ml-4 list-disc marker:text-grey-3">
                    {renderInline(line.slice(2))}
                </li>
            );
            i++;
            continue;
        }

        if (line.trim() === '') {
            i++;
            continue;
        }

        elements.push(
            <p key={key()} className="text-sm font-light text-ink-soft leading-loose">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return <div>{elements}</div>;
}

// ─── Question Row ────────────────────────────────────────────────────────────

function QuestionCard({ question, index, onClick }: { question: Question; index: number; onClick: () => void }) {
    const diff = DIFFICULTY_CONFIG[question.difficulty];

    return (
        <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.055 }}
            onClick={onClick}
            className="w-full text-left group -mt-px first:mt-0"
        >
            <div className="border border-border bg-page px-4 py-3.5 flex items-center gap-4 hover:bg-tint transition-colors duration-200">
                <span className="font-mono text-sm font-extrabold tabular-nums text-grey-3 w-7 shrink-0 text-right select-none group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-mono text-sm font-bold tracking-[-0.01em] text-foreground leading-snug">
                            {question.title}
                        </h4>
                        <span className={`${CHIP_BASE} ${diff.className}`}>
                            {diff.label}
                        </span>
                        {question.optional && (
                            <Badge variant="default" className={`${CHIP_BASE} border-border text-muted-foreground`}>
                                Optional
                            </Badge>
                        )}
                        {question.premium && (
                            <Crown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground tabular-nums mt-1">{question.complexity}</p>
                </div>
                <span
                    className="font-mono text-sm text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all motion-reduce:transition-none"
                    aria-hidden="true"
                >
                    →
                </span>
            </div>
        </motion.button>
    );
}

// ─── Problem Modal ───────────────────────────────────────────────────────────

function ProblemModal({
    question, questionIndex, totalCount, weekTitle, onClose, onPrev, onNext, hasPrev, hasNext,
}: {
    question: Question; questionIndex: number; totalCount: number; weekTitle: string;
    onClose: () => void; onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
}) {
    const diff = DIFFICULTY_CONFIG[question.difficulty];

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col p-0 gap-0 rounded-none overflow-hidden border border-border shadow-[8px_8px_0_0_hsl(var(--foreground))]">

                {/* Header */}
                <div className="px-7 pt-5 pb-4 border-b border-border shrink-0">
                    {/* Context row */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`${CHIP_BASE} gap-1.5 border-border text-muted-foreground`}>
                            <BookOpen className="h-3 w-3" />
                            {weekTitle}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                            Problem {questionIndex + 1} of {totalCount}
                        </span>
                    </div>

                    <DialogHeader>
                        <DialogTitle className="font-mono text-xl font-extrabold tracking-[-0.02em] text-foreground leading-tight text-left">
                            {question.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            LeetCode problem: {question.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                        <span className={`${CHIP_BASE} ${diff.className}`}>
                            {diff.label}
                        </span>
                        {question.optional && (
                            <Badge variant="default" className={`${CHIP_BASE} border-border text-muted-foreground`}>
                                Optional
                            </Badge>
                        )}
                        {question.premium && (
                            <Crown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{question.complexity}</span>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-7 py-5 min-h-0">
                    <SimpleMarkdown content={question.content} />
                </div>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-border shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPrev}
                                disabled={!hasPrev}
                                className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1.5 border border-border text-foreground hover:bg-foreground hover:text-page transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!hasNext}
                                className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1.5 border border-border text-foreground hover:bg-foreground hover:text-page transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                            >
                                Next →
                            </button>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground text-right">
                            Bring your solution to Thursday's Coworking
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GuideToLeetCode() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentWeek, setCurrentWeek] = useState(1);

    useEffect(() => {
        getCurrent().then(setCurrentWeek);
    }, []);

    const displayWeek = WEEKS[Math.min(Math.max(currentWeek - 1, 0), WEEKS.length - 1)];
    const displayQuestions = displayWeek.questions;

    const activeId = searchParams.get('q') ? Number(searchParams.get('q')) : null;
    const activeIndex = activeId ? displayQuestions.findIndex(q => q.id === activeId) : -1;
    const activeQuestion = activeIndex >= 0 ? displayQuestions[activeIndex] : null;

    const openQuestion = (q: Question) => setSearchParams({ q: String(q.id) });
    const closeQuestion = () => setSearchParams({});
    const goToPrev = () => { if (activeIndex > 0) setSearchParams({ q: String(displayQuestions[activeIndex - 1].id) }); };
    const goToNext = () => { if (activeIndex < displayQuestions.length - 1) setSearchParams({ q: String(displayQuestions[activeIndex + 1].id) }); };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="relative">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            <button
                                onClick={() => navigate('/classes')}
                                className="hover:text-foreground transition-colors"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                                Classes
                            </button>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-foreground font-semibold">Guide to LeetCode</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Timer className="h-4 w-4 text-primary" />
                            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Next drop</span>
                            <CountdownInline />
                        </div>
                    </div>

                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                        Course
                    </p>
                    <h1 className="font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground">
                        Guide to LeetCode
                    </h1>
                    <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                        {WEEKS.length} weeks · {displayQuestions.length} problems this week · drops Sunday
                    </p>
                    <p className="mt-4 text-[15px] leading-relaxed font-light text-ink-soft max-w-[68ch]">
                        Five hand-picked LeetCode Premium problems drop every Sunday. Solve them before Thursday's Coworking Session — that's when we peer review, share solutions, and learn new techniques together.
                    </p>

                    <div className="mt-6 border border-border px-5 py-4">
                        <h2 className="font-mono text-base font-extrabold tracking-[-0.02em] text-foreground">
                            Required Submission for Every Problem
                        </h2>
                        <p className="mt-1 text-sm font-light text-muted-foreground">
                            Bring all four required elements to the weekly Coworking Session.
                        </p>
                        <ol className="mt-4 space-y-3 text-sm text-foreground">
                            <li>
                                <span className="font-mono text-xs font-bold">1. Plan (before coding):</span>
                                <ul className="ml-4 mt-1 list-disc marker:text-grey-3 space-y-0.5 font-light text-muted-foreground">
                                    <li>Pattern name</li>
                                    <li>Invariant</li>
                                    <li>Target time and space complexity</li>
                                </ul>
                            </li>
                            <li>
                                <span className="font-mono text-xs font-bold">2. Implementation:</span>
                                <ul className="ml-4 mt-1 list-disc marker:text-grey-3 space-y-0.5 font-light text-muted-foreground">
                                    <li>Clean code</li>
                                    <li>Only minimal comments for non obvious logic</li>
                                </ul>
                            </li>
                            <li>
                                <span className="font-mono text-xs font-bold">3. Postmortem:</span>
                                <ul className="ml-4 mt-1 list-disc marker:text-grey-3 space-y-0.5 font-light text-muted-foreground">
                                    <li>First point of failure</li>
                                    <li>What earlier signal indicated the correct pattern</li>
                                    <li>One future rule written as: Next time I will _____</li>
                                </ul>
                            </li>
                            <li>
                                <span className="font-mono text-xs font-bold">4. Flashcard:</span>
                                <span className="ml-1 font-light text-muted-foreground">1 to 3 bullets capturing the key takeaway in under 10 seconds of reading.</span>
                            </li>
                        </ol>
                        <p className="mt-3 text-sm font-light text-muted-foreground italic">
                            This forces reasoning to be explicit and prevents passive solving.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="border border-border bg-page"
            >
                <div className="hatch px-5 py-4 border-b border-border">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1 select-none">
                        This week
                    </p>
                    <h2 className="font-mono text-lg font-extrabold tracking-[-0.02em] text-foreground">{displayWeek.title}</h2>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-sm font-light text-ink-soft leading-relaxed">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mr-2">Goal</span>
                        {displayWeek.goal}
                    </p>
                    <ul className="text-sm font-light text-ink-soft leading-relaxed space-y-1.5 pl-4 list-disc marker:text-grey-3">
                        {displayWeek.rules.map((rule, i) => (
                            <li key={i}>{rule}</li>
                        ))}
                    </ul>
                </div>
            </motion.section>

            {/* ── Problems section ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
                    <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        This week's problems
                    </h2>
                    <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5" />
                            {displayWeek.title}
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums">
                            <FileText className="h-3.5 w-3.5" />
                            {displayQuestions.length} problems
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    {displayQuestions.map((q, i) => (
                        <QuestionCard key={q.id} question={q} index={i} onClick={() => openQuestion(q)} />
                    ))}
                </div>
            </div>

            {/* ── Modal ── */}
            <AnimatePresence>
                {activeQuestion && (
                    <ProblemModal
                        key={activeQuestion.id}
                        question={activeQuestion}
                        questionIndex={activeIndex}
                        totalCount={displayQuestions.length}
                        weekTitle={displayWeek.title}
                        onClose={closeQuestion}
                        onPrev={goToPrev}
                        onNext={goToNext}
                        hasPrev={activeIndex > 0}
                        hasNext={activeIndex < displayQuestions.length - 1}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
