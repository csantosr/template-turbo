"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-none font-mono uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-2 border-primary bg-promary-foreground text-foreground font-bold transition-none hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none",
        outline:
          "border-2 border-border bg-transparent transition-none hover:bg-secondary",
        ghost:
          "bg-transparent text-muted-foreground transition-colors hover:text-foreground",
        destructive:
          "border-2 border-destructive bg-destructive text-destructive-foreground font-bold transition-none hover:opacity-80",
      },
      size: {
        icon: "h-auto w-auto p-1.5",
        md: "px-5 py-2 text-sm",
        lg: "px-6 py-2",
        xl: "px-8 py-5",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "md",
        class:
          "shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-px hover:translate-y-px",
      },
      {
        variant: "default",
        size: ["lg", "xl"],
        class:
          "shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** When set, wraps the button in a tooltip. Omit for buttons that do not need a label on hover. */
  tooltip?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const button = (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      );
    }

    return button;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
