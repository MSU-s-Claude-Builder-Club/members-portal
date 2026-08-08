import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, type Class } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import SemesterSelector from '@/components/SemesterSelector';
import { Plus, MapPin, Users, Edit, Calendar as CalendarIcon, Eye, Crown, BookOpen, Mail } from 'lucide-react';
import type { Database } from '@/integrations/supabase/database.types';
import type { MembershipInfo, ItemWithMembers } from '@/types/modal.types';
import { useNavigate } from 'react-router-dom';
import { cn, escapeCsv } from '@/lib/utils';

type Semester = Database['public']['Tables']['semesters']['Row'];

type ClassWithMembers = ItemWithMembers<Class>;

/** Classes with a dedicated hardcoded resource-page route (see App.tsx). A class
 *  "links" to one by having a name that slugifies to its slug; any other class
 *  has no page and must not render a "View Class Page" link (it would 404). */
const CLASS_PAGE_SLUGS = new Set([
  'introduction-to-fundamentals',
  'guide-to-leetcode',
  'the-founders-track',
]);

/* DESIGN.md recipes — status chips (§5), CTAs (§5), eyebrows (§3) */
const CHIP_BASE =
  'inline-flex items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 motion-reduce:transition-none';
const CTA_BASE =
  'inline-flex min-h-[40px] items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50';
const CTA_PRIMARY = `${CTA_BASE} border-2 border-border bg-page text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:border-page`;
const CTA_QUIET = `${CTA_BASE} border border-border bg-page text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:border-page`;
const EYEBROW =
  'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground';

/* Status chips per §5: in progress = ink fill; available = outline; completed = past grey.
   Each carries its ink-flood flip so it stays legible when the card floods. */
