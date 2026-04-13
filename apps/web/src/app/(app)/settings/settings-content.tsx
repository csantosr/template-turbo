"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import { ConfirmDialog, toast } from "@repo/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";
import { ChangePasswordDialog } from "./change-password-dialog";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function SettingsContent() {
  const { data: user, isLoading } = trpc.user.me.useQuery();

  const logActivity = trpc.user.logActivity.useMutation();

  async function handleRevokeAll(close: () => void) {
    const { error } = await authClient.revokeOtherSessions();
    if (error) {
      toast.error(error.message ?? "Failed to revoke sessions");
      return;
    }
    void logActivity.mutateAsync({
      action: "SESSION_REVOKE",
      detail: "Revoked all other sessions",
    });
    toast.success("All other sessions revoked");
    close();
  }

  if (isLoading) {
    return (
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        Loading...
      </p>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Profile
        </p>
        <div className="max-w-md border-2 border-border p-6">
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Name
              </dt>
              <dd className="font-mono text-base">{user.name}</dd>
            </div>
            <div className="border-t border-border" />
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Email
              </dt>
              <dd className="font-mono text-base">{user.email}</dd>
            </div>
            <div className="border-t border-border" />
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                User ID
              </dt>
              <dd className="break-all font-mono text-sm text-muted-foreground">{user.id}</dd>
            </div>
            <div className="border-t border-border" />
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Email Verified
              </dt>
              <dd className="font-mono text-base">{user.emailVerified ? "YES" : "NO"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Security
        </p>
        <div className="max-w-md border-2 border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-base font-bold uppercase tracking-widest">Password</p>
              <p className="font-mono text-sm text-muted-foreground">
                Last changed:{" "}
                {formatDate(
                  (user as Record<string, unknown>).passwordChangedAt as Date | null | undefined,
                )}
              </p>
            </div>
            <ChangePasswordDialog />
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-base font-bold uppercase tracking-widest">Sessions</p>
              <p className="font-mono text-sm text-muted-foreground">Revoke all other sessions</p>
            </div>
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="cursor-pointer font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-1">
                    Revoke all <ArrowRightIcon weight="bold" size={14} />
                  </span>
                </button>
              }
              title="Revoke All Sessions"
              description="This will sign out all other devices."
              confirmLabel="Revoke All"
              confirmPendingLabel="Revoking..."
              onConfirm={(close) => handleRevokeAll(close)}
            >
              <p className="font-mono text-base">
                Are you sure you want to revoke all other sessions?
              </p>
            </ConfirmDialog>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Appearance
        </p>
        <div className="max-w-md border-2 border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-base font-bold uppercase tracking-widest">Theme</p>
              <p className="font-mono text-sm text-muted-foreground">
                Toggle between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section>
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-destructive">
          Danger Zone
        </p>
        <div className="max-w-md border-2 border-destructive p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-base font-bold uppercase tracking-widest">
                Delete Account
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <button
              type="button"
              className="cursor-pointer font-mono text-sm uppercase tracking-widest text-destructive hover:underline"
            >
              <span className="flex items-center gap-1">
                Delete <ArrowRightIcon weight="bold" size={14} />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
