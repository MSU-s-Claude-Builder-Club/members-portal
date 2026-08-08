import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-6 py-12">
      <div className="w-full max-w-xl">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Error — Page not found
        </p>

        <h1 className="mt-2 font-mono text-[clamp(96px,24vw,160px)] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-foreground">
          404
        </h1>

        {/* The editorial mark: a single 2px orange rule */}
        <div aria-hidden="true" className="mt-6 h-[2px] w-24 bg-primary" />

        <p className="mt-6 max-w-[55ch] text-[15px] leading-relaxed text-ink-soft">
          Looks like you've wandered into uncharted territory. Let's get you back on track.
        </p>

        <div className="mt-10 flex flex-col gap-3 md:flex-row">
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            variant="default"
            className="font-mono text-sm font-semibold uppercase tracking-[0.1em]"
          >
            Go Home <span aria-hidden="true">→</span>
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
  );
};

export default NotFound;
