"use client";

import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";

const TITLES: Record<string, string> = {
  "/dashboard": "DASHBOARD",
  "/kanban": "KANBAN",
  "/users": "USERS",
  "/activity": "ACTIVITY",
  "/settings": "SETTINGS",
};

export function AppTopBar() {
  const pathname = usePathname();

  const chatId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;
  const { data: thread } = trpc.chat.getThread.useQuery(
    { id: chatId! },
    {
      enabled: !!chatId,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      staleTime: 0,
    },
  );

  let title = "APP";
  if (pathname === "/dashboard") {
    title = "DASHBOARD";
  } else if (pathname === "/users") {
    title = "USERS";
  } else if (pathname === "/activity") {
    title = "ACTIVITY";
  } else if (pathname === "/settings") {
    title = "SETTINGS";
  } else if (pathname.startsWith("/chat")) {
    title = thread?.title ? `CHAT / ${thread.title}` : "CHAT / NEW CONVERSATION";
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
      <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </span>
    </header>
  );
}
