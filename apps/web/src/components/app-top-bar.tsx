"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "DASHBOARD",
  "/users": "USERS",
  "/activity": "ACTIVITY",
  "/settings": "SETTINGS",
};

export function AppTopBar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "APP";

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
      <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </span>
    </header>
  );
}
