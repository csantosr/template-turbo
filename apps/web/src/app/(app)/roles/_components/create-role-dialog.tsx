"use client";

import { ActionDialog, Button, DialogFooter, Input } from "@repo/ui";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export function CreateRoleDialog() {
  const utils = trpc.useUtils();
  const [fields, setFields] = useState({ id: "", name: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  const create = trpc.rbac.createRole.useMutation({
    onSuccess: () => {
      utils.rbac.listRoles.invalidate();
      setFields({ id: "", name: "", description: "" });
    },
    onError: (e) => setError(e.message),
  });

  return (
    <ActionDialog
      trigger={
        <Button className="rounded-none border-2 border-primary px-4 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none">
          <Plus weight="bold" size={14} />
          Create Role
        </Button>
      }
      title="Create Role"
      description="Define a new role. Assign permissions to it from the roles list."
      onOpenChange={(open) => { if (!open) { setError(null); setFields({ id: "", name: "", description: "" }); } }}
    >
      {({ close }) => (
        <>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Role ID <span className="normal-case tracking-normal text-muted-foreground/60">(slug, e.g. &ldquo;editor&rdquo;)</span></span>
              <Input
                value={fields.id}
                onChange={(e) => setFields((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                placeholder="editor"
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Display Name</span>
              <Input
                value={fields.name}
                onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                placeholder="Editor"
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Description <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span></span>
              <Input
                value={fields.description}
                onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
                placeholder="Can edit content but not manage users."
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
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
            <Button
              onClick={() =>
                create.mutate(
                  { id: fields.id, name: fields.name, description: fields.description || undefined },
                  { onSuccess: close },
                )
              }
              disabled={create.isPending || !fields.id || !fields.name}
              className="rounded-none border-2 border-primary px-6 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            >
              {create.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </>
      )}
    </ActionDialog>
  );
}
