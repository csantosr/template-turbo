"use client";

import { Trash } from "@phosphor-icons/react";
import { Button, ConfirmDialog, toast } from "@repo/ui";
import { trpc } from "@/trpc/client";

interface Props {
  roleId: string;
  roleName: string;
}

export function DeleteRoleDialog({ roleId, roleName }: Props) {
  const utils = trpc.useUtils();
  const del = trpc.rbac.deleteRole.useMutation({
    onSuccess: () => {
      utils.rbac.listRoles.invalidate();
      toast.success("Role deleted");
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
          tooltip="Delete"
        >
          <Trash weight="bold" size={16} />
        </Button>
      }
      title="Delete Role"
      description={`Delete "${roleName}"?`}
      confirmLabel="Delete Role"
      confirmPendingLabel="Deleting..."
      isPending={del.isPending}
      variant="destructive"
      onConfirm={(close) => del.mutate({ roleId }, { onSuccess: close })}
    >
      <p className="font-mono text-base">
        All users assigned to this role will lose its permissions. This cannot be undone.
      </p>
    </ConfirmDialog>
  );
}
