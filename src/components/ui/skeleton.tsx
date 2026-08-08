import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-none bg-grey-4/40 motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
