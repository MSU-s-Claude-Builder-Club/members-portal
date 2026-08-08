// Generic comparison diagram component for side-by-side comparisons

export interface ComparisonItem {
    label: string;
    color: string;
    border: string;
    header: string;
    content: React.ReactNode;
    footer?: React.ReactNode;
}

export interface ComparisonDiagramProps {
    items: ComparisonItem[];
    className?: string;
}

/** An item whose legacy accent classes mention the accent is the ONE emphasized side. */
const isEmphasized = (item: ComparisonItem) => /primary|orange/.test(`${item.color} ${item.border} ${item.header}`);

export function ComparisonDiagram({ items, className = '' }: ComparisonDiagramProps) {
    return (
        <div className={`my-8 grid grid-cols-1 md:grid-cols-2 pt-px pl-px ${className}`}>
            {items.map((item) => {
                const emphasized = isEmphasized(item);
                return (
                    <div key={item.label} className="-mt-px -ml-px border border-border bg-page">
                        <div className="hatch px-4 py-2.5 border-b border-border select-none">
                            <p
                                className={`font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${emphasized ? 'text-primary' : 'text-foreground'}`}
                            >
                                {item.label}
                            </p>
                        </div>
                        <div className="p-4 text-sm font-light leading-relaxed text-ink-soft">
                            {item.content}
                            {item.footer && (
                                <div className="mt-4 pt-3 border-t border-hairline-faint">{item.footer}</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
