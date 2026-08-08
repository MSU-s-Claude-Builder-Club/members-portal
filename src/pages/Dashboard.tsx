import { useProfile, type Project, type Class } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Calendar,
  FolderKanban,
  BookOpen,
  ArrowRight,
  FileText,
  Crown,
  Users,
  Award,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import TextType from '@/components/ui/text-type';

// Dashboard uses types from AuthContext and separate queries

type AdminStats = {
  members: number;
  board: number;
  eBoard: number;
};


// --- Helper Functions ---
const getStatus = (
  item: Project | Class,
): { variant: 'gray' | 'green' | 'blue', label: string } => {
  if (!item.semesters) return { variant: 'gray', label: 'Unknown' };
  const now = new Date();
  const startDate = new Date(item.semesters.start_date);
  const endDate = new Date(item.semesters.end_date);

  if (startDate > now) {
    return { variant: 'green', label: 'Available' };
  }
  if (endDate < now) {
    return { variant: 'gray', label: 'Completed' };
  }
  return { variant: 'blue', label: 'Current' };
}

// Derived term label for the page-header meta line (receipts, not adjectives)
const getTermLabel = (d: Date) =>
  `${d.getMonth() >= 7 ? 'FALL' : d.getMonth() >= 4 ? 'SUMMER' : 'SPRING'} ${d.getFullYear()}`;

// Dashboard data is now sourced from AuthContext and separate admin queries

