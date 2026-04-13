"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { ActionDialog, Button, DialogFooter, Input, toast } from "@repo/ui";
import { createRoleSchema } from "@repo/validators";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export function CreateRoleDialog() {
  const utils = trpc.useUtils();
  const [fields, setFields] = useState({ id: "", name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = trpc.rbac.createRole.useMutation({
    onSuccess: () => {
      utils.rbac.listRoles.invalidate();
      setFields({ id: "", name: "", description: "" });
      toast.success("Role created");
    },
    onError: (e) => setErrors({ form: e.message }),
  });

  function handleSubmit(): void {
    const result = createRoleSchema.safeParse(fields);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    create.mutate({
      id: fields.id,
      name: fields.name,
      description: fields.description || undefined,
    });
  }

  return (
    <ActionDialog
      trigger={
        <Button className="rounded-none border-2 border-primary px-4 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none">
          <PlusIcon weight="bold" size={14} />
          Create Role
        </Button>
      }
      title="Create Role"
      description="Define a new role. Assign permissions to it from the roles list."
      onOpenChange={(open) => {
        if (!open) {
          setErrors({});
          setFields({ id: "", name: "", description: "" });
        }
      }}
    >
      {({ close }) => (
        <>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1" htmlFor="role-id">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Role ID{" "}
                <span className="normal-case tracking-normal text-muted-foreground/60">
                  (slug, e.g. &ldquo;editorrdquo;)
                </span>
              </span>
              <Input
                id="role-id"
                value={fields.id}
                onChange={(e) => {
                  setFields((f) => ({
                    ...f,
                    id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  }));
                  setErrors((er) => ({ ...er, id: "" }));
                }}
                error={errors.id}
                placeholder="editor"
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
            <label className="flex flex-col gap-1" htmlFor="role-name">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Display Name
              </span>
              <Input
                id="role-name"
                value={fields.name}
                onChange={(e) => {
                  setFields((f) => ({ ...f, name: e.target.value }));
                  setErrors((er) => ({ ...er, name: "" }));
                }}
                error={errors.name}
                placeholder="Editor"
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
            <label className="flex flex-col gap-1" htmlFor="role-description">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Description{" "}
                <span className="normal-case tracking-normal text-muted-foreground/60">
                  (optional)
                </span>
              </span>
              <Input
                id="role-description"
                value={fields.description}
                onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
                error={errors.description}
                placeholder="Can edit content but not manage users."
                className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
              />
            </label>
            {errors.form && (
              <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
                {errors.form}
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
              type="button"
              onClick={handleSubmit}
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
