"use client";

import { ActionDialog, Button, Input, toast } from "@repo/ui";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";

export function ChangePasswordDialog() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const notifyPasswordChange = trpc.user.notifyPasswordChange.useMutation();

  async function handleSubmit(close: () => void) {
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (authError) {
      setError(authError.message ?? "Failed to change password.");
      setLoading(false);
      return;
    }

    try {
      await notifyPasswordChange.mutateAsync();
    } catch {
      // non-critical — password already changed
    }

    toast.success("Password changed. Please sign in again.");
    close();

    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <ActionDialog
      trigger={
        <button
          type="button"
          className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1">Change</span>
        </button>
      }
      title="Change Password"
      description="Enter your current password and choose a new one."
    >
      {({ close }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(close);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="current-password"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground"
            >
              Current Password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
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
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
            />
          </div>
          {error && (
            <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
              {error}
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
