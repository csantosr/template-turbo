"use client";

import { ShieldCheck, X } from "@phosphor-icons/react";
import { ActionDialog, Badge, Button } from "@repo/ui";
import { useState } from "react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function UserRbacDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.rbac.getUserRbac.useQuery({ userId });
  const { data: allRoles } = trpc.rbac.listRoles.useQuery();
  const { data: allPerms } = trpc.rbac.listAvailablePermissions.useQuery();

  // New role / override state
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [overrideResource, setOverrideResource] = useState("");
  const [overrideAction, setOverrideAction] = useState("");
  const [overrideGranted, setOverrideGranted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assignRole = trpc.rbac.assignRole.useMutation({
    onSuccess: () => {
      utils.rbac.getUserRbac.invalidate({ userId });
      utils.user.list.invalidate();
      setSelectedRoleId("");
    },
    onError: (e) => setError(e.message),
  });

  const revokeRole = trpc.rbac.revokeRole.useMutation({
    onSuccess: () => {
      utils.rbac.getUserRbac.invalidate({ userId });
      utils.user.list.invalidate();
    },
    onError: (e) => setError(e.message),
  });

  const setPermission = trpc.rbac.setUserPermission.useMutation({
    onSuccess: () => {
      utils.rbac.getUserRbac.invalidate({ userId });
      setOverrideResource("");
      setOverrideAction("");
    },
    onError: (e) => setError(e.message),
  });

  const removePermission = trpc.rbac.removeUserPermission.useMutation({
    onSuccess: () => utils.rbac.getUserRbac.invalidate({ userId }),
    onError: (e) => setError(e.message),
  });

  const assignedRoleIds = new Set(data?.roles.map((r) => r.roleId) ?? []);
  const availableRolesToAdd = (allRoles ?? []).filter((r) => !assignedRoleIds.has(r.id));

  // Build list of available actions for the selected resource
  const availableActions = overrideResource
    ? (allPerms ?? []).filter((p) => p.resource === overrideResource).map((p) => p.action)
    : [];

  const availableResources = [...new Set((allPerms ?? []).map((p) => p.resource))];

  return (
    <ActionDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Manage roles & permissions">
          <ShieldCheck weight="bold" size={16} />
        </Button>
      }
      title="Roles & Permissions"
      description={`${userName} · ${userEmail}`}
      onOpenChange={(open) => {
        if (!open) setError(null);
      }}
    >
      {({ close: _close }) => (
        <div className="flex flex-col gap-6">
          <section>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Assigned Roles
            </p>
            {isLoading ? (
              <p className="font-mono text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {(data?.roles ?? []).length === 0 && (
                  <span className="font-mono text-sm text-muted-foreground">
                    No roles assigned.
                  </span>
                )}
                {(data?.roles ?? []).map((ur) => (
                  <span
                    key={ur.roleId}
                    className="flex items-center gap-1 border border-border px-2 py-0.5 font-mono text-xs uppercase tracking-widest"
                  >
                    {ur.role?.name ?? ur.roleId}
                    <button
                      onClick={() => revokeRole.mutate({ userId, roleId: ur.roleId })}
                      disabled={revokeRole.isPending}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${ur.roleId}`}
                    >
                      <X weight="bold" size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {availableRolesToAdd.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="flex-1 border-2 border-border bg-background px-2 py-1.5 font-mono text-sm uppercase tracking-widest focus:outline-none"
                >
                  <option value="">— Add role —</option>
                  {availableRolesToAdd.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
                </select>
                <Button
                  size="md"
                  disabled={!selectedRoleId || assignRole.isPending}
                  onClick={() => assignRole.mutate({ userId, roleId: selectedRoleId })}
                  className="rounded-none border-2 border-border px-3 font-mono text-xs uppercase tracking-widest transition-none hover:bg-foreground hover:text-background disabled:opacity-40"
                >
                  Assign
                </Button>
              </div>
            )}
          </section>

          <section>
            <p className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Permission Overrides
            </p>
            <p className="mb-2 font-mono text-xs text-muted-foreground/60">
              These override role-level grants. Deny takes priority over any role grant.
            </p>
            {isLoading ? (
              <p className="font-mono text-sm text-muted-foreground">Loading...</p>
            ) : (data?.overrides ?? []).length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">No overrides set.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {(data?.overrides ?? []).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between border border-border px-3 py-1.5"
                  >
                    <span className="font-mono text-sm">
                      {o.resource}:{o.action}
                    </span>
                    <div className="flex items-center gap-3">
                      <Badge variant={o.granted ? "success" : "destructive"}>
                        {o.granted ? "GRANTED" : "DENIED"}
                      </Badge>
                      <button
                        onClick={() =>
                          removePermission.mutate({
                            userId,
                            resource: o.resource,
                            action: o.action,
                          })
                        }
                        disabled={removePermission.isPending}
                        className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={overrideResource}
                  onChange={(e) => {
                    setOverrideResource(e.target.value);
                    setOverrideAction("");
                  }}
                  className="flex-1 border-2 border-border bg-background px-2 py-1.5 font-mono text-sm uppercase tracking-widest focus:outline-none"
                >
                  <option value="">— Resource —</option>
                  {availableResources.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value)}
                  disabled={!overrideResource}
                  className="flex-1 border-2 border-border bg-background px-2 py-1.5 font-mono text-sm uppercase tracking-widest focus:outline-none disabled:opacity-40"
                >
                  <option value="">— Action —</option>
                  {availableActions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={overrideGranted ? "grant" : "deny"}
                  onChange={(e) => setOverrideGranted(e.target.value === "grant")}
                  className="border-2 border-border bg-background px-2 py-1.5 font-mono text-sm uppercase tracking-widest focus:outline-none"
                >
                  <option value="grant">Grant</option>
                  <option value="deny">Deny</option>
                </select>
                <Button
                  size="md"
                  disabled={!overrideResource || !overrideAction || setPermission.isPending}
                  onClick={() =>
                    setPermission.mutate({
                      userId,
                      resource: overrideResource,
                      action: overrideAction,
                      granted: overrideGranted,
                    })
                  }
                  className="rounded-none border-2 border-border px-3 font-mono text-xs uppercase tracking-widest transition-none hover:bg-foreground hover:text-background disabled:opacity-40"
                >
                  Add Override
                </Button>
              </div>
            </div>
          </section>

          {error && (
            <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </ActionDialog>
  );
}
