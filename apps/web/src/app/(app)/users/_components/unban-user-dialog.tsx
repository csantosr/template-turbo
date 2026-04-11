"use client";

import { Button, ConfirmDialog } from "@repo/ui";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function UnbanUserDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const unban = trpc.user.unban.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Remove ban">
          <ArrowCounterClockwise weight="bold" size={16} />
        </Button>
      }
      title="Remove Ban"
      description="The user will be able to sign in again immediately."
      confirmLabel="Remove Ban"
      confirmPendingLabel="Removing..."
      isPending={unban.isPending}
      onConfirm={(close) =>
        unban.mutate({ userId }, { onSuccess: close })
      }
    >
      <p className="font-mono text-base">
        Remove ban for <span className="font-bold">{userName}</span> ({userEmail})?
      </p>
    </ConfirmDialog>
  );
}
