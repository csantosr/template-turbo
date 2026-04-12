"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  Gear,
  Pulse,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";
import { BRANDING } from "@/lib/branding";

const NAV: { href: string; label: string; icon: Icon; permission: string | null }[] = [
  { href: "/dashboard", label: "DASHBOARD", icon: SquaresFour, permission: null },
  { href: "/users", label: "USERS", icon: Users, permission: "users:read" },
  { href: "/roles", label: "ROLES", icon: ShieldCheck, permission: "roles:read" },
  { href: "/activity", label: "ACTIVITY", icon: Pulse, permission: "activity:read" },
  { href: "/settings", label: "SETTINGS", icon: Gear, permission: null },
];

interface AppSidebarProps {
  userName: string;
  userEmail: string;
  permissions: string[];
}

export function AppSidebar({ userName, userEmail, permissions }: AppSidebarProps) {
  const permSet = new Set(permissions);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    await signOut();
    router.push("/");
  }

  // Use false until mounted to avoid hydration mismatch
  const isCollapsed = mounted && collapsed;

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
        {NAV.filter((item) => item.permission === null || permSet.has(item.permission)).map(
          (item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
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
            );
          },
        )}
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
        {isCollapsed ? (
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
