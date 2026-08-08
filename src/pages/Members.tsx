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
import { type MemberWithRole, type AppRole } from '@/types/modal.types';
import { useProfile } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Mail, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const isClosingProfileRef = useRef(false);

  // ── Coworking window ───────────────────────────────────────────────────────
  const [withinCoworkingWindow, setWithinCoworkingWindow] = useState(isWithinCoworkingWindow);
  useEffect(() => {
    const tick = () => setWithinCoworkingWindow(isWithinCoworkingWindow());
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

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

  const closeProfile = () => {
    isClosingProfileRef.current = true;
    setIsProfileModalOpen(false);
    setSelectedMember(null);
    setSearchParams({});
  };

  const canManageRoles = role === 'admin';
  const canManageActions = role === 'board' || role === 'admin';

  const eboardCount = members.filter(m => m.role === 'admin').length;

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
    const rolePriority = (r: string | null) => r === 'admin' ? 1 : r === 'board' ? 2 : r === 'member' ? 3 : 4;
    return [...filteredMembers].sort((a, b) => {
      const roleDiff = rolePriority(a.role) - rolePriority(b.role);
      return roleDiff !== 0 ? roleDiff : (a.full_name || a.email).localeCompare(b.full_name || b.email);
    });
  }, [members, searchQuery]);

  const copyMemberEmailsCsv = useCallback(() => {
    const emails = processedMembers.map(m => m.email).filter((e): e is string => Boolean(e));
    if (emails.length === 0) {
      toast({ title: 'No emails', description: 'No emails to copy.', variant: 'destructive' });
      return;
    }
    void navigator.clipboard.writeText(emails.map(escapeCsv).join(',')).then(() => {
      toast({ title: 'Copied', description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard` });
    });
  }, [processedMembers, toast]);

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

  return (
    <div className="p-6 w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Directory</p>
          <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Members</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
            {members.length} {members.length === 1 ? 'member' : 'members'} · {eboardCount} admin
          </p>
        </div>
        <div className="flex items-center gap-3 md:shrink-0">
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
          {canManageActions && (
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 shrink-0 text-muted-foreground"
              onClick={copyMemberEmailsCsv}
              title="Copy member emails"
              aria-label="Copy member emails"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
          <div className="relative w-full min-w-0 md:w-52 lg:w-64">
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

      {/* Content: members grid shrinks to the left; profile docks on the right (desktop) */}
      <div className="mt-6 flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            {processedMembers.map(member => (
              <PersonCard
                key={member.id}
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
        </div>

        {/* Desktop: docked, sticky profile panel. The grid above reflows to fewer
            columns as this claims space, and the list stays scrollable. */}
        {selectedMember && !isMobile && (
          <aside className="sticky top-0 hidden max-h-[calc(100vh-3rem)] w-[22rem] shrink-0 self-start overflow-y-auto md:block lg:w-[24rem]">
            <div className="relative">
              <button
                type="button"
                onClick={closeProfile}
                aria-label="Close profile"
                className="absolute right-2 top-2 z-10 rounded-none p-1 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <ProfileModal member={selectedMember} embedded />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile: fall back to an overlay sheet (a docked panel won't fit on phones) */}
      {isMobile && (
        <ProfileModal open={isProfileModalOpen} onClose={closeProfile} member={selectedMember} />
      )}
      <JotFormModal open={isJotFormModalOpen} onClose={() => setIsJotFormModalOpen(false)} />
    </div>
  );
};

export default Members;
