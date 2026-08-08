/**
 * TerminalBlock
 *
 * A styled terminal window for displaying commands in lecture pages.
 * Commands and comments are intentionally non-selectable to encourage students to type.
 *
 * Usage:
 *   <TerminalBlock
 *     title="bash — ~/projects"        // optional, defaults to "bash — ~"
 *     lines={[
 *       { comment: "create a file", cmd: "touch notes.txt" },
 *       { cmd: "ls -la" },
 *     ]}
 *   />
 */

interface TerminalLine {
    /** Optional grey comment shown above the command (like a # bash comment) */
    comment?: string;
    /** The command itself — shown in ink after the orange prompt, non-selectable */
    cmd: string;
}

interface TerminalBlockProps {
    lines: TerminalLine[];
    /** Text shown in the title bar. Defaults to "bash — ~" */
    title?: string;
}

export const TerminalBlock = ({ lines, title = 'bash — ~' }: TerminalBlockProps) => (
    <div className="my-6 border border-border bg-page font-mono">
        {/* Title bar */}
        <div className="hatch h-[38px] px-4 flex items-center gap-2 border-b border-border select-none">
            <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
            <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
            <span className="w-[9px] h-[9px] rounded-full bg-grey-3 shrink-0" />
            <span className="ml-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground truncate">
                {title}
            </span>
        </div>
        {/* Body */}
        <div className="px-5 py-4 space-y-1 text-[12.5px] leading-[1.6] overflow-x-auto">
            {lines.map((line, i) => (
                <div key={i}>
                    {line.comment && (
                        <p className="text-grey-2 italic mb-1 mt-3 first:mt-0 select-none whitespace-pre"># {line.comment}</p>
                    )}
                    <p
                        className="text-foreground font-medium select-none whitespace-pre"
                        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                        <span className="text-primary font-semibold mr-2">$</span>
                        {line.cmd}
                    </p>
                </div>
            ))}
        </div>
    </div>
);
