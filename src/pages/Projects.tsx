import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, type Project } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { getItemStatus, useFilteredItems } from '@/hooks/use-modal';
import { useDeepLinkModal } from '@/hooks/use-deep-link-modal';
import { DetailModal } from '@/components/modals/DetailModal';
import { EditModal } from '@/components/modals/EditModal';
import { MembersListModal } from '@/components/modals/MembersListModal';
import { ItemCard } from '@/components/ItemCard';
import SemesterSelector from '@/components/SemesterSelector';
import { Plus, Github, Calendar as CalendarIcon, Users, Eye, Edit, Mail } from 'lucide-react';
import type { Database } from '@/integrations/supabase/database.types';
import type { MembershipInfo, ItemWithMembers } from '@/types/modal.types';
import { escapeCsv } from '@/lib/utils';

type Semester = Database['public']['Tables']['semesters']['Row'];

type ProjectWithMembers = ItemWithMembers<Project>;

/** Status chip base — mono uppercase micro-label per the design contract. */
const CHIP_BASE =
  'inline-flex items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';

const Projects = () => {
  const { user } = useAuth();
  const { role, isBoardOrAbove, userProjects, projectsLoading, refreshProjects } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedLead, setSelectedLead] = useState<string>('');

  const modalState = useDeepLinkModal<ProjectWithMembers>(isBoardOrAbove);

  // Query for admin users to fetch all projects with member data
  const { data: allProjectsWithMembers, isLoading: allProjectsLoading } = useQuery({
    queryKey: ['all-projects-with-members'],
    queryFn: async () => {
      // Fetch all projects with semester data
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          semesters (
            code,
            name,
            start_date,
            end_date
          )
        `);

      if (projectsError || !projectsData) {
        throw projectsError || new Error('Failed to fetch projects');
      }

      // Fetch all project members
      const { data: membersData } = await supabase
        .from('project_members')
        .select('*')
        .order('role', { ascending: true });

      // Get unique user IDs from members
      const memberUserIds = [...new Set(membersData?.map(m => m.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberUserIds);

      // Filter out banned users
      const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
      const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

      // Transform into ProjectWithMembers
      const projectsWithMembers: ProjectWithMembers[] = (projectsData as Project[]).map(project => {
        const projectMembers = membersData?.filter(m => m.project_id === project.id) || [];
        const members: MembershipInfo[] = projectMembers
          .map(membership => ({
            id: membership.id,
            user_id: membership.user_id,
            role: membership.role,
            profile: profilesMap.get(membership.user_id)!,
          }))
          .filter(m => m.profile);

        const userMembership = members.find(m => m.user_id === user!.id);

        return {
          ...project,
          members,
          memberCount: members.length,
          userMembership,
        };
      })
        .sort((a, b) => {
          // Sort by semester start date (most recent first)
          const aStart = a.semesters?.start_date ? new Date(a.semesters.start_date) : new Date(0);
          const bStart = b.semesters?.start_date ? new Date(b.semesters.start_date) : new Date(0);
          return bStart.getTime() - aStart.getTime();
        });

      return projectsWithMembers;
    },
    enabled: !!user && !!role && isBoardOrAbove,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });

  // Query to fetch member data for user's projects
  const { data: userProjectsWithMembers, isLoading: userProjectsMembersLoading } = useQuery({
    queryKey: ['user-projects-members', user?.id],
    queryFn: async () => {
      if (!userProjects) return null;

      // Get all project IDs from userProjects
      const allProjectIds = [
        ...(userProjects.inProgress || []).map(p => p.id),
        ...(userProjects.assigned || []).map(p => p.id),
        ...(userProjects.completed || []).map(p => p.id),
        ...(userProjects.available || []).map(p => p.id),
      ];

      if (allProjectIds.length === 0) return null;

      // Fetch full project data with semester info for these projects
      const { data: fullProjectsData } = await supabase
        .from('projects')
        .select(`
          *,
          semesters (
            code,
            name,
            start_date,
            end_date
          )
        `)
        .in('id', allProjectIds);

      // Fetch member data for these projects
      const { data: membersData } = await supabase
        .from('project_members')
        .select('*')
        .in('project_id', allProjectIds);

      // Get unique user IDs from members
      const memberUserIds = [...new Set(membersData?.map(m => m.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberUserIds);

      // Filter out banned users
      const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
      const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

      // Create a map of full project data
      const fullProjectsMap = new Map(fullProjectsData?.map(p => [p.id, p]) || []);

      // Transform userProjects into ProjectWithMembers
      const transformProjects = (projects: typeof userProjects.inProgress) => {
        return projects.map(project => {
          const fullProject = fullProjectsMap.get(project.id);
          if (!fullProject) return null;

          const projectMembers = membersData?.filter(m => m.project_id === project.id) || [];
          const members: MembershipInfo[] = projectMembers
            .map(membership => ({
              id: membership.id,
              user_id: membership.user_id,
              role: membership.role,
              profile: profilesMap.get(membership.user_id)!,
            }))
            .filter(m => m.profile);

          const userMembership = members.find(m => m.user_id === user!.id);

          return {
            ...fullProject,
            members,
            memberCount: members.length,
            userMembership,
          };
        }).filter(Boolean) as ProjectWithMembers[];
      };

      return {
        inProgress: transformProjects(userProjects.inProgress || []),
        assigned: transformProjects(userProjects.assigned || []),
        completed: transformProjects(userProjects.completed || []),
        available: transformProjects(userProjects.available || []),
      };
    },
    enabled: !!user && !!role && !isBoardOrAbove && !!userProjects,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  // Load form data when editing
  useEffect(() => {
    if (modalState.modalType === 'edit' && modalState.selectedItem) {
      const project = modalState.selectedItem;
      setName(project.name);
      setDescription(project.description || '');
      setClientName(project.client_name || '');
      setSelectedSemester(project.semester_id ? { id: project.semester_id } as Semester : null);
      const lead = project.members.find(m => m.role === 'lead');
      setSelectedLead(lead ? lead.user_id : '');
    } else if (isCreateModalOpen) {
      // Reset form
      setName('');
      setDescription('');
      setClientName('');
      setSelectedSemester(null);
      setSelectedLead('');
    }
  }, [modalState.modalType, modalState.selectedItem, isCreateModalOpen]);

  // Determine which projects data to use
  const projectsData = isBoardOrAbove
    ? allProjectsWithMembers || []
    : userProjectsWithMembers
      ? [
        ...userProjectsWithMembers.inProgress,
        ...userProjectsWithMembers.assigned,
        ...userProjectsWithMembers.completed,
        ...userProjectsWithMembers.available,
      ]
      : [];

  const loading = isBoardOrAbove ? allProjectsLoading : (projectsLoading || userProjectsMembersLoading);

  const { available, inProgress, completed } = useFilteredItems(
    projectsData,
    (project, status) => {
      if (status.state === 'available') return true;
      return isBoardOrAbove || !!project.userMembership;
    }
  );

  // Restore selected item from URL parameter
  useEffect(() => {
    if (modalState.id && !modalState.selectedItem && projectsData.length > 0) {
      const item = projectsData.find(p => p.id === modalState.id);
      if (item) {
        modalState.setSelectedItem(item);
      } else if (isBoardOrAbove) {
        // For board users, fetch the project separately if not in visible list
        const fetchProjectById = async (id: string) => {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select(`
              *,
              semesters (
                code,
                name,
                start_date,
                end_date
              )
            `)
            .eq('id', id)
            .single();

          if (projectError || !projectData) {
            toast({
              title: 'Project Not Found',
              description: 'The requested project could not be found.',
              variant: 'destructive',
            });
            modalState.close();
            return;
          }

          // Fetch members for this project
          const { data: membersData } = await supabase
            .from('project_members')
            .select('*')
            .eq('project_id', id);

          const memberUserIds = [...new Set(membersData?.map(m => m.user_id) || [])];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', memberUserIds);

          const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
          const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

          const members: MembershipInfo[] = (membersData || [])
            .map(membership => ({
              id: membership.id,
              user_id: membership.user_id,
              role: membership.role,
              profile: profilesMap.get(membership.user_id)!,
            }))
            .filter(m => m.profile);

          const userMembership = members.find(m => m.user_id === user!.id);

          const projectWithMembers: ProjectWithMembers = {
            ...projectData as Project,
            members,
            memberCount: members.length,
            userMembership,
          };

          modalState.setSelectedItem(projectWithMembers);
        };

        fetchProjectById(modalState.id);
      } else {
        // Regular members can't access projects not in their list
        toast({
          title: 'Access Denied',
          description: 'You do not have access to this project.',
          variant: 'destructive',
        });
        modalState.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.id, projectsData, isBoardOrAbove, modalState.selectedItem]); // modalState, toast, user are stable

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!name.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSemester) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a term',
        variant: 'destructive',
      });
      return;
    }

    setSaveLoading(true);

    try {
      const projectData = {
        name,
        description: description || null,
        client_name: clientName || null,
        semester_id: selectedSemester?.id || null,
      };

      let projectId = modalState.selectedItem?.id;

      if (modalState.selectedItem) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', modalState.selectedItem.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Project updated!' });
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...projectData, created_by: user.id })
          .select('id')
          .single();
        if (error) throw error;
        projectId = data.id;
        toast({ title: 'Success', description: 'Project created!' });
      }

      // Handle lead assignment
      if (projectId) {
        // Remove existing lead if any
        await supabase
          .from('project_members')
          .delete()
          .eq('project_id', projectId)
          .eq('role', 'lead');

        // Add new lead if selected
        if (selectedLead) {
          const { error: leadError } = await supabase
            .from('project_members')
            .insert({
              project_id: projectId,
              user_id: selectedLead,
              role: 'lead'
            });
          if (leadError) throw leadError;
        }
      }

      await refreshProjects();

      // Invalidate admin projects queries if user is admin
      if (isBoardOrAbove) {
        queryClient.invalidateQueries({ queryKey: ['all-projects-with-members'] });
        queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      }

      modalState.close();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modalState.selectedItem) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', modalState.selectedItem.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }

    toast({ title: 'Success', description: 'Project deleted!' });
    await refreshProjects();

    // Invalidate admin projects queries if user is admin
    if (isBoardOrAbove) {
      queryClient.invalidateQueries({ queryKey: ['all-projects-with-members'] });
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
    }

    modalState.close();
  };

  const renderProjectCard = (project: ProjectWithMembers) => {
    const isMember = !!project.userMembership;
    const isLead = project.userMembership?.role === 'lead';
    const lead = project.members.find(m => m.role === 'lead');
    const status = getItemStatus(project);

    if (!status) return null;

    // Status chips per the ink/outline/grey system — flip on the card's ink flood
    const statusChipClass =
      status.state === 'in_progress'
        ? 'border-foreground bg-foreground text-page group-hover:border-page group-hover:bg-page group-hover:text-foreground'
        : status.state === 'completed'
          ? 'border-grey-3 text-grey-2'
          : 'border-border text-foreground group-hover:border-page group-hover:text-page';

    const badges = [];
    if (isMember && !isMobile) {
      badges.push(
        <span
          key="member"
          className={`${CHIP_BASE} shrink-0 border-border text-foreground transition-colors group-hover:border-page group-hover:text-page`}
        >
          {isLead ? 'Lead' : 'Member'}
        </span>
      );
    }
    badges.push(
      <span key="status" className={`${CHIP_BASE} shrink-0 transition-colors ${statusChipClass}`}>
        {status.label}
      </span>
    );

    const metadata = [];

    // Mono meta row: semester code · member count · lead
    metadata.push({
      icon: null,
      text: '',
      render: () => (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
          {project.semesters && <span>{project.semesters.code}</span>}
          {project.semesters && <span aria-hidden>·</span>}
          <button
            type="button"
            onClick={() => modalState.openMembers(project)}
            className="cursor-pointer underline decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
          </button>
          {lead && (
            <>
              <span aria-hidden>·</span>
              <span className="min-w-0">Lead: {lead.profile.full_name || lead.profile.email}</span>
            </>
          )}
        </div>
      ),
    });

    if (project.client_name) {
      metadata.push({
        icon: null,
        text: '',
        render: () => <div>Client: {project.client_name}</div>,
      });
    }

    // Only show GitHub link if project has started
    if (project.github_project_id && !isMobile) {
      metadata.push({
        icon: null,
        text: '',
        render: () => (
          <a
            href={`https://github.com/orgs/claude-msu/projects/${project.github_project_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 transition-colors hover:text-primary"
          >
            <span className="truncate">
              github.com/orgs/claude-msu/projects/{project.github_project_id}
            </span>
            <span aria-hidden className="shrink-0 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        ),
      });
    }

    const actions = [];

    actions.push({
      label: isBoardOrAbove ? 'Edit Details' : 'View Details',
      onClick: () => modalState.open(project, project.id),
      icon: isBoardOrAbove
        ? <Edit className="h-4 w-4 mr-2" />
        : <Eye className="h-4 w-4 mr-2" />,
      variant: isBoardOrAbove ? 'outline' : 'default',
    });

    if (isBoardOrAbove) {
      const copyProjectEmailsCsv = () => {
        const emails = (project.members ?? [])
          .map(m => m.profile?.email)
          .filter((e): e is string => Boolean(e));
        if (emails.length === 0) {
          toast({ title: 'No emails', description: 'No member emails to copy for this project.', variant: 'destructive' });
          return;
        }
        void navigator.clipboard.writeText(emails.map(escapeCsv).join(',')).then(() => {
          toast({ title: 'Copied', description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard as CSV` });
        });
      };
      actions.push({
        label: 'Copy member emails as CSV',
        onClick: copyProjectEmailsCsv,
        icon: <Mail className="h-4 w-4" />,
        variant: 'default',
        size: 'icon',
      });
    }

    return (
      <ItemCard
        title={project.name}
        badges={badges}
        metadata={metadata}
        description={project.description || undefined}
        members={{
          data: project.members,
          onViewAll: () => modalState.openMembers(project),
          maxDisplay: 5,
        }}
        actions={actions}
      />
    );
  };

  const renderSection = (label: string, projects: ProjectWithMembers[]) => (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </h2>
        <span className="font-mono text-[11px] tabular-nums text-grey-3">
          {String(projects.length).padStart(2, '0')}
        </span>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(375px,1fr))]">
        {projects.map(project => (
          <div key={project.id} className="min-w-0 w-full">
            {renderProjectCard(project)}
          </div>
        ))}
      </div>
    </section>
  );

  const projectCount = inProgress.length + available.length + completed.length;

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-10">
      {/* Page header */}
      <header className="border-b border-border pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Projects
            </p>
            <h1 className="mt-2 font-mono text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
              Project board
            </h1>
            <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
              {loading
                ? 'Loading projects...'
                : `${projectCount} ${projectCount === 1 ? 'project' : 'projects'} · ${inProgress.length} in progress · ${available.length} available · ${completed.length} completed`}
            </p>
          </div>
          {isBoardOrAbove && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="mt-6 border border-border p-8">
          <p className="text-center font-mono text-sm text-muted-foreground">Loading projects...</p>
        </div>
      ) : available.length === 0 && inProgress.length === 0 && completed.length === 0 ? (
        <div className="mt-6 border border-dashed border-grey-3 p-8 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            No projects
          </p>
          <p className="mt-2 text-sm text-muted-foreground">No projects at this time.</p>
          {isBoardOrAbove && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {inProgress.length > 0 && renderSection('In progress', inProgress)}

          {available.length > 0 && renderSection('Available', available)}

          {completed.length > 0 && renderSection('Completed', completed)}
        </div>
      )}

      {/* EDIT MODAL */}
      <EditModal
        open={isCreateModalOpen || modalState.modalType === 'edit'}
        onClose={() => {
          setIsCreateModalOpen(false);
          modalState.close();
        }}
        title={modalState.selectedItem ? 'Edit Project' : 'Create New Project'}
        description={modalState.selectedItem ? 'Update project details' : 'Add a new project'}
        onSubmit={handleSubmit}
        onDelete={modalState.selectedItem ? handleDelete : undefined}
        loading={saveLoading}
        deleteItemName={modalState.selectedItem?.name}
        submitLabel={modalState.selectedItem ? 'Update Project' : 'Create Project'}
      >
        <div className="space-y-2">
          <Label htmlFor="name" required>Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="AI Chatbot"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Project description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Claude.ai"
            />
          </div>

          <SemesterSelector
            value={selectedSemester?.id || ''}
            onSelect={setSelectedSemester}
            required
          />
        </div>
      </EditModal>

      {/* DETAIL MODAL */}
      {modalState.selectedItem && modalState.modalType === 'details' && (
        <DetailModal
          open={modalState.isOpen}
          onClose={modalState.close}
          title={modalState.selectedItem.name}
          subtitle={modalState.selectedItem.client_name ? `Client: ${modalState.selectedItem.client_name}` : undefined}
          sections={[
            ...(modalState.selectedItem.description
              ? [
                {
                  title: 'Description',
                  content: modalState.selectedItem.description,
                },
              ]
              : []),
            ...(modalState.selectedItem.semesters
              ? [
                {
                  title: 'Term',
                  icon: <CalendarIcon className="h-4 w-4" />,
                  content: `${modalState.selectedItem.semesters.code} - ${modalState.selectedItem.semesters.name}`,
                },
              ]
              : []),
            {
              title: 'Team Size',
              icon: <Users className="h-4 w-4" />,
              content: `${modalState.selectedItem.memberCount} ${modalState.selectedItem.memberCount === 1 ? 'member' : 'members'
                }`,
            },
            ...(modalState.selectedItem.semesters
              ? [
                {
                  title: 'Dates',
                  icon: <CalendarIcon className="h-4 w-4" />,
                  content: `${modalState.selectedItem.semesters.start_date
                    ? `Start: ${new Date(modalState.selectedItem.semesters.start_date).toLocaleDateString()}`
                    : ''
                    }${modalState.selectedItem.semesters.end_date
                      ? ` | End: ${new Date(modalState.selectedItem.semesters.end_date).toLocaleDateString()}`
                      : ''
                    }`,
                },
              ]
              : []),
            ...(modalState.selectedItem.members.some(m => m.role === 'lead')
              ? [
                {
                  title: 'Project Lead',
                  content: (
                    <div className="flex items-center gap-2">
                      {modalState.selectedItem.members
                        .filter(m => m.role === 'lead')
                        .map(m => (
                          <div key={m.id} className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{m.profile.full_name || 'No name'}</span>
                            <span className="font-mono text-xs text-muted-foreground">{m.profile.email}</span>
                          </div>
                        ))}
                    </div>
                  ),
                },
              ]
              : []),
            ...(() => {
              // Check if project has started for GitHub access
              const projectHasStarted = modalState.selectedItem!.semesters?.start_date
                ? new Date(modalState.selectedItem!.semesters.start_date) <= new Date()
                : false;

              return projectHasStarted ? [{
                title: 'GitHub Project',
                content: (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://github.com/orgs/claude-msu/projects/${modalState.selectedItem!.github_project_id}`,
                        '_blank'
                      )
                    }
                    className="group/gh inline-flex w-full items-center justify-between gap-2 border border-border px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      {`GitHub Project #${modalState.selectedItem!.github_project_id}`}
                    </span>
                    <span aria-hidden className="transition-transform group-hover/gh:translate-x-0.5">→</span>
                  </button>
                ),
              }] : [];
            })(),
          ]}
        />
      )}

      {/* MEMBERS MODAL */}
      {modalState.selectedItem && modalState.modalType === 'members' && (
        <MembersListModal
          open={modalState.isOpen}
          onClose={modalState.close}
          title={`${modalState.selectedItem.name} - Team Members`}
          members={modalState.selectedItem.members}
          entityType="project"
          entityId={modalState.selectedItem.id}
          onMemberRemoved={refreshProjects}
        />
      )}
    </div>
  );
};

export default Projects;
