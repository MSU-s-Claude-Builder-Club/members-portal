import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Trophy, Mail, GraduationCap, Crown, Users, Award, Settings, UserMinus, Ban, ArrowBigUpDashIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/database.types';
import type { AppRole } from '@/contexts/AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MemberWithRole extends Profile {
    role: AppRole;
}

interface PersonCardProps {
    person: MemberWithRole;
    onViewProfile: (person: MemberWithRole) => void;
    onRoleChange?: (personId: string, newRole: AppRole) => void;
    onKick?: (personId: string, personName: string) => void;
    onBan?: (personId: string, personName: string) => void;
    onGraduate?: (personId: string, personName: string) => void;
    canManage: boolean;
    canChangeRoles?: boolean;
    isMobile: boolean;
    currentUserId?: string;
    currentUserRole?: AppRole;
    type: 'member' | 'prospect';
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/** The one role-chip mapping (mono, uppercase, square). group-hover classes answer the tile's ink flood. */
const CHIP_BASE =
    'inline-flex shrink-0 items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200';

const ROLE_CHIP: Record<string, string> = {
    'e-board': 'bg-primary text-primary-foreground border-primary',
    board: 'bg-foreground text-page border-foreground group-hover:bg-page group-hover:text-foreground group-hover:border-page',
    member: 'border-border text-foreground group-hover:border-page/60 group-hover:text-page',
    prospect: 'border-grey-3 text-grey-2 group-hover:border-page/40 group-hover:text-page/70',
};

const BANNED_CHIP =
    'border-border text-muted-foreground line-through decoration-primary decoration-2 group-hover:border-page/40 group-hover:text-page/60';

export const PersonCard = ({
    person,
    onViewProfile,
    onRoleChange,
    onKick,
    onBan,
    onGraduate,
    canManage,
    canChangeRoles = false,
    isMobile,
    currentUserId,
    currentUserRole,
    type,
}: PersonCardProps) => {
    // Board cannot manage themselves, board members, or e-board members
    const canManageThisPerson =
        canManage &&
        currentUserId !== person.id &&
        !(currentUserRole === 'board' && (person.role === 'board' || person.role === 'e-board'));

    const showManageButton = canManageThisPerson && !isMobile;

    // Board cannot promote to e-board
    const canPromoteToEBoard = currentUserRole !== 'board';

    const chipClass = person.is_banned ? BANNED_CHIP : (ROLE_CHIP[person.role] ?? ROLE_CHIP.member);

    const termLabel = person.term_joined
        ? person.term_joined
        : (() => {
            const date = person.created_at ? new Date(person.created_at) : new Date();
            return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        })();

    return (
        <div
            className="group relative flex h-full w-full cursor-pointer flex-col border border-border bg-page p-4 transition-colors duration-200 hover:border-foreground hover:bg-foreground motion-reduce:transition-none"
            onClick={() => onViewProfile(person)}
        >
            {/* Identity row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-12 w-12 shrink-0 rounded-none border border-border transition-colors duration-200 group-hover:border-page/40">
                        <AvatarImage src={person.profile_picture_url || undefined} className="rounded-none" />
                        <AvatarFallback className="rounded-none font-mono text-sm text-muted-foreground group-hover:text-page/70">
                            {person.full_name ? getInitials(person.full_name) : person.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-page">
                            {person.full_name || 'No name'}
                        </p>
                        {type === 'member' && person.position && (
                            <p className="truncate text-xs text-muted-foreground transition-colors duration-200 group-hover:text-page/60">
                                {person.position}
                            </p>
                        )}
                        {type === 'prospect' && (
                            <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors duration-200 group-hover:text-page/60">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{person.email}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Chip */}
                {type === 'member' ? (
                    <span className={`${CHIP_BASE} ${chipClass}`}>{person.role}</span>
                ) : (
                    <span className={`${CHIP_BASE} ${person.is_banned ? BANNED_CHIP : ROLE_CHIP.prospect}`}>
                        {termLabel}
                    </span>
                )}
            </div>

            {/* Meta row */}
            <div className="mt-4 flex flex-1 items-end justify-between gap-3 text-xs">
                {person.class_year ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-page/60">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span className="capitalize">{person.class_year}</span>
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-page/60">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        No class year
                    </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-page/60">
                    <Trophy className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground transition-colors duration-200 group-hover:text-page">
                        {person.points}
                    </span>
                </span>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline-faint pt-3 transition-colors duration-200 group-hover:border-page/20">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(person);
                    }}
                    className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:text-primary group-hover:text-page"
                >
                    View profile
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">
                        →
                    </span>
                </button>

                {showManageButton && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Manage"
                                title="Manage"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="h-8 w-8 shrink-0 p-0 group-hover:border-page/40 group-hover:text-page"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-44" onClick={(e) => e.stopPropagation()}>
                            {/* Member Management - Only show role change for e-board */}
                            {type === 'member' && onRoleChange && canChangeRoles && (
                                <>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger variant="ghost" className="font-mono text-xs uppercase tracking-[0.08em]">
                                            <Crown className="h-4 w-4 mx-1" />
                                            Change Role
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem
                                                onClick={() => onRoleChange(person.id, 'member')}
                                                disabled={person.role === 'member'}
                                                className="font-mono text-xs uppercase tracking-[0.08em]"
                                            >
                                                <Users className="h-4 w-4" />
                                                Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onRoleChange(person.id, 'board')}
                                                disabled={person.role === 'board'}
                                                className="font-mono text-xs uppercase tracking-[0.08em]"
                                            >
                                                <Award className="h-4 w-4" />
                                                Board
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onRoleChange(person.id, 'e-board')}
                                                disabled={person.role === 'e-board' || !canPromoteToEBoard}
                                                className="font-mono text-xs uppercase tracking-[0.08em]"
                                            >
                                                <Crown className="h-4 w-4" />
                                                E-Board
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Graduate (Prospects only) */}
                            {type === 'prospect' && onGraduate && (
                                <DropdownMenuItem
                                    onClick={() => onGraduate(person.id, person.full_name || person.email)}
                                    className="font-mono text-xs uppercase tracking-[0.08em] text-primary focus:bg-primary focus:text-primary-foreground"
                                >
                                    <ArrowBigUpDashIcon className="h-4 w-4" />
                                    Graduate
                                </DropdownMenuItem>
                            )}

                            {/* Kick */}
                            {onKick && (
                                <DropdownMenuItem
                                    onClick={() => onKick(person.id, person.full_name || person.email)}
                                    className="font-mono text-xs uppercase tracking-[0.08em] text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                    <UserMinus className="h-4 w-4" />
                                    {type === 'member' ? 'Kick Member' : 'Kick Prospect'}
                                </DropdownMenuItem>
                            )}

                            {/* Ban */}
                            {onBan && (
                                <DropdownMenuItem
                                    onClick={() => onBan(person.id, person.full_name || person.email)}
                                    className="font-mono text-xs uppercase tracking-[0.08em] text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                    <Ban className="h-4 w-4" />
                                    {type === 'member' ? 'Ban Member' : 'Ban Prospect'}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
