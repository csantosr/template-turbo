import { cn } from "../lib/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-none bg-muted", className)} {...props} />
);

export { Skeleton };
