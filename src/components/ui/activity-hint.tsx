/**
 * ActivityHint
 *
 * A collapsible hint accordion for activity pages. Students must click to
 * reveal the hint, nudging them to try on their own first. The label gives
 * a topic so they can decide if it's relevant without opening everything.
 *
 * Usage:
 *   <ActivityHint label="creating everything at once">
 *     mkdir -p can take multiple paths separated by spaces...
 *   </ActivityHint>
 */

import { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';

interface ActivityHintProps {
    /** Short topic label shown in the collapsed state */
    label: string;
    children: React.ReactNode;
}

export const ActivityHint = ({ label, children }: ActivityHintProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="my-3 border border-border">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-tint transition-colors duration-200 text-left"
            >
                <span className="flex items-baseline gap-2 min-w-0">
                    <Lightbulb className="h-3 w-3 shrink-0 self-center text-primary" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground shrink-0">
                        Hint
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
                </span>
                <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="px-4 py-3 text-sm font-light text-ink-soft leading-relaxed border-t border-hairline-faint [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:border [&_code]:border-hairline-faint [&_code]:bg-tint [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-none">
                    {children}
                </div>
            )}
        </div>
    );
};
