/**
 * Lecture UI — layout, header, typography, callouts, and inline command tooltips
 *
 * Import from this module for all lecture and activity pages. Tooltips use the
 * app-level TooltipProvider in App.tsx (not provided here).
 *
 * Layout & chrome:
 *   LectureLayout     — max-width page shell with fade-in; auto prev/next footer on fundamentals session routes (from weeks.ts)
 *   LectureHeader     — breadcrumb + hero (week, session, title, description, icon)
 *
 * Typography:
 *   LectureSectionHeading, LectureSubHeading, LectureP, LectureTerm
 *
 * Blocks & inline:
 *   LectureCallout    — tip / warning / info boxes
 *   LectureTip        — inline term or monospace command with hover tip (code + optional warn)
 */

import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BookOpen, ChevronRight, Info, Lightbulb } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getFundamentalsFooterNavFromPathname,
    INTRODUCTION_TO_FUNDAMENTALS_BASE,
} from '@/pages/classes/introduction-to-fundamentals/weeks';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/** Inline `code` chip recipe, imposed on nested <code> elements (incl. legacy consumer classes). */
const INLINE_CODE_CHIP =
    '[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:border [&_code]:border-hairline-faint [&_code]:bg-tint [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-none';

// ─── Section Heading ──────────────────────────────────────────────────────────

/**
 * Top-level section heading with a numbered label and orange left border accent.
 */
interface LectureSectionHeadingProps {
    /** Zero-padded number shown in the left margin, e.g. "01", "02" */
    number: string;
    title: string;
}

export const LectureSectionHeading = ({ number, title }: LectureSectionHeadingProps) => (
    <div className="flex items-start gap-3 mt-12 mb-5 first:mt-6">
        <span className="font-mono text-xs font-medium tracking-[0.08em] tabular-nums text-grey-3 mt-1 w-7 shrink-0 text-right select-none">
            {number}
        </span>
        <h2 className="font-mono text-xl font-extrabold tracking-[-0.02em] leading-snug text-foreground border-l-2 border-primary pl-4">
            {title}
        </h2>
    </div>
);

// ─── Sub Heading ──────────────────────────────────────────────────────────────

/** Subsection heading — sits inside a section, no number. */
export const LectureSubHeading = ({ title }: { title: string }) => (
    <h3 className="font-mono text-lg font-extrabold tracking-[-0.02em] text-foreground mt-8 mb-3">{title}</h3>
);

// ─── Paragraph ───────────────────────────────────────────────────────────────

/**
 * Body paragraph. Accepts any React children so you can embed
 * LectureTip (term or code mode), LectureTerm, or plain <code> inline.
 */
export const LectureP = ({ children }: { children: React.ReactNode }) => (
    <p className={`text-[16px] md:text-[17px] leading-[1.65] font-light text-ink-soft max-w-[720px] ${INLINE_CODE_CHIP}`}>
        {children}
    </p>
);

// ─── Term ─────────────────────────────────────────────────────────────────────

/** Inline bold term — for introducing key vocabulary. */
export const LectureTerm = ({ children }: { children: string }) => (
    <span className="font-semibold text-foreground">{children}</span>
);

// ─── Inline term or command + tooltip ─────────────────────────────────────────

interface LectureTipProps {
    children: string;
    tip: string;
    /** When true, render as monospace code chip (warn styling applies only in this mode). */
    code?: boolean;
    /** Dangerous / fragile; only applies when code is true */
    warn?: boolean;
}

export const LectureTip = ({ children, tip, code = false, warn }: LectureTipProps) => {
    const showWarn = code && warn;
    const Trigger = code ? 'code' : 'span';
    const triggerClassName = code
        ? `
          font-mono text-[0.85em] border border-hairline-faint bg-tint px-1.5 py-0.5 rounded-none cursor-help transition-colors duration-200
          ${showWarn
                ? 'text-destructive font-medium hover:border-destructive'
                : 'text-foreground hover:border-primary hover:text-primary'
            }
        `
        : 'font-medium text-foreground cursor-help underline decoration-dotted decoration-grey-3 underline-offset-4 hover:decoration-primary transition-colors duration-200';

    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <Trigger className={triggerClassName}>{children}</Trigger>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className={`max-w-xs font-mono text-xs leading-relaxed rounded-none ${showWarn ? 'border-destructive text-destructive' : ''}`}
            >
                {showWarn && <AlertTriangle className="inline h-3 w-3 mr-1 text-destructive" />}
                {tip}
            </TooltipContent>
        </Tooltip>
    );
};

