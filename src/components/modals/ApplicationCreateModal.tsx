import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Save, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/database.types';

type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationType = Database['public']['Enums']['application_type'];
type Class = Database['public']['Tables']['classes']['Row'] & {
  semesters: { code: string; name: string } | null;
};
type Project = Database['public']['Tables']['projects']['Row'] & {
  semesters: { code: string; name: string } | null;
};

interface ApplicationCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BOARD_POSITIONS = [
  // E-Board
  'President',
  'SVP',
  'VP of Marketing',
  'VP of Community',
  'VP of Technical Operations',
  // Board
  'Creative Director',
  'Content Director',
  'Outreach Director',
  'Outreach Officer',
  'Workshop Director',
  'Events Director',
  'Social Director',
  'Program Director',
  'Project Director',
  'Xcelerate Director',
  'Treasurer',
  'Secretary',
];

/** Mono eyebrow that labels each hairline-ruled field group. */
const GROUP_EYEBROW =
  'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground';

/** Hairline-ruled field group wrapper. */
const GROUP_RULE = 'space-y-4 border-t border-hairline-faint pt-5';

/** Dashed dropzone shell for file uploads. */
const DROPZONE =
  'relative border border-dashed border-grey-3 transition-colors hover:border-primary hover:bg-tint focus-within:border-primary';

