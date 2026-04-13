"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { ActionDialog, Button, DialogFooter, Input, toast } from "@repo/ui";
import { inviteUserClientSchema } from "@repo/validators";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export function InviteUserDialog() {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const invite = trpc.user.invite.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      setForm({ name: "", email: "" });
      toast.success("Invite sent");
    },
    onError: (e) => {
      setErrors({ form: e.message });
    },
  });

  function handleSubmit(): void {
    const result = inviteUserClientSchema.safeParse(form);
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
    invite.mutate(form);
  }

  return (
    <ActionDialog
      trigger={
        <Button>
          <span className="flex items-center gap-1.5">
            <PlusIcon weight="bold" size={14} /> INVITE USER
          </span>
        </Button>
      }
      title="Invite User"
      description="They'll receive an email to set their password."
      onOpenChange={(open) => {
        if (!open) setErrors({});
      }}
    >
      {({ close }) => (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1" htmlFor="invite-name">
            <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              Full Name
            </span>
            <Input
              id="invite-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: "" }));
              }}
              error={errors.name}
              placeholder="Jane Doe"
              className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
            />
          </label>
          <label className="flex flex-col gap-1" htmlFor="invite-email">
            <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              Email
            </span>
            <Input
              id="invite-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                setErrors((er) => ({ ...er, email: "" }));
              }}
              error={errors.email}
              placeholder="jane@example.com"
              className="rounded-none border-2 border-border bg-background font-mono text-base focus-visible:ring-0"
            />
          </label>
          {errors.form && (
            <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
              {errors.form}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={close}
              className="rounded-none border-2 border-border px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={invite.isPending}
              className="rounded-none border-2 border-primary px-6 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            >
              {invite.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </div>
      )}
    </ActionDialog>
  );
}
