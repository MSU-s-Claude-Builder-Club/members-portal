import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID;
const JOTFORM_EMBED_BASE = 'https://form.jotform.com';
const CAMPUS_NAME = 'Michigan State University';

interface JotFormModalProps {
    open: boolean;
    onClose?: () => void;
}

/**
 * Builds the pre-filled JotForm URL using the current user's profile/auth data.
 * Uses auth context only — no database queries.
 */
function buildPrefilledFormUrl(
    fullName: string | null | undefined,
    email: string | null | undefined
): string {
    const nameParts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = String(today.getFullYear());

    const params = new URLSearchParams({
        'whatCbc[month]': month,
        'whatCbc[day]': day,
        'whatCbc[year]': year,
        whatIs: firstName,
        typeA6: lastName,
        whatIs7: email || '',
        // haveYou: 'Yes',
        whatCampus: CAMPUS_NAME,
    });

    return `${JOTFORM_EMBED_BASE}/${JOTFORM_FORM_ID}?${params.toString()}`;
}

/**
 * Modal that embeds the weekly JotForm inside the dialog and pre-fills it
 * with the signed-in member's name and email from auth/profile context.
 */
export const JotFormModal = ({ open, onClose }: JotFormModalProps) => {
    const { user, profile } = useAuth();

    const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? '';
    const email = profile?.email ?? user?.email ?? '';

    const embedUrl = buildPrefilledFormUrl(fullName, email);

    const isReady = Boolean(email);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex h-[90vh] max-w-[85vw] flex-col gap-0 rounded-none border border-border bg-page p-0 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                <DialogHeader className="hatch shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
                    <DialogTitle className="font-mono text-lg font-extrabold tracking-[-0.02em]">
                        Weekly Check-in Form
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs text-muted-foreground">
                        Your name and email are pre-filled. Complete and submit the form below.
                    </DialogDescription>
                </DialogHeader>

                {!isReady ? (
                    <div className="p-8 text-center font-mono text-sm text-muted-foreground">
                        Please sign in to submit the weekly check-in form.
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col p-4">
                        <div className="min-h-[480px] flex-1 overflow-hidden border border-border bg-page">
                            <iframe
                                title="Weekly check-in form"
                                src={embedUrl}
                                className="w-full h-full min-h-[480px] border-0"
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
