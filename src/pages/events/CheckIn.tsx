import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Checkin = () => {
    const { token } = useParams<{ token: string }>();
    const { user, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        points_awarded?: number;
        event_name?: string;
    } | null>(null);

    useEffect(() => {
        // User must be logged in to check in (ProtectedRoute handles redirect)
        const doCheckin = async () => {
            if (!token || checking) return;

            setChecking(true);

            try {
                const { data, error } = await supabase.rpc('checkin_member', {
                    p_token: token,
                });

                if (error) throw error;

                const resultData = data as {
                    success: boolean;
                    message: string;
                    points_awarded?: number;
                    event_name?: string;
                };

                // For RSVP violations (negative points), show as failure in UI
                if (resultData.success && resultData.points_awarded && resultData.points_awarded < 0) {
                    setResult({
                        success: false,
                        message: resultData.message,
                        points_awarded: resultData.points_awarded,
                        event_name: resultData.event_name
                    });
                } else {
                    setResult(resultData);
                }

                // Refresh profile to get updated points after check-in (success or penalty)
                if (resultData?.points_awarded !== undefined) {
                    await refreshProfile();
                }
            } catch (error) {
                console.error('Check-in error:', error);
                setResult({
                    success: false,
                    message: 'Failed to check in. Please try again.',
                });
            } finally {
                setChecking(false);
            }
        };

        if (!loading && user && token) {
            doCheckin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, token]); // checking and refreshProfile are intentionally excluded to prevent re-runs

    if (loading || checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-page p-4">
                <div className="w-full max-w-md border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                    <div className="hatch flex items-center justify-between border-b border-border px-5 py-2.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Check-in receipt
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-grey-3">
                            CBC·MSU
                        </span>
                    </div>
                    <div className="p-8 text-center">
                        <div
                            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                        <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Checking you in...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-page p-4">
            <div className="w-full max-w-md border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                {/* Chrome strip */}
                <div className="hatch flex items-center justify-between border-b border-border px-5 py-2.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Check-in receipt
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-grey-3">
                        CBC·MSU
                    </span>
                </div>

                <div className="p-6 md:p-8">
                    {result?.success ? (
                        <>
                            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Status
                            </p>
                            <p className="mt-2 font-mono text-4xl font-extrabold uppercase tracking-[-0.03em] text-foreground">
                                Checked in
                            </p>
                            <div className="mt-4 h-0.5 w-full bg-primary" aria-hidden="true" />
                            {result?.message && (
                                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                                    {result.message}
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                                Check-in failed
                            </p>
                            <div className="mt-3 h-px w-full bg-border" aria-hidden="true" />
                            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                                {result?.message}
                            </p>
                        </>
                    )}

                    {result?.event_name && (
                        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-grey-2">
                            {result.event_name}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 border-2 border-border bg-page px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground motion-reduce:transition-none"
                    >
                        Back to events
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkin;
