import * as React from "react";
import { cn } from "../lib/utils";

type AlertVariant = "default" | "destructive" | "warning" | "success";

const variants: Record<AlertVariant, { container: string; icon: string }> = {
  default: {
    container: "border-foreground/20 bg-foreground/5",
    icon: "text-foreground",
  },
  destructive: {
    container: "border-red-600 bg-red-600/10 dark:border-red-500 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-500",
  },
  warning: {
    container: "border-yellow-600 bg-yellow-600/10 dark:border-yellow-400 dark:bg-yellow-400/10",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  success: {
    container: "border-green-600 bg-green-600/10 dark:border-green-400 dark:bg-green-400/10",
    icon: "text-green-600 dark:text-green-400",
  },
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full border-2 px-4 py-3 font-mono text-sm",
          variants[variant].container,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mb-1 font-bold uppercase tracking-widest", className)} {...props} />
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
