import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, Linkedin, Github, Briefcase, BookOpen, Copy, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { AppRole } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MemberWithRole extends Profile {
  role: AppRole;
}

interface ProfileViewerProps {
  open?: boolean;
  onClose?: () => void;
  member: MemberWithRole | null;
  embedded?: boolean;
  className?: string;
}

interface InvolvementBadge {
  id: string;
  type: 'project' | 'class';
  role: string;
  semesterCode: string;
  name: string;
}

/** The one role-chip mapping (mono, uppercase, square). */
const CHIP_BASE =
  'inline-flex shrink-0 items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';

const roleChipClass = (member: MemberWithRole) =>
  member.is_banned
    ? 'border-border text-muted-foreground line-through decoration-primary decoration-2'
    : member.role === 'admin'
      ? 'bg-primary text-primary-foreground border-primary'
      : member.role === 'board'
        ? 'bg-foreground text-page border-foreground'
        : member.role === 'member'
          ? 'border-border text-foreground'
          : 'border-grey-3 text-grey-2';

/** Mono eyebrow label for meta rows */
const ROW_LABEL =
  'shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground';

const ProfileModal = ({ open = false, onClose, member, embedded = false, className = '' }: ProfileViewerProps) => {
  const [involvementBadges, setInvolvementBadges] = useState<InvolvementBadge[]>([]);
  const [emailCopied, setEmailCopied] = useState(false);
  const isMobile = useIsMobile();

  const copyEmail = useCallback(async () => {
    if (!member?.email) return;
    try {
      await navigator.clipboard.writeText(member.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = member.email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  }, [member?.email]);


  const fetchInvolvement = useCallback(async () => {
    if (!member?.id) return;

    try {
      const badges: InvolvementBadge[] = [];

      // Fetch project memberships with project and semester data
      const { data: projectMemberships, error: projectError } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          projects (
            name,
            semesters (code)
          )
        `)
        .eq('user_id', member.id);

      if (projectError) {
        console.error('Error fetching project memberships:', projectError);
      }

      if (projectMemberships) {
        for (const membership of projectMemberships) {
          const project = membership.projects;
          if (project?.name && project?.semesters?.code) {
            badges.push({
              id: membership.id,
              type: 'project',
              role: membership.role === 'lead' ? 'Lead' : 'Member',
              semesterCode: project.semesters.code,
              name: project.name,
            });
          }
        }
      }

      // Fetch class enrollments with class and semester data
      const { data: classEnrollments, error: classError } = await supabase
        .from('class_enrollments')
        .select(`
          id,
          role,
          classes (
            name,
            semesters (code)
          )
        `)
        .eq('user_id', member.id);

      if (classError) {
        console.error('Error fetching class enrollments:', classError);
      }

      if (classEnrollments) {
        for (const enrollment of classEnrollments) {
          const classData = enrollment.classes;
          if (classData?.name && classData?.semesters?.code) {
            badges.push({
              id: enrollment.id,
              type: 'class',
              role: enrollment.role === 'teacher' ? 'Teacher' : 'Student',
              semesterCode: classData.semesters.code,
              name: classData.name,
            });
          }
        }
      }

      setInvolvementBadges(badges);
    } catch (error) {
      console.error('Error fetching involvement:', error);
    }
  }, [member?.id]);

  useEffect(() => {
    if (member?.id) {
      fetchInvolvement();
    }
  }, [member?.id, fetchInvolvement]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileContent = member && (
    <div>
      {/* Identity header */}
      <div className="flex items-center gap-4 pb-4">
        <Avatar className="h-20 w-20 shrink-0 rounded-none border border-border">
          <AvatarImage src={member.profile_picture_url || undefined} className="rounded-none" />
          <AvatarFallback className="rounded-none font-mono text-2xl">
            {member.full_name
              ? getInitials(member.full_name)
              : member.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="truncate font-mono text-xl font-extrabold tracking-[-0.02em]">
            {member.full_name || 'No name'}
          </h3>
          <span className={`${CHIP_BASE} ${roleChipClass(member)}`}>{member.role}</span>
        </div>
      </div>

      {/* Meta rows */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between gap-4 border-b border-hairline-faint py-2.5">
          <span className={ROW_LABEL}>Email</span>
          <button
            type="button"
            className="group -mr-1 flex min-w-0 cursor-pointer items-center gap-2 px-1 py-0.5 transition-colors hover:bg-tint"
            onClick={copyEmail}
            title="Copy email"
          >
            <span className="relative inline-flex shrink-0 items-center justify-center text-muted-foreground">
              {emailCopied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <Mail className="pointer-events-none absolute inset-0 h-4 w-4 transition-opacity duration-200 group-hover:opacity-0" />
                  <Copy className="pointer-events-none absolute inset-0 h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </span>
              )}
            </span>
            <p className="truncate font-mono text-xs">{member.email}</p>
          </button>
        </div>

        {member.class_year && (
          <div className="flex items-center justify-between gap-4 border-b border-hairline-faint py-2.5">
            <span className={ROW_LABEL}>Class Year</span>
            <p className="text-sm capitalize">{member.class_year}</p>
          </div>
        )}

        {member.position && (
          <div className="flex items-center justify-between gap-4 border-b border-hairline-faint py-2.5">
            <span className={ROW_LABEL}>Position</span>
            <p className="truncate text-sm">{member.position}</p>
          </div>
        )}

        {member.term_joined && (
          <div className="flex items-center justify-between gap-4 border-b border-hairline-faint py-2.5">
            <span className={ROW_LABEL}>Term Joined</span>
            <p className="font-mono text-sm tabular-nums">{member.term_joined}</p>
          </div>
        )}
      </div>

      {(member.linkedin_username || member.github_username) && (
        <div className="space-y-2 pt-4">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Links</p>
          <div className="flex flex-col gap-2">
            {member.linkedin_username && (
              <button
                type="button"
                aria-label="View LinkedIn profile"
                onClick={() => window.open(`https://linkedin.com/in/${member.linkedin_username}`, '_blank')}
                className="group flex w-full items-center justify-between gap-3 border border-border px-3 py-2.5 text-foreground transition-colors duration-200 hover:bg-foreground hover:text-page motion-reduce:transition-none"
              >
                <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
                  <Linkedin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">linkedin.com/in/{member.linkedin_username}</span>
                </span>
                <span aria-hidden className="font-mono text-sm transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
              </button>
            )}
            {member.github_username && (
              <button
                type="button"
                aria-label="View GitHub profile"
                onClick={() => window.open(`https://github.com/${member.github_username}`, '_blank')}
                className="group flex w-full items-center justify-between gap-3 border border-border px-3 py-2.5 text-foreground transition-colors duration-200 hover:bg-foreground hover:text-page motion-reduce:transition-none"
              >
                <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
                  <Github className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">github.com/{member.github_username}</span>
                </span>
                <span aria-hidden className="font-mono text-sm transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!isMobile && involvementBadges.length > 0 && (
        <motion.div
          className="relative overflow-hidden pt-4"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <motion.div
            className="relative"
            initial={{ y: -24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut', delay: 0.04 }}
          >
            <div className="space-y-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Involvement</p>
              <div className="flex flex-wrap gap-2">
                {involvementBadges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <span className="inline-block">
                        <Badge
                          variant="secondary"
                          className="flex cursor-pointer items-center gap-1.5 border border-border bg-page px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-foreground hover:text-page"
                        >
                          {badge.type === 'project' ? (
                            <Briefcase className="h-3 w-3" />
                          ) : (
                            <BookOpen className="h-3 w-3" />
                          )}
                          <span>
                            {badge.role} {badge.semesterCode}
                          </span>
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="max-w-xs">
                      <p className="text-sm">{badge.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  // If embedded mode, return content directly without Dialog wrapper
  if (embedded) {
    return (
      <div className={`bg-page border border-border overflow-hidden ${className}`}>
        <div className="p-6">
          {profileContent}
        </div>
      </div>
    );
  }

  // Otherwise, return as a right-side sidebar (onOpenChange receives new open state; only call onClose when closing)
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose?.(); }}>
      <SheetContent side="right" style={{ width: '100%', maxWidth: '26rem' }} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Member Profile</SheetTitle>
          <SheetDescription>View member details</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {profileContent}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileModal;
