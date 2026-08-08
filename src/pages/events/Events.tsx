import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeepLinkModal } from '@/hooks/use-deep-link-modal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DetailModal } from '@/components/modals/DetailModal';
import { EditModal } from '@/components/modals/EditModal';
import { Plus, Calendar as CalendarIcon, MapPin, Users, Trophy, Eye, Edit, QrCode, Clock, MailCheck, X, CheckCircle, Mail } from 'lucide-react';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { format } from 'date-fns';
import { cn, escapeCsv } from '@/lib/utils';
import QrCodeWithLogo from 'qrcode-with-logos';
import type { Database } from '@/integrations/supabase/database.types';

type AppRole = Database['public']['Enums']['app_role'];
type Event = Database['public']['Tables']['events']['Row'];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

/* DESIGN.md recipes — status chips (§5), CTAs (§5), eyebrows (§3) */
const CHIP_BASE =
  'inline-flex items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]';
const CTA_BASE =
  'inline-flex min-h-[40px] items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50';
const CTA_PRIMARY = `${CTA_BASE} border-2 border-border bg-page text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground`;
const CTA_QUIET = `${CTA_BASE} border border-border bg-page text-foreground hover:bg-tint`;
const CTA_DANGER = `${CTA_BASE} border-2 border-destructive bg-destructive text-destructive-foreground hover:border-foreground hover:bg-foreground hover:text-page`;
const EYEBROW =
  'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground';
const CAL_LINK =
  'group/cal flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-tint hover:text-primary motion-reduce:transition-none';
const PICKER_TRIGGER =
  'w-full justify-start border border-input bg-page px-3 font-mono text-sm font-normal text-foreground hover:bg-tint hover:text-foreground';

