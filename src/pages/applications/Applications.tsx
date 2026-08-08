import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ApplicationCreateModal } from '@/components/modals/ApplicationCreateModal';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { canOpenApplicationForm, getNextSemesterStartIso } from '@/lib/semester';
import type { ApplicationWithProfile, ApplicationGroup } from '@/contexts/AuthContext';

/** Status chip base — mono uppercase micro-label per the design contract. */
const CHIP_BASE =
  'inline-flex items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';

const Applications = ({ openCreateModal: openCreateModalProp = false }: { openCreateModal?: boolean }) => {
  const { isBoardOrAbove, userApplications, applicationsLoading, refreshApplications } = useProfile();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const openFromRoute = location.pathname === '/applications/new';
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!openCreateModalProp);
  const [applyGateReady, setApplyGateReady] = useState(false);
  const [canApply, setCanApply] = useState(false);
  const [nextSemesterStartIso, setNextSemesterStartIso] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([canOpenApplicationForm(), getNextSemesterStartIso()]).then(([open, next]) => {
      if (cancelled) return;
      setCanApply(open);
      setNextSemesterStartIso(next);
      setApplyGateReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Open create modal from /applications/new only during the application window; otherwise leave the route.
  useEffect(() => {
    if (!applyGateReady || !openFromRoute) return;
    if (canApply) {
      setIsCreateModalOpen(true);
    } else {
      navigate('/applications', { replace: true });
    }
  }, [applyGateReady, openFromRoute, canApply, navigate]);

  useEffect(() => {
    if (!applyGateReady || !openCreateModalProp) return;
    if (canApply) setIsCreateModalOpen(true);
  }, [applyGateReady, openCreateModalProp, canApply]);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    if (location.pathname === '/applications/new') {
      navigate('/applications', { replace: true });
    }
  };
  const [myApplicationsCollapsed, setMyApplicationsCollapsed] = useState(false);
  const [myPendingCollapsed, setMyPendingCollapsed] = useState(false);
  const [myReviewedCollapsed, setMyReviewedCollapsed] = useState(true);
  const [reviewApplicationsCollapsed, setReviewApplicationsCollapsed] = useState(false);
  const [reviewPendingCollapsed, setReviewPendingCollapsed] = useState(false);
  const [reviewReviewedCollapsed, setReviewReviewedCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const applyButtonDisabled = !applyGateReady || !canApply;
  const applicationClosedTooltip =
    nextSemesterStartIso != null
      ? `Application Week starts on ${new Date(nextSemesterStartIso).toLocaleDateString(undefined, { dateStyle: 'medium' })}.`
      : 'Application Week has not started yet.';


  /** Build searchable string for an application (name, email, type, role, class/project name). */
  const getSearchableText = (app: ApplicationWithProfile): string => {
    const parts: string[] = [
      app.profiles?.full_name ?? '',
      app.profiles?.email ?? '',
      app.application_type ?? '',
      app.class_role ?? '',
      app.project_role ?? '',
      app.board_position ?? '',
      app.classes?.name ?? '',
      app.projects?.name ?? '',
    ];
    return parts.filter(Boolean).join(' ').toLowerCase();
  };

  const applicationMatchesSearch = (app: ApplicationWithProfile): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return getSearchableText(app).includes(query);
  };

  const groupMatchesSearch = (group: ApplicationGroup): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    if (group.applicantName.toLowerCase().includes(query)) return true;
    return group.applications.some(applicationMatchesSearch);
  };

  /** Status chip class per the ink/outline/strike/grey status system. */
  const getStatusChipClass = (status: string): string => {
    switch (status) {
      case 'accepted':
        return 'border-foreground bg-foreground text-page';
      case 'rejected':
        return 'border-border text-muted-foreground line-through decoration-primary decoration-2';
      case 'pending':
      case 'submitted':
        return 'border-border text-foreground';
      default:
        // draft / withdrawn / anything else
        return 'border-grey-3 text-grey-2';
    }
  };

  const formatApplicationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getApplicationTarget = (application: ApplicationWithProfile) => {
    if (application.application_type === 'board' && application.board_position) {
      return application.board_position;
    }
    return formatApplicationType(application.application_type);
  };

  /** Dot class by status (only used in review-pending section). */
  const getReviewPendingDotClass = (a: ApplicationWithProfile, currentAppId: string) => {
    if (a.id === currentAppId) return 'bg-primary application-dot-current';
    if (a.status === 'accepted') return 'bg-foreground opacity-80';
    if (a.status === 'rejected') return 'bg-destructive opacity-80';
    return 'bg-grey-3';
  };

  const renderApplicationCard = (
    app: ApplicationWithProfile,
    samePersonApplications?: ApplicationWithProfile[],
    dotVariant?: 'review-pending'
  ) => {
    const showDots =
      dotVariant === 'review-pending' && samePersonApplications && samePersonApplications.length > 1;
    const sortedSame = showDots
      ? [...samePersonApplications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      : [];

    return (
      <div
        key={app.id}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline-faint px-2 py-3 transition-colors hover:bg-tint"
      >
        <div className="min-w-0 flex-1 basis-44">
          <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {getApplicationTarget(app)}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">
            {app.profiles?.full_name ?? 'Applicant'}
          </p>
        </div>
        {showDots && (
          <div className="flex shrink-0 items-center gap-1" title={`${sortedSame.length} applications from this person`}>
            {sortedSame.map((a) => (
              <span
                key={a.id}
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${getReviewPendingDotClass(a, app.id)}`}
                aria-hidden
              />
            ))}
          </div>
        )}
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {new Date(app.created_at).toLocaleDateString()}
        </span>
        <span className={`${CHIP_BASE} shrink-0 ${getStatusChipClass(app.status)}`}>
          {app.status}
        </span>
        {!isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                window.open(`/applications/${app.id}`, '_blank', 'noopener');
              } else {
                navigate(`/applications/${app.id}`);
              }
            }}
            className="h-9 shrink-0 px-3"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isBoardOrAbove ? 'Review' : 'View'}
          </Button>
        )}
      </div>
    );
  };

  const renderApplicationSection = (
    title: string,
    applications: ApplicationWithProfile[],
    collapsed: boolean,
    onToggle: () => void,
    allFromSamePerson?: ApplicationWithProfile[]
  ) => {
    if (applications.length === 0) return null;

    return (
      <Collapsible open={!collapsed} onOpenChange={onToggle}>
        <div className="space-y-3">
          <CollapsibleTrigger asChild>
            <button className="h-auto w-full border-0 p-0 text-left hover:bg-transparent focus:bg-transparent active:bg-transparent">
              <div className="flex w-full items-center gap-2">
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {title}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-grey-3">
                  {applications.length}
                </span>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={`border-t border-border ${isMobile ? 'ml-0' : 'ml-6'}`}>
              {applications.map((app) => renderApplicationCard(app, allFromSamePerson, undefined))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  /** Renders review pending (flat by time) with status dots. */
  const renderReviewPendingSection = (
    title: string,
    applications: ApplicationWithProfile[],
    collapsed: boolean,
    onToggle: () => void,
    allReviewByUser: Map<string, ApplicationWithProfile[]>
  ) => {
    if (applications.length === 0) return null;
    return (
      <Collapsible open={!collapsed} onOpenChange={onToggle}>
        <div className="space-y-3">
          <CollapsibleTrigger asChild>
            <button className="h-auto w-full border-0 p-0 text-left hover:bg-transparent focus:bg-transparent active:bg-transparent">
              <div className="flex w-full items-center gap-2">
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {title}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-grey-3">
                  {applications.length}
                </span>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={`border-t border-border ${isMobile ? 'ml-0' : 'ml-6'}`}>
              {applications.map((app) => {
                const samePerson = (allReviewByUser.get(app.user_id) ?? []).sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                return renderApplicationCard(app, samePerson, 'review-pending');
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  /** Renders a review section with applications grouped by applicant (no dots). */
  const renderReviewSection = (
    title: string,
    groups: ApplicationGroup[],
    collapsed: boolean,
    onToggle: () => void
  ) => {
    const totalCount = groups.reduce((acc, g) => acc + g.applications.length, 0);
    if (totalCount === 0) return null;

    return (
      <Collapsible open={!collapsed} onOpenChange={onToggle}>
        <div className="space-y-3">
          <CollapsibleTrigger asChild>
            <button className="h-auto w-full border-0 p-0 text-left hover:bg-transparent focus:bg-transparent active:bg-transparent">
              <div className="flex w-full items-center gap-2">
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {title}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-grey-3">
                  {totalCount}
                </span>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={`space-y-6 ${isMobile ? 'ml-0' : 'ml-6'}`}>
              {groups.map((group) => (
                <div key={group.user_id} className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold">{group.applicantName}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
                      {group.applications.length} {group.applications.length === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                  <div className="border-t border-border">
                    {group.applications.map((app) => renderApplicationCard(app, undefined, undefined))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  // Filter by search (name, email, type, role, class/project name)
  const filteredSelfPending = !userApplications
    ? []
    : userApplications.self.pending.filter(applicationMatchesSearch);
  const filteredSelfDecided = !userApplications
    ? []
    : userApplications.self.decided.filter(applicationMatchesSearch);
  const filteredReviewPending = !userApplications
    ? []
    : userApplications.review.pending.filter(applicationMatchesSearch);
  const filteredReviewDecided = !userApplications
    ? []
    : !searchQuery.trim()
      ? userApplications.review.decided
      : userApplications.review.decided
        .filter(groupMatchesSearch)
        .map((g) => ({
          ...g,
          applications: g.applications.filter(applicationMatchesSearch),
        }))
        .filter((g) => g.applications.length > 0);

  const myApplicationsTotal = filteredSelfPending.length + filteredSelfDecided.length;
  const reviewApplicationsTotal =
    filteredReviewPending.length +
    filteredReviewDecided.reduce((acc, g) => acc + g.applications.length, 0);
  const selfCountAll = userApplications
    ? userApplications.self.pending.length + userApplications.self.decided.length
    : 0;
  const reviewCountAll = userApplications
    ? userApplications.review.pending.length +
    userApplications.review.decided.reduce((acc, g) => acc + g.applications.length, 0)
    : 0;
  const hasAnyApplicationsUnfiltered = selfCountAll + reviewCountAll > 0;
  const showEmptySearchState = searchQuery.trim() && myApplicationsTotal === 0 && reviewApplicationsTotal === 0;

  // When searching, open all folders/sections that contain results
  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (myApplicationsTotal > 0) {
      setMyApplicationsCollapsed(false);
      if (filteredSelfPending.length > 0) setMyPendingCollapsed(false);
      if (filteredSelfDecided.length > 0) setMyReviewedCollapsed(false);
    }
    if (reviewApplicationsTotal > 0) {
      setReviewApplicationsCollapsed(false);
      if (filteredReviewPending.length > 0) setReviewPendingCollapsed(false);
      if (filteredReviewDecided.length > 0) setReviewReviewedCollapsed(false);
    }
  }, [
    searchQuery,
    myApplicationsTotal,
    reviewApplicationsTotal,
    filteredSelfPending.length,
    filteredSelfDecided.length,
    filteredReviewPending.length,
    filteredReviewDecided.length,
  ]);

  /** All review applications by user_id (pending + decided) for status dots in pending section. */
  const allReviewByUser = (() => {
    const map = new Map<string, ApplicationWithProfile[]>();
    for (const app of userApplications?.review.pending ?? []) {
      const list = map.get(app.user_id) ?? [];
      list.push(app);
      map.set(app.user_id, list);
    }
    for (const g of userApplications?.review.decided ?? []) {
      for (const app of g.applications) {
        const list = map.get(app.user_id) ?? [];
        list.push(app);
        map.set(app.user_id, list);
      }
    }
    return map;
  })();

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-10">
      {/* Page header */}
      <header className="border-b border-border pb-6">
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-end justify-between gap-4'}`}>
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Applications
            </p>
            <h1 className="mt-2 font-mono text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
              Applications
            </h1>
            <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
              {applicationsLoading
                ? 'Loading applications...'
                : `${selfCountAll} filed by you${reviewCountAll > 0 ? ` · ${reviewCountAll} for review` : ''}`}
            </p>
          </div>
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center'}`}>
            {applyButtonDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={hasAnyApplicationsUnfiltered && !isMobile ? 'inline-flex shrink-0' : 'inline-flex'}>
                    <Button
                      type="button"
                      disabled
                      className={hasAnyApplicationsUnfiltered && !isMobile ? 'shrink-0' : ''}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Application
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{applyGateReady ? applicationClosedTooltip : 'Checking application window…'}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={hasAnyApplicationsUnfiltered && !isMobile ? 'shrink-0' : ''}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            )}
            {hasAnyApplicationsUnfiltered && (
              <div className={`relative ${isMobile ? 'w-40' : 'w-64'}`}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={isMobile ? 'Search' : 'Search applications...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {applicationsLoading ? (
        <div className="mt-6 border border-border p-8">
          <p className="text-center font-mono text-sm text-muted-foreground">Loading applications...</p>
        </div>
      ) : !userApplications || !hasAnyApplicationsUnfiltered ? (
        <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            No applications
          </p>
          <p className="mx-auto mt-2 max-w-[68ch] text-sm text-muted-foreground">
            {applyGateReady && !canApply
              ? 'Applications are only open Sunday–Wednesday during week zero before each term. Use the New Application button tooltip for the next term start when available.'
              : 'No applications yet. When applications are open, use New Application to get started.'}
          </p>
        </div>
      ) : showEmptySearchState ? (
        <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            No matches
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No applications match your search criteria.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* My Applications Folder */}
          {myApplicationsTotal > 0 && (
            <Collapsible open={!myApplicationsCollapsed} onOpenChange={setMyApplicationsCollapsed}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <button className="h-auto w-full border-0 p-0 text-left hover:bg-transparent focus:bg-transparent active:bg-transparent">
                    <div className="flex w-full items-center gap-2 border-b border-border pb-2">
                      {myApplicationsCollapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                      <h2 className="font-mono text-lg font-extrabold tracking-[-0.02em]">My Applications</h2>
                      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                        {myApplicationsTotal}
                      </span>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  {/* My Pending Applications (by time, no dots) */}
                  {renderApplicationSection(
                    "Pending",
                    filteredSelfPending,
                    myPendingCollapsed,
                    () => setMyPendingCollapsed(!myPendingCollapsed),
                    undefined
                  )}

                  {/* My Reviewed Applications (by time, no dots) */}
                  {renderApplicationSection(
                    "Reviewed",
                    filteredSelfDecided,
                    myReviewedCollapsed,
                    () => setMyReviewedCollapsed(!myReviewedCollapsed),
                    undefined
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Review Applications Folder */}
          {reviewApplicationsTotal > 0 && (
            <Collapsible open={!reviewApplicationsCollapsed} onOpenChange={setReviewApplicationsCollapsed}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <button className="h-auto w-full border-0 p-0 text-left hover:bg-transparent focus:bg-transparent active:bg-transparent">
                    <div className="flex w-full items-center gap-2 border-b border-border pb-2">
                      {reviewApplicationsCollapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                      <h2 className="font-mono text-lg font-extrabold tracking-[-0.02em]">Review Applications</h2>
                      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                        {reviewApplicationsTotal}
                      </span>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  {/* Review Pending (flat by time, status dots, current pulsating) */}
                  {renderReviewPendingSection(
                    "Pending Review",
                    filteredReviewPending,
                    reviewPendingCollapsed,
                    () => setReviewPendingCollapsed(!reviewPendingCollapsed),
                    allReviewByUser
                  )}

                  {/* Review Decided (grouped by applicant only, no dots) */}
                  {renderReviewSection(
                    "Reviewed",
                    filteredReviewDecided,
                    reviewReviewedCollapsed,
                    () => setReviewReviewedCollapsed(!reviewReviewedCollapsed)
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </div>
      )}

      <ApplicationCreateModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={() => {
          handleCloseCreateModal();
          refreshApplications();
          // Invalidate the applications query to refresh the UI
          queryClient.invalidateQueries({ queryKey: ['user-applications'] });
        }}
      />
    </div>
  );
};

export default Applications;
