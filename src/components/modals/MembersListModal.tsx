import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { X, Plus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import type { MembershipInfo, Profile } from '@/types/modal.types';
import ProfileModal from '@/components/modals/ProfileModal';
import type { AppRole } from '@/contexts/AuthContext';

interface MembersListModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    members: MembershipInfo[];
    entityType?: 'project' | 'class';
    entityId?: string;
    onMemberRemoved?: () => void;
    canRemoveMembers?: boolean;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/** The one chip mapping (mono, uppercase, square): lead/teacher = ink flood, member/student = outline. */
const roleChipClass = (role: string): string =>
    role === 'lead' || role === 'teacher'
        ? 'bg-foreground text-page border-foreground'
        : 'border-border text-foreground';

export const MembersListModal = ({
    open,
    onClose,
    title,
    subtitle,
    members,
    entityType,
    entityId,
    onMemberRemoved,
}: MembersListModalProps) => {
    const { toast } = useToast();
    const { isBoardOrAbove } = useProfile();
    const isMobile = useIsMobile();
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<Profile[]>([]);
    const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
    const [locallyRemovedIds, setLocallyRemovedIds] = useState<Set<string>>(new Set());
    const [locallyAddedMembers, setLocallyAddedMembers] = useState<MembershipInfo[]>([]);
    const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<MembershipInfo | null>(null);

    const displayMembers = useMemo(
        () => [
            ...members.filter(m => !locallyRemovedIds.has(m.id)),
            ...locallyAddedMembers,
        ],
        [members, locallyRemovedIds, locallyAddedMembers]
    );
    const memberCount = displayMembers.length;
    const displaySubtitle = subtitle || `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;

    const showRemoveButton = isBoardOrAbove && entityType && entityId;

    useEffect(() => {
        if (!open) {
            setLocallyRemovedIds(new Set());
            setLocallyAddedMembers([]);
            setSelectedMember(null);
        }
    }, [open]);

    useEffect(() => {
        const fetchAvailableMembers = async () => {
            if (!open || !entityType || !entityId) return;

            try {
                const { data: allProfiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('is_banned', false)
                    .order('full_name');

                if (!allProfiles) return;

                const existingUserIds = displayMembers.map(m => m.user_id);
                const available = allProfiles.filter(p => !existingUserIds.includes(p.id));

                setAvailableMembers(available);
            } catch (error) {
                console.error('Error fetching available members:', error);
            }
        };

        fetchAvailableMembers();
    }, [open, entityType, entityId, displayMembers]);

    const handleRemoveMember = async (membershipId: string) => {
        if (!entityType || !entityId) return;

        setRemovingMemberId(membershipId);
        setLocallyRemovedIds(prev => new Set([...prev, membershipId]));

        try {
            const tableName = entityType === 'project' ? 'project_members' : 'class_enrollments';
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', membershipId);

            if (error) throw error;

            onMemberRemoved?.();
        } catch (error) {
            console.error('Error removing member:', error);
            setLocallyRemovedIds(prev => {
                const updated = new Set(prev);
                updated.delete(membershipId);
                return updated;
            });
            toast({
                title: 'Error',
                description: `Failed to remove member from ${entityType}.`,
                variant: 'destructive',
            });
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleAddMember = async (userId: string, memberName: string, profile: Profile) => {
        if (!entityType || !entityId) return;

        setAddingMemberId(userId);
        const defaultRole = entityType === 'project' ? 'member' : 'student';

        try {
            const tableName = entityType === 'project' ? 'project_members' : 'class_enrollments';

            const insertData = entityType === 'project'
                ? {
                    user_id: userId,
                    project_id: entityId,
                    role: defaultRole as 'member' | 'lead',
                }
                : {
                    user_id: userId,
                    class_id: entityId,
                    role: defaultRole as 'student' | 'teacher',
                };

            const { data: insertedData, error } = await supabase
                .from(tableName)
                .insert(insertData)
                .select();

            if (error) {
                if (error.code === '23505') {
                    toast({
                        title: 'Already Added',
                        description: `${memberName} is already in this ${entityType}.`,
                        variant: 'destructive',
                    });
                } else {
                    throw error;
                }
                return;
            }

            const newMembership: MembershipInfo = {
                id: insertedData?.[0]?.id || `temp-${userId}`,
                user_id: userId,
                role: defaultRole,
                profile,
            };

            setLocallyAddedMembers(prev => [...prev, newMembership]);
            setAddMemberOpen(false);
            onMemberRemoved?.();
        } catch (error) {
            console.error('Error adding member:', error);
            toast({
                title: 'Error',
                description: `Failed to add member to ${entityType}.`,
                variant: 'destructive',
            });
        } finally {
            setAddingMemberId(null);
        }
    };

    const getNextRole = (currentRole: string) => {
        if (entityType === 'project') {
            return currentRole === 'member' ? 'lead' : 'member';
        } else {
            return currentRole === 'student' ? 'teacher' : 'student';
        }
    };

    const handleRoleChange = async (memberId: string, currentRole: string) => {
        if (!entityType || !entityId) return;

        const nextRole = getNextRole(currentRole);

        try {
            const tableName = entityType === 'project' ? 'project_members' : 'class_enrollments';
            const { error } = await supabase
                .from(tableName)
                .update({ role: nextRole })
                .eq('id', memberId);

            if (error) throw error;

            setMemberRoles(prev => ({
                ...prev,
                [memberId]: nextRole,
            }));

            onMemberRemoved?.();
        } catch (error) {
            console.error('Error updating member role:', error);
            toast({
                title: 'Error',
                description: `Failed to update member role.`,
                variant: 'destructive',
            });
        }
    };

    const profileViewerMember = selectedMember
        ? { ...selectedMember.profile, role: (selectedMember.profile as { role?: AppRole }).role ?? ('member' as AppRole) }
        : null;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Positioning wrapper: centers both modals as a group */}
                <div className="fixed inset-0 z-50 flex items-center justify-center gap-5 pointer-events-none p-4">

                    {/* Modal 1: Members List */}
                    <DialogPrimitive.Content
                        className={cn(
                            'pointer-events-auto relative flex max-h-[85vh] w-[90vw] max-w-lg flex-col gap-4 border border-border bg-page p-6 shadow-[8px_8px_0_0_hsl(var(--foreground))] duration-200',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                            isMobile && 'px-4',
                        )}
                        onInteractOutside={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('[data-profile-modal]')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className={cn('hatch -mt-6 flex flex-col space-y-1.5 border-b border-border py-4 text-left', isMobile ? '-mx-4 px-4' : '-mx-6 px-6')}>
                            <DialogPrimitive.Title className="font-mono text-lg font-extrabold tracking-[-0.02em]">
                                {title}
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Description asChild>
                                <div className="font-mono text-xs text-muted-foreground tabular-nums">{displaySubtitle}</div>
                            </DialogPrimitive.Description>
                        </div>

                        {showRemoveButton && (
                            <div className="hidden md:block pb-3 border-b border-hairline-faint">
                                <Popover open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="w-full"
                                            disabled={availableMembers.length === 0}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Member
                                            {availableMembers.length === 0 && ' (All members added)'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-96 p-0"
                                        align="center"
                                        onOpenAutoFocus={e => {
                                            e.preventDefault();
                                            const input = (e.target as HTMLElement)
                                                .closest('[data-radix-popper-content-wrapper]')
                                                ?.querySelector<HTMLInputElement>('[cmdk-input]');
                                            input?.focus();
                                        }}
                                    >
                                        <div
                                            className="p-1"
                                            style={{
                                                height: '300px',
                                                overflowY: 'scroll',
                                                overflowX: 'hidden',
                                                WebkitOverflowScrolling: 'touch',
                                                overscrollBehavior: 'none',
                                            }}
                                            onWheel={e => e.stopPropagation()}
                                            onTouchMove={e => e.stopPropagation()}
                                        >
                                            <Command>
                                                <CommandInput placeholder="Search members..." />
                                                <CommandList>
                                                    <CommandEmpty>No members found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableMembers.map((profile) => (
                                                            <CommandItem
                                                                key={profile.id}
                                                                value={`${profile.full_name || ''} ${profile.email}`}
                                                                onSelect={() => {
                                                                    handleAddMember(
                                                                        profile.id,
                                                                        profile.full_name || profile.email,
                                                                        profile
                                                                    );
                                                                }}
                                                                disabled={addingMemberId === profile.id}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span>{profile.full_name || 'No name'}</span>
                                                                    <span className="text-xs">{profile.email}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}

                        <div className="max-h-[60vh] overflow-y-auto border-t border-border">
                            {displayMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className={cn(
                                        'flex items-center gap-3 border-b border-hairline-faint px-2 py-2.5 transition-colors',
                                        !isMobile && 'cursor-pointer hover:bg-tint',
                                    )}
                                    onClick={() => !isMobile && setSelectedMember(member)}
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0 rounded-none border border-hairline-faint">
                                        <AvatarImage src={member.profile.profile_picture_url || undefined} className="rounded-none" />
                                        <AvatarFallback className="rounded-none font-mono text-sm">
                                            {member.profile.full_name
                                                ? getInitials(member.profile.full_name)
                                                : member.profile.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-mono text-sm font-semibold">
                                            {member.profile.full_name || 'No name'}
                                        </p>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {member.profile.email}
                                        </p>
                                    </div>

                                    <motion.div
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileTap={{ scale: 0.93, opacity: 0.7 }}
                                        className="cursor-pointer flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isBoardOrAbove) {
                                                handleRoleChange(member.id, memberRoles[member.id] || member.role);
                                            }
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'inline-flex shrink-0 items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]',
                                                roleChipClass(memberRoles[member.id] || member.role),
                                            )}
                                        >
                                            {memberRoles[member.id] || member.role}
                                        </span>
                                    </motion.div>

                                    {showRemoveButton && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hidden h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:flex"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveMember(member.id);
                                            }}
                                            disabled={removingMemberId === member.id}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {displayMembers.length === 0 && (
                                <div className="mt-3 border border-dashed border-grey-3 py-8 text-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    No members yet
                                </div>
                            )}
                        </div>
                    </DialogPrimitive.Content>

                    {/* Modal 2: Profile Viewer (separate, detached) */}
                    <AnimatePresence mode="wait">
                        {selectedMember && profileViewerMember && (
                            <motion.div
                                key={selectedMember.id}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                                data-profile-modal
                                className="pointer-events-auto relative flex max-h-[85vh] w-[28rem] flex-col border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))] overflow-hidden"
                            >
                                <ProfileModal
                                    member={profileViewerMember}
                                    embedded
                                    className="border-0 shadow-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};