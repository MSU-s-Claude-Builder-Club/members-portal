import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // ink fill — active/accepted/member states
        default: "bg-foreground text-page border-foreground",
        member: "bg-foreground text-page border-foreground",
        green: "bg-foreground text-page border-foreground",

        // orange fill — featured/today/admin/current
        board: "bg-primary text-primary-foreground border-primary",
        blue: "bg-primary text-primary-foreground border-primary",

        // muted outline — pending/quiet states
        secondary: "border-border text-muted-foreground",

        // plain outline — open/upcoming
        outline: "border-border text-foreground",

        // faint furniture — past/inactive/prospect/unknown
        prospect: "border-grey-3 text-grey-2",
        gray: "border-grey-3 text-grey-2",

        // the editorial orange strike — rejected/cancelled
        red: "border-border text-muted-foreground line-through decoration-primary decoration-2",

        destructive: "bg-destructive text-destructive-foreground border-destructive",

        ghost: "border-primary text-primary",
        link: "border-transparent text-primary underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
