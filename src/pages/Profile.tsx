import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mail, Linkedin, Github, FileText, Camera, RotateCw, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Cropper, { Area } from 'react-easy-crop';
import type { Database } from '@/integrations/supabase/database.types';
import type { AppRole } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isValidGithubUsername, isValidLinkedinUsername } from '@/lib/validation';

/** Eyebrow recipe — the signature move */
const EYEBROW = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground';

/** The one role-chip mapping (mono, uppercase, square). */
const CHIP_BASE =
  'inline-flex shrink-0 items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';

const roleChipClass = (role: AppRole | null): string =>
  role === 'admin'
    ? 'bg-primary text-primary-foreground border-primary'
    : role === 'board'
      ? 'bg-foreground text-page border-foreground'
      : role === 'member'
        ? 'border-border text-foreground'
        : 'border-grey-3 text-grey-2';

/** Danger button recipe */
const DANGER_BTN =
  'border-2 border-destructive bg-destructive font-mono text-xs font-semibold uppercase tracking-[0.1em] text-destructive-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-page disabled:pointer-events-none disabled:opacity-50';

const Profile = () => {
  // Get data from contexts
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth();
  const { isBoardOrAbove, role } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Form states
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [classYear, setClassYear] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [position, setPosition] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Image cropping states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setClassYear(profile.class_year || '');
      setLinkedinUsername(profile.linkedin_username || '');
      setGithubUsername(profile.github_username || '');
      setPosition(profile.position || '');
    }
  }, [profile]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg');
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select a valid image file',
          variant: 'destructive',
        });
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'Error',
          description: 'Image file is too large. Please select a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to read the image file',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    try {
      setLoading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });

      const sanitizedName = fullName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const filePath = `${sanitizedName}_${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, croppedFile, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const timestamp = Date.now();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: `${publicUrl}?t=${timestamp}`
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Profile picture updated!',
      });

      await refreshProfile();
      setShowCropModal(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();

    const sanitizedName = fullName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const resumeName = fullName
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('_');

    const newFolderPath = `${sanitizedName}_${user.id}`;
    const fileName = `${resumeName}_resume.${fileExt}`;
    const filePath = `${newFolderPath}/${fileName}`;

    // Clean up old resume if name changed
    if (profile?.full_name && profile.full_name !== fullName) {
      const oldSanitizedName = profile.full_name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const oldFolderPath = `${oldSanitizedName}_${user.id}`;

      const { data: oldFiles } = await supabase.storage
        .from('profiles')
        .list(oldFolderPath);

      if (oldFiles && oldFiles.length > 0) {
        const filesToDelete = oldFiles.map(file => `${oldFolderPath}/${file.name}`);
        await supabase.storage
          .from('profiles')
          .remove(filesToDelete);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteResume = async () => {
    if (!user || !profile?.resume_url) return;

    try {
      setLoading(true);

      // Extract file path from URL or construct it
      // The URL format is: https://[project].supabase.co/storage/v1/object/public/profiles/[filePath]
      const urlParts = profile.resume_url.split('/profiles/');
      let filePath: string | null = null;

      if (urlParts.length > 1) {
        // Extract path from URL (remove query params if any)
        filePath = urlParts[1].split('?')[0];
      } else {
        // Fallback: try to find resume file by listing folder
        const sanitizedName = (profile.full_name || fullName)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        const folderPath = `${sanitizedName}_${user.id}`;

        const { data: files } = await supabase.storage
          .from('profiles')
          .list(folderPath);

        if (files && files.length > 0) {
          const resumeFile = files.find(file => file.name.includes('_resume'));
          if (resumeFile) {
            filePath = `${folderPath}/${resumeFile.name}`;
          }
        }
      }

      // Delete from storage if we found the path
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove([filePath]);

        if (deleteError) throw deleteError;
      }

      // Update profile to remove resume_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Resume deleted successfully!',
      });

      await refreshProfile();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resume',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidGithubUsername(githubUsername)) {
      toast({
        title: 'Invalid GitHub Username',
        description:
          'GitHub usernames may only contain letters, numbers, single hyphens (not consecutive, not at start/end), and be 1-39 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidLinkedinUsername(linkedinUsername)) {
      toast({
        title: 'Invalid LinkedIn Username',
        description:
          'LinkedIn usernames must be 5-30 characters, only letters, numbers, hyphens or underscores, not start/end with hyphen/underscore.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let newResumeUrl = profile?.resume_url || null;

      if (resumeFile) {
        newResumeUrl = await uploadResume(resumeFile);
      }

      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        full_name: fullName,
        class_year: classYear || null,
        linkedin_username: linkedinUsername || null,
        github_username: githubUsername || null,
        position: position || null,
        resume_url: newResumeUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user!.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });

      await refreshProfile();
      setResumeFile(null);

      // Check if there's a redirect URL stored (e.g., from check-in flow)
      // ProtectedRoute will handle the redirect after profile is complete
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      // Step 1: Delete all files from storage
      const sanitizedName = (profile?.full_name || fullName)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const folderPath = `${sanitizedName}_${user.id}`;

      // List and delete all files in user's folder
      const { data: files } = await supabase.storage
        .from('profiles')
        .list(folderPath);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${folderPath}/${file.name}`);
        await supabase.storage
          .from('profiles')
          .remove(filePaths);
      }

      const { error: rpcError } = await supabase.rpc('delete_profile', {
        target_user_id: user.id,
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error('Failed to delete account. Please contact support.');
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Close the dialog before signing out
      setShowDeleteDialog(false);

      // Step 3: Sign out and redirect
      await signOut();
      navigate('/auth#signup', { replace: true });
    } catch (error) {
      console.error('Delete profile error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state
  if (authLoading || !user || !profile) {
    return (
      <div className={`min-h-full flex items-center justify-center ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="w-full max-w-md border border-border bg-page p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none"></div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full h-full overflow-y-auto">
      <div className="mx-auto max-w-[1200px]">
        {/* Page header */}
        <div className="border-b border-border pb-6">
          <p className={EYEBROW}>Personnel file</p>
          <h1 className="mt-1 font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]">Profile</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
            {user.email}
            {profile.created_at ? ` · joined ${new Date(profile.created_at).toLocaleDateString()}` : ''}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — identity + stats */}
          <div className="lg:col-span-1">
            <div className="border border-border bg-page">
              <div className="hatch border-b border-border px-5 py-2.5">
                <p className={EYEBROW}>Identity</p>
              </div>

              <div className="p-5">
                <div className="relative w-fit">
                  <Avatar className={`${isMobile ? 'h-24 w-24' : 'h-28 w-28'} rounded-none border border-border`}>
                    <AvatarImage src={profile.profile_picture_url || undefined} className="rounded-none" />
                    <AvatarFallback className="rounded-none font-mono text-3xl">
                      {fullName ? getInitials(fullName) : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    title="Upload profile picture"
                    className="absolute -bottom-px -right-px flex cursor-pointer items-center justify-center border border-border bg-primary p-2 text-primary-foreground transition-colors hover:bg-accent-hover"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      ref={fileInputRef}
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>

                <h2 className="mt-4 font-mono text-xl font-extrabold tracking-[-0.02em]">
                  {fullName || 'No name set'}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {role && <span className={`${CHIP_BASE} ${roleChipClass(role)}`}>{role}</span>}
                  {profile.term_joined && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`${CHIP_BASE} border-border text-foreground`}>
                          {profile.term_joined}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {profile.created_at
                          ? `Joined: ${new Date(profile.created_at).toLocaleDateString()}`
                          : 'Date joined unavailable'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Stats bento — hairline-collapsed cells, ONE primary emphasis */}
              <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                <div className="p-4">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Term</p>
                  <p className="mt-1 font-sans text-2xl font-bold tracking-[-0.02em] tabular-nums text-primary">
                    {profile.term_joined || '—'}
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Year</p>
                  <p className="mt-1 truncate font-sans text-2xl font-bold capitalize tracking-[-0.02em]">
                    {classYear || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — edit form */}
          <div className="lg:col-span-2">
            <div className="border border-border bg-page">
              <div className="hatch border-b border-border px-5 py-2.5">
                <p className={EYEBROW}>Edit profile</p>
              </div>

              <div className={isMobile ? 'p-4' : 'p-5 md:p-6'}>
                <p className="max-w-[68ch] text-sm text-muted-foreground">
                  Update your personal information. A well-filled out profile will help you stand out on applications.
                </p>

                <form onSubmit={handleSubmit} className="mt-6">
                  {/* ── Identity ── */}
                  <section>
                    <p className={EYEBROW}>Identity</p>
                    <div className={`mt-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      {isBoardOrAbove && (
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            placeholder="e.g., Marketing Director"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                          />
                          <p className="font-mono text-xs text-muted-foreground">
                            Your role or title in the club
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ── Academics ── */}
                  <section className="mt-6 border-t border-border pt-6">
                    <p className={EYEBROW}>Academics</p>
                    <div className="mt-4 space-y-4">
                      <div className={`space-y-2 ${isMobile ? '' : 'md:max-w-[calc(50%-0.5rem)]'}`}>
                        <Label htmlFor="classYear">Class Year</Label>
                        <Select value={classYear} onValueChange={setClassYear}>
                          <SelectTrigger id="classYear">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="freshman">Freshman</SelectItem>
                            <SelectItem value="sophomore">Sophomore</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resume">Resume (PDF, DOC, or DOCX)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className={profile?.resume_url ? "flex-[4]" : "w-full"}
                          />
                          {profile?.resume_url && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.open(profile.resume_url, '_blank')}
                                className="flex items-center gap-2 px-3"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {isMobile ? null : "Resume"}
                              </Button>
                              <Button
                                type="button"
                                variant="red"
                                onClick={deleteResume}
                                disabled={loading}
                                className={`px-3 ${DANGER_BTN}`}
                                title="Delete resume"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {resumeFile && (
                          <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            Selected: {resumeFile.name}
                          </p>
                        )}
                        <p className="font-mono text-xs text-muted-foreground">
                          Uploading a new resume will replace your current one
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ── Links ── */}
                  <section className="mt-6 border-t border-border pt-6">
                    <p className={EYEBROW}>Links</p>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedinUsername">
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Username
                          </div>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-grey-2">
                            linkedin.com/in/
                          </span>
                          <Input
                            id="linkedinUsername"
                            value={linkedinUsername}
                            onChange={(e) => setLinkedinUsername(e.target.value)}
                            placeholder="yourprofile"
                            className="pl-[130px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="githubUsername">
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            GitHub Username
                          </div>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-grey-2">
                            github.com/
                          </span>
                          <Input
                            id="githubUsername"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            placeholder="yourusername"
                            className="pl-[94px]"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* ── Danger zone — spans all columns ── */}
          <div className="lg:col-span-3">
            <div className="border border-destructive p-5 md:p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-destructive">Danger zone</p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[60ch] text-sm text-muted-foreground">
                  Permanently delete your account and your uploaded files. This cannot be undone.
                </p>
                <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
                  setShowDeleteDialog(open);
                  if (!open) {
                    setDeleteConfirmationEmail('');
                  }
                }}>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isDeleting}
                      className={`${DANGER_BTN} shrink-0 px-4 py-2.5`}
                    >
                      {isDeleting ? 'Deleting your profile...' : 'Delete your profile'}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex w-full justify-between items-center">
                        <AlertDialogTitle className="text-left font-mono font-extrabold tracking-[-0.02em]">Delete account</AlertDialogTitle>
                        <div className="flex h-8 w-8 items-center justify-center border border-destructive text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                      <AlertDialogDescription className="text-left mt-4 space-y-3">
                        <p>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>

                        <div className="space-y-2">
                          <p className="font-semibold text-foreground text-sm">
                            You will lose:
                          </p>
                          <ol className="text-sm space-y-1 text-muted-foreground ml-4">
                            <li className="list-decimal">Your profile information and settings</li>
                            <li className="list-decimal">Uploaded files (resume, profile picture)</li>
                            <li className="list-decimal">Access to the members portal</li>
                          </ol>
                        </div>

                        <div className="space-y-2 pt-2">
                          <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                            Type your email to confirm deletion:
                          </p>
                          <Input
                            type="email"
                            placeholder={user?.email || "your@email.com"}
                            value={deleteConfirmationEmail}
                            onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                            disabled={isDeleting}
                            autoComplete="off"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                      className={`flex !justify-around ${isMobile ? 'space-y-2 flex-col-reverse' : 'flex-row'}`}
                    >
                      <AlertDialogCancel
                        disabled={isDeleting}
                        className={isMobile ? '' : 'w-[47%] mt-0'}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        variant="red"
                        onClick={handleDeleteProfile}
                        disabled={isDeleting || deleteConfirmationEmail !== user?.email}
                        className={`${DANGER_BTN} ${!isMobile ? 'w-[47%]' : 'w-full'}`}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete my account'}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className={isMobile ? 'max-w-[calc(100vw-2rem)]' : 'max-w-2xl'}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : ''}>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div className={`relative bg-muted overflow-hidden ${isMobile ? 'h-64' : 'h-96'}`}>
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape="rect"
                />
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </Label>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                />
              </div>
            </div>
          </div>
          <div
            className={`gap-2 pt-4 w-full flex flex-shrink-0 border-t border-border bg-page
              ${isMobile ? 'flex-col' : 'flex-row'}
            `}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCropModal(false)}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCroppedImage}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Picture'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