export default function Dashboard() {
  const { role, profileLoading, isEBoard, isBoardOrAbove, userProjects, userClasses, userEvents, userApplications } = useProfile();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Fetch admin stats for E-Board
  const { data: adminStats, isLoading: adminStatsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: rolesRes } = await supabase.from('user_roles').select('role');

      return {
        members: rolesRes?.filter(r => r.role !== 'prospect').length || 0,
        board: rolesRes?.filter(r => r.role === 'board').length || 0,
        eBoard: rolesRes?.filter(r => r.role === 'admin').length || 0,
      };
    },
    enabled: isEBoard,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  // Fetch all projects and classes for board members
  const { data: allProjects, isLoading: allProjectsLoading } = useQuery<Project[]>({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, semesters (code, name, start_date, end_date), project_members(count)`);

      if (error) throw error;

      // Remove projects with an end_date previous to now
      return (data || [])
        .filter(
          (p) =>
            !p.semesters ||
            !p.semesters.end_date ||
            new Date(p.semesters.end_date) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.semesters?.start_date ?? 0).getTime() -
            new Date(b.semesters?.start_date ?? 0).getTime()
        );
    },
    enabled: isBoardOrAbove,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: allClasses, isLoading: allClassesLoading } = useQuery<Class[]>({
    queryKey: ['all-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`*, semesters (code, name, start_date, end_date), class_enrollments(count)`)

      if (error) throw error;

      // Remove classes with an end_date previous to now
      return (data || [])
        .filter(
          (p) =>
            !p.semesters ||
            !p.semesters.end_date ||
            new Date(p.semesters.end_date) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.semesters?.start_date ?? 0).getTime() -
            new Date(b.semesters?.start_date ?? 0).getTime()
        );
    },
    enabled: isBoardOrAbove,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const isLoading = profileLoading || (isEBoard && adminStatsLoading) || (isBoardOrAbove && (allProjectsLoading || allClassesLoading));

  // --- Sub-Components ---


  const PageHeader = () => {
    const now = new Date();

    return (
      <header className="border-b border-border pb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 font-mono text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-4xl">
          <TextType
            text={[`Welcome back, ${profile.full_name?.split(' ')[0] || ''}!`]}
            // cursorCharacter="|"
            cursorCharacter="█"
            loop={false}
            variableSpeed={{ min: 50, max: 120 }}
            cursorBlinkDuration={0.5}
            hideCursorWhileTyping={false}
          />
        </h1>
        <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
          {getTermLabel(now)} · {format(now, 'EEE MMM d, yyyy').toUpperCase()}
        </p>
      </header>
    );
  };

  type StatItemProps = {
    icon: React.ElementType,
    value: number | string,
    label: string,
    link?: string,
    emphasis?: boolean,
  };

  const StatItem = ({ icon: Icon, value, label, link, emphasis }: StatItemProps) => (
    <div
      className={`group relative -ml-px -mt-px flex flex-col border border-border bg-page p-5${link ? ' cursor-pointer transition-colors hover:bg-tint' : ''}`}
      onClick={() => link && navigate(link)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
      <div
        className={`mt-4 font-sans font-bold tracking-[-0.02em] ${typeof value === 'string' ? 'text-2xl capitalize' : 'text-4xl tabular-nums'} ${emphasis ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </div>
      {link && (
        <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          View{' '}
          <span
            aria-hidden="true"
            className="inline-block transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
          >
            →
          </span>
        </p>
      )}
    </div>
  );

  const StatsGrid = () => {
    // E-Board shows admin stats
    if (isEBoard && adminStats) {

      return (
        <div className="grid grid-cols-2 pl-px pt-px lg:grid-cols-4">
          <StatItem
            icon={Users}
            value={adminStats.members}
            label={adminStats.members === 1 ? "Active Member" : "Active Members"}
            link="/members"
          />
          <StatItem
            icon={FileText}
            emphasis
            value={userApplications?.review.pending.length ?? 0}
            label={(userApplications?.review.pending.length ?? 0) === 1 ? "Pending Application" : "Pending Applications"}
            link="/applications"
          />
          <StatItem
            icon={Award}
            value={adminStats.board}
            label={adminStats.board === 1 ? "Board Member" : "Board Members"}
            link="/members"
          />
          <StatItem
            icon={Crown}
            value={adminStats.eBoard}
            label={adminStats.eBoard === 1 ? "E-Board Member" : "E-Board Members"}
            link="/members"
          />
        </div>
      );
    }

    // Everyone else shows personal stats (from AuthContext)
    return (
      <div className="grid grid-cols-2 pl-px pt-px lg:grid-cols-3">
        <StatItem
          emphasis
          icon={FolderKanban}
          value={
            userProjects.inProgress.length > 0
              ? userProjects.inProgress.length
              : userProjects.assigned.length || 0
          }
          label={
            userProjects.inProgress.length > 0
              ? (userProjects.inProgress.length === 1 ? "Active Project" : "Active Projects")
              : (userProjects.assigned.length === 1 ? "Assigned Project" : "Assigned Projects")
          }
          link="/projects"
        />
        <StatItem
          icon={BookOpen}
          value={
            userClasses.inProgress.length > 0
              ? userClasses.inProgress.length
              : userClasses.enrolled.length || 0
          }
          label={
            userClasses.inProgress.length > 0
              ? (userClasses.inProgress.length === 1 ? "Active Class" : "Active Classes")
              : (userClasses.enrolled.length === 1 ? "Enrolled Class" : "Enrolled Classes")
          }
          link="/classes"
        />
        <StatItem
          icon={Award}
          value={role?.replace('-', ' ') || 'Prospect'}
          label="Status"
        />
      </div>
    );
  };

  const EventsCard = () => {
    // Show only attending events for members, all events for admins
    const allEvents = userEvents
      ? (isBoardOrAbove
        ? ((userEvents.attending ?? []).concat(userEvents.notAttending ?? []))
          .slice()
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .filter(event => new Date(event.event_date) >= new Date()) // Only future events
          .slice(0, 5)
        : (userEvents.attending ?? [])
          .slice()
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .filter(event => new Date(event.event_date) >= new Date()) // Only future events
          .slice(0, 5))
      : [];

    return (
      <Card className="flex h-full min-w-[300px] flex-col">
        <CardHeader className="shrink-0 space-y-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="font-mono text-sm font-extrabold uppercase tracking-[0.08em]">
                Upcoming Events
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
                {`${allEvents.length} event${allEvents.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/events')}
              className="group shrink-0 rounded-none font-mono text-xs font-semibold uppercase tracking-[0.1em] hover:bg-tint hover:text-foreground"
            >
              View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center p-6 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Loading...</div>
          ) : allEvents.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="flex w-full flex-col items-center gap-2 border border-dashed border-grey-3 px-6 py-8 text-center">
                <Calendar className="h-6 w-6 text-grey-3" aria-hidden="true" />
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">No upcoming events</p>
              </div>
            </div>
          ) : (
            <div>
              {allEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events?id=${event.id}`)}
                  className="group cursor-pointer border-b border-hairline-faint px-4 py-3 transition-colors last:border-b-0 hover:bg-tint"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-sans text-sm font-semibold text-foreground">{event.name}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ResourceCard = ({ type }: { type: 'Projects' | 'Classes' }) => {
    const isProject = type === 'Projects';
    const Icon = isProject ? FolderKanban : BookOpen;
    const link = isProject ? '/projects' : '/classes';

    // For board/admin: show all projects/classes from dashboard query
    // For members: show their projects/classes from AuthContext
    let items: (Project | Class)[] = [];
    let title = '';

    if (isBoardOrAbove) {
      items = isProject
        ? (allProjects || [])
        : (allClasses || []);
      title = `All ${type}`;
    } else {
      items = isProject
        ? ([...(userProjects?.inProgress || []), ...(userProjects?.assigned || [])])
        : ([...(userClasses?.inProgress || []), ...(userClasses?.enrolled || [])]);
      title = `Your ${type}`;
    }

    const singularMap: Record<string, string> = { Projects: 'project', Classes: 'class' };
    const desc = `${items.length} ${items.length === 1 ? singularMap[type] : type.toLowerCase()}`;

    return (
      <Card className="flex h-full min-w-[300px] flex-col">
        <CardHeader className="shrink-0 space-y-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="font-mono text-sm font-extrabold uppercase tracking-[0.08em]">
                {title}
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
                {desc}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(link)}
              className="group shrink-0 rounded-none font-mono text-xs font-semibold uppercase tracking-[0.1em] hover:bg-tint hover:text-foreground"
            >
              View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center p-6 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="flex w-full flex-col items-center gap-2 border border-dashed border-grey-3 px-6 py-8 text-center">
                <Icon className="h-6 w-6 text-grey-3" aria-hidden="true" />
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">No active {type.toLowerCase()}</p>
              </div>
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const status = getStatus(item);
                const count = 'project_members' in item ? item.project_members[0].count : item.class_enrollments[0].count;

                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      navigate(`${link}?id=${item.id}`);
                    }}
                    className="group cursor-pointer border-b border-hairline-faint px-4 py-3 transition-colors last:border-b-0 hover:bg-tint"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 max-w-[70%] truncate font-sans text-sm font-semibold text-foreground">{item.name}</p>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
                      {'client_name' in item && item.client_name && (
                        <span className="flex min-w-0 max-w-[80%] items-center gap-1.5">
                          <FolderKanban className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate capitalize">{item.client_name}</span>
                        </span>
                      )}
                      {'location' in item && item.location && (
                        <span className="flex min-w-0 max-w-[80%] items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate capitalize">{item.location}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        <span>{count}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-fit min-h-full w-full flex-col gap-6 p-6 md:gap-8 md:p-10">
      {/* 1. Page header */}
      <div className="shrink-0">
        <PageHeader />
      </div>

      {/* 2. Stats bento */}
      <div className="shrink-0">
        <StatsGrid />
      </div>

      {/* 3. Main Content Grid */}
      <div
        className={`grid flex-1 min-h-0 ${isMobile
          ? 'grid-cols-1 gap-4'
          : 'md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-y-4 xl:gap-y-4'
          }`}
      >
        <div
          className={`${isMobile ? 'h-[250px]' : 'min-h-0'
            } ${isMobile ? '' : 'md:col-span-1 md:row-span-2 xl:col-span-1 xl:row-span-2'}`}
        >
          <EventsCard />
        </div>

        <div
          className={`h-full ${isMobile ? 'h-[250px]' : 'min-h-[250px]'
            } md:col-span-1 xl:col-span-2`}
        >
          <ResourceCard type="Projects" />
        </div>

        <div
          className={`h-full ${isMobile ? 'h-[250px]' : 'min-h-[250px]'
            } md:col-span-1 xl:col-span-2`}
        >
          <ResourceCard type="Classes" />
        </div>
      </div>
    </div>
  );
}