const Events = () => {
  const { user } = useAuth();
  const { role, isBoardOrAbove, userEvents, eventsLoading, refreshEvents } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Combine and sort all events with grace period
  // Include events from the past 12 hours (grace period) plus future events
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const events = ((userEvents?.attending ?? []).concat(userEvents?.notAttending ?? []))
    .slice()
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .filter(event => new Date(event.event_date) >= sixHoursAgo); // Events from past 12 hours + future
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Header meta — receipts from the ledger already computed above
  const upcomingCount = events.filter(e => new Date(e.event_date) > new Date()).length;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date>();
  const [eventTime, setEventTime] = useState('');
  const [points, setPoints] = useState(0);
  const [maxAttendance, setMaxAttendance] = useState(50);
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [inviteProspects, setInviteProspects] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const timeScrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node && eventTime) {
      const selected = node.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [eventTime]);

  // Recurring event state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'after' | 'on'>('after');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(5);
  const [recurrenceEndCalendarOpen, setRecurrenceEndCalendarOpen] = useState(false);

  const modalState = useDeepLinkModal<Event>(isBoardOrAbove);

  // Query for attendance data for current user
  const { data: userAttendanceData } = useQuery({
    queryKey: ['user-event-attendance', user?.id],
    queryFn: async () => {
      if (!user || !userEvents) return {};

      const allEventIds = [
        ...(userEvents.attending?.map(e => e.id) || []),
        ...(userEvents.notAttending?.map(e => e.id) || [])
      ];

      if (allEventIds.length === 0) return {};

      const { data, error } = await supabase
        .from('event_attendance')
        .select('event_id, rsvped_at, attended_at')
        .eq('user_id', user.id)
        .in('event_id', allEventIds);

      if (error) throw error;

      // Create a map of event_id -> attendance data
      const attendanceMap: Record<string, { rsvped_at: string | null; attended_at: string | null }> = {};
      data?.forEach(attendance => {
        attendanceMap[attendance.event_id] = {
          rsvped_at: attendance.rsvped_at,
          attended_at: attendance.attended_at
        };
      });

      return attendanceMap;
    },
    enabled: !!userEvents && !!user,
    staleTime: 1000 * 60 * 1, // 1 minute - more frequent updates for user actions
    gcTime: 1000 * 60 * 5,
  });

  // Query for attendance counts for all visible events
  const { data: attendanceCounts } = useQuery({
    queryKey: ['event-attendance-counts', user?.id, role],
    queryFn: async () => {
      if (!userEvents || (!userEvents.attending?.length && !userEvents.notAttending?.length)) return {};

      const allEventIds = [
        ...(userEvents.attending?.map(e => e.id) || []),
        ...(userEvents.notAttending?.map(e => e.id) || [])
      ];

      if (allEventIds.length === 0) return {};

      const { data, error } = await supabase
        .from('event_attendance')
        .select('event_id')
        .in('event_id', allEventIds)
        .not('rsvped_at', 'is', null);

      if (error) throw error;

      // Count RSVPs per event
      const counts: Record<string, number> = {};
      data?.forEach(attendance => {
        counts[attendance.event_id] = (counts[attendance.event_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!userEvents && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });

  // Events are loaded via AuthContext (userEvents)

  // Restore selected item from URL parameter
  useEffect(() => {
    if (modalState.id && !modalState.selectedItem && events.length > 0) {
      const item = events.find(e => e.id === modalState.id);
      if (item) {
        modalState.setSelectedItem(item);
      } else if (isBoardOrAbove) {
        // For board users, fetch the event separately if not in visible list
        const fetchEventById = async (id: string) => {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (eventError || !eventData) {
            toast({
              title: 'Event Not Found',
              description: 'The requested event could not be found.',
              variant: 'destructive',
            });
            modalState.close();
            return;
          }

          modalState.setSelectedItem(eventData);
        };

        fetchEventById(modalState.id);
      } else {
        // Regular members can't access events not in their list
        toast({
          title: 'Access Denied',
          description: 'You do not have access to this event.',
          variant: 'destructive',
        });
        modalState.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.id, events, isBoardOrAbove, modalState.selectedItem]); // modalState and toast are stable

  // Load form data when editing
  useEffect(() => {
    if (modalState.modalType === 'edit' && modalState.selectedItem) {
      const event = modalState.selectedItem;
      setName(event.name);
      setDescription(event.description || '');
      setLocation(event.location || '');
      const eventDateTime = new Date(event.event_date);
      setDate(eventDateTime);
      setEventTime(eventDateTime.toTimeString().slice(0, 5));
      setPoints(event.points);
      setMaxAttendance(event.max_attendance);
      setRsvpRequired(event.rsvp_required);
      setInviteProspects(event.allowed_roles.includes('prospect'));
      // Reset recurring event fields when editing (recurring options are hidden)
      setIsRecurring(false);
      setRecurrenceFrequency('weekly');
      setRecurrenceInterval(1);
      setRecurrenceEndType('after');
      setRecurrenceEndDate(undefined);
      setRecurrenceOccurrences(5);
    } else if (isCreateModalOpen) {
      // Reset form for creating new event
      setName('');
      setDescription('');
      setLocation('');
      setDate(undefined);
      setEventTime('');
      setPoints(0);
      setMaxAttendance(50);
      setRsvpRequired(false);
      setInviteProspects(false);
      // Reset recurring event fields
      setIsRecurring(false);
      setRecurrenceFrequency('weekly');
      setRecurrenceInterval(1);
      setRecurrenceEndType('after');
      setRecurrenceEndDate(undefined);
      setRecurrenceOccurrences(5);
    }
  }, [modalState.modalType, modalState.selectedItem, isCreateModalOpen]);


  const getAllowedRoles = (): AppRole[] => {
    if (rsvpRequired) return ['member', 'board', 'e-board'];
    if (inviteProspects) return ['prospect', 'member', 'board', 'e-board'];
    return ['member', 'board', 'e-board'];
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!name.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter an event name',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }

    if (!eventTime) {
      toast({
        title: 'Required Field Missing',
        description: 'Please select a time',
        variant: 'destructive',
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter a location',
        variant: 'destructive',
      });
      return;
    }

    if (points < 0) {
      toast({
        title: 'Invalid Value',
        description: 'Points cannot be negative',
        variant: 'destructive',
      });
      return;
    }

    if (rsvpRequired && maxAttendance < 1) {
      toast({
        title: 'Invalid Value',
        description: 'Max attendance must be at least 1 when RSVP is required',
        variant: 'destructive',
      });
      return;
    }

    setSaveLoading(true);

    try {
      const [hours, minutes] = eventTime.split(':');
      // Build local date + time, then send as UTC via toISOString() — correct for a specific moment.
      const baseEventDateTime = new Date(date);
      baseEventDateTime.setHours(parseInt(hours), parseInt(minutes));

      const baseEventData = {
        name,
        description: description || null,
        location: location || null,
        points,
        max_attendance: maxAttendance,
        rsvp_required: rsvpRequired,
        allowed_roles: getAllowedRoles(),
      };

      if (modalState.selectedItem) {
        // Update the event itself
        const eventData = {
          ...baseEventData,
          event_date: baseEventDateTime.toISOString(),
        };

        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', modalState.selectedItem.id);
        if (error) throw error;

        toast({ title: 'Success', description: 'Event updated!' });
      } else {
        if (isRecurring) {
          // Create multiple recurring events
          const eventsToCreate = [];
          let currentDate = new Date(baseEventDateTime);
          let occurrencesCreated = 0;
          const maxOccurrences = recurrenceEndType === 'after' ? recurrenceOccurrences : 100; // Reasonable limit

          while (occurrencesCreated < maxOccurrences) {
            // Check if we've exceeded the end date
            if (recurrenceEndType === 'on' && recurrenceEndDate && currentDate > recurrenceEndDate) {
              break;
            }

            const eventData = {
              ...baseEventData,
              event_date: currentDate.toISOString(),
              created_by: user.id,
            };

            eventsToCreate.push(eventData);

            // Calculate next occurrence
            const nextDate = new Date(currentDate);
            if (recurrenceFrequency === 'daily') {
              nextDate.setDate(nextDate.getDate() + (recurrenceInterval * 1));
            } else if (recurrenceFrequency === 'weekly') {
              nextDate.setDate(nextDate.getDate() + (recurrenceInterval * 7));
            } else if (recurrenceFrequency === 'monthly') {
              nextDate.setMonth(nextDate.getMonth() + recurrenceInterval);
            }

            currentDate = nextDate;
            occurrencesCreated++;

            // Safety check to prevent infinite loops
            if (occurrencesCreated > 100) break;
          }

          const { error } = await supabase
            .from('events')
            .insert(eventsToCreate);

          if (error) throw error;

          toast({
            title: 'Success',
            description: `${eventsToCreate.length} recurring events created!`
          });
        } else {
          // Create single event
          const eventData = {
            ...baseEventData,
            event_date: baseEventDateTime.toISOString(),
            created_by: user.id,
          };

          const { error } = await supabase
            .from('events')
            .insert(eventData);
          if (error) throw error;
          toast({ title: 'Success', description: 'Event created!' });
        }
      }

      await refreshEvents();
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
      .rpc('delete_event', { target_event_id: modalState.selectedItem.id });

    if (error) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete event',
        variant: 'destructive'
      });
      return;
    }

    toast({ title: 'Success', description: 'Event deleted!' });
    await refreshEvents();
    modalState.close();
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('event_attendance')
      .insert({
        user_id: user.id,
        event_id: eventId,
        rsvped_at: new Date().toISOString(),
      });

    if (error) return;

    await refreshEvents();
    // Invalidate attendance counts and user attendance data to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['event-attendance-counts', user?.id, role] });
    queryClient.invalidateQueries({ queryKey: ['user-event-attendance', user?.id] });
    toast({ title: 'Success', description: 'Your RSVP is confirmed.' });
  };

  const handleCancelRSVP = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('event_attendance')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) return;

    await refreshEvents();
    // Invalidate attendance counts and user attendance data to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['event-attendance-counts', user?.id, role] });
    queryClient.invalidateQueries({ queryKey: ['user-event-attendance', user?.id] });
    toast({ title: 'Success', description: 'Your RSVP has been cancelled.' });
  };

  const handleGenerateQR = async (event: Event) => {
    setGeneratingQR(event.id);

    try {
      const { data: existingQR } = await supabase
        .from('event_qr_codes')
        .select('qr_code_url, token')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingQR?.qr_code_url) {
        if (isMobile) {
          window.location.href = existingQR.qr_code_url;
        } else {
          window.open(existingQR.qr_code_url, '_blank');
        }
        setGeneratingQR(null);
        return;
      }

      const token = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/events/checkin/${token}`;

      const primaryHex = '#e07a5f';
      const size = 512;
      const qr = new QrCodeWithLogo({
        content: qrUrl,
        width: size,
        logo: {
          src: '/claude-logo-transparent.png',
          borderRadius: 10,
          borderWidth: 12,
          bgColor: '#ffffff',
        },
        dotsOptions: {
          type: 'dot',
          color: primaryHex,
        },
        cornersOptions: {
          type: 'rounded',
          color: primaryHex,
        },
        nodeQrCodeOptions: {
          margin: 4,
          errorCorrectionLevel: 'H',
          color: { dark: primaryHex, light: '#FFFFFF' },
        },
      });
      const canvas = await qr.getCanvas();
      const qrCodeDataUrl = canvas.toDataURL('image/png');
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();

      const fileName = `${event.id}_${token}.png`;
      const filePath = `qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      const { error: qrError } = await supabase
        .from('event_qr_codes')
        .insert({
          event_id: event.id,
          token,
          qr_code_url: publicUrl,
        });

      if (qrError) throw qrError;

      toast({ title: 'Success', description: 'QR code generated successfully!' });
      window.open(publicUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    } finally {
      setGeneratingQR(null);
    }
  };

  const generateCalendarLinks = (event: Event) => {
    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location || '',
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    return {
      google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
      apple: () => {
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.name}.ics`;
        link.click();
        URL.revokeObjectURL(url);
      },
    };
  };

  const isEventFull = (event: Event) => {
    const count = attendanceCounts?.[event.id] || 0;
    return event.rsvp_required && count >= event.max_attendance;
  };

  const getEventTypeLabel = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    if (eventDate <= now) return 'In Progress';

    const isOpenToProspects = event.allowed_roles.includes('prospect');
    if (isOpenToProspects) return 'Open Meeting';
    if (event.rsvp_required) return 'Closed Meeting';
    return 'Internal Meeting';
  };

  // Status chip per DESIGN.md §5: live/today = orange fill; upcoming = outline
  const getEventChipClass = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    if (eventDate <= now || eventDate.toDateString() === now.toDateString()) {
      return `${CHIP_BASE} border-primary bg-primary text-primary-foreground`;
    }
    return `${CHIP_BASE} border-border text-foreground`;
  };

  const renderEventCard = (event: Event) => {
    const isFull = isEventFull(event);
    const userAttendance = userAttendanceData?.[event.id];
    const hasRSVPed = userAttendance?.rsvped_at !== null;
    const hasAttended = userAttendance?.attended_at !== null;
    const attendanceCount = attendanceCounts?.[event.id] || 0;
    const eventHasStarted = new Date(event.event_date) <= new Date();
    const calendarLinks = generateCalendarLinks(event);
    const eventDate = new Date(event.event_date);
    const capacityPct = event.max_attendance > 0
      ? Math.min(100, Math.round((attendanceCount / event.max_attendance) * 100))
      : 0;
    const memberHasRsvpAction = !isBoardOrAbove && event.rsvp_required && !eventHasStarted;

    const copyEventEmailsCsv = async () => {
      const emailSet = new Set<string>();
      if (event.rsvp_required) {
        const { data: attendance } = await supabase
          .from('event_attendance')
          .select('user_id')
          .eq('event_id', event.id)
          .not('rsvped_at', 'is', null);
        const userIds = [...new Set((attendance ?? []).map(a => a.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .in('id', userIds)
            .or('is_banned.is.null,is_banned.eq.false');
          (profiles ?? []).forEach(p => emailSet.add(p.email));
        }
      } else {
        const { data: roleRows } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', event.allowed_roles);
        const userIds = [...new Set((roleRows ?? []).map(r => r.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .in('id', userIds)
            .or('is_banned.is.null,is_banned.eq.false');
          (profiles ?? []).forEach(p => emailSet.add(p.email));
        }
      }
      if (event.allowed_roles.includes('prospect')) {
        const { data: prospectRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'prospect');
        const prospectIds = [...new Set((prospectRoles ?? []).map(r => r.user_id))];
        if (prospectIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .in('id', prospectIds)
            .or('is_banned.is.null,is_banned.eq.false');
          (profiles ?? []).forEach(p => emailSet.add(p.email));
        }
      }
      const emails = [...emailSet];
      if (emails.length === 0) {
        toast({ title: 'No emails', description: 'No invited member emails to copy for this event.', variant: 'destructive' });
        return;
      }
      void navigator.clipboard.writeText(emails.map(escapeCsv).join(',')).then(() => {
        toast({ title: 'Copied', description: `${emails.length} email${emails.length === 1 ? '' : 's'} copied to clipboard` });
      });
    };

    return (
      <article className="flex h-full min-w-0 flex-col border border-border bg-page md:flex-row">
        {/* DATE BLOCK — the machine voice */}
        <div className="flex shrink-0 items-baseline gap-3 border-b border-hairline-faint px-4 py-2.5 md:w-[96px] md:flex-col md:items-center md:justify-center md:gap-1 md:border-b-0 md:border-r md:px-2 md:py-5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {format(eventDate, 'MMM')}
          </span>
          <span className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">
            {format(eventDate, 'dd')}
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-grey-2">
            {format(eventDate, 'EEE')}
          </span>
        </div>

        {/* DOCUMENT BODY */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <span className={cn(getEventChipClass(event), 'shrink-0')}>
              {getEventTypeLabel(event)}
            </span>
            {isBoardOrAbove && (
              <button
                type="button"
                onClick={() => void copyEventEmailsCsv()}
                title="Copy invited emails as CSV"
                aria-label="Copy invited emails as CSV"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground motion-reduce:transition-none"
              >
                <Mail className="h-4 w-4" />
              </button>
            )}
          </div>

          <h3 className="break-words font-sans text-lg font-bold leading-snug text-foreground">
            {event.name}
          </h3>

          {/* Mono meta row: time · location · points */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs tabular-nums text-muted-foreground">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 underline decoration-transparent transition-colors duration-200 hover:text-primary hover:decoration-primary motion-reduce:transition-none"
                >
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                  {format(new Date(event.event_date), isMobile ? 'MMM d, h:mm a' : 'PPP p')}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 border border-border p-0" align={isMobile ? 'start' : 'end'}>
                <div className="divide-y divide-hairline-faint">
                  <button
                    type="button"
                    className={CAL_LINK}
                    onClick={() => window.open(calendarLinks.google, '_blank')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaGoogle className="h-3.5 w-3.5" />
                      Add to Google
                    </span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/cal:translate-x-0.5 motion-reduce:transition-none">
                      →
                    </span>
                  </button>
                  <button
                    type="button"
                    className={CAL_LINK}
                    onClick={() => calendarLinks.apple()}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaApple className="h-3.5 w-3.5" />
                      Add to Apple
                    </span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/cal:translate-x-0.5 motion-reduce:transition-none">
                      →
                    </span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {event.location && (
              <>
                <span aria-hidden="true" className="text-grey-3">·</span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </span>
              </>
            )}

            {event.points > 0 && (
              <>
                <span aria-hidden="true" className="text-grey-3">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 shrink-0" />
                  +{event.points} points
                </span>
              </>
            )}
          </div>

          {/* Capacity — tabular receipt + square progress bar */}
          {event.rsvp_required && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  RSVPs
                </span>
                <span className="font-semibold text-foreground">
                  {attendanceCount}/{event.max_attendance}
                </span>
              </div>
              <div className="h-1.5 w-full bg-grey-4">
                <div className="h-full bg-primary" style={{ width: `${capacityPct}%` }} />
              </div>
            </div>
          )}

          {!isMobile && event.description && (
            <p className="line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          )}

          {/* Actions — ruled off from the document body */}
          <div className="mt-auto flex flex-col gap-2 border-t border-hairline-faint pt-3 md:flex-row md:flex-wrap">
            {isBoardOrAbove ? (
              <>
                <button
                  type="button"
                  className={cn(CTA_QUIET, 'w-full md:w-auto')}
                  onClick={() => modalState.open(event, event.id)}
                >
                  <Edit className="h-4 w-4" />
                  {isMobile ? 'Edit' : 'Edit Details'}
                </button>
                {!isMobile && (
                  <button
                    type="button"
                    className={cn(CTA_PRIMARY, 'w-full md:w-auto')}
                    onClick={() => handleGenerateQR(event)}
                    disabled={generatingQR === event.id}
                  >
                    <QrCode className="h-4 w-4" />
                    {generatingQR === event.id ? 'Generating...' : 'Generate QR Code'}
                  </button>
                )}
              </>
            ) : (
              <>
                {event.rsvp_required && !eventHasStarted && (
                  hasAttended ? (
                    <button
                      type="button"
                      className={cn(CTA_QUIET, 'w-full md:w-auto')}
                      onClick={() => { }}
                      disabled
                    >
                      <CheckCircle className="h-4 w-4" />
                      Attended
                    </button>
                  ) : hasRSVPed ? (
                    <button
                      type="button"
                      className={cn(CTA_DANGER, 'w-full md:w-auto')}
                      onClick={() => handleCancelRSVP(event.id)}
                    >
                      <X className="h-4 w-4" />
                      {isMobile ? 'Cancel' : 'Cancel RSVP'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={cn(CTA_PRIMARY, 'w-full md:w-auto')}
                      onClick={() => handleRSVP(event.id)}
                      disabled={isFull}
                    >
                      <MailCheck className="h-4 w-4" />
                      {isFull ? 'Full' : 'RSVP'}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className={cn(memberHasRsvpAction ? CTA_QUIET : CTA_PRIMARY, 'w-full md:w-auto')}
                  onClick={() => modalState.open(event, event.id)}
                >
                  <Eye className="h-4 w-4" />
                  {isMobile ? 'Details' : 'View Details'}
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-10">
      {/* PAGE HEADER — eyebrow / title / meta line (DESIGN.md §6) */}
      <header className="border-b border-border pb-6">
        <p className={EYEBROW}>Events</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-mono text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            Events
          </h1>
          {isBoardOrAbove && (
            <button
              type="button"
              className={CTA_PRIMARY}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          )}
        </div>
        <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
          {upcomingCount} upcoming · {events.length} on the ledger
        </p>
      </header>

      {eventsLoading ? (
        <div className="mt-6 space-y-0" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="-mt-px flex h-28 animate-pulse border border-border first:mt-0 motion-reduce:animate-none"
            >
              <div className="w-16 border-r border-hairline-faint bg-grey-4/40 md:w-[96px]" />
              <div className="flex-1 space-y-3 p-5">
                <div className="h-3 w-1/4 bg-grey-4/40" />
                <div className="h-3 w-2/3 bg-grey-4/40" />
                <div className="h-3 w-1/3 bg-grey-4/40" />
              </div>
            </div>
          ))}
          <p className="sr-only">Loading events...</p>
        </div>
      ) : (events.length === 0) ? (
        <div className="mt-6 border border-dashed border-grey-3 px-6 py-12 text-center">
          <p className={EYEBROW}>No events on record</p>
          <p className="mt-2 text-sm text-muted-foreground">No upcoming events at this time.</p>
          {isBoardOrAbove && (
            <button
              type="button"
              className={cn(CTA_PRIMARY, 'mt-5')}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {/* THE EVENT LEDGER — hairline-collapsed document rows */}
          {events.length > 0 && (
            <div className="flex flex-col">
              {events.map((event) => (
                <div key={event.id} className="-mt-px w-full min-w-0 first:mt-0">
                  {renderEventCard(event)}
                </div>
              ))}
            </div>
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
        title={modalState.selectedItem ? 'Edit Event' : 'Create New Event'}
        description={modalState.selectedItem ? 'Update event details' : 'Add a new event to the calendar'}
        onSubmit={handleSubmit}
        onDelete={modalState.selectedItem ? handleDelete : undefined}
        loading={saveLoading}
        deleteItemName={modalState.selectedItem?.name}
        submitLabel={modalState.selectedItem ? 'Update Event' : 'Create Event'}
      >
        <div className="space-y-2">
          <Label htmlFor="name" required>Event Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workshop: Intro to AI"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label required>Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className={cn(
                    PICKER_TRIGGER,
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label required>Time</Label>
            <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className={cn(
                    PICKER_TRIGGER,
                    !eventTime && 'text-muted-foreground'
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {eventTime
                    ? TIME_OPTIONS.find((opt) => opt.value === eventTime)?.label
                    : <span>Select time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-0"
                align="center"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div
                  ref={timeScrollRef}
                  className="p-1"
                  style={{
                    height: '300px',
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    position: 'relative',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'none',
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {TIME_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      data-selected={eventTime === option.value}
                      variant={eventTime === option.value ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start font-normal mb-1',
                        eventTime === option.value
                          ? 'pointer-events-none'
                          : 'hover:bg-background hover:text-primary'
                      )}
                      onClick={() => {
                        setEventTime(option.value);
                        setTimePickerOpen(false);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${rsvpRequired ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div className="space-y-2">
            <Label htmlFor="location" required>Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="STEM 3202"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points" required>Points</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {rsvpRequired && (
            <div className="space-y-2">
              <Label htmlFor="maxAttendance" required>Max Attendance</Label>
              <Input
                id="maxAttendance"
                type="number"
                value={maxAttendance}
                onChange={(e) => setMaxAttendance(parseInt(e.target.value) || 50)}
                min={1}
              />
            </div>
          )}
        </div>

        <div className="space-y-3 border border-border p-4">
          <Label>Event Options</Label>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rsvp"
              checked={rsvpRequired}
              onCheckedChange={(checked) => {
                setRsvpRequired(checked as boolean);
                if (checked) setInviteProspects(false);
              }}
            />
            <label htmlFor="rsvp" className="text-sm cursor-pointer">
              Require RSVP
            </label>
          </div>

          {!rsvpRequired && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inviteProspects"
                checked={inviteProspects}
                onCheckedChange={(checked) => setInviteProspects(checked as boolean)}
              />
              <label htmlFor="inviteProspects" className="text-sm cursor-pointer">
                Invite Prospects
              </label>
            </div>
          )}

          <p className="border-t border-hairline-faint pt-3 font-mono text-[11px] text-muted-foreground">
            Open to:{' '}
            {rsvpRequired
              ? 'members, board, and e-board only'
              : inviteProspects
                ? 'all members including prospects'
                : 'members, board, and e-board'}
          </p>
        </div>

        {!modalState.selectedItem && (
          <div className="space-y-3 border border-border p-4">
            <Label>Recurring Event</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <label htmlFor="recurring" className="text-sm cursor-pointer">
                Make this a recurring event
              </label>
            </div>

            {isRecurring && (
              <div className="ml-6 space-y-4 border-l border-hairline-faint pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      value={recurrenceFrequency}
                      onChange={(e) => setRecurrenceFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                      className="flex h-10 w-full rounded-none border border-input bg-page px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interval">Every</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="interval"
                        type="number"
                        min={1}
                        max={30}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {recurrenceFrequency === 'daily' ? 'day(s)' :
                          recurrenceFrequency === 'weekly' ? 'week(s)' : 'month(s)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Recurrence</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="endAfter"
                        name="endType"
                        className="accent-primary"
                        checked={recurrenceEndType === 'after'}
                        onChange={() => setRecurrenceEndType('after')}
                      />
                      <label htmlFor="endAfter" className="text-sm cursor-pointer">After</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="endOn"
                        name="endType"
                        className="accent-primary"
                        checked={recurrenceEndType === 'on'}
                        onChange={() => setRecurrenceEndType('on')}
                      />
                      <label htmlFor="endOn" className="text-sm cursor-pointer">On</label>
                    </div>
                  </div>

                  {recurrenceEndType === 'after' ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={recurrenceOccurrences}
                        onChange={(e) => setRecurrenceOccurrences(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="font-mono text-xs text-muted-foreground">occurrences</span>
                    </div>
                  ) : (
                    <Popover open={recurrenceEndCalendarOpen} onOpenChange={setRecurrenceEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="secondary"
                          className={cn(
                            PICKER_TRIGGER,
                            !recurrenceEndDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurrenceEndDate ? format(recurrenceEndDate, 'PPP') : <span>Pick end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={recurrenceEndDate}
                          onSelect={(selectedDate) => {
                            setRecurrenceEndDate(selectedDate);
                            setRecurrenceEndCalendarOpen(false);
                          }}
                          disabled={(d) => d < (date || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </EditModal>

      {/* DETAIL MODAL */}
      {modalState.selectedItem && modalState.modalType === 'details' && (
        <DetailModal
          open={modalState.isOpen}
          onClose={modalState.close}
          title={modalState.selectedItem.name}
          badges={[
            <span key="type" className={getEventChipClass(modalState.selectedItem)}>
              {getEventTypeLabel(modalState.selectedItem)}
            </span>,
          ]}
          sections={[
            {
              title: 'Time',
              icon: <CalendarIcon className="h-4 w-4" />,
              content: format(new Date(modalState.selectedItem.event_date), 'p'),
            },
            {
              title: 'Date',
              icon: <CalendarIcon className="h-4 w-4" />,
              content: format(new Date(modalState.selectedItem.event_date), 'PPP'),
            },
            {
              title: 'Location',
              icon: <MapPin className="h-4 w-4" />,
              content: modalState.selectedItem.location,
            },
            ...(modalState.selectedItem.points > 0
              ? [
                {
                  title: 'Points Reward',
                  icon: <Trophy className="h-4 w-4" />,
                  content: (
                    <span className="font-mono font-semibold tabular-nums text-primary">
                      +{modalState.selectedItem.points} points
                    </span>
                  ),
                },
              ]
              : []),
            ...(modalState.selectedItem.description
              ? [
                {
                  title: 'Description',
                  content: modalState.selectedItem.description,
                },
              ]
              : []),
            {
              title: 'Event Type',
              content: modalState.selectedItem.rsvp_required
                ? `This is a closed meeting with limited capacity (${modalState.selectedItem.max_attendance} attendees). RSVP is required.`
                : 'This is an open meeting. Members and prospects are welcome to attend.',
            },
            ...(modalState.selectedItem.rsvp_required
              ? [
                {
                  title: 'Attendance',
                  icon: <Users className="h-4 w-4" />,
                  content: `${attendanceCounts?.[modalState.selectedItem.id] || 0} / ${modalState.selectedItem.max_attendance} RSVPs`,
                },
              ]
              : []),
          ]}
        />
      )}
    </div>
  );
};

export default Events;
