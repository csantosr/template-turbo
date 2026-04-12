import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-top-bar";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { getUserEffectivePermissions } from "@/server/rbac";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawPerms = await getUserEffectivePermissions(session.user.id);
  const permissions = rawPerms.map((p) => `${p.resource}:${p.action}`);
  const impersonatedBy = session.session.impersonatedBy ?? null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        userName={session.user.name ?? "User"}
        userEmail={session.user.email}
        permissions={permissions}
        impersonatedBy={impersonatedBy}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar />
        <ImpersonationBanner
          impersonatedBy={impersonatedBy}
          impersonatedEmail={session.user.email}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
