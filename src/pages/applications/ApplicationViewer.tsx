import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Calendar,
    Info,
    Github,
    MapPin,
    Users,
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from '@/components/modals/ProfileModal';
import { DetailModal } from '@/components/modals/DetailModal';
import type { Database } from '@/integrations/supabase/database.types';
import type { DetailSection } from '@/types/modal.types';
import { Class, Project, useProfile } from '@/contexts/AuthContext';

type Application = Database['public']['Tables']['applications']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface MemberWithRole extends Profile {
    role: AppRole;
}

/** Status chip base — mono uppercase micro-label per the design contract. */
const CHIP_BASE =
    'inline-flex items-center whitespace-nowrap border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';

/** Mono uppercase question/section label for the dossier. */
const DOSSIER_LABEL =
    'font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground';

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

const ApplicationViewerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const { role, refreshApplications } = useProfile();

    // State
    const [application, setApplication] = useState<Application | null>(null);
    const [applicantProfile, setApplicantProfile] = useState<MemberWithRole | null>(null);
    const [classData, setClassData] = useState<Class | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // Success/Rejection screen states
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [showRejectionScreen, setShowRejectionScreen] = useState(false);

    const fetchApplication = useCallback(async () => {
        if (!id) return;

        try {
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .select('*')
                .eq('id', id)
                .single();

            if (appError) throw appError;
            if (!appData) {
                toast({
                    title: 'Not Found',
                    description: 'Application not found.',
                    variant: 'destructive',
                });
                navigate('/applications');
                return;
            }

            setApplication(appData);

            // Fetch applicant profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', appData.user_id)
                .single();

            if (profileData && !profileData.is_banned) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', appData.user_id)
                    .single();

                setApplicantProfile({
                    ...profileData,
                    role: roleData?.role || 'prospect',
                });
            }

            // Fetch class/project data
            if (appData.class_id) {
                const { data: classInfo } = await supabase
                    .from('classes')
                    .select(`*, semesters (code, name, start_date, end_date), class_enrollments(count)`)
                    .eq('id', appData.class_id)
                    .single();

                setClassData(classInfo);
            }

            if (appData.project_id) {
                const { data: projectInfo } = await supabase
                    .from('projects')
                    .select(`*, semesters (code, name, start_date, end_date), project_members(count)`)
                    .eq('id', appData.project_id)
                    .single();

                setProjectData(projectInfo);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            toast({
                title: 'Error',
                description: 'Failed to load application.',
                variant: 'destructive',
            });
            navigate('/applications');
        } finally {
            setLoading(false);
        }
    }, [id, toast, navigate]);

    useEffect(() => {
        if (id) {
            fetchApplication();
        }
    }, [id, fetchApplication]);

    const handleAccept = async () => {
        if (!user || !application) return;

        try {
            // Call edge function to process acceptance (DB updates + side effects)
            const { data, error } = await supabase.functions.invoke('process-application-update', {
                body: {
                    application_id: application.id,
                    status: 'accepted',
                    reviewer_id: user.id,
                },
            });

            if (error) throw error;
            if (!data?.success) {
                throw new Error(data?.message || 'Failed to process application acceptance');
            }

            // Show success screen
            setTimeout(() => {
                setShowSuccessScreen(true);
            }, 300);

            // Refresh applications data and navigate back after showing success
            setTimeout(async () => {
                await refreshApplications();
                navigate('/applications');
            }, 3000);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleReject = async () => {
        if (!user || !application) return;

        try {
            // Call edge function to process rejection (DB updates + email)
            const { data, error } = await supabase.functions.invoke('process-application-update', {
                body: {
                    application_id: application.id,
                    status: 'rejected',
                    reviewer_id: user.id,
                },
            });

            if (error) throw error;
            if (!data?.success) {
                throw new Error(data?.message || 'Failed to process application rejection');
            }

            // Show rejection screen
            setTimeout(() => {
                setShowRejectionScreen(true);
            }, 300);

            // Refresh applications data and navigate back after showing rejection
            setTimeout(async () => {
                await refreshApplications();
                navigate('/applications');
            }, 3000);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleOpenDocument = async (filePath: string) => {
        console.log(filePath);
        try {
            const { data, error } = await supabase.storage
                .from('applications')
                .createSignedUrl(filePath, 3600);

            if (error) throw error;
            if (!data?.signedUrl) throw new Error('Failed to generate signed URL');

            window.open(data.signedUrl, '_blank');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to open document.',
                variant: 'destructive',
            });
            console.error(error);
        }
    };

    // Status chips per the ink/outline/strike system
    const getStatusBadge = (status: string) => {
        const variants = {
            accepted: { className: 'border-foreground bg-foreground text-page', text: 'Accepted' },
            rejected: {
                className: 'border-border text-muted-foreground line-through decoration-primary decoration-2',
                text: 'Rejected',
            },
            pending: { className: 'border-border text-foreground', text: 'Pending' },
        };
        const config = variants[status as keyof typeof variants] || variants.pending;

        return <span className={`${CHIP_BASE} ${config.className}`}>{config.text}</span>;
    };

    const getAcceptanceMessage = () => {
        if (!application) return '';

        const name = applicantProfile?.full_name ?? 'Applicant';
        switch (application.application_type) {
            case 'board':
                return `Added ${name} to ${application.board_position || 'Board'}!`;
            case 'class':
                return `Enrolled ${name} in ${classData?.name || 'class'}!`;
            case 'project':
                return `Added ${name} to ${projectData?.name || 'project'}!`;
            default:
                return `Accepted ${name}'s application!`;
        }
    };

    const getDeletionInfo = () => {
        if (!application?.reviewed_at) return null;

        const reviewedDate = new Date(application.reviewed_at);
        const deletionDate = addDays(reviewedDate, 30);
        const daysRemaining = differenceInDays(deletionDate, new Date());

        if (daysRemaining < 0) return 'This application will be deleted soon.';

        return `This application will be automatically deleted in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''
            } (${format(deletionDate, 'MMM d, yyyy')}).`;
    };

    const buildDetailSections = (item: Project | Class): DetailSection[] => {
        const sections: DetailSection[] = [];
        const isProject = 'project_members' in item;
        const hasStarted = item.semesters.start_date ? new Date(item.semesters.start_date) <= new Date() : false;

        // Description
        if (item.description) {
            sections.push({
                title: 'Description',
                content: <p className="whitespace-pre-wrap leading-relaxed text-ink-soft">{item.description}</p>,
            });
        }

        // Details Grid
        const gridItems = [];

        // Term
        if (item.semesters) {
            gridItems.push(
                <div key="term" className="space-y-1.5">
                    <h4 className={DOSSIER_LABEL}>Term</h4>
                    <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-ink-soft">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {item.semesters.code} - {item.semesters.name}
                    </div>
                </div>
            );
        }

        // Size
        gridItems.push(
            <div key="size" className="space-y-1.5">
                <h4 className={DOSSIER_LABEL}>{isProject ? 'Team Size' : 'Class Size'}</h4>
                <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-ink-soft">
                    <Users className="h-4 w-4 shrink-0" />
                    {isProject
                        ? `${item.project_members[0].count} ${item.project_members[0].count === 1 ? 'member' : 'members'}`
                        : `${item.class_enrollments[0].count} ${item.class_enrollments[0].count === 1 ? 'student' : 'students'}`
                    }
                </div>
            </div>
        );

        // Location (classes) or Repository (projects)
        if ('location' in item && item.location) {
            gridItems.push(
                <div
                    key="location"
                    className="space-y-1.5 md:col-span-2"
                >
                    <h4 className={DOSSIER_LABEL}>Location</h4>
                    <div className="flex items-center gap-2 font-mono text-xs text-ink-soft">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {item.location}
                    </div>
                </div>
            );
        }

        if (hasStarted && 'github_project_id' in item && item.github_project_id) {
            gridItems.push(
                <div key="repo" className="space-y-1.5">
                    <h4 className={DOSSIER_LABEL}>Repository</h4>
                    <a
                        href={`https://github.com/orgs/claude-msu/projects/${item.github_project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/repo inline-flex items-center gap-2 font-mono text-xs text-ink-soft transition-colors hover:text-primary"
                    >
                        <Github className="h-4 w-4 shrink-0" />
                        View on GitHub
                        <span aria-hidden className="transition-transform group-hover/repo:translate-x-0.5">→</span>
                    </a>
                </div>
            );
        }

        sections.push({
            content: <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{gridItems}</div>,
            fullWidth: true,
            title: ''
        });

        return sections;
    };

    const renderApplicationFields = () => {
        if (!application) return null;

        const getTextValue = (key: keyof Application, fallbacks: Array<keyof Application> = []) => {
            const primary = application[key];
            if (typeof primary === 'string' && primary.trim()) return primary;
            for (const fbKey of fallbacks) {
                const fb = application[fbKey];
                if (typeof fb === 'string' && fb.trim()) return fb;
            }
            return '';
        };

        const fields = {
            board: [
                { key: 'why_position', title: 'Why this position?' },
                { key: 'relevant_experience', title: 'Relevant experience' },
                { key: 'other_commitments', title: 'Other commitments' },
            ],
            project: [
                { key: 'relevant_experience', title: 'Relevant experience' },
                { key: 'problem_solved', title: 'Problem solved' },
                { key: 'project_detail', title: 'Project detail' },
            ],
            class: [
                { key: 'why_class', title: 'Why this class?' },
                { key: 'relevant_knowledge', title: 'Relevant knowledge', fallbacks: ['relevant_experience'] },
            ],
        };

        const typeFields = fields[application.application_type as keyof typeof fields] || [];

        return typeFields.map(
            (field) => {
                const { key, title } = field;
                const fallbacks = ('fallbacks' in field ? (field as { fallbacks?: Array<keyof Application> }).fallbacks : []) || [];
                const value = getTextValue(key as keyof Application, fallbacks as Array<keyof Application>);
                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-hairline-faint px-4 py-5 md:px-6"
                    >
                        <h3 className={DOSSIER_LABEL}>{title}</h3>
                        <p className="mt-2 max-w-[68ch] whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                            {value || 'Not provided'}
                        </p>
                    </motion.div>
                );
            }
        );
    };

    const canReview = user && (role === 'board' || role === 'admin') && application?.user_id !== user.id;
    const deletionInfo = getDeletionInfo();

    if (loading) {
        return (
            <div className="min-h-screen bg-page">
                <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
                    <Button variant="ghost" onClick={() => navigate('/applications')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Applications
                    </Button>
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-page">
                <div className="text-center">
                    <h1 className="mb-2 font-mono text-2xl font-extrabold tracking-[-0.02em]">Application Not Found</h1>
                    <Button onClick={() => navigate('/applications')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Applications
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {showSuccessScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className="text-center text-page"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <CheckCircle className="mx-auto mb-6 h-32 w-32" />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-2 font-mono text-4xl font-extrabold tracking-[-0.02em]"
                            >
                                Application Accepted!
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-xl"
                            >
                                {getAcceptanceMessage()}
                            </motion.p>
                        </motion.div>

                        {/* Ripple effect */}
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-page/10"
                            style={{ transformOrigin: 'center' }}
                        />
                    </motion.div>
                )}

                {showRejectionScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-destructive"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className="text-center text-destructive-foreground"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <XCircle className="mx-auto mb-6 h-32 w-32" />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-2 font-mono text-4xl font-extrabold tracking-[-0.02em]"
                            >
                                Application Rejected
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-xl"
                            >
                                {applicantProfile?.full_name ?? 'Applicant'}'s application has been declined
                            </motion.p>
                        </motion.div>

                        {/* Ripple effect */}
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-page/10"
                            style={{ transformOrigin: 'center' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-page">
                <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 md:mb-8"
                    >
                        <Button variant="ghost" onClick={() => navigate('/applications')} className="-ml-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Applications
                        </Button>
                    </motion.div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                        {/* Left Column — the dossier */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6 lg:col-span-2"
                        >
                            {/* Deletion Warning */}
                            {deletionInfo && application.status !== 'pending' && (
                                <Alert className="rounded-none border-hairline-faint bg-tint">
                                    <AlertDescription className="flex min-h-7 items-center gap-3 font-mono text-xs text-muted-foreground">
                                        <Info className={isMobile ? "h-10 w-10" : "h-4 w-4"} />
                                        <div className="flex items-center gap-2">
                                            {deletionInfo}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* THE DOCUMENT */}
                            <div className="border border-border bg-page">
                                {/* Titlebar strip */}
                                <div className="hatch flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-2.5 md:px-6">
                                    <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]">
                                        Application · {application.application_type}
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tabular-nums text-muted-foreground">
                                        No. {application.id.slice(0, 8)} · {format(new Date(application.created_at), 'MMM d, yyyy')}
                                    </span>
                                </div>

                                {/* Applicant identity row */}
                                <div className="flex flex-wrap items-center gap-4 px-4 py-5 md:px-6">
                                    <Avatar className="h-12 w-12 shrink-0 rounded-none border border-border">
                                        <AvatarImage src={applicantProfile?.profile_picture_url || undefined} />
                                        <AvatarFallback className="rounded-none bg-page font-mono text-sm text-foreground">
                                            {getInitials(applicantProfile?.full_name ?? 'Applicant')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate font-sans text-2xl font-bold tracking-[-0.02em] md:text-3xl">
                                            {applicantProfile?.full_name ?? 'Applicant'}
                                        </h1>
                                        {applicantProfile?.email && (
                                            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                                                {applicantProfile.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0">{getStatusBadge(application.status)}</div>
                                </div>

                                {/* Filing information */}
                                <div className="border-t border-hairline-faint px-4 py-5 md:px-6">
                                    {/* Project/Class/Position name - full row */}
                                    {((application.application_type === 'board' && application.board_position) ||
                                        (application.application_type === 'class' && classData) ||
                                        (application.application_type === 'project' && projectData)) && (
                                            <div className="mb-4">
                                                <p className={DOSSIER_LABEL}>
                                                    {application.application_type === 'board' && 'Position'}
                                                    {application.application_type === 'class' && 'Class'}
                                                    {application.application_type === 'project' && 'Project'}
                                                </p>
                                                <p className="mt-1 font-sans text-lg font-bold">
                                                    {application.application_type === 'board' && application.board_position}
                                                    {application.application_type === 'class' && classData?.name}
                                                    {application.application_type === 'project' && projectData?.name}
                                                </p>
                                            </div>
                                        )}
                                    {/* Role (member/student/lead/teacher) and submission date */}
                                    <div className="grid grid-cols-2 gap-6">
                                        {(application.application_type === 'class' && application.class_role) ||
                                        (application.application_type === 'project' && application.project_role) ? (
                                            <div>
                                                <p className={DOSSIER_LABEL}>Role</p>
                                                <p className="mt-1 font-mono text-sm capitalize">
                                                    {application.application_type === 'class' && application.class_role?.replace('_', ' ')}
                                                    {application.application_type === 'project' && application.project_role?.replace('_', ' ')}
                                                </p>
                                            </div>
                                        ) : null}
                                        <div>
                                            <p className={DOSSIER_LABEL}>Submitted</p>
                                            <p className="mt-1 font-mono text-sm tabular-nums">
                                                {format(new Date(application.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Q&A — application responses */}
                                {renderApplicationFields()}

                                {/* Documents */}
                                {(application.resume_url || application.transcript_url) && (
                                    <div className="border-t border-hairline-faint px-4 py-5 md:px-6">
                                        <h3 className={DOSSIER_LABEL}>Documents</h3>
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {application.resume_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDocument(application.resume_url!)}
                                                    className="group/doc inline-flex min-h-10 items-center gap-2 border border-border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                                >
                                                    {isMobile ? 'Resume' : 'View Resume'}
                                                    <span aria-hidden className="transition-transform group-hover/doc:translate-x-0.5">→</span>
                                                </button>
                                            )}
                                            {application.transcript_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDocument(application.transcript_url!)}
                                                    className="group/doc inline-flex min-h-10 items-center gap-2 border border-border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                                >
                                                    {isMobile ? 'Transcript' : 'View Transcript'}
                                                    <span aria-hidden className="transition-transform group-hover/doc:translate-x-0.5">→</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Reviewer actions — ruled-off footer strip */}
                                {application.status === 'pending' && canReview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="hatch border-t border-border px-4 py-4 md:px-6"
                                    >
                                        <p className={DOSSIER_LABEL}>Review Actions</p>
                                        <div className="mt-3 flex flex-col gap-3 md:flex-row">
                                            <button
                                                type="button"
                                                onClick={handleAccept}
                                                className="inline-flex h-12 flex-1 items-center justify-center border-2 border-border bg-page px-5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2 shrink-0" />
                                                Accept Application
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleReject}
                                                className="inline-flex h-12 flex-1 items-center justify-center border-2 border-destructive bg-destructive px-5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-destructive-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-page"
                                            >
                                                <XCircle className="h-5 w-5 mr-2 shrink-0" />
                                                Reject Application
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Embedded Profile */}
                            {applicantProfile && (
                                <div>
                                    <ProfileModal member={applicantProfile} embedded className="lg:sticky lg:top-24" />
                                </div>
                            )}

                            {/* Class/Project Details - below profile */}
                            {(classData || projectData) && (
                                <DetailModal
                                    title={(classData || projectData).name}
                                    subtitle={projectData?.client_name ? `Client: ${projectData.client_name}` : undefined}
                                    sections={buildDetailSections(
                                        classData || projectData
                                    )}
                                    embedded
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApplicationViewerPage;
