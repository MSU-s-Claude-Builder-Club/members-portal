import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { MetadataItem, CardAction, MembershipInfo } from '@/types/modal.types';

interface ItemCardProps {
    title: string;
    badges?: React.ReactNode[];
    metadata?: MetadataItem[];
    description?: string;
    members?: {
        data: MembershipInfo[];
        onViewAll?: () => void;
        maxDisplay?: number;
    };
    actions?: CardAction[];
    className?: string;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const ItemCard = ({
    title,
    badges,
    metadata,
    description,
    members,
    actions,
    className = '',
}: ItemCardProps) => {
    const maxDisplay = members?.maxDisplay || 5;
    const displayedMembers = members?.data.slice(0, maxDisplay) || [];
    const remainingCount = (members?.data.length || 0) - maxDisplay;

    const iconActions = actions?.filter(a => a.size === 'icon') ?? [];
    const mainActions = actions?.filter(a => a.size !== 'icon') ?? [];

    return (
        <div
            className={cn(
                'group flex h-full w-full flex-col border border-border bg-page p-5 transition-colors duration-200 hover:bg-foreground hover:text-page',
                className
            )}
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
                <h3 className="min-w-0 flex-1 font-sans text-lg font-bold leading-snug tracking-[-0.01em]">
                    {title}
                </h3>
                {(badges?.length ?? 0) > 0 || iconActions.length > 0 ? (
                    <div className="flex shrink-0 flex-row items-center gap-2">
                        {badges && badges.length > 0 && (
                            <>
                                {badges.map((badge, index) => (
                                    <div key={index}>{badge}</div>
                                ))}
                            </>
                        )}
                        {iconActions.length > 0 && (
                            <>
                                {iconActions.map((action, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={action.onClick}
                                        disabled={action.disabled || action.loading}
                                        title={action.label}
                                        className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-hover:text-page/60 group-hover:hover:text-primary [&_svg]:h-4 [&_svg]:w-4"
                                    >
                                        {action.icon}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                ) : null}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                {/* Metadata — mono meta rows */}
                {metadata && metadata.length > 0 && (
                    <div className="space-y-2 pt-3 font-mono text-xs text-muted-foreground transition-colors group-hover:text-page/60">
                        {metadata.map((item, index) => (
                            <div key={index}>
                                {item.render ? (
                                    item.render(item)
                                ) : (
                                    <div
                                        className={`flex items-center gap-2 ${item.interactive
                                            ? 'w-fit cursor-pointer transition-colors hover:text-primary'
                                            : ''
                                            }`}
                                        onClick={item.onClick}
                                    >
                                        <span className="shrink-0">{item.icon}</span>
                                        <span
                                            className={`min-w-0 tabular-nums ${item.interactive
                                                ? 'underline decoration-transparent underline-offset-4 transition-all hover:decoration-primary'
                                                : ''
                                                }`}
                                        >
                                            {item.text}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Members — square-avatar hairline filmstrip */}
                {members && members.data.length > 0 && (
                    <div className="pt-3">
                        <div className="flex">
                            {displayedMembers.map((member) => (
                                <Avatar
                                    key={member.id}
                                    className="-ml-px h-8 w-8 shrink-0 rounded-none border border-border transition-colors first:ml-0 group-hover:border-page/40"
                                >
                                    <AvatarImage src={member.profile.profile_picture_url || undefined} />
                                    <AvatarFallback className="rounded-none bg-page font-mono text-[10px] text-foreground">
                                        {member.profile.full_name
                                            ? getInitials(member.profile.full_name)
                                            : member.profile.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {remainingCount > 0 && (
                                <div className="-ml-px flex h-8 w-8 shrink-0 items-center justify-center border border-border font-mono text-[10px] tabular-nums transition-colors group-hover:border-page/40">
                                    +{remainingCount}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Description — reading voice */}
                {description && (
                    <div className="min-h-0 flex-1 space-y-3 whitespace-pre-line break-words pt-3 text-sm leading-relaxed text-ink-soft line-clamp-3 transition-colors group-hover:text-page/80">
                        {description}
                    </div>
                )}

                {/* Actions: main actions only (icon actions are in header) */}
                {mainActions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                        {mainActions.map((action, index) => (
                            <Button
                                key={index}
                                className="w-full"
                                variant={action.variant || 'default'}
                                onClick={action.onClick}
                                disabled={action.disabled || action.loading}
                            >
                                {action.icon}
                                {action.loading ? 'Loading...' : action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
