import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonCard } from '@/components/PersonCard';
import ProfileModal from '@/components/modals/ProfileModal';
import type { Database } from '@/integrations/supabase/database.types';
import { useProfile } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Search, Mail } from 'lucide-react';
import { escapeCsv } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface ProspectWithRole extends Profile {
  role: AppRole;
}

const Prospects = () => {
  const { toast } = useToast();
  const { role: userRole } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prospects, setProspects] = useState<ProspectWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<ProspectWithRole | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const isClosingProfileRef = useRef(false);

  const prospectId = searchParams.get('id');

  useEffect(() => {
    fetchProspects();
  }, []);

  // Sync modal closed when URL has no id (e.g. after clicking outside to close)
  useEffect(() => {
    if (!prospectId) {
      isClosingProfileRef.current = false;
      setSelectedProspect(null);
      setIsProfileModalOpen(false);
    }
  }, [prospectId]);

  // Open modal when id is in URL (deep link or back/forward)
  useEffect(() => {
    if (!prospectId || prospects.length === 0 || isClosingProfileRef.current) return;
    const prospect = prospects.find(p => p.id === prospectId);
    if (prospect) {
      setSelectedProspect(prospect);
      setIsProfileModalOpen(true);
    } else {
      toast({
        title: 'Prospect Not Found',
        description: 'The requested prospect could not be found.',
        variant: 'destructive',
      });
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId, prospects]);

  const fetchProspects = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError || !profilesData) {
      setLoading(false);
      return;
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

    const prospectsWithRoles: ProspectWithRole[] = profilesData
      .map(profile => ({
        ...profile,
        role: roleMap.get(profile.id) || 'prospect',
      }))
      .filter(member => member.role === 'prospect' && !member.is_banned);

    // Group by term_joined, then sort within groups by oldest creation_date
    const groupsMap: Record<string, ProspectWithRole[]> = {};
    for (const prospect of prospectsWithRoles) {
      const term = prospect.term_joined ?? 'Unknown Term';
      if (!groupsMap[term]) groupsMap[term] = [];
      groupsMap[term].push(prospect);
    }

    const termOrder = (term: string): [number, number] => {
      // Parse format like "F26" or "S27"
      const match = term.match(/^([FS])(\d{2})$/i);

      // treat unknown as always last
      if (!match) return [-Infinity, -Infinity];

      const [, season, year] = match;
      const yearNum = Number.parseInt(year, 10);
      const seasonNum = season.toUpperCase() === 'F' ? 2 : 1;
      return [yearNum, seasonNum];
    };

    const sortedTermGroups = Object.keys(groupsMap).sort((a, b) => {
      const aOrder = termOrder(a);
      const bOrder = termOrder(b);
      if (aOrder[0] !== bOrder[0]) {
        // Descending order by year
        return bOrder[0] - aOrder[0];
      }
      // Descending order: Fall after Spring in the same year (2 after 1)
      return bOrder[1] - aOrder[1];
    });

    const sortedProspects: ProspectWithRole[] = [];

    for (const term of sortedTermGroups) {
      const group = groupsMap[term].slice().sort((a, b) => {
        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      });
      sortedProspects.push(...group);
    }

    setProspects(sortedProspects);
    setLoading(false);
  };

  // Filter and sort prospects
  const processedProspects = useMemo(() => {
    let filteredProspects = prospects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredProspects = prospects.filter(prospect =>
        prospect.full_name?.toLowerCase().includes(query) ||
        prospect.email?.toLowerCase().includes(query) ||
        prospect.term_joined?.toLowerCase().includes(query) ||
        prospect.class_year?.toLowerCase().includes(query) ||
        prospect.github_username?.toLowerCase().includes(query) ||
        prospect.linkedin_username?.toLowerCase().includes(query)
      );
    }

    return filteredProspects;
  }, [prospects, searchQuery]);

  const handleGraduate = async (prospectId: string, prospectName: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: 'member' })
      .eq('user_id', prospectId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `${prospectName} graduated to Member successfully`,
      });
      fetchProspects();

      // Invalidate auth/role queries since role changes affect what data users can see
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      queryClient.invalidateQueries({ queryKey: ['user-classes'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
    }
  };

  const handleKickProspect = async (prospectId: string, prospectName: string) => {
    try {
      const { error } = await supabase.rpc('delete_profile', { target_user_id: prospectId });
      if (error) throw error;
      toast({ title: 'Prospect Kicked', description: `${prospectName} has been removed from the club` });
      fetchProspects();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to kick prospect',
        variant: 'destructive',
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBanProspect = async (prospectId: string, prospectName: string) => {
    try {
      const { data, error } = await supabase.rpc('ban_user_by_id', {
        target_user_id: prospectId,
      });

      if (error) throw error;

      const success = typeof data === 'object' && data !== null && 'success' in data ? (data).success : data;
      const banError = typeof data === 'object' && data !== null && 'error' in data ? (data).error : undefined;

      if (!success) {
        throw new Error(typeof banError === 'string' ? banError : 'Failed to ban prospect');
      }

      toast({
        title: 'Prospect Banned',
        description: `${prospectName} has been permanently banned`,
        variant: 'destructive',
      });
      fetchProspects();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to ban prospect',
        variant: 'destructive',
      });
    }
  };

  const handleViewProfile = (prospect: ProspectWithRole) => {
    setSelectedProspect(prospect);
    setIsProfileModalOpen(true);
    setSearchParams({ id: prospect.id });
  };

  const copyEmailsCsv = () => {
    const emails = processedProspects
      .map(p => p.email)
      .filter((e): e is string => Boolean(e));
    if (emails.length === 0) {
      toast({
        title: 'No emails',
        description: 'No emails to copy for the current filter.',
        variant: 'destructive',
      });
      return;
    }
    const csv = emails.map(escapeCsv).join(',');
    void navigator.clipboard.writeText(csv).then(() => {
      toast({
        title: 'Copied',
        description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard`,
      });
    });
  };

  const canManageProspects = userRole === 'board' || userRole === 'e-board';

  const termCount = new Set(prospects.map(p => p.term_joined ?? 'Unknown Term')).size;

  if (loading) {
    return (
      <div className="p-6 md:p-10 w-full h-full overflow-y-auto">
        <div className="border-b border-border pb-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Admissions</p>
          <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Prospects</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">Manage prospective members</p>
        </div>
        <div className="mt-6 border border-border bg-page p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full h-full overflow-y-auto">
      <div className="flex justify-between items-end gap-4 border-b border-border pb-6">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Admissions</p>
          <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Prospects</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
            {prospects.length} {prospects.length === 1 ? 'prospect' : 'prospects'} · {termCount} {termCount === 1 ? 'term' : 'terms'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isMobile && canManageProspects && (
            <Button size="icon" onClick={copyEmailsCsv} title="Copy filtered emails as CSV">
              <Mail className="h-4 w-4" />
            </Button>
          )}
          <div className={`relative ${isMobile ? "w-40" : "w-64"}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isMobile ? "Search" : "Search prospects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {prospects.length === 0 ? (
        <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Empty</p>
          <p className="mt-2 text-sm text-muted-foreground">No prospects at this time.</p>
        </div>
      ) : processedProspects.length === 0 ? (
        <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">No results</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No prospects match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] mt-6">
          {processedProspects.map((prospect, i) => {
            /** The initial animation delay for the first prospect card. */
            const initialDelay = 0.05;
            /** The base value used for staggering the delay between prospect card animations. */
            const staggerBase = 0.045;
            /** The decay factor applied to stagger intervals; closer to 1 equals less decay per card. */
            const staggerDecay = 0.82;
            /**
             * The staggered delay between prospect card animations.
             * Calculated as a decaying geometric series
             */
            const stagger = staggerBase * (1 - Math.pow(staggerDecay, i)) / (1 - staggerDecay);

            /**
             * The total delay to apply to this prospect card's entrance animation.
             * Starts with initialDelay, then adds the computed stagger.
             */
            const delay = initialDelay + stagger;
            return (
              <motion.div
                key={prospect.id}
                className="min-w-0 max-w-[500px] w-full"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <PersonCard
                  person={prospect}
                  onViewProfile={handleViewProfile}
                  onGraduate={handleGraduate}
                  onKick={handleKickProspect}
                  canManage={canManageProspects}
                  isMobile={isMobile}
                  currentUserId={user?.id}
                  currentUserRole={userRole}
                  type="prospect"
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => {
          isClosingProfileRef.current = true;
          setIsProfileModalOpen(false);
          setSelectedProspect(null);
          setSearchParams({});
        }}
        member={selectedProspect}
      />
    </div>
  );
};

export default Prospects;