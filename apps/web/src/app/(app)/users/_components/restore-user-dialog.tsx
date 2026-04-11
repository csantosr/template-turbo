"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { Button, ConfirmDialog } from "@repo/ui";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function RestoreUserDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const restore = trpc.user.restore.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      utils.user.listDeleted.invalidate();
    },
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Restore">
          <ArrowCounterClockwise weight="bold" size={16} />
        </Button>
      }
      title="Restore User"
      description="This user will be restored to the active users list."
      confirmLabel="Restore User"
      confirmPendingLabel="Restoring..."
      isPending={restore.isPending}
      onConfirm={(close) => restore.mutate({ id: userId }, { onSuccess: close })}
    >
      <p className="font-mono text-base">
        Are you sure you want to restore <span className="font-bold">{userName}</span> ({userEmail}
        )?
      </p>
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground pt-2">
        They will need to sign in again.
      </p>
    </ConfirmDialog>
  );
}
