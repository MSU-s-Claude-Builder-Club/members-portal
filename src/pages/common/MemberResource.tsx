import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MemberResourceGate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-6 py-12">
      {/* A bordered notice document with hard extrusion */}
      <div className="w-full max-w-xl border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]">
        {/* Titlebar strip */}
        <div className="hatch flex h-[38px] items-center gap-1.5 border-b border-border px-4">
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span className="ml-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Access — Restricted
          </span>
        </div>

        <div className="p-6 md:p-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
            Members only
          </p>

          <h2 className="mt-3 font-mono text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-foreground">
            Member resource
          </h2>

          <p className="mt-4 max-w-[55ch] text-[15px] leading-relaxed text-ink-soft">
            This page is for members only. Submit an application to unlock member resources.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("/applications/new")}
              variant="default"
              className="font-mono text-sm font-semibold uppercase tracking-[0.1em]"
            >
              Apply to join <span aria-hidden="true">→</span>
            </Button>
            <Button
              size="lg"
              onClick={() => navigate(-1)}
              variant="outline"
              className="font-mono text-sm font-semibold uppercase tracking-[0.1em]"
            >
              <span aria-hidden="true">←</span> Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberResourceGate;
