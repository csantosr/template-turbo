import { getSession } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-top-bar";
import { getUserEffectivePermissions } from "@/server/rbac";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawPerms = await getUserEffectivePermissions(session.user.id);
  const permissions = rawPerms.map((p) => `${p.resource}:${p.action}`);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        userName={session.user.name ?? "User"}
        userEmail={session.user.email}
        permissions={permissions}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
