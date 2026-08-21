import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type AppRole = Database['public']['Enums']['app_role'];

export type Project = Database['public']['Tables']['projects']['Row'] & {
  semesters: { code: string; name: string; start_date: string; end_date: string } | null;
  project_members: { count: number }[];
};

export type Class = Database['public']['Tables']['classes']['Row'] & {
  semesters: { code: string; name: string; start_date: string; end_date: string } | null;
  class_enrollments: { count: number }[];
};

type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationWithProfile = Application & {
  profiles: { full_name: string; email: string } | null;
  classes: { name: string } | null;
  projects: { name: string } | null;
};
type Event = Database['public']['Tables']['events']['Row'];

/** Applications from one applicant, ordered by submitted date (newest first). */
export interface ApplicationGroup {
  user_id: string;
  applicantName: string;
  applications: ApplicationWithProfile[];
}

interface UserProjects {
  inProgress: Project[];
  assigned: Project[];
  completed: Project[];
  available: Project[];
}

interface UserClasses {
  inProgress: Class[];
  enrolled: Class[];
  completed: Class[];
  available: Class[];
}

interface UserApplications {
  /** Current user's applications: flat lists, sorted by submitted date (newest first). */
  self: { pending: ApplicationWithProfile[]; decided: ApplicationWithProfile[] };
  /** Review queue: pending = flat list by time (newest first); decided = grouped by applicant only. */
  review: { pending: ApplicationWithProfile[]; decided: ApplicationGroup[] };
}

interface UserEvents {
  attending: Event[];
  notAttending: Event[];
}

// ---------- Fetch helpers (role, projects, classes, applications, events) ----------
async function fetchUserRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
  if (error) {
    console.error('Error fetching role:', error);
    return 'prospect';
  }
  return data?.role || 'prospect';
}

async function fetchUserProjects(userId: string): Promise<UserProjects> {
  const { data: memberships, error: membershipsError } = await supabase
    .from('project_members')
    .select('*')
    .eq('user_id', userId);
  if (membershipsError) throw membershipsError;

  const { data: allProjects, error: allProjectsError } = await supabase
    .from('projects')
    .select(`*, semesters (code, name, start_date, end_date), project_members(count)`);
  if (allProjectsError) throw allProjectsError;

  const now = new Date();
  const userProjectsMap = new Map((memberships ?? []).map((m) => [m.project_id, m]));
  const inProgress: Project[] = [];
  const assigned: Project[] = [];
  const completed: Project[] = [];
  const involvedProjectIds = new Set<string>();

  for (const project of allProjects ?? []) {
    const membership = userProjectsMap.get(project.id);
    if (!membership) continue;
    involvedProjectIds.add(project.id);
    if (!project.semesters) continue;
    const { start_date, end_date } = project.semesters;
    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;
    if (startDate && endDate && now >= startDate && now <= endDate) inProgress.push(project);
    else if (startDate && now < startDate) assigned.push(project);
    else if (endDate && now > endDate) completed.push(project);
    else if (startDate && !endDate) assigned.push(project);
    else if (!startDate && endDate) inProgress.push(project);
  }

  const available: Project[] = (allProjects ?? []).filter((p) => !involvedProjectIds.has(p.id));
  return { inProgress, assigned, completed, available };
}

async function fetchUserClasses(userId: string): Promise<UserClasses> {
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('class_enrollments')
    .select('*')
    .eq('user_id', userId);
  if (enrollmentsError) throw enrollmentsError;

  const { data: allClasses, error: allClassesError } = await supabase
    .from('classes')
    .select(`*, semesters (code, name, start_date, end_date), class_enrollments(count)`);
  if (allClassesError) throw allClassesError;

  const now = new Date();
  const userClassesMap = new Map((enrollments ?? []).map((e) => [e.class_id, e]));
  const inProgress: Class[] = [];
  const enrolled: Class[] = [];
  const completed: Class[] = [];
  const involvedClassIds = new Set<string>();

  for (const classItem of allClasses ?? []) {
    const enrollment = userClassesMap.get(classItem.id);
    if (!enrollment) continue;
    involvedClassIds.add(classItem.id);
    if (!classItem.semesters) continue;
    const { start_date, end_date } = classItem.semesters;
    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;
    if (startDate && endDate && now >= startDate && now <= endDate) inProgress.push(classItem);
    else if (startDate && now < startDate) enrolled.push(classItem);
    else if (endDate && now > endDate) completed.push(classItem);
    else if (startDate && !endDate) enrolled.push(classItem);
    else if (!startDate && endDate) inProgress.push(classItem);
  }

  const available: Class[] = (allClasses ?? []).filter((c) => !involvedClassIds.has(c.id));
  return { inProgress, enrolled, completed, available };
}

