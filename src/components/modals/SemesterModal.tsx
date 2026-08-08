import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/database.types';
import { useIsMobile } from '@/hooks/use-mobile';

type Semester = Database['public']['Tables']['semesters']['Row'];

interface SemesterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (semester: Semester) => void;
  required?: boolean;
}

// Store semester dates as date-only (YYYY-MM-DD). The DB will store as midnight UTC (or server TZ),
// avoiding timezone conversion issues that produced 08:00/10:00 instead of 00:00.
const toDateOnly = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Parse YYYY-MM-DD as local midnight (avoid new Date(str) which is UTC midnight and shifts the day in some zones).
const parseDateOnly = (str: string): Date => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const SemesterModal = ({ open, onClose, onSuccess }: SemesterModalProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.code.trim()) {
        toast({
          title: 'Required Field Missing',
          description: 'Please enter a semester code',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.name.trim()) {
        toast({
          title: 'Required Field Missing',
          description: 'Please enter a semester name',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.start_date) {
        toast({
          title: 'Required Field Missing',
          description: 'Please select a start date',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.end_date) {
        toast({
          title: 'Required Field Missing',
          description: 'Please select an end date',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validate dates
      const startDate = parseDateOnly(formData.start_date);
      const endDate = parseDateOnly(formData.end_date);

      if (endDate <= startDate) {
        toast({
          title: 'Error',
          description: 'End date must be after start date',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Send midnight UTC so DB stores 00:00:00+00 (avoids server TZ interpreting date-only as local midnight).
      const start_date = `${formData.start_date}T00:00:00.000Z`;
      const end_date = `${formData.end_date}T00:00:00.000Z`;
      const { data, error } = await supabase
        .from('semesters')
        .insert({
          code: formData.code,
          name: formData.name,
          start_date,
          end_date,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Term created successfully',
      });

      // Reset form
      setFormData({
        code: '',
        name: '',
        start_date: '',
        end_date: '',
      });

      onSuccess(data);
    } catch (error) {
      console.error('Error creating semester:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create term',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        code: '',
        name: '',
        start_date: '',
        end_date: '',
      });
      setStartCalendarOpen(false);
      setEndCalendarOpen(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`${isMobile ? 'max-w-[90vw]' : 'max-w-xl'} gap-0 rounded-none border border-border bg-page p-0 shadow-[8px_8px_0_0_hsl(var(--foreground))]`}
      >
        <DialogHeader className="hatch space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-mono text-lg font-extrabold tracking-[-0.02em]">
            Create New Term
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Add a new semester/term for projects and classes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="code" required>
              Code
            </Label>
            <Input
              id="code"
              placeholder="W26"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              maxLength={10}
            />
            <p className="font-mono text-[11px] text-muted-foreground">
              e.g., S26 (Spring 2026), F27 (Fall 2027)
              {!isMobile
                && ', Su26 (Summer 2026)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              placeholder="Winter 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>
                Start Date
              </Label>
              <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full justify-start border border-input bg-page px-3 font-mono text-sm font-normal text-foreground hover:bg-tint hover:text-foreground',
                      !formData.start_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date
                      ? format(parseDateOnly(formData.start_date), 'PPP')
                      : <span>{isMobile ? 'Start date' : 'Pick a start date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? parseDateOnly(formData.start_date) : undefined}
                    onSelect={(selectedDate) => {
                      setFormData({ ...formData, start_date: selectedDate ? toDateOnly(selectedDate) : '' });
                      setStartCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label required>
                End Date
              </Label>
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full justify-start border border-input bg-page px-3 font-mono text-sm font-normal text-foreground hover:bg-tint hover:text-foreground',
                      !formData.end_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date
                      ? format(parseDateOnly(formData.end_date), 'PPP')
                      : <span>{isMobile ? 'End date' : 'Pick an end date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={formData.end_date ? parseDateOnly(formData.end_date) : undefined}
                    onSelect={(selectedDate) => {
                      setFormData({ ...formData, end_date: selectedDate ? toDateOnly(selectedDate) : '' });
                      setEndCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-hairline-faint pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Term'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterModal;