"use client";

import { Button, ConfirmDialog } from "@repo/ui";
import { Key } from "@phosphor-icons/react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ResetPasswordDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const resetPassword = trpc.user.resetPassword.useMutation({
    onSuccess: () => utils.activity.list.invalidate(),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Send password reset">
          <Key weight="bold" size={16} />
        </Button>
      }
      title="Send Password Reset"
      description={userEmail}
      confirmLabel="Send Email"
      confirmPendingLabel="Sending..."
      isPending={resetPassword.isPending}
      onConfirm={(close) =>
        resetPassword.mutate({ id: userId }, { onSuccess: close })
      }
    >
      <p className="font-mono text-base">
        Send a password reset email to <span className="font-bold">{userName}</span>?
      </p>
    </ConfirmDialog>
  );
}
