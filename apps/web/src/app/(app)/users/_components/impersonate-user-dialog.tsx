"use client";

import { UserSwitch } from "@phosphor-icons/react";
import { Button, ConfirmDialog, toast } from "@repo/ui";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ImpersonateUserDialog({ userId, userName, userEmail }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleImpersonate(close: () => void) {
    setLoading(true);
    try {
      const { error } = await authClient.admin.impersonateUser({ userId });
      if (error) {
        toast.error(error.message ?? "Failed to impersonate user");
        return;
      }
      close();
      window.location.href = "/dashboard";
    } catch {
      toast.error("Failed to impersonate user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Impersonate">
          <UserSwitch weight="bold" size={16} />
        </Button>
      }
      title="Impersonate User"
      description="You will act as this user and see everything they see."
      confirmLabel={loading ? "Impersonating..." : "Impersonate"}
      confirmPendingLabel="Impersonating..."
      isPending={loading}
      onConfirm={handleImpersonate}
    >
      <p className="font-mono text-base">
        Are you sure you want to impersonate <span className="font-bold">{userName}</span> (
        {userEmail})?
      </p>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        A banner will remind you that you are acting as this user. Use &quot;Stop
        Impersonating&quot; to return to your admin account.
      </p>
    </ConfirmDialog>
  );
}
