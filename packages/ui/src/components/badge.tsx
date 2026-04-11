import { cn } from "../lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "border-foreground text-foreground",
  success:
    "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400",
  warning:
    "border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400",
  destructive:
    "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500 dark:text-white",
  muted: "border-border text-muted-foreground",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 font-mono text-sm uppercase tracking-widest",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
