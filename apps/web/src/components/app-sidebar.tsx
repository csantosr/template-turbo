"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  ChatsCircle,
  Cube,
  Gear,
  Plus,
  Kanban,
  Pulse,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Trash,
  UserSwitch,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TypingTitle } from "@/components/typing-title";
import { authClient } from "@/lib/auth-client";
import { BRANDING } from "@/lib/branding";
import { trpc } from "@/trpc/client";

const NAV: {
  href: string;
  label: string;
  icon: Icon;
  permission: string | null;
  renderChildren?: () => React.ReactNode;
}[] = [
  { href: "/dashboard", label: "DASHBOARD", icon: SquaresFour, permission: null },
  { href: "/chat", label: "AI CHAT", icon: ChatsCircle, permission: null },
  { href: "/kanban", label: "KANBAN", icon: Kanban, permission: "kanban:read" },
  { href: "/users", label: "USERS", icon: Users, permission: "users:read" },
  { href: "/roles", label: "ROLES", icon: ShieldCheck, permission: "roles:read" },
  { href: "/activity", label: "ACTIVITY", icon: Pulse, permission: "activity:read" },
  { href: "/components", label: "COMPONENTS", icon: Cube, permission: null },
  { href: "/settings", label: "SETTINGS", icon: Gear, permission: null },
];

interface AppSidebarProps {
  userName: string;
  userEmail: string;
  permissions: string[];
  impersonatedBy?: string | null;
}

export function AppSidebar({ userName, userEmail, permissions, impersonatedBy }: AppSidebarProps) {
  const permSet = new Set(permissions);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: threadData } = trpc.chat.listThreads.useQuery();

  const createThread = trpc.chat.createThread.useMutation({
    onSuccess: (data) => {
      utils.chat.listThreads.invalidate();
      router.push(`/chat/${data.id}`);
    },
  });

  const handleNewConversation = () => {
    createThread.mutate();
  };

  const deleteThread = trpc.chat.deleteThread.useMutation({
    onSuccess: () => {
      utils.chat.listThreads.invalidate();
      if (pathname.startsWith("/chat/")) {
        const remainingThreads = threadData?.filter((t) => t.id !== hoveredThread) ?? [];
        if (remainingThreads.length > 0) {
          router.push(`/chat/${remainingThreads[0]!.id}`);
        } else {
          router.push("/chat");
        }
      }
    },
  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const isDark = resolvedTheme === "dark";
  const logoSrc = isDark ? BRANDING.logo.fullDark : BRANDING.logo.full;
  const iconSrc = isDark ? BRANDING.logo.iconDark : BRANDING.logo.icon;

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  async function handleStopImpersonating() {
    setStopping(true);
    try {
      await authClient.admin.stopImpersonating();
      window.location.href = "/dashboard";
    } finally {
      setStopping(false);
    }
  }

  const isCollapsed = mounted && collapsed;
  const isChatPage = pathname.startsWith("/chat");

  const renderThreadList = () => {
    if (!isChatPage || !threadData) return null;

    return (
      <div className="ml-6">
        <button
          type="button"
          onClick={handleNewConversation}
          className="flex w-full items-center gap-1 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <Plus size={12} weight="bold" />
          New conversation
        </button>
        {threadData.length > 0 &&
          threadData.map((thread) => (
            <div
              key={thread.id}
              className="group relative flex items-center justify-between border-l-2 border-transparent hover:border-muted-foreground"
              onMouseEnter={() => setHoveredThread(thread.id)}
              onMouseLeave={() => setHoveredThread(null)}
            >
              <Link
                href={`/chat/${thread.id}`}
                className={`flex-1 truncate px-3 py-1.5 text-xs font-mono ${
                  pathname === `/chat/${thread.id}`
                    ? "border-foreground text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <div className="truncate">
                  <TypingTitle title={thread.title} fallback="New conversation" />
                </div>
                <RelativeTime timestamp={thread.updatedAt} />
              </Link>
              {hoveredThread === thread.id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteThread.mutate({ id: thread.id });
                  }}
                  className="mr-2 cursor-pointer text-muted-foreground hover:text-destructive"
                  title="Delete conversation"
                >
                  <Trash size={12} weight="bold" />
                </button>
              )}
            </div>
          ))}
      </div>
    );
  };

  const navWithChildren = NAV.map((item) => {
    if (item.href === "/chat") {
      return { ...item, renderChildren: renderThreadList };
    }
    return item;
  });

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 ${
        isCollapsed ? "w-14" : "w-56"
      }`}
    >
      <div
        className={`flex h-14 items-center border-b border-border ${
          isCollapsed ? "justify-center px-3" : "justify-between px-4"
        }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="group relative flex h-8 w-8 items-center justify-center text-foreground"
          >
            <Image
              src={iconSrc}
              alt={BRANDING.name}
              width={20}
              height={20}
              className="transition-opacity duration-150 group-hover:opacity-0"
            />
            <CaretDoubleRight
              weight="bold"
              size={18}
              className="absolute opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            />
          </button>
        ) : (
          <>
            <Image
              src={logoSrc}
              alt={BRANDING.name}
              width={100}
              height={20}
              className="h-5 w-auto"
            />
            <button
              type="button"
              onClick={toggle}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <CaretDoubleLeft weight="bold" size={16} />
            </button>
          </>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navWithChildren
          .filter((item) => item.permission === null || permSet.has(item.permission))
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center border-l-2 py-2 font-mono text-sm uppercase tracking-widest transition-none ${
                    isCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon weight="bold" size={16} />
                  {!isCollapsed && item.label}
                </Link>
                {!isCollapsed && item.renderChildren?.()}
              </div>
            );
          })}
      </nav>

      <div className="border-t border-border p-3">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="truncate font-mono text-sm font-bold uppercase leading-tight tracking-widest">
              {userName}
            </p>
            <p className="truncate font-mono text-sm leading-tight text-muted-foreground">
              {userEmail}
            </p>
          </div>
        )}
        {impersonatedBy ? (
          isCollapsed ? (
            <button
              type="button"
              onClick={handleStopImpersonating}
              disabled={stopping}
              title="Stop impersonating"
              className="flex w-full items-center justify-center text-yellow-600 hover:text-yellow-700"
            >
              <UserSwitch weight="bold" size={16} />
            </button>
          ) : (
            <Button
              onClick={handleStopImpersonating}
              disabled={stopping}
              className="w-full rounded-none border-2 border-yellow-600 bg-yellow-500 px-4 font-mono text-sm font-bold uppercase tracking-widest text-yellow-950 transition-none hover:bg-yellow-400 disabled:opacity-60"
            >
              {stopping ? "STOPPING..." : "STOP IMPERSONATING"}
            </Button>
          )
        ) : isCollapsed ? (
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="flex w-full items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <SignOut weight="bold" size={16} />
          </button>
        ) : (
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full rounded-none border-2 border-foreground px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-foreground hover:text-background"
          >
            SIGN OUT
          </Button>
        )}
      </div>
    </aside>
  );
}

function RelativeTime({ timestamp }: { timestamp: Date | string }) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let text: string;
  if (minutes < 1) text = "Just now";
  else if (minutes < 60) text = `${minutes}m ago`;
  else if (hours < 24) text = `${hours}hr ago`;
  else if (days < 7) text = `${days}d ago`;
  else
    text = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return <span className="text-[10px] text-muted-foreground/70">{text}</span>;
}
