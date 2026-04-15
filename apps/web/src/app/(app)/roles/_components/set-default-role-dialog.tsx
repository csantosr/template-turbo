"use client";

import { Star } from "@phosphor-icons/react";
import { Button, ConfirmDialog, toast } from "@repo/ui";
import { trpc } from "@/trpc/client";

interface Props {
  roleId: string;
  roleName: string;
}

export function SetDefaultRoleDialog({ roleId, roleName }: Props) {
  const utils = trpc.useUtils();
  const setDefault = trpc.rbac.setDefaultRole.useMutation({
    onSuccess: () => {
      utils.rbac.listRoles.invalidate();
      toast.success(`"${roleName}" is now the default role`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          tooltip="Set as default"
        >
          <Star weight="bold" size={16} />
        </Button>
      }
      title="Set Default Role"
      description={`Set "${roleName}" as the default role?`}
      confirmLabel="Set Default"
      confirmPendingLabel="Setting..."
      isPending={setDefault.isPending}
      onConfirm={(close) => setDefault.mutate({ roleId }, { onSuccess: close })}
    >
      <p className="font-mono text-base">
        This role will be automatically assigned to all new users upon registration.
      </p>
    </ConfirmDialog>
  );
}
