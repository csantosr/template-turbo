"use client";

import { Prohibit } from "@phosphor-icons/react";
import { ActionDialog, Button, DialogFooter, Input, toast } from "@repo/ui";
import { useState } from "react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

const DURATIONS = [
  { label: "Permanent", value: "" },
  { label: "1 day", value: String(60 * 60 * 24) },
  { label: "7 days", value: String(60 * 60 * 24 * 7) },
  { label: "30 days", value: String(60 * 60 * 24 * 30) },
  { label: "90 days", value: String(60 * 60 * 24 * 90) },
];

export function BanUserDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ban = trpc.user.ban.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      toast.success("User banned");
    },
    onError: (e) => setError(e.message),
  });

  return (
    <ActionDialog
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:opacity-70"
          tooltip="Ban user"
        >
          <Prohibit weight="bold" size={16} />
        </Button>
      }
      title="Ban User"
      description={`${userName} · ${userEmail}`}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          setReason("");
          setDuration("");
        }
      }}
    >
      {({ close }) => (
        <>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Reason (optional)
              </span>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Violation of terms of service"
                maxLength={500}
                className="rounded-none border-2 border-border bg-background font-mono text-sm focus-visible:ring-0"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Duration
              </span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border-2 border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-widest focus:outline-none"
              >
                {DURATIONS.map((d) => (
                  <option key={d.label} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
              This will immediately sign the user out of all active sessions.
            </p>
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
              variant="destructive"
              disabled={ban.isPending}
              onClick={() =>
                ban.mutate(
                  {
                    userId,
                    reason: reason || undefined,
                    expiresIn: duration ? Number(duration) : undefined,
                  },
                  { onSuccess: close },
                )
              }
              className="rounded-none border-2 border-destructive px-6 font-mono text-sm font-bold uppercase tracking-widest transition-none disabled:opacity-50"
            >
              {ban.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </>
      )}
    </ActionDialog>
  );
}
