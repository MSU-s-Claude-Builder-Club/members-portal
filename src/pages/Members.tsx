import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonCard } from '@/components/PersonCard';
import ProfileModal from '@/components/modals/ProfileModal';
import { JotFormModal } from '@/components/modals/JotFormModal';
import { ManageFamilyModal } from '@/components/modals/ManageFamilyModal';
import { FamilyTree } from '@/components/FamilyTree';
import {
  buildFamilies,
  type Family,
  type FamilyRelationship,
  type MemberWithRole,
  type AppRole,
} from '@/types/modal.types';
import { useProfile } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Mail, Users, Home, Trophy, UserX } from 'lucide-react';
import { escapeCsv } from '@/lib/utils';

/** True if current time is 7:00pm–8:30pm EST on a Thursday. */
function isWithinCoworkingWindow(): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  let weekday = '';
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === 'weekday') weekday = p.value;
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  }
  if (weekday !== 'Thursday') return false;
  if (hour < 19) return false;
  if (hour > 20) return false;
  if (hour === 20 && minute >= 30) return false;
  return true;
}

const TRANSITION_MS = 100;

const Members = () => {
  const { toast } = useToast();
  const { role } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberWithRole | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isJotFormModalOpen, setIsJotFormModalOpen] = useState(false);
  const [isManageFamilyOpen, setIsManageFamilyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  // ── Coworking window ───────────────────────────────────────────────────────
  const [withinCoworkingWindow, setWithinCoworkingWindow] = useState(isWithinCoworkingWindow);
  useEffect(() => {
    const tick = () => setWithinCoworkingWindow(isWithinCoworkingWindow());
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Family state (desktop only) ────────────────────────────────────────────
  const [activeFamilyIdx, setActiveFamilyIdx] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const directoryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransRef = useRef(false);
  const activeIdxRef = useRef(0);
  const hasInitializedFamilySelection = useRef(false);
  const isClosingProfileRef = useRef(false);
  activeIdxRef.current = activeFamilyIdx;
  isTransRef.current = isTransitioning;

  // ── Fetch relationships ────────────────────────────────────────────────────
  const { data: relationships = [] } = useQuery<FamilyRelationship[]>({
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

  const memberId = searchParams.get('id');

  useEffect(() => {
    fetchMembers();
  }, []);

  // Sync modal closed state when URL has no id (e.g. after clicking outside to close)
  useEffect(() => {
    if (!memberId) {
      isClosingProfileRef.current = false;
      setSelectedMember(null);
      setIsProfileModalOpen(false);
    }
  }, [memberId]);

  // Open modal and set member when id is in URL (deep link or back/forward)
  useEffect(() => {
    if (!memberId || members.length === 0) return;
    if (isClosingProfileRef.current) return;
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setIsProfileModalOpen(true);
    } else {
      toast({
        title: 'Member Not Found',
        description: 'The requested member could not be found.',
        variant: 'destructive',
      });
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, members]);

  const fetchMembers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (profilesError || !profilesData) {
      setLoading(false);
      return;
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

    const membersWithRoles: MemberWithRole[] = profilesData
      .map(profile => ({
        ...profile,
        role: (roleMap.get(profile.id) || 'prospect') as AppRole,
      }))
      .filter(member => member.role !== 'prospect' && !member.is_banned);

    setMembers(membersWithRoles);
    setLoading(false);
  };

  const handleRoleChange = async (memberId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', memberId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Member role updated successfully' });
      fetchMembers();
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      queryClient.invalidateQueries({ queryKey: ['user-classes'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
    }
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
    try {
      const { error } = await supabase.rpc('delete_profile', { target_user_id: memberId });
      if (error) throw error;
      toast({ title: 'Member Kicked', description: `${memberName} has been kicked from the club` });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to kick member', variant: 'destructive' });
    }
  };

  const handleBanMember = async (memberId: string, memberName: string) => {
    try {
      const { data, error } = await supabase.rpc('ban_user_by_id', { target_user_id: memberId });
      if (error) throw error;
      const success = typeof data === 'object' && data !== null && 'success' in data ? (data).success : data;
      const banError = typeof data === 'object' && data !== null && 'error' in data ? (data).error : undefined;
      if (!success) throw new Error(typeof banError === 'string' ? banError : 'Failed to ban member');
      toast({ title: 'Member Banned', description: `${memberName} has been permanently banned`, variant: 'destructive' });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to ban member', variant: 'destructive' });
    }
  };

  const handleViewProfile = (member: MemberWithRole) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
    setSearchParams({ id: member.id });
  };

  const canManageRoles = role === 'e-board';
  const canManageActions = role === 'board' || role === 'e-board';

  const eboardCount = members.filter(m => m.role === 'e-board').length;

  const processedMembers = useMemo(() => {
    let filteredMembers = members;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.position?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        member.class_year?.toLowerCase().includes(query) ||
        member.github_username?.toLowerCase().includes(query) ||
        member.linkedin_username?.toLowerCase().includes(query)
      );
    }
    const rolePriority = (r: string | null) => r === 'e-board' ? 1 : r === 'board' ? 2 : r === 'member' ? 3 : 4;
    return [...filteredMembers].sort((a, b) => {
      const roleDiff = rolePriority(a.role) - rolePriority(b.role);
      return roleDiff !== 0 ? roleDiff : (a.full_name || a.email).localeCompare(b.full_name || b.email);
    });
  }, [members, searchQuery]);

  const processedIds = useMemo(() => new Set(processedMembers.map(m => m.id)), [processedMembers]);

  // ── Families (desktop): build from full member list so structure is always correct ──
  const familiesFull = useMemo(
    () => buildFamilies(members, relationships),
    [members, relationships],
  );
  const inFamilyIds = useMemo(
    () => new Set(familiesFull.flatMap(f => f.members.map(m => m.id))),
    [familiesFull],
  );
  /** Members not in any family (for dedicated Orphans view) */
  const orphansFull = useMemo(
    () => members.filter(m => !inFamilyIds.has(m.id)),
    [members, inFamilyIds],
  );
  const orphanProcessedMembers = useMemo(
    () => (searchQuery.trim() ? processedMembers.filter(m => !inFamilyIds.has(m.id)) : []),
    [processedMembers, searchQuery, inFamilyIds],
  );
  /** Orphans to display: all when not searching, else filtered by search; sorted like directory */
  const displayOrphans = useMemo(() => {
    const list = searchQuery.trim()
      ? orphansFull.filter(m => processedIds.has(m.id))
      : [...orphansFull];
    const rolePriority = (r: string | null) => r === 'e-board' ? 1 : r === 'board' ? 2 : r === 'member' ? 3 : 4;
    return list.sort((a, b) => {
      const roleDiff = rolePriority(a.role) - rolePriority(b.role);
      return roleDiff !== 0 ? roleDiff : (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '');
    });
  }, [orphansFull, searchQuery, processedIds]);
  const displayFamilies = useMemo(() => {
    if (!searchQuery.trim()) return familiesFull;
    return familiesFull.filter(f => f.members.some(m => processedIds.has(m.id)));
  }, [familiesFull, searchQuery, processedIds]);
  const hasRelationships = relationships.length > 0;
  const totalViewCount = displayFamilies.length + (displayOrphans.length > 0 ? 1 : 0);
  const isOrphansView = activeFamilyIdx === displayFamilies.length && displayOrphans.length > 0;
  const activeFamily: Family | null = isOrphansView ? null : (displayFamilies[activeFamilyIdx] ?? displayFamilies[0] ?? null);
  const activeFamilyDirectoryMembers = useMemo(() => {
    if (isOrphansView) return displayOrphans;
    if (!activeFamily) return [];
    if (!searchQuery.trim()) return activeFamily.members;
    return activeFamily.members.filter(m => processedIds.has(m.id));
  }, [activeFamily, searchQuery, processedIds, isOrphansView, displayOrphans]);
  const isOrphanOnlyView = isOrphansView;
  // When searching, directory shows all matching members (same regardless of selected family)
  const directoryMembers = useMemo(() => {
    if (searchQuery.trim()) return processedMembers;
    return activeFamilyDirectoryMembers;
  }, [searchQuery, processedMembers, activeFamilyDirectoryMembers]);
  const directoryTotalPoints = useMemo(
    () => directoryMembers.reduce((sum, m) => sum + (m.points ?? 0), 0),
    [directoryMembers],
  );

  const copyFamilyEmailsCsv = useCallback(() => {
    const emails = directoryMembers.map(m => m.email).filter((e): e is string => Boolean(e));
    if (emails.length === 0) {
      toast({ title: 'No emails', description: 'No emails to copy for this family.', variant: 'destructive' });
      return;
    }
    void navigator.clipboard.writeText(emails.map(escapeCsv).join(',')).then(() => {
      toast({ title: 'Copied', description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard` });
    });
  }, [directoryMembers, toast]);

  const searchTopMemberId = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const first = processedMembers[0];
    return first?.id ?? null;
  }, [searchQuery, processedMembers]);

  // On first load, select the family the current user belongs to
  useEffect(() => {
    if (!user?.id || hasInitializedFamilySelection.current || familiesFull.length === 0) return;
    hasInitializedFamilySelection.current = true;
    const idx = familiesFull.findIndex(f => f.members.some(m => m.id === user.id));
    if (idx >= 0) setActiveFamilyIdx(idx);
  }, [user?.id, familiesFull]);

  // Reset index when view count shrinks (e.g. search filters out orphans)
  useEffect(() => {
    setActiveFamilyIdx(i => (i >= totalViewCount ? 0 : i));
  }, [totalViewCount]);

  const scrollToMember = useCallback((memberId: string) => {
    const el = directoryRef.current?.querySelector(`[data-member-id="${memberId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const switchFamily = useCallback((nextIdx: number) => {
    if (isTransRef.current) return;
    if (nextIdx < 0 || nextIdx >= totalViewCount) return;
    if (nextIdx === activeIdxRef.current) return;
    setIsTransitioning(true); isTransRef.current = true;
    setActiveFamilyIdx(nextIdx);
    setTimeout(() => {
      setIsTransitioning(false); isTransRef.current = false;
      if (directoryRef.current) directoryRef.current.scrollTop = 0;
    }, TRANSITION_MS);
  }, [totalViewCount]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); switchFamily(activeIdxRef.current + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); switchFamily(activeIdxRef.current - 1); }
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [switchFamily]);

  // ── Modals shared by both layouts ──────────────────────────────────────────
  const sharedModals = (
    <>
      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => {
          isClosingProfileRef.current = true;
          setIsProfileModalOpen(false);
          setSelectedMember(null);
          setSearchParams({});
        }}
        member={selectedMember}
      />
      <JotFormModal open={isJotFormModalOpen} onClose={() => setIsJotFormModalOpen(false)} />
      <ManageFamilyModal
        open={isManageFamilyOpen}
        onClose={() => setIsManageFamilyOpen(false)}
        members={members}
      />
    </>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 w-full h-full overflow-y-auto">
        <div className="border-b border-border pb-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Directory</p>
          <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Members</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">Club members</p>
        </div>
        <div className="mt-6 border border-border bg-page p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="p-6 w-full h-full overflow-y-auto">
        <div className="flex justify-between items-start gap-4 border-b border-border pb-6">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Directory</p>
            <h1 className="mt-1 font-mono text-3xl font-extrabold tracking-[-0.03em]">Members</h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
              {members.length} {members.length === 1 ? 'member' : 'members'} · {eboardCount} e-board
            </p>
          </div>
          <div className="relative w-40 shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] mt-6">
          {processedMembers.map(member => (
            <div key={member.id} className="min-w-0 max-w-[500px] w-full">
              <PersonCard
                person={member}
                onViewProfile={handleViewProfile}
                onRoleChange={handleRoleChange}
                onKick={handleKickMember}
                onBan={handleBanMember}
                canManage={canManageActions}
                canChangeRoles={canManageRoles}
                isMobile={isMobile}
                currentUserId={user?.id}
                currentUserRole={role}
                type="member"
              />
            </div>
          ))}
        </div>

        {members.length === 0 ? (
          <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Empty</p>
            <p className="mt-2 text-sm text-muted-foreground">No members found.</p>
          </div>
        ) : processedMembers.length === 0 ? (
          <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">No results</p>
            <p className="mt-2 text-sm text-muted-foreground">No members match your search criteria.</p>
          </div>
        ) : null}

        {sharedModals}
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-6">

      {/* Header */}
      <div className="flex-shrink-0 border-b border-border pb-6">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Directory</p>
            <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Members</h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
              {members.length} {members.length === 1 ? 'member' : 'members'} · {eboardCount} e-board
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {role !== 'prospect' && (
              withinCoworkingWindow ? (
                <Button variant="default" onClick={() => setIsJotFormModalOpen(true)} className="gap-2">
                  <span
                    className="h-4 w-4 shrink-0 inline-block bg-current [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]"
                    style={{
                      maskImage: 'url(/claude-logo-transparent.png)',
                      WebkitMaskImage: 'url(/claude-logo-transparent.png)',
                    }}
                    aria-hidden
                  />
                  Claude Pro
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="default" disabled className="gap-2">
                        <span
                          className="h-4 w-4 shrink-0 inline-block bg-current [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]"
                          style={{
                            maskImage: 'url(/claude-logo-transparent.png)',
                            WebkitMaskImage: 'url(/claude-logo-transparent.png)',
                          }}
                          aria-hidden
                        />
                        Claude Pro
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Come to our weekly Coworking Session to check in!</p>
                  </TooltipContent>
                </Tooltip>
              )
            )}
            <div className="relative w-40 sm:w-52 lg:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0 mt-6">
        {members.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-dashed border-grey-3 px-10 py-8 text-center">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Empty</p>
              <p className="mt-2 text-sm text-muted-foreground">No members found.</p>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex-1 min-h-0 border border-border bg-page overflow-hidden flex flex-col lg:flex-row"
            tabIndex={-1}
            style={{ outline: 'none' }}
          >
            {/* LEFT / TOP: canvas (full width stacked on medium, 2/3 on large+) */}
            <div className="w-full lg:w-2/3 h-[45vh] min-h-[280px] lg:h-full lg:min-h-0 flex-shrink-0">
              <FamilyTree
                family={activeFamily}
                orphans={displayOrphans.length > 0 ? displayOrphans : undefined}
                families={displayFamilies}
                activeFamilyIdx={activeFamilyIdx}
                onSwitchFamily={switchFamily}
                currentUserId={user?.id ?? ''}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                onNodeClick={scrollToMember}
                hasRelationships={hasRelationships}
                canManage={canManageActions}
                searchTopMemberId={searchTopMemberId}
              />
            </div>

            {/* RIGHT / BOTTOM: family directory (full width below tree on medium, 1/3 on large+) — no key so content updates in place and we avoid double fade on family switch */}
            <motion.div
              className="w-full lg:w-1/3 flex-1 lg:flex-initial min-h-0 lg:min-w-[280px] border-t lg:border-t-0 lg:border-l border-border bg-page flex flex-col flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Family / search header — fade when switching between search and family view */}
              <div className="flex-shrink-0 p-3 border-b border-border hatch overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AnimatePresence mode="wait" initial={false}>
                      {searchQuery.trim() ? (
                        <motion.div
                          key="search-header"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-page text-muted-foreground">
                            <Search className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-foreground truncate">Search results</span>
                            </div>
                            <p className="font-mono text-[11px] text-muted-foreground tabular-nums mt-0.5 flex items-center gap-2">
                              <span>
                                {directoryMembers.length} result
                                {directoryMembers.length !== 1 ? 's' : ''}
                              </span>
                              <span aria-hidden>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {displayFamilies.length} {displayFamilies.length === 1 ? 'family' : 'families'}
                              </span>
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="family-header"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-page text-muted-foreground">
                            {isOrphanOnlyView ? (
                              <UserX className="h-4 w-4" aria-hidden />
                            ) : (
                              <Home className="h-4 w-4" aria-hidden />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-foreground truncate">
                                {isOrphanOnlyView
                                  ? 'Orphans'
                                  : activeFamily
                                    ? hasRelationships
                                      ? `${activeFamily.root.full_name}'s Family`
                                      : 'All Members'
                                    : 'No results'}
                              </span>
                              {isOrphanOnlyView ? (
                                <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center" title="No family">
                                  <Home className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="w-[130%] h-px bg-muted-foreground rotate-45" aria-hidden />
                                  </span>
                                </span>
                              ) : (
                                <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-muted-foreground tabular-nums mt-0.5 flex items-center gap-2">
                              <span>
                                {directoryMembers.length} member
                                {directoryMembers.length !== 1 ? 's' : ''}
                              </span>
                              <span aria-hidden>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {directoryTotalPoints}
                              </span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right: copy family emails + manage links (board+ only) */}
                  {canManageActions && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-muted-foreground"
                        onClick={copyFamilyEmailsCsv}
                        title="Copy family emails"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-muted-foreground"
                        onClick={() => setIsManageFamilyOpen(true)}
                        title="Manage big/little links"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable member list: when searching shows all matches; otherwise active family + orphans */}
              <div
                ref={directoryRef}
                className="flex-1 overflow-y-auto p-4 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 content-start"
              >
                <AnimatePresence mode="wait">
                  {directoryMembers.map((member, i) => (
                    <motion.div
                      key={member.id}
                      data-member-id={member.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.2, delay: i * 0.012, ease: [0.22, 1, 0.36, 1] }}
                      className={`min-w-0 border-2 transition-colors ${hoveredId === member.id ? 'border-primary' : 'border-transparent'}`}
                    >
                      <PersonCard
                        person={member}
                        onViewProfile={handleViewProfile}
                        onRoleChange={handleRoleChange}
                        onKick={handleKickMember}
                        onBan={handleBanMember}
                        canManage={canManageActions}
                        canChangeRoles={canManageRoles}
                        isMobile={isMobile}
                        currentUserId={user?.id}
                        currentUserRole={role}
                        type="member"
                      />
                    </motion.div>
                  ))}
                  {!searchQuery.trim() && orphanProcessedMembers.map((member, i) => (
                    <motion.div
                      key={member.id}
                      data-member-id={member.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: (directoryMembers.length + i) * 0.012, ease: [0.22, 1, 0.36, 1] }}
                      className={`min-w-0 border-2 transition-colors ${hoveredId === member.id ? 'border-primary' : 'border-transparent'}`}
                    >
                      <PersonCard
                        person={member}
                        onViewProfile={handleViewProfile}
                        onRoleChange={handleRoleChange}
                        onKick={handleKickMember}
                        onBan={handleBanMember}
                        canManage={canManageActions}
                        canChangeRoles={canManageRoles}
                        isMobile={isMobile}
                        currentUserId={user?.id}
                        currentUserRole={role}
                        type="member"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {sharedModals}
    </div>
  );
};

export default Members;
