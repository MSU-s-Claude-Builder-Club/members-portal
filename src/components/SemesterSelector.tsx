import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SemesterModal from './modals/SemesterModal';
import type { Database } from '@/integrations/supabase/database.types';

type Semester = Database['public']['Tables']['semesters']['Row'];

interface SemesterSelectorProps {
  value: string;
  onSelect: (semester: Semester | null) => void;
  required?: boolean;
}

// Mono chip trigger per system: hairline border, mono uppercase, tint wash on hover
const chipTriggerClasses =
  'h-auto w-full justify-between rounded-none border border-border bg-transparent px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors hover:bg-tint';

const SemesterSelector = ({ value, onSelect, required = false }: SemesterSelectorProps) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching semesters:', error);
        setLoading(false);
        return;
      }

      setSemesters(data || []);
      setLoading(false);
    };

    fetchSemesters();
  }, []);

  // Sync effect: If value exists but parent doesn't have the object (optional safety net)
  // This helps if the parent passed an ID but needs the full object back
  useEffect(() => {
    if (!loading && value && semesters.length > 0) {
      const selected = semesters.find(s => s.id === value);
      if (selected) {
        // We don't call onSelect here to avoid infinite loops,
        // but it confirms the data is present.
      }
    }
  }, [loading, value, semesters]);

  const handleSelect = (semesterId: string) => {
    if (semesterId === 'create-new') {
      setShowCreateModal(true);
      return;
    }

    const semester = semesters.find(s => s.id === semesterId);
    onSelect(semester || null);
  };

  const handleSemesterCreated = (newSemester: Semester) => {
    setSemesters(prev => [...prev, newSemester]);
    onSelect(newSemester);
    setShowCreateModal(false);
  };

  const selectedSemester = semesters.find(s => s.id === value);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label required={required}>Term</Label>
        <Select disabled>
          <SelectTrigger className={chipTriggerClasses}>
            <SelectValue placeholder="Loading terms..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label required={required}>Term</Label>
        <Select
          // 1. KEY FIX: This forces a re-render when data loads or value changes
          // effectively "waking up" the component to display the correct label.
          key={`${value || 'empty'}-${semesters.length}`}
          value={value || ""}
          onValueChange={handleSelect}
          required={required}
        >
          <SelectTrigger className={chipTriggerClasses}>
            {/* The chip reads the current semester CODE; placeholder otherwise */}
            <SelectValue placeholder={semesters.length === 0 ? "No terms available" : "Select term"}>
              {selectedSemester?.code}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {semesters.length === 0 ? (
              <div className="p-2 text-center font-mono text-xs text-muted-foreground">
                No terms available. Create one below.
              </div>
            ) : (
              semesters.map((semester) => (
                <SelectItem
                  key={semester.id}
                  value={semester.id}
                  className="font-mono text-xs data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                >
                  {semester.code} - {semester.name}
                </SelectItem>
              ))
            )}
            <div className="mt-1 border-t border-border pt-1">
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-full justify-start rounded-none font-mono text-xs uppercase tracking-[0.08em] hover:bg-tint"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Term
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>

      <SemesterModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSemesterCreated}
      />
    </>
  );
};

export default SemesterSelector;
