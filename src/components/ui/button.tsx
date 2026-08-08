import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-none font-mono text-sm font-medium ring-offset-page transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-border bg-page text-foreground font-semibold uppercase tracking-[0.1em] hover:bg-primary hover:border-primary hover:text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive font-semibold uppercase tracking-[0.1em] hover:bg-foreground hover:border-foreground hover:text-page",
        // legacy alias — danger actions (kick/ban/delete)
        red: "bg-destructive text-destructive-foreground border-2 border-destructive font-semibold uppercase tracking-[0.1em] hover:bg-foreground hover:border-foreground hover:text-page",
        // legacy alias — affirmative actions (approve/graduate): ink fill
        green:
          "border-2 border-foreground bg-foreground text-page font-semibold uppercase tracking-[0.1em] hover:bg-primary hover:border-primary hover:text-primary-foreground",
        outline: "border border-border bg-page text-foreground hover:bg-tint",
        secondary: "bg-secondary text-secondary-foreground hover:bg-tint",
        ghost: "hover:bg-tint",
        link: "text-foreground underline-offset-4 hover:underline hover:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
