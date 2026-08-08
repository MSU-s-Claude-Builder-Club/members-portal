// Generic card grid component for displaying cards in a grid layout

export interface CardItem {
    id: string;
    title: string;
    subtitle?: string;
    color: string;
    bg: string;
    border: string;
    content: React.ReactNode;
}

export interface CardGridProps {
    cards: CardItem[];
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

/** A card whose legacy accent classes mention the accent is the ONE emphasized cell. */
const isEmphasized = (card: CardItem) => /primary|orange/.test(`${card.color} ${card.bg} ${card.border}`);

export function CardGrid({ cards, columns = 3, className = '' }: CardGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={`my-6 grid ${gridCols[columns]} pt-px pl-px ${className}`}>
            {cards.map((card) => {
                const emphasized = isEmphasized(card);
                return (
                    <div key={card.id} className="-mt-px -ml-px border border-border bg-page">
                        <div className="px-4 py-3 border-b border-hairline-faint">
                            <p
                                className={`font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${emphasized ? 'text-primary' : 'text-foreground'}`}
                            >
                                {card.title}
                            </p>
                            {card.subtitle && (
                                <p className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground mt-0.5">
                                    {card.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="px-4 py-3 text-sm font-light leading-relaxed text-ink-soft">
                            {card.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
