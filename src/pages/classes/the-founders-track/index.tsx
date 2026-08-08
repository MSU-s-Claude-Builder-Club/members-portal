import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    BookOpen,
    Timer,
    MapPin,
    Building2,
    GraduationCap,
    Briefcase,
    TrendingUp,
    Zap,
    BarChart2,
    DollarSign,
    Award,
    PieChart,
    Target,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { WEEKS, getCurrent, type WeekConfig, type PortfolioEntry } from './weeks';
import { getActiveSemesterStartIso, getNextDropDeadline } from '@/lib/semester';

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

// ─── Countdown inline ─────────────────────────────────────────────────────────

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
                                    {unit.pad
                                        ? String(unit.value).padStart(2, '0')
                                        : unit.value}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p className="text-xs">{unit.label}</p>
                        </TooltipContent>
                    </Tooltip>
                    {i < units.length - 1 && (
                        <span className="font-mono text-xs font-bold text-grey-3 mx-0.5 select-none">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Experience Timeline ──────────────────────────────────────────────────────

function ExperienceTimeline({ experience }: { experience: WeekConfig['persona']['experience'] }) {
    const showLine = experience.length > 1;
    return (
        <div className="relative">
            {showLine && (
                <div
                    className="absolute left-4 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
                    aria-hidden
                />
            )}
            <div className="space-y-5">
                {experience.map((exp, i) => (
                    <div key={i} className="relative flex gap-5 items-start">
                        <div className="w-8 shrink-0 flex justify-center pt-1.5 relative z-10">
                            <div className="w-2 h-2 bg-foreground outline outline-2 outline-page" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mt-0.5">{exp.company}</p>
                                </div>
                                <span className="font-mono text-xs text-muted-foreground tabular-nums">{exp.years}</span>
                            </div>
                            <p className="text-sm font-light text-muted-foreground leading-relaxed mt-1">
                                {exp.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Portfolio (quote cards: note is primary, company + stage as label) ─────────

function PortfolioList({ portfolio }: { portfolio: PortfolioEntry[]; weekTitle: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 pt-px pl-px">
            {portfolio.map((entry, i) => (
                <div
                    key={i}
                    className="relative -mt-px -ml-px border border-border bg-page p-4 text-left"
                >
                    <p className="text-sm font-light text-ink-soft leading-relaxed italic pr-12">
                        "{entry.note}"
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">{entry.company}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold px-2 py-0.5 border border-border text-muted-foreground">
                            {entry.stage}
                        </span>
                    </div>
                    <span
                        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center border border-hairline-faint text-muted-foreground"
                        aria-hidden
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Persona Card ─────────────────────────────────────────────────────────────

function PersonaCard({ week }: { week: WeekConfig }) {
    const { persona } = week;

    const getStatIcon = (label: string) => {
        const lower = label.toLowerCase();
        if (lower.includes('fund')) return <DollarSign className="h-3.5 w-3.5" />;
        if (lower.includes('portfolio')) return <PieChart className="h-3.5 w-3.5" />;
        if (lower.includes('exit') || lower.includes('unicorn')) return <Award className="h-3.5 w-3.5" />;
        if (lower.includes('check') || lower.includes('entry')) return <BarChart2 className="h-3.5 w-3.5" />;
        if (lower.includes('years')) return <Timer className="h-3.5 w-3.5" />;
        return <Target className="h-3.5 w-3.5" />;
    };
    return (
        <motion.div
            key={week.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
        >
            {/* ── Identity block ── */}
            <div className="border border-border bg-page">
                {/* Top chrome strip */}
                <div className="h-14 hatch border-b border-border" />

                <div className="px-5 pb-5">
                    {/* Avatar (square, the one orange) + name row */}
                    <div className="flex items-end gap-4 -mt-8 mb-4">
                        <div className="w-16 h-16 border border-border bg-primary flex items-center justify-center shrink-0">
                            <span className="font-mono text-xl font-extrabold text-primary-foreground select-none">
                                {persona.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="pb-1 min-w-0">
                            <h2 className="font-mono text-lg font-extrabold tracking-[-0.02em] text-foreground leading-tight truncate">{persona.name}</h2>
                            <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">{persona.title} · {persona.company}</p>
                        </div>
                    </div>

                    {/* Badges: company, location, education (level + school, no dates) */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground border border-border px-2 py-0.5">
                            <Building2 className="h-3 w-3" />
                            {persona.company}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground border border-border px-2 py-0.5">
                            <MapPin className="h-3 w-3" />
                            {persona.location}
                        </span>
                        {persona.education.map((edu, i) => {
                            const level = edu.degree.split(/\s+/)[0] ?? edu.degree;
                            return (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground border border-border px-2 py-0.5"
                                >
                                    <GraduationCap className="h-3 w-3" />
                                    {level} · {edu.school}
                                </span>
                            );
                        })}
                    </div>

                    {/* About */}
                    <div className="space-y-2">
                        {persona.about.trim().split('\n\n').map((para, i) => (
                            <p key={i} className="text-[15px] font-light text-ink-soft leading-relaxed max-w-[68ch]">
                                {para.trim()}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats grid (hairline-collapsed bento) ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 pt-px pl-px">
                {persona.stats.map((stat, i) => (
                    <div
                        key={i}
                        className="-mt-px -ml-px border border-border bg-page px-4 py-3.5 flex items-stretch justify-between gap-3"
                    >
                        <span className="font-sans text-2xl font-bold tracking-[-0.02em] text-foreground leading-none tabular-nums self-center">
                            {stat.value}
                        </span>
                        <div className="flex flex-col items-end justify-between shrink-0">
                            <span className="inline-flex items-center justify-center border border-hairline-faint w-6 h-6 text-muted-foreground">
                                {getStatIcon(stat.label)}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground text-right leading-snug line-clamp-2 mt-1">
                                {stat.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Experience ── */}
            <div className="border border-border bg-page">
                <div className="hatch px-5 py-3.5 border-b border-border flex items-center gap-2.5 select-none">
                    <span className="text-muted-foreground"><Briefcase className="h-4 w-4" /></span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Experience</span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums border border-hairline-faint px-1.5 py-0.5">
                        {persona.experience.length}
                    </span>
                </div>
                <div className="p-5 pt-4">
                    <ExperienceTimeline experience={persona.experience} />
                </div>
            </div>

            {/* ── Portfolio ── */}
            <div className="border border-border bg-page">
                <div className="hatch px-5 py-3.5 border-b border-border flex items-center gap-2.5 select-none">
                    <span className="text-muted-foreground"><TrendingUp className="h-4 w-4" /></span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Portfolio</span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums border border-hairline-faint px-1.5 py-0.5">
                        {persona.portfolio.length}
                    </span>
                </div>
                <div className="p-5 pt-4">
                    <PortfolioList portfolio={persona.portfolio} weekTitle={week.title} />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TheFoundersTrack() {
    const navigate = useNavigate();
    const [currentWeek, setCurrentWeek] = useState(1);

    useEffect(() => {
        getCurrent().then(setCurrentWeek);
    }, []);

    const displayWeek = WEEKS[Math.min(Math.max(currentWeek - 1, 0), WEEKS.length - 1)];

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
                            <span className="text-foreground font-semibold">The Founder's Track</span>
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
                        The Founder's Track
                    </h1>
                    <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                        {WEEKS.length} weeks · 1 investor persona weekly · defended Thursdays
                    </p>
                    <p className="mt-4 text-[15px] leading-relaxed font-light text-ink-soft max-w-[68ch]">
                        An internal accelerator for students who are building something. Every Thursday at Coworking, you'll defend your progress in front of a different investor persona — each one attacking from a completely different angle.
                    </p>
                </div>
            </motion.div>

            {/* ── How it works ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="border border-border px-5 py-5 space-y-4"
            >
                <h2 className="font-mono text-base font-extrabold tracking-[-0.02em] text-foreground">How it works</h2>
                <ol className="space-y-4 text-sm">
                    <li className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 border border-border flex items-center justify-center font-mono text-[11px] font-bold text-foreground tabular-nums">
                            1
                        </span>
                        <div className="space-y-1">
                            <p className="font-semibold text-foreground">Read the persona like a brief</p>
                            <p className="font-light text-muted-foreground leading-relaxed max-w-[68ch]">
                                Skim their background, experience, and portfolio notes to understand how they actually think about companies. You are looking for what they care about, not for a list of canned questions.
                            </p>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 border border-border flex items-center justify-center font-mono text-[11px] font-bold text-foreground tabular-nums">
                            2
                        </span>
                        <div className="space-y-1">
                            <p className="font-semibold text-foreground">Build and plan real conversations</p>
                            <p className="font-light text-muted-foreground leading-relaxed max-w-[68ch]">
                                In the startup world you are not making slideshows — you are talking to people and adapting to their interests. Use the persona to decide what progress to make this week and how you would explain it to this specific investor.
                            </p>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 border border-border flex items-center justify-center font-mono text-[11px] font-bold text-foreground tabular-nums">
                            3
                        </span>
                        <div className="space-y-1">
                            <p className="font-semibold text-foreground">Test it live at Coworking</p>
                            <p className="font-light text-muted-foreground leading-relaxed max-w-[68ch]">
                                At Thursday Coworking the teacher becomes the persona and you defend your progress in a Socratic seminar. Treat it like a practice investor meeting: listen closely, respond in real time, and adjust when you realize what they actually care about.
                            </p>
                        </div>
                    </li>
                </ol>
            </motion.div>

            {/* ── Persona ── */}
            <PersonaCard week={displayWeek} />

        </div>
    );
}
