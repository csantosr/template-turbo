"use client";

import { ActionDialog, Button, Input, toast } from "@repo/ui";
import { changePasswordSchema } from "@repo/validators";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";

export function ChangePasswordDialog() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const notifyPasswordChange = trpc.user.notifyPasswordChange.useMutation();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const result = changePasswordSchema.safeParse(form);
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
    doChangePassword();
  }

  async function doChangePassword(close?: () => void) {
    setLoading(true);

    const { error: authError } = await authClient.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      revokeOtherSessions: true,
    });

    if (authError) {
      setErrors({ form: authError.message ?? "Failed to change password." });
      setLoading(false);
      return;
    }

    try {
      await notifyPasswordChange.mutateAsync();
    } catch {
      // non-critical — password already changed
    }

    toast.success("Password changed. Please sign in again.");
    close?.();

    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <ActionDialog
      trigger={
        <button
          type="button"
          className="cursor-pointer font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1">Change</span>
        </button>
      }
      title="Change Password"
      description="Enter your current password and choose a new one."
      onOpenChange={(open) => {
        if (!open) setErrors({});
      }}
    >
      {({ close }) => (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="current-password"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground"
            >
              Current Password
            </label>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) => {
                setForm((f) => ({ ...f, currentPassword: e.target.value }));
                setErrors((er) => ({ ...er, currentPassword: "" }));
              }}
              error={errors.currentPassword}
              autoComplete="current-password"
              className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="new-password"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground"
            >
              New Password
            </label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(e) => {
                setForm((f) => ({ ...f, newPassword: e.target.value }));
                setErrors((er) => ({ ...er, newPassword: "" }));
              }}
              error={errors.newPassword}
              autoComplete="new-password"
              className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm-password"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground"
            >
              Confirm New Password
            </label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm((f) => ({ ...f, confirmPassword: e.target.value }));
                setErrors((er) => ({ ...er, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
              autoComplete="new-password"
              className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
            />
          </div>
          {errors.form && (
            <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
              {errors.form}
            </p>
          )}
          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={loading}
              className="rounded-none border-2 border-border px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-none border-2 border-primary px-6 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? "CHANGING..." : "CHANGE PASSWORD"}
            </Button>
          </div>
        </form>
      )}
    </ActionDialog>
  );
}
