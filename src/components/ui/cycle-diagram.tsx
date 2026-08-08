// Generic cycle diagram component for circular/iterative processes

export interface CyclePhase {
    title: string;
    color: string;
    bg: string;
    border: string;
    desc: string;
}

export interface CycleDiagramProps {
    phases: CyclePhase[];
    className?: string;
}

/** A phase whose legacy accent classes mention the accent is the ONE emphasized node. */
const isEmphasized = (phase: CyclePhase) => /primary|orange/.test(`${phase.color} ${phase.bg} ${phase.border}`);

export function CycleDiagram({ phases, className = '' }: CycleDiagramProps) {
    return (
        <div className={`my-8 ${className}`}>
            {phases.map((phase, i) => {
                const emphasized = isEmphasized(phase);
                return (
                    <div key={i}>
                        <div className="flex items-start gap-4">
                            <div
                                className={`px-4 py-3 shrink-0 min-w-[140px] bg-page ${emphasized ? 'border-2 border-primary' : 'border border-border'}`}
                            >
                                <p
                                    className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${emphasized ? 'text-primary' : 'text-foreground'}`}
                                >
                                    {phase.title}
                                </p>
                            </div>
                            <div className="flex-1 pt-1.5">
                                <p className="text-sm font-light text-muted-foreground leading-relaxed">{phase.desc}</p>
                            </div>
                        </div>
                        {i < phases.length - 1 && (
                            <div className="flex items-center justify-center w-[140px] py-1">
                                <span className="font-mono text-foreground select-none" aria-hidden="true">
                                    ↓
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
