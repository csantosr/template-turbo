"use client";

import { Trash } from "@phosphor-icons/react";
import { Button, ConfirmDialog, Input, toast } from "@repo/ui";
import { useState } from "react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function RemoveUserDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const [reason, setReason] = useState("");
  const remove = trpc.user.remove.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      utils.user.listDeleted.invalidate();
      setReason("");
      toast.success("User removed");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:opacity-70"
          tooltip="Remove"
        >
          <Trash weight="bold" size={16} />
        </Button>
      }
      title="Remove User"
      description="This user will be moved to the deletions list. They can be restored by a superadmin."
      confirmLabel="Remove User"
      confirmPendingLabel="Removing..."
      isPending={remove.isPending}
      variant="destructive"
      onConfirm={(close) =>
        remove.mutate(
          { id: userId, reason: reason || undefined },
          {
            onSuccess: () => {
              close();
              setReason("");
            },
          },
        )
      }
    >
      <p className="font-mono text-base">
        Are you sure you want to remove <span className="font-bold">{userName}</span> ({userEmail})?
      </p>
      <label htmlFor="reason" className="flex flex-col gap-1 pt-4">
        <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Reason{" "}
          <span className="normal-case tracking-normal text-muted-foreground/50">(optional)</span>
        </span>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. user requested deletion, policy violation..."
          className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
        />
      </label>
    </ConfirmDialog>
  );
}
