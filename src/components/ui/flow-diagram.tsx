// Generic flow diagram component for pipeline/process flows

export interface FlowStage {
    label: string;
    icon?: string;
    desc: string;
    color: string;
    bg: string;
}

export interface FlowDiagramProps {
    stages: FlowStage[];
    description?: string;
    className?: string;
}

/** A stage whose legacy accent classes mention the accent is the ONE emphasized node. */
const isEmphasized = (stage: FlowStage) => /primary|orange/.test(`${stage.color} ${stage.bg}`);

export function FlowDiagram({ stages, description, className = '' }: FlowDiagramProps) {
    return (
        <div className={`my-8 ${className}`}>
            <div className="flex items-center overflow-x-auto pb-2">
                {stages.map((stage, i) => {
                    const emphasized = isEmphasized(stage);
                    return (
                        <div key={stage.label} className="flex items-center shrink-0">
                            <div
                                className={`px-4 py-3 text-center min-w-[90px] bg-page ${emphasized ? 'border-2 border-primary' : 'border border-border'}`}
                            >
                                {stage.icon && (
                                    <p className="font-mono text-base leading-none mb-1 text-foreground select-none">
                                        {stage.icon}
                                    </p>
                                )}
                                <p
                                    className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] mt-0.5 ${emphasized ? 'text-primary' : 'text-foreground'}`}
                                >
                                    {stage.label}
                                </p>
                                <p className="text-xs font-light text-muted-foreground mt-1 leading-tight">
                                    {stage.desc}
                                </p>
                            </div>
                            {i < stages.length - 1 && (
                                <span
                                    className="font-mono text-sm text-foreground shrink-0 px-1.5 select-none"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {description && (
                <p className="text-xs font-light text-muted-foreground mt-3 leading-relaxed max-w-[720px]">
                    {description}
                </p>
            )}
        </div>
    );
}
