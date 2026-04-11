import { getSession } from "@/auth";
import { checkPermission } from "@/server/rbac";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function RolesLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const can = await checkPermission(session.user.id, "roles", "read");
  if (!can) redirect("/dashboard");
  return <>{children}</>;
}
