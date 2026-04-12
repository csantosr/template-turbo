export type ActivityFilter =
  | "ALL"
  | "LOGIN"
  | "INVITE"
  | "UPDATE"
  | "REMOVE"
  | "PASSWORD_RESET"
  | "FAILED";

const FILTERS: ActivityFilter[] = [
  "ALL",
  "LOGIN",
  "INVITE",
  "UPDATE",
  "REMOVE",
  "PASSWORD_RESET",
  "FAILED",
];

type ActivityFiltersProps = {
  value: ActivityFilter;
  onChange: (filter: ActivityFilter) => void;
};

export function ActivityFilters({ value, onChange }: ActivityFiltersProps) {
  return (
    <div className="flex gap-px overflow-x-auto border border-border">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`shrink-0 px-4 py-2 font-mono text-sm uppercase tracking-widest transition-none ${
            value === f
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
