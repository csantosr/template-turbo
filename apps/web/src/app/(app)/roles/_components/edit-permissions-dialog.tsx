"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { ActionDialog, Button, DialogFooter, toast } from "@repo/ui";
import { ALL_PERMISSIONS, PERMISSIONS } from "@repo/validators";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

interface RoleData {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: { resource: string; action: string }[];
}

interface Props {
  role: RoleData;
}

export function EditPermissionsDialog({ role }: Props) {
  const utils = trpc.useUtils();
  const isSuperadmin = role.id === "superadmin";

  // Set of "resource:action" strings that are currently granted
  const [granted, setGranted] = useState<Set<string>>(
    () => new Set(role.permissions.map((p) => `${p.resource}:${p.action}`)),
  );
  const [error, setError] = useState<string | null>(null);

  // Sync state when role prop changes (e.g. after save)
  useEffect(() => {
    setGranted(new Set(role.permissions.map((p) => `${p.resource}:${p.action}`)));
  }, [role.permissions]);

  const update = trpc.rbac.updateRolePermissions.useMutation({
    onSuccess: () => {
      utils.rbac.listRoles.invalidate();
      toast.success("Permissions updated");
    },
    onError: (e) => setError(e.message),
  });

  function toggle(key: string) {
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSave(close: () => void) {
    const permissions = Array.from(granted).map((key) => {
      const [resource, action] = key.split(":");
      return { resource: resource!, action: action! };
    });
    update.mutate({ roleId: role.id, permissions }, { onSuccess: close });
  }

  const resources = Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[];

  return (
    <ActionDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Edit permissions">
          <PencilSimple weight="bold" size={16} />
        </Button>
      }
      title={`Permissions — ${role.name}`}
      description={
        isSuperadmin
          ? "Superadmin always has all permissions. These cannot be changed."
          : `Check the actions this role is allowed to perform.`
      }
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          // Reset to saved state on cancel
          setGranted(new Set(role.permissions.map((p) => `${p.resource}:${p.action}`)));
        }
      }}
    >
      {({ close }) => (
        <>
          <div className="flex flex-col gap-4">
            {resources.map((resource) => {
              const actions = PERMISSIONS[resource] as readonly string[];
              return (
                <div key={resource} className="border border-border p-3">
                  <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {resource}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {actions.map((action) => {
                      const key = `${resource}:${action}`;
                      const checked = isSuperadmin ? true : granted.has(key);
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-2 font-mono text-sm ${isSuperadmin ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isSuperadmin}
                            onChange={() => toggle(key)}
                            className="h-4 w-4 accent-foreground"
                          />
                          {action}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {error && (
              <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={close}
              className="rounded-none border-2 border-border px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-secondary"
            >
              Cancel
            </Button>
            {!isSuperadmin && (
              <Button
                onClick={() => handleSave(close)}
                disabled={update.isPending}
                className="rounded-none border-2 border-primary px-6 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
              >
                {update.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </>
      )}
    </ActionDialog>
  );
}