export const ApplicationCreateModal = ({
  open,
  onClose,
  onSuccess,
}: ApplicationCreateModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [existingApplications, setExistingApplications] = useState<Array<{
    class_id: string | null;
    project_id: string | null;
  }>>([]);

  // Form fields
  const [applicationType, setApplicationType] = useState<ApplicationType | ''>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profileResumeFile, setProfileResumeFile] = useState<File | null>(null);
  const [resumePullLoading, setResumePullLoading] = useState(false);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [resumeInputKey, setResumeInputKey] = useState(0);
  const [whyPosition, setWhyPosition] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [otherCommitments, setOtherCommitments] = useState('');
  const [whyClass, setWhyClass] = useState('');
  const [relevantKnowledge, setRelevantKnowledge] = useState('');
  const [projectDetail, setProjectDetail] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedBoardPosition, setSelectedBoardPosition] = useState('');
  const [selectedClassRole, setSelectedClassRole] = useState<'student' | 'teacher'>('student');
  const [selectedProjectRole, setSelectedProjectRole] = useState<'member' | 'lead'>('member');

  const fetchExistingApplications = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('applications')
      .select('class_id, project_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching existing applications:', error);
      return [];
    }

    const applications = data || [];
    setExistingApplications(applications);
    return applications;
  }, [user]);

  const fetchAvailableOptions = useCallback(async (applicationsToFilter: Array<{ class_id: string | null; project_id: string | null }>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const now = new Date().toLocaleString("en-US", { timeZone: "America/Detroit" });

    // Fetch classes where the semester start date is in the future
    const { data: classesData } = await supabase
      .from('classes')
      .select(`
        *,
        semesters!inner (
          code,
          name,
          start_date
        )
      `)
      // TODO: Re-implement this
      // .gt('semesters.start_date', now)
      .order('name', { ascending: true });

    if (classesData) {
      // Filter out classes the user has already applied to
      const appliedClassIds = new Set(
        applicationsToFilter
          .filter(app => app.class_id !== null)
          .map(app => app.class_id)
      );
      const filteredClasses = classesData.filter(
        cls => !appliedClassIds.has(cls.id)
      );
      setAvailableClasses(filteredClasses);
    }

    // Fetch projects where the semester start date is in the future
    const { data: projectsData } = await supabase
      .from('projects')
      .select(`
        *,
        semesters!inner (
          code,
          name,
          start_date
        )
      `)
      // TODO: Re-implement this
      // .gt('semesters.start_date', now)
      .order('name', { ascending: true });

    if (projectsData) {
      // Filter out projects the user has already applied to
      const appliedProjectIds = new Set(
        applicationsToFilter
          .filter(app => app.project_id !== null)
          .map(app => app.project_id)
      );
      const filteredProjects = projectsData.filter(
        proj => !appliedProjectIds.has(proj.id)
      );
      setAvailableProjects(filteredProjects);
    }
  }, []);

  // Fetch available options and existing applications
  useEffect(() => {
    if (open && user) {
      const loadData = async () => {
        const applications = await fetchExistingApplications();
        if (applications) {
          await fetchAvailableOptions(applications);
        }
      };
      loadData();
    }
  }, [open, user, fetchExistingApplications, fetchAvailableOptions]);

  // When user selects application type, pull their profile resume into memory so "what they see is what they submit"
  useEffect(() => {
    if (!open || !applicationType || !profile?.resume_url || resumeFile) {
      if (!applicationType) setProfileResumeFile(null);
      return;
    }

    let cancelled = false;
    setResumePullLoading(true);
    setProfileResumeFile(null);

    const urlParts = profile.resume_url.split('/profiles/');
    if (urlParts.length < 2) {
      setResumePullLoading(false);
      return;
    }
    const storagePath = urlParts[1].split('?')[0];

    supabase.storage
      .from('profiles')
      .download(storagePath)
      .then(({ data: blob, error: downloadError }) => {
        if (cancelled) return;
        if (downloadError || !blob) {
          console.error('Failed to download profile resume:', downloadError);
          setResumePullLoading(false);
          return;
        }
        const ext = storagePath.split('.').pop() || 'pdf';
        const file = new File([blob], `resume.${ext}`, { type: blob.type || 'application/pdf' });
        setProfileResumeFile(file);
        toast({
          title: 'Resume pulled from profile',
          description: 'Your profile resume was attached to this application.',
        });
      })
      .catch(() => {
        if (!cancelled) setProfileResumeFile(null);
      })
      .finally(() => {
        if (!cancelled) setResumePullLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, applicationType, profile?.resume_url, resumeFile, toast]);

  const handleApplicationTypeChange = (type: ApplicationType) => {
    // Check if user has GitHub username for project applications
    if (type === 'project' && !profile?.github_username) {
      toast({
        title: 'GitHub Username Required',
        description: 'Please add your GitHub username to your profile before applying to projects.',
        variant: 'destructive',
      });
      return;
    }

    setApplicationType(type);

    if (type === 'class' && availableClasses.length === 0) {
      toast({
        title: 'No Classes Available',
        description: 'There are currently no classes available to apply for.',
        variant: 'destructive',
      });
      setApplicationType('');
      return;
    }

    if (type === 'project' && availableProjects.length === 0) {
      toast({
        title: 'No Projects Available',
        description: 'There are currently no projects available to apply for.',
        variant: 'destructive',
      });
      setApplicationType('');
      return;
    }
  };

  const fullName = profile?.full_name ?? 'Applicant';

  const uploadFile = async (file: File, type: 'resume' | 'transcript'): Promise<string> => {
    const safeUserName = fullName.replace(/\s+/g, '-');
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}.${fileExt}`;

    // Build folder path: {userName}_{thing_id}/resume.pdf
    let filePath: string | undefined;
    if (applicationType === 'class' && selectedClassId) {
      filePath = `${safeUserName}_${selectedClassId}/${fileName}`;
    } else if (applicationType === 'project' && selectedProjectId) {
      filePath = `${safeUserName}_${selectedProjectId}/${fileName}`;
    } else if (applicationType === 'board' && selectedBoardPosition) {
      const safePosition = selectedBoardPosition.replace(/\s+/g, '-');
      filePath = `${safeUserName}_board_${safePosition}/${fileName}`;
    } else {
      throw new Error('Could not resolve file path for upload');
    }

    const { error: uploadError } = await supabase.storage.from('applications').upload(filePath, file);

    if (uploadError) {
      console.error('File upload error:', uploadError);
      throw new Error(`Failed to upload ${type}: ${uploadError.message}`);
    }

    return filePath;
  };

  const resetForm = useCallback(() => {
    setApplicationType('');
    setResumeFile(null);
    setProfileResumeFile(null);
    setTranscriptFile(null);
    setWhyPosition('');
    setRelevantExperience('');
    setOtherCommitments('');
    setWhyClass('');
    setRelevantKnowledge('');
    setProjectDetail('');
    setProblemSolved('');
    setSelectedClassId('');
    setSelectedProjectId('');
    setSelectedBoardPosition('');
    setSelectedClassRole('student');
    setSelectedProjectRole('member');
  }, []);

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!applicationType) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select an application type',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'board' && !selectedBoardPosition) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a board position',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'board' && !whyPosition.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please explain why you want this position',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'board' && !relevantExperience.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please describe your relevant experience for this position',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'board' && !otherCommitments.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please list any other major commitments (so we can understand your availability)',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'class' && !selectedClassId) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a class',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'class' && !selectedClassRole) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select your class role',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'class' && !whyClass.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please tell us why you want this class',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'class' && !relevantKnowledge.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please describe what you already know / how you\'re prepared for this class',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'project' && !selectedProjectId) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'project' && !selectedProjectRole) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select your project role',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'project' && !relevantExperience.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please describe your relevant experience for this project',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'project' && !problemSolved.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please describe a problem you\'ve solved (or a challenge you\'ve overcome)',
        variant: 'destructive',
      });
      return;
    }

    if (applicationType === 'project' && !projectDetail.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please provide project detail (what you want to work on / contribute)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate applications
      if (applicationType === 'class' && selectedClassId) {
        const hasExistingClassApplication = existingApplications.some(
          app => app.class_id === selectedClassId
        );
        if (hasExistingClassApplication) {
          toast({
            title: 'Duplicate Application',
            description: 'You have already applied to this class. You cannot apply again.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      } else if (applicationType === 'project' && selectedProjectId) {
        const hasExistingProjectApplication = existingApplications.some(
          app => app.project_id === selectedProjectId
        );
        if (hasExistingProjectApplication) {
          toast({
            title: 'Duplicate Application',
            description: 'You have already applied to this project. You cannot apply again.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      let resumeUrl: string | null = null;
      let transcriptUrl: string | null = null;

      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, 'resume');
      } else if (profileResumeFile) {
        resumeUrl = await uploadFile(profileResumeFile, 'resume');
      }

      if (transcriptFile) {
        transcriptUrl = await uploadFile(transcriptFile, 'transcript');
      }

      const baseData: Partial<Application> = {
        user_id: user.id,
        application_type: applicationType,
        resume_url: resumeUrl,
        transcript_url: transcriptUrl,
        status: 'pending',
      };

      let extraData: Partial<Application> = {};

      if (applicationType === 'board') {
        extraData = {
          board_position: selectedBoardPosition,
          why_position: whyPosition,
          relevant_experience: relevantExperience,
          other_commitments: otherCommitments,
        };
      } else if (applicationType === 'class') {
        extraData = {
          class_id: selectedClassId,
          class_role: selectedClassRole,
          why_class: whyClass,
          relevant_knowledge: relevantKnowledge,
        };
      } else if (applicationType === 'project') {
        extraData = {
          project_id: selectedProjectId,
          project_role: selectedProjectRole,
          project_detail: projectDetail,
          problem_solved: problemSolved,
          relevant_experience: relevantExperience,
        };
      }

      const applicationData: Application = { ...baseData, ...extraData } as Application;

      const { error } = await supabase.from('applications').insert(applicationData);

      if (error) throw error;

      toast({ title: 'Success', description: 'Application submitted successfully!' });

      // Reset form and refresh existing applications and available options
      resetForm();
      const updatedApplications = await fetchExistingApplications();
      await fetchAvailableOptions(updatedApplications);
      onSuccess();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (!applicationType) return null;

    return (
      <>
        {/* Type-specific Fields */}
        {applicationType === 'board' && (
          <>
            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Board application</p>

              <div className="space-y-2">
                <Label htmlFor="boardPosition" required>Position</Label>
                <Select value={selectedBoardPosition} onValueChange={setSelectedBoardPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Responses</p>

              <div className="space-y-2">
                <Label htmlFor="whyPosition" required>Why this position?</Label>
                <Textarea
                  id="whyPosition"
                  value={whyPosition}
                  onChange={(e) => setWhyPosition(e.target.value)}
                  rows={4}
                  placeholder="What impact do you want to make in this role, and why are you applying now?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevantExperience" required>Relevant Experience</Label>
                <Textarea
                  id="relevantExperience"
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  rows={3}
                  placeholder="Share leadership experience, projects, skills, or specific examples that make you a strong fit."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherCommitments" required>Other Commitments</Label>
                <Textarea
                  id="otherCommitments"
                  value={otherCommitments}
                  onChange={(e) => setOtherCommitments(e.target.value)}
                  rows={3}
                  placeholder="Jobs, other orgs, courses, or anything else that affects your weekly availability."
                />
              </div>
            </div>
          </>
        )}

        {applicationType === 'class' && (
          <>
            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Class application</p>

              <div className="space-y-2">
                <Label htmlFor="class" required>Select Class</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                        {cls.semesters && ` (${cls.semesters.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label required>Class Role</Label>
                <RadioGroup value={selectedClassRole} onValueChange={(value) => setSelectedClassRole(value as 'student' | 'teacher')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="class-student" />
                    <Label htmlFor="class-student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="class-teacher" />
                    <Label htmlFor="class-teacher">Teacher</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Responses</p>

              <div className="space-y-2">
                <Label htmlFor="whyClass" required>Why this class?</Label>
                <Textarea
                  id="whyClass"
                  value={whyClass}
                  onChange={(e) => setWhyClass(e.target.value)}
                  rows={4}
                  placeholder="What do you hope to learn/teach, and how does this class fit your goals?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevantKnowledge" required>Relevant knowledge</Label>
                <Textarea
                  id="relevantKnowledge"
                  value={relevantKnowledge}
                  onChange={(e) => setRelevantKnowledge(e.target.value)}
                  rows={3}
                  placeholder="What do you already know that will help you succeed? (Concepts, tools, prior coursework, etc.)"
                />
              </div>
            </div>
          </>
        )}

        {applicationType === 'project' && (
          <>
            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Project application</p>

              <div className="space-y-2">
                <Label htmlFor="project" required>Select Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.name}
                        {proj.semesters && ` (${proj.semesters.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label required>Project Role</Label>
                <RadioGroup value={selectedProjectRole} onValueChange={(value) => setSelectedProjectRole(value as 'member' | 'lead')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="member" id="project-member" />
                    <Label htmlFor="project-member">Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lead" id="project-lead" />
                    <Label htmlFor="project-lead">Lead</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className={GROUP_RULE}>
              <p className={GROUP_EYEBROW}>Responses</p>

              <div className="space-y-2">
                <Label htmlFor="relevantExperience" required>Relevant experience</Label>
                <Textarea
                  id="relevantExperience"
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  rows={3}
                  placeholder="What skills/projects make you a good fit?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemSolved" required>Problem solved</Label>
                <Textarea
                  id="problemSolved"
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  rows={3}
                  placeholder="Describe a problem you've solved (or a tough challenge you overcame). What was your approach and result?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDetail" required>Project detail</Label>
                <Textarea
                  id="projectDetail"
                  value={projectDetail}
                  onChange={(e) => setProjectDetail(e.target.value)}
                  rows={4}
                  placeholder="What do you want to work on in this project? Are you interested in the backend or the frontend?"
                />
              </div>
            </div>
          </>
        )}

        <div className={GROUP_RULE}>
          <p className={GROUP_EYEBROW}>Documents</p>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            {resumePullLoading && (
              <p className="font-mono text-xs text-muted-foreground">Loading your profile resume…</p>
            )}
            {!resumePullLoading && (resumeFile || profileResumeFile) ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full items-center border border-border px-3 py-1.5 font-mono text-xs">
                  <span className="truncate">
                    {resumeFile ? resumeFile.name : 'Profile Resume'}
                  </span>
                </span>
                <button
                  type="button"
                  className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    setResumeFile(null);
                    setProfileResumeFile(null);
                    setResumeInputKey((k) => k + 1);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : null}
            {!resumePullLoading && !resumeFile && !profileResumeFile && (
              <div className={DROPZONE}>
                <Input
                  key={resumeInputKey}
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setResumeFile(file);
                    if (file) setProfileResumeFile(null);
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="pointer-events-none flex flex-col items-center gap-1 px-4 py-6 text-center">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Drop file or click to upload
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-grey-2">
                    PDF · DOC · DOCX
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript">Transcript</Label>
            <div className={DROPZONE}>
              <Input
                id="transcript"
                type="file"
                accept=".pdf"
                onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="pointer-events-none flex flex-col items-center gap-1 px-4 py-6 text-center">
                <span className="max-w-full truncate font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {transcriptFile ? transcriptFile.name : 'Drop file or click to upload'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-grey-2">
                  PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${isMobile ? 'max-w-[92vw] max-h-[90vh]' : 'max-w-2xl max-h-[90vh]'
          } gap-0 overflow-y-auto overflow-x-hidden rounded-none border border-border p-0 shadow-[8px_8px_0_0_hsl(var(--foreground))]`}
      >
        <DialogHeader className="hatch space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-mono text-lg font-extrabold tracking-[-0.02em]">New Application</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            You may only apply to each class or project once, as the teacher/lead or a student/member.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="applicationType" required>Application Type</Label>
              <Select
                value={applicationType}
                onValueChange={(value) => handleApplicationTypeChange(value as ApplicationType)}
              >
                <SelectTrigger id="applicationType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {/* {role !== 'prospect' && <SelectItem value="board">Board Position</SelectItem>} */}
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderFormFields()}

            {applicationType && (
              <div className="flex w-full flex-col gap-2 border-t border-hairline-faint pt-4 md:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full md:flex-1"
                >
                  <X className="h-4 w-4 mr-0" />
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full md:flex-1">
                  <Save className="h-4 w-4 mr-0" />
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
