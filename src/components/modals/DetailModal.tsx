import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DetailSection, CardAction } from '@/types/modal.types';

interface DetailModalProps {
  open?: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode[];
  sections: DetailSection[];
  actions?: CardAction[];
  embedded?: boolean;
  className?: string;
}

/** Mono uppercase micro-label for section headings. */
const SECTION_LABEL =
  'flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground';

export const DetailModal = ({
  open = false,
  onClose,
  title,
  subtitle,
  badges,
  sections,
  actions,
  embedded = false,
  className = '',
}: DetailModalProps) => {
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className={isMobile ? 'justify-center items-center' : 'flex items-center justify-between gap-4'}>
        <h2 className="font-mono text-xl font-extrabold tracking-[-0.02em]">{title}</h2>
        {badges && badges.length > 0 && (
          <div className={`flex gap-2 ${isMobile ? 'mt-2' : ''}`}>
            {badges.map((badge, index) => (
              <div key={index}>{badge}</div>
            ))}
          </div>
        )}
      </div>

      {subtitle && <p className="mt-2 font-mono text-xs text-muted-foreground">{subtitle}</p>}

      <div className="mt-6">
        {sections.map((section, index) => (
          <div key={index} className={index > 0 ? 'mt-5 border-t border-hairline-faint pt-5' : ''}>
            {section.title && (
              <h3 className={SECTION_LABEL}>
                {section.icon}
                {section.title}
              </h3>
            )}
            <div className={`text-sm text-muted-foreground ${section.title ? 'mt-2' : ''}`}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-6 flex gap-3 border-t border-border pt-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              className="flex-1"
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {action.icon}
              {action.loading ? 'Loading...' : action.label}
            </Button>
          ))}
        </div>
      )}
    </>
  );

  // If embedded mode, return content directly without Dialog wrapper
  if (embedded) {
    return (
      <div className={`overflow-hidden border border-border bg-page ${className}`}>
        <div className="p-6">{content}</div>
      </div>
    );
  }

  // Otherwise, return as modal
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-lg gap-0 overflow-y-auto rounded-none border border-border p-0 shadow-[8px_8px_0_0_hsl(var(--foreground))] ${isMobile ? 'mx-4 max-w-[85vw] max-h-[85vh] overflow-x-hidden m-0' : 'max-h-[90vh]'}`}
      >
        <DialogHeader className={`hatch border-b border-border px-6 py-4 text-left ${isMobile ? 'justify-center items-center' : 'flex-row items-center justify-between'}`}>
          <DialogTitle className="font-mono text-lg font-extrabold tracking-[-0.02em]">{title}</DialogTitle>
          {badges && badges.length > 0 && (
            <div className={`flex gap-2 ${isMobile ? 'mt-2' : '!m-0'}`}>
              {badges.map((badge, index) => (
                <div key={index}>{badge}</div>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-5">
          {subtitle && (
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              {subtitle}
            </DialogDescription>
          )}

          <div className={subtitle ? 'mt-5' : ''}>
            {sections.map((section, index) => (
              <div key={index} className={index > 0 ? 'mt-5 border-t border-hairline-faint pt-5' : ''}>
                {section.title && (
                  <h3 className={SECTION_LABEL}>
                    {section.icon}
                    {section.title}
                  </h3>
                )}
                <div
                  className={`max-w-full overflow-y-auto overflow-x-auto break-words whitespace-pre-line text-sm text-muted-foreground ${section.title ? 'mt-2' : ''}`}
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {actions && actions.length > 0 && (
            <div className="mt-6 flex gap-3 border-t border-border pt-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  className="flex-1"
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                >
                  {action.icon}
                  {action.loading ? 'Loading...' : action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
