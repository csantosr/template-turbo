"use client";

import { usePathname } from "next/navigation";
import { TypingTitle } from "@/components/typing-title";
import { trpc } from "@/trpc/client";

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
    const displayTitle = thread?.title ? `CHAT / ${thread.title}` : null;
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          <TypingTitle title={displayTitle} fallback="CHAT / NEW CONVERSATION" />
        </span>
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
      <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </span>
    </header>
  );
}