function sortByCreatedAtDesc(apps: ApplicationWithProfile[]): ApplicationWithProfile[] {
  return [...apps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function groupApplicationsByApplicant(apps: ApplicationWithProfile[]): ApplicationGroup[] {
  const byUser = new Map<string, ApplicationWithProfile[]>();
  for (const app of apps) {
    const list = byUser.get(app.user_id) ?? [];
    list.push(app);
    byUser.set(app.user_id, list);
  }
  const groups: ApplicationGroup[] = [];
  byUser.forEach((applications, user_id) => {
    const sorted = sortByCreatedAtDesc(applications);
    const applicantName = applications[0]?.profiles?.full_name ?? 'Applicant';
    groups.push({ user_id, applicantName, applications: sorted });
  });
  // Order groups by most recent submission (newest first)
  groups.sort((a, b) => {
    const aLatest = new Date(a.applications[0].created_at).getTime();
    const bLatest = new Date(b.applications[0].created_at).getTime();
    return bLatest - aLatest;
  });
  return groups;
}

async function fetchUserApplications(userId: string, role: AppRole): Promise<UserApplications> {
  const applicationsSelect =
    '*, profiles!applications_user_id_fkey(full_name, email), classes:class_id(name), projects:project_id(name)';
  const { data: ownApplications, error: ownError } = await supabase
    .from('applications')
    .select(applicationsSelect)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (ownError) throw ownError;

  const own = (ownApplications ?? []) as unknown as ApplicationWithProfile[];
  const self = {
    pending: sortByCreatedAtDesc(own.filter((a) => a.status === 'pending')),
    decided: sortByCreatedAtDesc(own.filter((a) => ['accepted', 'rejected'].includes(a.status))),
  };
  const review = { pending: [] as ApplicationWithProfile[], decided: [] as ApplicationGroup[] };

  if (role === 'admin' || role === 'board') {
    let reviewQuery = supabase
      .from('applications')
      .select(applicationsSelect)
      .neq('user_id', userId)
      .order('created_at', { ascending: false });
    if (role === 'board') reviewQuery = reviewQuery.in('application_type', ['project', 'class']);
    const { data: reviewableApplications, error: reviewError } = await reviewQuery;
    if (!reviewError && reviewableApplications) {
      const typed = reviewableApplications as unknown as ApplicationWithProfile[];
      const pending = typed.filter((a) => a.status === 'pending');
      const decided = typed.filter((a) => ['accepted', 'rejected'].includes(a.status));
      review.pending = sortByCreatedAtDesc(pending);
      review.decided = groupApplicationsByApplicant(decided);
    }
  }
  return { self, review };
}

async function fetchUserEvents(userId: string, role: AppRole): Promise<UserEvents> {
  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from('event_attendance')
    .select('event_id')
    .eq('user_id', userId);
  if (attendanceError) throw attendanceError;
  const attendedEventIds = (attendanceRecords ?? []).map((e) => e.event_id);

  const { data: allEvents, error: allEventsError } = await supabase
    .from('events')
    .select('*')
    .contains('allowed_roles', [role])
    .order('event_date', { ascending: false });
  if (allEventsError) throw allEventsError;

  let rsvpCounts: Record<string, number> = {};
  const eventIds = (allEvents ?? []).filter((e) => e.rsvp_required).map((e) => e.id);
  if (eventIds.length > 0) {
    const { data: rsvpCountsData, error: rsvpCountsError } = await supabase
      .from('event_attendance')
      .select('event_id')
      .in('event_id', eventIds);
    if (!rsvpCountsError && rsvpCountsData) {
      rsvpCounts = rsvpCountsData.reduce((acc: Record<string, number>, row: { event_id: string }) => {
        acc[row.event_id] = (acc[row.event_id] ?? 0) + 1;
        return acc;
      }, {});
    }
  }

  const attending: Event[] = [];
  const notAttending: Event[] = [];
  (allEvents ?? []).forEach((event) => {
    const isRSVPd = attendedEventIds.includes(event.id);
    if (!event.rsvp_required || isRSVPd) attending.push(event);
    else if ((rsvpCounts[event.id] ?? 0) < event.max_attendance) notAttending.push(event);
  });
  return { attending, notAttending };
}

// ---------- Context type (auth + profile data) ----------
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  role: AppRole | null;
  roleLoading: boolean;
  profileLoading: boolean;
  isEBoard: boolean;
  isBoard: boolean;
  isBoardOrAbove: boolean;
  canManageRoles: boolean;
  canManageApplications: boolean;
  canManageProjects: boolean;
  canManageClasses: boolean;
  canManageEvents: boolean;
  userProjects: UserProjects | undefined;
  projectsLoading: boolean;
  userClasses: UserClasses | undefined;
  classesLoading: boolean;
  userApplications: UserApplications | undefined;
  applicationsLoading: boolean;
  userEvents: UserEvents | undefined;
  eventsLoading: boolean;
  refreshProjects: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
  role: null,
  roleLoading: true,
  profileLoading: true,
  isEBoard: false,
  isBoard: false,
  isBoardOrAbove: false,
  canManageRoles: false,
  canManageApplications: false,
  canManageProjects: false,
  canManageClasses: false,
  canManageEvents: false,
  userProjects: undefined,
  projectsLoading: true,
  userClasses: undefined,
  classesLoading: true,
  userApplications: undefined,
  applicationsLoading: true,
  userEvents: undefined,
  eventsLoading: true,
  refreshProjects: async () => { },
  refreshClasses: async () => { },
  refreshApplications: async () => { },
  refreshEvents: async () => { },
  refreshAll: async () => { },
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// eslint-disable-next-line react-refresh/only-export-components -- context hook, not a component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/** Same as useAuth(); kept so existing useProfile() call sites keep working. */
// eslint-disable-next-line react-refresh/only-export-components -- context hook, not a component
export const useProfile = () => useAuth();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const profileCacheRef = useRef<{ userId: string; data: Profile; timestamp: number } | null>(null);
  const CACHE_DURATION = 30 * 1000;

  const fetchProfile = async (userId: string, skipCache = false) => {
    if (fetchingRef.current) return;
    if (!skipCache && profileCacheRef.current) {
      const { userId: cachedUserId, data, timestamp } = profileCacheRef.current;
      if (cachedUserId === userId && Date.now() - timestamp < CACHE_DURATION && mountedRef.current) {
        setProfile(data);
        return;
      }
    }
    fetchingRef.current = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .abortSignal(controller.signal)
        .single();
      clearTimeout(timeoutId);
      if (error) {
        if (error.message?.includes('aborted')) throw new Error('Profile fetch timeout');
        throw error;
      }
      if (!mountedRef.current) return;
      if (profileData.is_banned) {
        setProfile(null);
        setUser(null);
        setSession(null);
        profileCacheRef.current = null;
        await supabase.auth.signOut();
        throw new Error('Your account has been banned. Please contact the admin for more information.');
      }
      profileCacheRef.current = { userId, data: profileData, timestamp: Date.now() };
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (mountedRef.current) {
        setProfile({
          id: userId,
          email: user?.email ?? '',
          full_name: '',
          class_year: null,
          is_banned: false,
          linkedin_username: null,
          profile_picture_url: null,
          resume_url: null,
          points: 0,
          github_username: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          position: null,
          term_joined: null,
          theme: 'light',
          slack_user_id: '',
        } as Profile);
      }
    } finally {
      fetchingRef.current = false;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, true);
  };

  useEffect(() => {
    mountedRef.current = true;

    // Keep React state in step with GoTrue. This matters most for email
    // confirmation: clicking the link in the signup email lands back on /auth
    // with the tokens in the URL fragment, and supabase-js exchanges them
    // asynchronously (detectSessionInUrl). Without this listener the exchange
    // lands after our one-shot getSession() and the freshly confirmed member
    // just sees the login form again. It also picks up the session created by
    // verifyOtp() when they type the code instead.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mountedRef.current) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT' || !s?.user) {
        setProfile(null);
        profileCacheRef.current = null;
        return;
      }

      // Never await supabase calls inside this callback - it can deadlock the
      // auth client. Defer to a macrotask instead.
      const userId = s.user.id;
      if (event === 'TOKEN_REFRESHED' && profileCacheRef.current?.userId === userId) return;
      setTimeout(() => {
        if (mountedRef.current) void fetchProfile(userId);
      }, 0);
    });

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await fetchProfile(s.user.id);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    initAuth();
    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchProfile is stable (uses refs), run once on mount
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const sub = supabase
      .channel(`profile_changes_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => {
        if (mountedRef.current) { profileCacheRef.current = null; fetchProfile(user.id, true); }
      })
      .subscribe();
    return () => { void sub.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchProfile is stable (uses refs)
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
      // fetchProfile already signs out and throws if user is banned
    }
  };

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    profileCacheRef.current = null;
    queryClient.clear();
    await supabase.auth.signOut();
  };

  // ---------- Profile data (role, projects, classes, applications, events) ----------
  const { data: role, isLoading: roleLoading, refetch: refetchRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: () => fetchUserRole(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: userProjects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: () => fetchUserProjects(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const { data: userClasses, isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['user-classes', user?.id],
    queryFn: () => fetchUserClasses(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const { data: userApplications, isLoading: applicationsLoading, refetch: refetchApplications } = useQuery({
    queryKey: ['user-applications', user?.id, role],
    queryFn: () => fetchUserApplications(user!.id, role!),
    enabled: !!user && !!role,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
  });

  const { data: userEvents, isLoading: eventsQueryLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['user-events', user?.id, role],
    queryFn: () => fetchUserEvents(user!.id, role!),
    enabled: !!user && !!role,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!user) return;
    const roleCh = supabase.channel(`user_role_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${user.id}` }, () => refetchRole()).subscribe();
    const projCh = supabase.channel(`user_projects_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'project_members', filter: `user_id=eq.${user.id}` }, () => refetchProjects()).subscribe();
    const classCh = supabase.channel(`user_classes_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'class_enrollments', filter: `user_id=eq.${user.id}` }, () => refetchClasses()).subscribe();
    const appCh = supabase.channel(`user_applications_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `user_id=eq.${user.id}` }, () => refetchApplications()).subscribe();
    const evCh = supabase.channel(`user_event_records_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'event_attendance', filter: `user_id=eq.${user.id}` }, () => refetchEvents()).subscribe();
    return () => { void roleCh.unsubscribe(); void projCh.unsubscribe(); void classCh.unsubscribe(); void appCh.unsubscribe(); void evCh.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-subscribe when user id changes; refetches are stable
  }, [user?.id, refetchRole, refetchProjects, refetchClasses, refetchApplications, refetchEvents]);

  const profileLoading = roleLoading || projectsLoading || classesLoading || applicationsLoading || (eventsQueryLoading ?? false) || (!!user && !role);
  const isEBoard = role === 'admin';
  const isBoard = role === 'board';
  const isBoardOrAbove = role === 'board' || role === 'admin';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    role: role ?? null,
    roleLoading,
    profileLoading,
    isEBoard,
    isBoard,
    isBoardOrAbove,
    canManageRoles: role === 'admin',
    canManageApplications: role === 'board' || role === 'admin',
    canManageProjects: role === 'admin' || role === 'board',
    canManageClasses: role === 'board' || role === 'admin',
    canManageEvents: role === 'board' || role === 'admin',
    userProjects,
    projectsLoading,
    userClasses,
    classesLoading,
    userApplications,
    applicationsLoading,
    userEvents,
    eventsLoading: roleLoading || eventsQueryLoading || (!!user && !role),
    refreshProjects: async () => { await refetchProjects(); },
    refreshClasses: async () => { await refetchClasses(); },
    refreshApplications: async () => { await refetchApplications(); },
    refreshEvents: async () => { await refetchEvents(); },
    refreshAll: async () => { await Promise.all([refetchProjects(), refetchClasses(), refetchApplications(), refetchEvents()]); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------- Role badges (used in header, profile, member cards) ----------
function getRoleBadgeVariant(role: AppRole): 'default' | 'secondary' {
  if (role === 'admin') return 'default';
  return role as 'default' | 'secondary';
}

/** Renders a role badge for any app role (admin gets gold styling). Use for current user or other members. */
export function RoleBadge({ role, className }: { role: AppRole; className?: string }) {
  if (role === 'admin') {
    return (
      <Badge
        className={`capitalize shrink-0 whitespace-nowrap sparkle gold-shimmer text-yellow-900 font-semibold border-2 border-yellow-400/50 relative ${className ?? ''}`}
      >
        <span className="sparkle-particle" />
        <span className="sparkle-particle" />
        <span className="sparkle-particle" />
        <span className="relative z-10">{role.replace('-', ' ')}</span>
      </Badge>
    );
  }
  return (
    <Badge variant={getRoleBadgeVariant(role)} className={`capitalize shrink-0 whitespace-nowrap ${className ?? ''}`}>
      {role.replace('-', ' ')}
    </Badge>
  );
}

/** Current user's role badge. Use in header/sidebar and profile page. */
export function UserBadge({ className }: { className?: string }) {
  const { role } = useAuth();
  if (!role) return null;
  return <RoleBadge role={role} className={className} />;
}
