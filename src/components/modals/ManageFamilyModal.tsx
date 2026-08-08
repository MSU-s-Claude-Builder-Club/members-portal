import { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, ChevronsUpDown, Link2, Loader2, Link2Off } from 'lucide-react';
import type { Database } from '@/integrations/supabase/database.types';

interface LastLinkOp {
    createdIds: string[];
    deleted: { big_id: string; little_id: string }[];
}

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface MemberWithRole extends Profile {
    role: AppRole;
}

interface FamilyRelationship {
    id: string;
    big_id: string;
    little_id: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    members: MemberWithRole[];
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Member combobox ────────────────────────────────────────────────────────

function MemberCombobox({
    members,
    value,
    onChange,
    placeholder,
    disabled,
    align = 'start',
}: {
    members: MemberWithRole[];
    value: string | null;
    onChange: (id: string) => void;
    placeholder: string;
    disabled?: boolean;
    align?: 'start' | 'end' | 'center';
}) {
    const [open, setOpen] = useState(false);
    const selected = members.find(m => m.id === value) ?? null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondary"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between font-normal"
                >
                    {selected ? (
                        <span className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-6 w-6 shrink-0 rounded-none">
                                <AvatarImage src={selected.profile_picture_url ?? undefined} className="rounded-none" />
                                <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                    {getInitials(selected.full_name ?? selected.email ?? '?')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{selected.full_name ?? selected.email}</span>
                        </span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 bg-page text-foreground" align={align}>
                <div
                    className="p-1"
                    style={{
                        height: '280px',
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
                                {members.map(m => (
                                    <CommandItem
                                        key={m.id}
                                        value={`${m.full_name ?? ''} ${m.email ?? ''}`}
                                        onSelect={() => {
                                            onChange(m.id);
                                            setOpen(false);
                                        }}
                                        className="flex items-center gap-3 py-2"
                                    >
                                        <Avatar className="h-8 w-8 shrink-0 rounded-none">
                                            <AvatarImage src={m.profile_picture_url ?? undefined} className="rounded-none" />
                                            <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                                {getInitials(m.full_name ?? m.email ?? '?')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{m.full_name ?? 'No name'}</span>
                                            <span className="text-xs">{m.email}</span>
                                        </div>
                                        <Check
                                            className={cn('h-4 w-4 shrink-0', value === m.id ? 'opacity-100' : 'opacity-0')}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─── Full-width arrow ────────────────────────────────────────────────────────
// CSS line for the shaft + SVG chevron-only for the head.
// Kept separate so they never overlap and the weight stays consistent.

function ConnectionArrow() {
    return (
        <div className="flex-1 flex items-center mx-2 min-w-0">
            <div className="flex-1 h-px bg-border" />
            <svg
                viewBox="0 0 6 10"
                className="h-2.5 w-1.5 shrink-0 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M1 1l4 4-4 4" />
            </svg>
        </div>
    );
}

// ─── Main modal ────────────────────────────────────────────────────────────

function displayName(member: { full_name: string | null; email: string | null } | undefined) {
    if (!member) return '?';
    return member.full_name?.split(' ')[0] ?? member.email ?? '?';
}

export function ManageFamilyModal({ open, onClose, members }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [bigId, setBigId] = useState<string | null>(null);
    const [littleId, setLittleId] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newConnectionIds, setNewConnectionIds] = useState<string[]>([]);
    const [lastLinkOp, setLastLinkOp] = useState<LastLinkOp | null>(null);

    const { data: relationships = [], isLoading } = useQuery<FamilyRelationship[]>({
        queryKey: ['family-relationships'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('family_relationships')
                .select('id, big_id, little_id');
            if (error) return [];
            return data ?? [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const memberMap = new Map(members.map(m => [m.id, m]));
    const littleIds = new Set(relationships.map(r => r.little_id));
    const familyRootIds = new Set(relationships.map(r => r.big_id).filter(id => !littleIds.has(id)));
    const availableLittles = members.filter(m => m.id !== bigId);
    const existingRelByLittle = new Map(relationships.map(r => [r.little_id, r]));

    useEffect(() => {
        if (open) {
            setNewConnectionIds([]);
            setLastLinkOp(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || e.key !== 'z' || !lastLinkOp) return;
            e.preventDefault();
            const op = lastLinkOp;
            setLastLinkOp(null);
            (async () => {
                try {
                    if (op.createdIds.length > 0) {
                        await supabase
                            .from('family_relationships')
                            .delete()
                            .in('id', op.createdIds);
                    }
                    for (const row of op.deleted) {
                        await supabase
                            .from('family_relationships')
                            .insert({ big_id: row.big_id, little_id: row.little_id });
                    }
                    setNewConnectionIds(prev => prev.filter(id => !op.createdIds.includes(id)));
                    await queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
                    toast({ title: 'Changes reverted', description: 'Last link action was undone.' });
                } catch (err) {
                    toast({
                        title: 'Error',
                        description: err instanceof Error ? err.message : 'Failed to undo.',
                        variant: 'destructive',
                    });
                }
            })();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, lastLinkOp, queryClient, toast]);

    async function handleLink() {
        if (!bigId || !littleId) return;
        if (bigId === littleId) {
            toast({ title: 'Invalid', description: 'A member cannot be their own big.', variant: 'destructive' });
            return;
        }
        const oldRel = existingRelByLittle.get(littleId);
        if (oldRel && familyRootIds.has(bigId)) {
            toast({
                title: 'Cannot add family root',
                description: 'Cannot add a family root as big to someone who already has a big. Remove that family lead\'s connection first.',
                variant: 'destructive',
            });
            return;
        }
        setLinking(true);
        try {
            let createdIds: string[] = [];
            let deleted: { big_id: string; little_id: string }[] = [];
            const linksForToast: string[] = [];

            if (oldRel) {
                const { error: delError } = await supabase
                    .from('family_relationships')
                    .delete()
                    .eq('id', oldRel.id);
                if (delError) throw delError;
                deleted = [{ big_id: oldRel.big_id, little_id: oldRel.little_id }];
                const bigName = displayName(memberMap.get(oldRel.big_id));
                const newBigName = displayName(memberMap.get(bigId));
                const littleName = displayName(memberMap.get(littleId));
                const { data: inserted, error: insError } = await supabase
                    .from('family_relationships')
                    .insert([
                        { big_id: oldRel.big_id, little_id: bigId },
                        { big_id: bigId, little_id: littleId },
                    ])
                    .select('id');
                if (insError) throw insError;
                createdIds = (inserted ?? []).map(r => r.id);
                linksForToast.push(`${bigName} → ${newBigName}`, `${newBigName} → ${littleName}`);
            } else {
                const { data: inserted, error } = await supabase
                    .from('family_relationships')
                    .insert({ big_id: bigId, little_id: littleId })
                    .select('id');
                if (error) throw error;
                const row = inserted?.[0];
                if (row) createdIds = [row.id];
                const bigName = displayName(memberMap.get(bigId));
                const littleName = displayName(memberMap.get(littleId));
                linksForToast.push(`${bigName} → ${littleName}`);
            }

            setNewConnectionIds(prev => [...prev, ...createdIds]);
            setLastLinkOp({ createdIds, deleted });
            toast({ title: 'Linked', description: linksForToast.join(', ') });
            setBigId(null);
            setLittleId(null);
            await queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to create link.',
                variant: 'destructive',
            });
        } finally {
            setLinking(false);
        }
    }

    async function handleUnlink(relId: string) {
        setDeletingId(relId);
        try {
            const { error } = await supabase
                .from('family_relationships')
                .delete()
                .eq('id', relId);
            if (error) throw error;
            setNewConnectionIds(prev => prev.filter(id => id !== relId));
            toast({ title: 'Unlinked', description: 'Connection removed.' });
            await queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to remove link.',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
        }
    }

    const linkAlreadyExists = bigId && littleId && relationships.some(
        r => r.big_id === bigId && r.little_id === littleId
    );
    const linkInverseExists = bigId && littleId && relationships.some(
        r => r.big_id === littleId && r.little_id === bigId
    );
    const canLink = !!bigId && !!littleId && bigId !== littleId && !linking && !linkAlreadyExists && !linkInverseExists;
    const littleAlreadyHasBig = littleId ? existingRelByLittle.has(littleId) : false;
    const linkDisabledReason =
        !bigId ? 'Select a big'
            : !littleId ? 'Select a little'
                : bigId === littleId ? "Can't link a member to themselves"
                    : linkAlreadyExists ? 'This link already exists'
                        : linkInverseExists ? 'This pair is already linked (other direction)'
                            : littleAlreadyHasBig && familyRootIds.has(bigId)
                                ? "Can't add a family root as big here. Remove their link first."
                                : linking ? 'Linking...'
                                    : null;

    const newConnections = relationships.filter(r => newConnectionIds.includes(r.id));
    const existingConnections = relationships.filter(r => !newConnectionIds.includes(r.id));

    return (
        <DialogPrimitive.Root open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
                        'flex w-[90vw] max-w-lg flex-col gap-4',
                        'border border-border bg-page p-6 shadow-[8px_8px_0_0_hsl(var(--foreground))]',
                        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                        'max-h-[90vh] overflow-y-auto',
                    )}
                >
                    {/* Header */}
                    <div className="hatch -mx-6 -mt-6 border-b border-border px-6 py-4">
                        <DialogPrimitive.Title className="font-mono text-lg font-extrabold tracking-[-0.02em]">
                            Manage Big/Little Links
                        </DialogPrimitive.Title>
                    </div>

                    {/* ── Add new link ── */}
                    <div className="space-y-3">
                        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Add New Link
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <MemberCombobox
                                    members={members}
                                    value={bigId}
                                    onChange={setBigId}
                                    placeholder="Select big…"
                                    align="start"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <MemberCombobox
                                    members={availableLittles}
                                    value={littleId}
                                    onChange={setLittleId}
                                    placeholder="Select little…"
                                    disabled={availableLittles.length === 0}
                                    align="end"
                                />
                            </div>
                        </div>
                        {linkDisabledReason ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-block w-full">
                                        <Button
                                            onClick={handleLink}
                                            disabled={!canLink}
                                            className="w-full gap-2"
                                        >
                                            {linking
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <Link2 className="h-4 w-4" />
                                            }
                                            Link
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="z-[100] max-w-[min(20rem,90vw)]"
                                >
                                    {linkDisabledReason}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                onClick={handleLink}
                                disabled={!canLink}
                                className="w-full gap-2"
                            >
                                {linking
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Link2 className="h-4 w-4" />
                                }
                                Link
                            </Button>
                        )}
                    </div>

                    {/* ── New connections (this session) ── */}
                    {newConnectionIds.length > 0 && (
                        <div className="space-y-2">
                            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                New Connections
                                <span className="ml-1.5 font-normal tabular-nums">
                                    ({newConnections.length})
                                </span>
                            </p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {newConnections.map(rel => {
                                    const big = memberMap.get(rel.big_id);
                                    const little = memberMap.get(rel.little_id);
                                    if (!big || !little) return null;
                                    return (
                                        <div
                                            key={rel.id}
                                            className="flex items-center gap-4 border border-hairline-faint bg-page p-3 transition-colors hover:bg-tint group"
                                        >
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Avatar className="h-8 w-8 shrink-0 rounded-none border border-hairline-faint">
                                                    <AvatarImage src={big.profile_picture_url ?? undefined} className="rounded-none" />
                                                    <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                                        {getInitials(big.full_name ?? big.email ?? '?')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-mono text-xs font-semibold whitespace-nowrap">
                                                    {big.full_name?.split(' ')[0] ?? big.email}
                                                </span>
                                            </div>
                                            <ConnectionArrow />
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Avatar className="h-8 w-8 shrink-0 rounded-none border border-hairline-faint">
                                                    <AvatarImage src={little.profile_picture_url ?? undefined} className="rounded-none" />
                                                    <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                                        {getInitials(little.full_name ?? little.email ?? '?')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                    {little.full_name?.split(' ')[0] ?? little.email}
                                                </span>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 shrink-0 ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleUnlink(rel.id)}
                                                disabled={deletingId === rel.id}
                                                title="Remove connection"
                                            >
                                                {deletingId === rel.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Link2Off className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* ── Existing connections ── */}
                    <div className="space-y-2">
                        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Existing Connections
                            {existingConnections.length > 0 && (
                                <span className="ml-1.5 font-normal tabular-nums">
                                    ({existingConnections.length})
                                </span>
                            )}
                        </p>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : existingConnections.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No connections yet.
                            </p>
                        ) : (
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {existingConnections.map(rel => {
                                    const big = memberMap.get(rel.big_id);
                                    const little = memberMap.get(rel.little_id);
                                    if (!big || !little) return null;
                                    return (
                                        <div
                                            key={rel.id}
                                            className="flex items-center gap-4 border border-hairline-faint bg-page p-3 transition-colors hover:bg-tint group"
                                        >
                                            {/* Big side */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Avatar className="h-8 w-8 shrink-0 rounded-none border border-hairline-faint">
                                                    <AvatarImage src={big.profile_picture_url ?? undefined} className="rounded-none" />
                                                    <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                                        {getInitials(big.full_name ?? big.email ?? '?')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-mono text-xs font-semibold whitespace-nowrap">
                                                    {big.full_name?.split(' ')[0] ?? big.email}
                                                </span>
                                            </div>

                                            <ConnectionArrow />

                                            {/* Little side */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Avatar className="h-8 w-8 shrink-0 rounded-none border border-hairline-faint">
                                                    <AvatarImage src={little.profile_picture_url ?? undefined} className="rounded-none" />
                                                    <AvatarFallback className="rounded-none text-xs bg-muted text-muted-foreground font-medium">
                                                        {getInitials(little.full_name ?? little.email ?? '?')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                    {little.full_name?.split(' ')[0] ?? little.email}
                                                </span>
                                            </div>

                                            {/* Delete */}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 shrink-0 ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleUnlink(rel.id)}
                                                disabled={deletingId === rel.id}
                                                title="Remove connection"
                                            >
                                                {deletingId === rel.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Link2Off className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

export default ManageFamilyModal;
