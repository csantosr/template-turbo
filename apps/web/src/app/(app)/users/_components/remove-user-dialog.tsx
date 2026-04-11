"use client";

import { Button, ConfirmDialog } from "@repo/ui";
import { Trash } from "@phosphor-icons/react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function RemoveUserDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const remove = trpc.user.remove.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" className="text-destructive hover:opacity-70" tooltip="Remove">
          <Trash weight="bold" size={16} />
        </Button>
      }
      title="Remove User"
      description="This action cannot be undone."
      confirmLabel="Remove User"
      confirmPendingLabel="Removing..."
      isPending={remove.isPending}
      variant="destructive"
      onConfirm={(close) =>
        remove.mutate({ id: userId }, { onSuccess: close })
      }
    >
      <p className="font-mono text-base">
        Are you sure you want to remove <span className="font-bold">{userName}</span> ({userEmail})?
      </p>
    </ConfirmDialog>
  );
}