const statusChipClass = (state: 'available' | 'in_progress' | 'completed') => {
  if (state === 'in_progress') {
    return `${CHIP_BASE} border-foreground bg-foreground text-page group-hover:border-page group-hover:bg-page group-hover:text-foreground`;
  }
  if (state === 'completed') {
    return `${CHIP_BASE} border-grey-3 text-grey-2`;
  }
  return `${CHIP_BASE} border-border text-foreground group-hover:border-page group-hover:text-page`;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Classes = () => {
  const { user } = useAuth();
  const { role, isBoardOrAbove, userClasses, classesLoading, refreshClasses } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const modalState = useDeepLinkModal<ClassWithMembers>(isBoardOrAbove);

  // Query for admin users to fetch all classes with enrollment data
  const { data: allClassesWithMembers, isLoading: allClassesLoading } = useQuery({
    queryKey: ['all-classes-with-members'],
    queryFn: async () => {
      // Fetch all classes with semester data
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          semesters (
            code,
            name,
            start_date,
            end_date
          )
        `);

      if (classesError || !classesData) {
        throw classesError || new Error('Failed to fetch classes');
      }

      // Fetch all class enrollments
      const { data: enrollmentsData } = await supabase
        .from('class_enrollments')
        .select('*')
        .order('role', { ascending: true });

      // Get unique user IDs from enrollments
      const enrolledUserIds = [...new Set(enrollmentsData?.map(e => e.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', enrolledUserIds);

      // Filter out banned users
      const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
      const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

      // Transform into ClassWithMembers
      const classesWithMembers: ClassWithMembers[] = (classesData as Class[]).map(cls => {
        const classEnrollments = enrollmentsData?.filter(e => e.class_id === cls.id) || [];
        const members: MembershipInfo[] = classEnrollments
          .map(enrollment => ({
            id: enrollment.id,
            user_id: enrollment.user_id,
            role: enrollment.role,
            profile: profilesMap.get(enrollment.user_id)!,
          }))
          .filter(m => m.profile);

        const userEnrollment = members.find(m => m.user_id === user!.id);

        return {
          ...cls,
          members,
          memberCount: members.length,
          userMembership: userEnrollment,
        };
      })
        .sort((a, b) => {
          // Sort by semester start date (most recent first)
          const aStart = a.semesters?.start_date ? new Date(a.semesters.start_date) : new Date(0);
          const bStart = b.semesters?.start_date ? new Date(b.semesters.start_date) : new Date(0);
          return bStart.getTime() - aStart.getTime();
        });

      return classesWithMembers;
    },
    enabled: !!user && !!role && isBoardOrAbove,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });

  // Query to fetch enrollment data for user's classes
  const { data: userClassesWithMembers, isLoading: userClassesMembersLoading } = useQuery({
    queryKey: ['user-classes-members', user?.id],
    queryFn: async () => {
      if (!userClasses) return null;

      // Get all class IDs from userClasses
      const allClassIds = [
        ...(userClasses.inProgress || []).map(c => c.id),
        ...(userClasses.enrolled || []).map(c => c.id),
        ...(userClasses.completed || []).map(c => c.id),
        ...(userClasses.available || []).map(c => c.id),
      ];

      if (allClassIds.length === 0) return null;

      // Fetch full class data with semester info for these classes
      const { data: fullClassesData } = await supabase
        .from('classes')
        .select(`
          *,
          semesters (
            code,
            name,
            start_date,
            end_date
          )
        `)
        .in('id', allClassIds);

      // Fetch enrollment data for these classes
      const { data: enrollmentsData } = await supabase
        .from('class_enrollments')
        .select('*')
        .in('class_id', allClassIds);

      // Get unique user IDs from enrollments
      const enrolledUserIds = [...new Set(enrollmentsData?.map(e => e.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', enrolledUserIds);

      // Filter out banned users
      const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
      const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

      // Create a map of full class data
      const fullClassesMap = new Map(fullClassesData?.map(c => [c.id, c]) || []);

      // Transform userClasses into ClassWithMembers
      const transformClasses = (classes: typeof userClasses.inProgress) => {
        return classes.map(cls => {
          const fullClass = fullClassesMap.get(cls.id);
          if (!fullClass) return null;

          const classEnrollments = enrollmentsData?.filter(e => e.class_id === cls.id) || [];
          const members: MembershipInfo[] = classEnrollments
            .map(enrollment => ({
              id: enrollment.id,
              user_id: enrollment.user_id,
              role: enrollment.role,
              profile: profilesMap.get(enrollment.user_id)!,
            }))
            .filter(m => m.profile);

          const userEnrollment = members.find(m => m.user_id === user!.id);

          return {
            ...fullClass,
            members,
            memberCount: members.length,
            userMembership: userEnrollment,
          };
        }).filter(Boolean) as ClassWithMembers[];
      };

      return {
        inProgress: transformClasses(userClasses.inProgress || []),
        enrolled: transformClasses(userClasses.enrolled || []),
        completed: transformClasses(userClasses.completed || []),
        available: transformClasses(userClasses.available || []),
      };
    },
    enabled: !!user && !!role && !isBoardOrAbove && !!userClasses,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  // Load form data when editing
  useEffect(() => {
    if (modalState.modalType === 'edit' && modalState.selectedItem) {
      const cls = modalState.selectedItem;
      setName(cls.name);
      setDescription(cls.description || '');
      setLocation(cls.location || '');
      setSelectedSemester(cls.semester_id ? { id: cls.semester_id } as Semester : null);
      const teacher = cls.members.find(m => m.role === 'teacher');
      setSelectedTeacher(teacher ? teacher.user_id : '');
    } else if (isCreateModalOpen) {
      // Reset form
      setName('');
      setDescription('');
      setLocation('');
      setSelectedSemester(null);
      setSelectedTeacher('');
    }
  }, [modalState.modalType, modalState.selectedItem, isCreateModalOpen]);

  // Determine which classes data to use
  const classesData = isBoardOrAbove
    ? allClassesWithMembers || []
    : userClassesWithMembers
      ? [
        ...userClassesWithMembers.inProgress,
        ...userClassesWithMembers.enrolled,
        ...userClassesWithMembers.completed,
        ...userClassesWithMembers.available,
      ]
      : [];

  const loading = isBoardOrAbove ? allClassesLoading : (classesLoading || userClassesMembersLoading);

  const { available, inProgress, completed } = useFilteredItems(
    classesData,
    (cls, status) => {
      if (status.state === 'available') return true;
      return isBoardOrAbove || !!cls.userMembership;
    }
  );

  // Restore selected item from URL parameter
  useEffect(() => {
    if (modalState.id && !modalState.selectedItem && classesData.length > 0) {
      const item = classesData.find(c => c.id === modalState.id);
      if (item) {
        modalState.setSelectedItem(item);
      } else if (isBoardOrAbove) {
        // For board users, fetch the class separately if not in visible list
        const fetchClassById = async (id: string) => {
          const { data: classData, error: classError } = await supabase
            .from('classes')
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

          if (classError || !classData) {
            toast({
              title: 'Class Not Found',
              description: 'The requested class could not be found.',
              variant: 'destructive',
            });
            modalState.close();
            return;
          }

          // Fetch enrollments for this class
          const { data: enrollmentsData } = await supabase
            .from('class_enrollments')
            .select('*')
            .eq('class_id', id);

          const enrolledUserIds = [...new Set(enrollmentsData?.map(e => e.user_id) || [])];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', enrolledUserIds);

          const activeProfilesData = profilesData?.filter(p => !p.is_banned) || [];
          const profilesMap = new Map(activeProfilesData.map(p => [p.id, p]));

          const members: MembershipInfo[] = (enrollmentsData || [])
            .map(enrollment => ({
              id: enrollment.id,
              user_id: enrollment.user_id,
              role: enrollment.role,
              profile: profilesMap.get(enrollment.user_id)!,
            }))
            .filter(m => m.profile);

          const userMembership = members.find(m => m.user_id === user!.id);

          const classWithMembers: ClassWithMembers = {
            ...classData as Class,
            members,
            memberCount: members.length,
            userMembership,
          };

          modalState.setSelectedItem(classWithMembers);
        };

        fetchClassById(modalState.id);
      } else {
        // Regular members can't access classes not in their list
        toast({
          title: 'Access Denied',
          description: 'You do not have access to this class.',
          variant: 'destructive',
        });
        modalState.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.id, classesData, isBoardOrAbove, modalState.selectedItem]); // modalState, toast, user are stable

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!name.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter a class name',
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
      const classData = {
        name,
        description: description || null,
        location: location || null,
        semester_id: selectedSemester?.id || null,
      };

      let classId = modalState.selectedItem?.id;

      if (modalState.selectedItem) {
        const { error } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', modalState.selectedItem.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Class updated!' });
      } else {
        const { data, error } = await supabase
          .from('classes')
          .insert({ ...classData, created_by: user.id })
          .select('id')
          .single();
        if (error) throw error;
        classId = data.id;
        toast({ title: 'Success', description: 'Class created!' });
      }

      // Handle teacher assignment
      if (classId) {
        // Remove existing teacher if any
        await supabase
          .from('class_enrollments')
          .delete()
          .eq('class_id', classId)
          .eq('role', 'teacher');

        // Add new teacher if selected
        if (selectedTeacher) {
          const { error: teacherError } = await supabase
            .from('class_enrollments')
            .insert({
              class_id: classId,
              user_id: selectedTeacher,
              role: 'teacher'
            });
          if (teacherError) throw teacherError;
        }
      }

      await refreshClasses();

      // Invalidate admin classes queries if user is admin
      if (isBoardOrAbove) {
        queryClient.invalidateQueries({ queryKey: ['all-classes-with-members'] });
        queryClient.invalidateQueries({ queryKey: ['all-classes'] });
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
      .from('classes')
      .delete()
      .eq('id', modalState.selectedItem.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }

    toast({ title: 'Success', description: 'Class deleted!' });
    await refreshClasses();

    // Invalidate admin classes queries if user is admin
    if (isBoardOrAbove) {
      queryClient.invalidateQueries({ queryKey: ['all-classes-with-members'] });
      queryClient.invalidateQueries({ queryKey: ['all-classes'] });
    }

    modalState.close();
  };

  const renderClassCard = (cls: ClassWithMembers) => {
    const isEnrolled = !!cls.userMembership;
    const isTeacher = cls.userMembership?.role === 'teacher';
    const teacher = cls.members.find(m => m.role === 'teacher');
    const status = getItemStatus(cls);

    if (!status) return null;

    const maxDisplay = 5;
    const displayedMembers = cls.members.slice(0, maxDisplay);
    const remainingCount = cls.members.length - maxDisplay;

    const copyClassEmailsCsv = () => {
      const emails = (cls.members ?? [])
        .map(m => m.profile?.email)
        .filter((e): e is string => Boolean(e));
      if (emails.length === 0) {
        toast({ title: 'No emails', description: 'No member emails to copy for this class.', variant: 'destructive' });
        return;
      }
      void navigator.clipboard.writeText(emails.map(escapeCsv).join(',')).then(() => {
        toast({ title: 'Copied', description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard` });
      });
    };

    // A class links to a dedicated resource page by having a name that slugifies
    // to one of the hardcoded class-page routes. Any other name has no page, so
    // we hide the link rather than navigate into the 404 catch-all.
    const classPageSlug = cls.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
    const hasClassPage = CLASS_PAGE_SLUGS.has(classPageSlug);

    const goToClassPage = () => {
      if (!hasClassPage) return;
      navigate(`/classes/${classPageSlug}`);
    };

    return (
      <article className="group relative flex h-full min-w-0 flex-col border border-border bg-page p-5 transition-colors duration-200 hover:bg-foreground motion-reduce:transition-none">
        {/* Eyebrow row: semester code + chips + board furniture */}
        <div className="flex items-start justify-between gap-3">
          <p className={cn(EYEBROW, 'transition-colors duration-200 group-hover:text-page/60 motion-reduce:transition-none')}>
            {cls.semesters?.code || 'No term'}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {isEnrolled && !isMobile && (
              <span
                className={cn(
                  CHIP_BASE,
                  isTeacher
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-foreground bg-foreground text-page group-hover:border-page group-hover:bg-page group-hover:text-foreground'
                )}
              >
                {isTeacher ? 'Teacher' : 'Student'}
              </span>
            )}
            <span className={statusChipClass(status.state)}>{status.label}</span>
            {isBoardOrAbove && (
              <button
                type="button"
                onClick={copyClassEmailsCsv}
                title="Copy member emails as CSV"
                aria-label="Copy member emails as CSV"
                className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:border-page group-hover:text-page/70 motion-reduce:transition-none"
              >
                <Mail className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Course title */}
        <h3 className="mt-2 break-words font-sans text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-page motion-reduce:transition-none">
          {cls.name}
        </h3>

        {/* Mono meta — term / room / teacher / enrollment */}
        <div className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground transition-colors duration-200 group-hover:text-page/60 motion-reduce:transition-none">
          {cls.semesters && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cls.semesters.code} - {cls.semesters.name}</span>
            </div>
          )}
          {cls.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cls.location}</span>
            </div>
          )}
          {teacher && (
            <div className="flex items-center gap-2">
              <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">Teacher: {teacher.profile.full_name || teacher.profile.email}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => modalState.openMembers(cls)}
            className="flex items-center gap-2 tabular-nums underline decoration-transparent transition-colors duration-200 hover:text-primary hover:decoration-primary motion-reduce:transition-none"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{cls.memberCount} {cls.memberCount === 1 ? 'member' : 'members'}</span>
          </button>
        </div>

        {/* Enrollment register — square portraits */}
        {cls.members.length > 0 && (
          <div className="mt-3 flex -space-x-px">
            {displayedMembers.map((member) => (
              <Avatar
                key={member.id}
                className="h-8 w-8 rounded-none border border-border group-hover:border-page"
              >
                <AvatarImage src={member.profile.profile_picture_url || undefined} />
                <AvatarFallback className="rounded-none text-xs">
                  {member.profile.full_name
                    ? getInitials(member.profile.full_name)
                    : member.profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="flex h-8 w-8 items-center justify-center border border-border bg-secondary font-mono text-[10px] tabular-nums group-hover:border-page">
                +{remainingCount}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {cls.description && (
          <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-page/60 motion-reduce:transition-none">
            {cls.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-4 md:flex-row md:flex-wrap md:items-center">
          <button
            type="button"
            className={cn(isBoardOrAbove ? CTA_QUIET : CTA_PRIMARY, 'w-full md:w-auto')}
            onClick={() => modalState.open(cls, cls.id)}
          >
            {isBoardOrAbove
              ? <Edit className="h-4 w-4" />
              : <Eye className="h-4 w-4" />}
            {isBoardOrAbove ? 'Edit Details' : 'View Details'}
          </button>

          {hasClassPage && (status.state === 'in_progress' || status.state === 'completed') && !isMobile && (
            <button
              type="button"
              onClick={goToClassPage}
              className="group/link inline-flex min-h-[40px] items-center justify-center gap-1.5 px-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:text-primary group-hover:text-page motion-reduce:transition-none md:justify-start"
            >
              <BookOpen className="h-4 w-4" />
              View Class Page
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover/link:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </button>
          )}
        </div>
      </article>
    );
  };

  const renderCatalogGrid = (classes: ClassWithMembers[]) => (
    <div className="grid grid-cols-1 gap-0 pl-px pt-px md:grid-cols-2 xl:grid-cols-3">
      {classes.map(cls => (
        <div key={cls.id} className="-ml-px -mt-px w-full min-w-0">
          {renderClassCard(cls)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-10">
      {/* PAGE HEADER — eyebrow / title / meta line (DESIGN.md §6) */}
      <header className="border-b border-border pb-6">
        <p className={EYEBROW}>Classes</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-mono text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            Classes
          </h1>
          {isBoardOrAbove && (
            <button
              type="button"
              className={CTA_PRIMARY}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Class
            </button>
          )}
        </div>
        {!loading && (
          <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
            {inProgress.length} in progress · {available.length} available · {completed.length} completed
          </p>
        )}
      </header>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-0 pl-px pt-px md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="-ml-px -mt-px h-48 animate-pulse space-y-3 border border-border p-5 motion-reduce:animate-none"
            >
              <div className="h-3 w-1/4 bg-grey-4/40" />
              <div className="h-4 w-2/3 bg-grey-4/40" />
              <div className="h-3 w-1/2 bg-grey-4/40" />
              <div className="h-3 w-1/3 bg-grey-4/40" />
            </div>
          ))}
          <p className="sr-only">Loading classes...</p>
        </div>
      ) : available.length === 0 && inProgress.length === 0 && completed.length === 0 ? (
        <div className="mt-6 border border-dashed border-grey-3 px-6 py-12 text-center">
          <p className={EYEBROW}>Course catalog empty</p>
          <p className="mt-2 text-sm text-muted-foreground">No classes at this time.</p>
          {isBoardOrAbove && (
            <button
              type="button"
              className={cn(CTA_PRIMARY, 'mt-5')}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Class
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {inProgress.length > 0 && (
            <section>
              <p className={cn(EYEBROW, 'mb-3 tabular-nums')}>In progress · {inProgress.length}</p>
              {renderCatalogGrid(inProgress)}
            </section>
          )}

          {available.length > 0 && (
            <section>
              <p className={cn(EYEBROW, 'mb-3 tabular-nums')}>Available · {available.length}</p>
              {renderCatalogGrid(available)}
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <p className={cn(EYEBROW, 'mb-3 tabular-nums')}>Completed · {completed.length}</p>
              {renderCatalogGrid(completed)}
            </section>
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      <EditModal
        open={isCreateModalOpen || modalState.modalType === 'edit'}
        onClose={() => {
          setIsCreateModalOpen(false);
          modalState.close();
        }}
        title={modalState.selectedItem ? 'Edit Class' : 'Create New Class'}
        description={modalState.selectedItem ? 'Update class details' : 'Add a new class'}
        onSubmit={handleSubmit}
        onDelete={modalState.selectedItem ? handleDelete : undefined}
        loading={saveLoading}
        deleteItemName={modalState.selectedItem?.name}
        submitLabel={modalState.selectedItem ? 'Update Class' : 'Create Class'}
      >
        <div className="space-y-2">
          <Label htmlFor="name" required>Class Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Intro to Machine Learning"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Class description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="STEM 3202"
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
          subtitle={modalState.selectedItem.location ? `Location: ${modalState.selectedItem.location}` : undefined}
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
              title: 'Class Size',
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
            ...(modalState.selectedItem.members.some(m => m.role === 'teacher')
              ? [
                {
                  title: 'Teacher',
                  content: (
                    <div className="flex items-center gap-2">
                      {modalState.selectedItem.members
                        .filter(m => m.role === 'teacher')
                        .map(m => (
                          <div key={m.id} className="flex items-center gap-2">
                            <span className="font-semibold">{m.profile.full_name || 'No name'}</span>
                            <span className="font-mono text-xs text-muted-foreground">{m.profile.email}</span>
                          </div>
                        ))}
                    </div>
                  ),
                },
              ]
              : []),
          ]}
        />
      )}

      {/* MEMBERS MODAL */}
      {modalState.selectedItem && modalState.modalType === 'members' && (
        <MembersListModal
          open={modalState.isOpen}
          onClose={modalState.close}
          title={`${modalState.selectedItem.name} - Class Members`}
          members={modalState.selectedItem.members}
          entityType="class"
          entityId={modalState.selectedItem.id}
          onMemberRemoved={refreshClasses}
        />
      )}
    </div>
  );
};

export default Classes;