// ─── Callout ──────────────────────────────────────────────────────────────────

interface LectureCalloutProps {
    type: 'tip' | 'warning' | 'info';
    children: React.ReactNode;
}

const CALLOUT_STYLES = {
    tip: {
        border: 'border-primary',
        icon: <Lightbulb className="h-3.5 w-3.5 shrink-0" />,
        label: 'Tip',
        labelColor: 'text-primary',
    },
    warning: {
        border: 'border-destructive',
        icon: <AlertTriangle className="h-3.5 w-3.5 shrink-0" />,
        label: 'Warning',
        labelColor: 'text-destructive',
    },
    info: {
        border: 'border-foreground',
        icon: <Info className="h-3.5 w-3.5 shrink-0" />,
        label: 'Note',
        labelColor: 'text-muted-foreground',
    },
};

export const LectureCallout = ({ type, children }: LectureCalloutProps) => {
    const s = CALLOUT_STYLES[type];
    return (
        <div className={`my-6 border-l-2 ${s.border} pl-4 py-0.5`}>
            <p className={`flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5 select-none ${s.labelColor}`}>
                {s.icon}
                {s.label}
            </p>
            <div className={`text-[15px] leading-relaxed font-light text-ink-soft max-w-[720px] ${INLINE_CODE_CHIP}`}>
                {children}
            </div>
        </div>
    );
};

// ─── Page header ──────────────────────────────────────────────────────────────

interface LectureHeaderProps {
    week: number;
    /** e.g. "Lecture 1", "Lecture 2", "Activity" */
    session: string;
    title: string;
    description: string;
    /** Icon rendered inside the small square badge next to the session label */
    icon: React.ReactNode;
}

export const LectureHeader = ({
    week,
    session,
    title,
    description,
    icon,
}: LectureHeaderProps) => {
    const navigate = useNavigate();

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-8"
            >
                <BookOpen className="h-3.5 w-3.5" />
                <button
                    type="button"
                    onClick={() => navigate('/classes')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                    Classes
                </button>
                <ChevronRight className="h-3 w-3" />

                <button
                    type="button"
                    onClick={() => navigate(INTRODUCTION_TO_FUNDAMENTALS_BASE)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                    Introduction to Fundamentals
                </button>
                <ChevronRight className="h-3 w-3" />
                <button
                    type="button"
                    onClick={() => navigate(`${INTRODUCTION_TO_FUNDAMENTALS_BASE}?s=${week}`)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                    Week {week}
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-semibold">{session}</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-8 pb-8 border-b border-border"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 border border-border text-primary flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                        Week {week} · {session}
                    </span>
                </div>
                <h1 className="font-mono font-extrabold tracking-[-0.03em] text-[clamp(28px,4vw,40px)] leading-[1.1] text-foreground mb-3">
                    {title}
                </h1>
                <p className="text-[16px] md:text-[17px] leading-[1.65] font-light text-ink-soft max-w-[720px]">{description}</p>
            </motion.div>
        </>
    );
};

// ─── Page layout ───────────────────────────────────────────────────────────────

export interface LectureFooterNavItem {
    label: string;
    onClick: () => void;
}

function LectureLayoutFooter({ prev, next }: { prev?: LectureFooterNavItem; next?: LectureFooterNavItem }) {
    return (
        <div className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4">
            {prev ? (
                <button
                    type="button"
                    onClick={prev.onClick}
                    className="group flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                    <ArrowLeft className="h-3.5 w-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform motion-reduce:transition-none" />
                    {prev.label}
                </button>
            ) : (
                <div />
            )}
            {next ? (
                <button
                    type="button"
                    onClick={next.onClick}
                    className="group flex items-center gap-2 font-mono text-xs font-semibold text-primary hover:text-accent-hover transition-colors text-right"
                >
                    {next.label}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
                </button>
            ) : (
                <div />
            )}
        </div>
    );
}

export const LectureLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const links = getFundamentalsFooterNavFromPathname(location.pathname);
    const footerNav: { prev?: LectureFooterNavItem; next?: LectureFooterNavItem } | undefined = links
        ? {
              prev: links.prev
                  ? { label: links.prev.title, onClick: () => navigate(links.prev.path) }
                  : undefined,
              next: links.next
                  ? { label: links.next.title, onClick: () => navigate(links.next.path) }
                  : undefined,
          }
        : undefined;
    const showFooter = footerNav && (footerNav.prev || footerNav.next);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 py-8"
        >
            {children}
            {showFooter ? <LectureLayoutFooter {...footerNav} /> : null}
        </motion.div>
    );
};
