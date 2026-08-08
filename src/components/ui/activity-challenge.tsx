/**
 * ActivityChallenge
 *
 * A card container for a single challenge within an activity page.
 * Hatched chrome strip with a mono CHALLENGE eyebrow and number, title and
 * description below, with a content area for tasks, terminal blocks, hints,
 * and callouts.
 *
 * Usage:
 *   <ActivityChallenge
 *     number="1.1"
 *     title="Build a Project Structure"
 *     description="Create a specific directory layout using only terminal commands."
 *   >
 *     <ActivityTask>Create the directory tree using mkdir -p</ActivityTask>
 *     <ActivityHint label="creating everything at once">...</ActivityHint>
 *   </ActivityChallenge>
 */

interface ActivityChallengeProps {
    /** Display number, e.g. "1.1", "2.3", "★" */
    number: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

export const ActivityChallenge = ({
    number,
    title,
    description,
    children,
}: ActivityChallengeProps) => (
    <div className="my-8 border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]">
        {/* Chrome strip */}
        <div className="hatch h-[38px] px-4 flex items-center justify-between gap-3 border-b border-border select-none">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Challenge
            </span>
            <span className="font-mono text-[10.5px] font-bold tracking-[0.08em] text-primary tabular-nums">
                {number}
            </span>
        </div>
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline-faint">
            <h3 className="font-mono text-lg font-extrabold tracking-[-0.02em] text-foreground">{title}</h3>
            <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground max-w-[720px]">
                {description}
            </p>
        </div>
        <div className="p-5">{children}</div>
    </div>
);
