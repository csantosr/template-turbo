"use client";

import { Button, ConfirmDialog } from "@repo/ui";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { trpc } from "@/trpc/client";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ResendVerificationDialog({ userId, userName, userEmail }: Props) {
  const utils = trpc.useUtils();
  const resend = trpc.user.resendVerification.useMutation({
    onSuccess: () => utils.activity.list.invalidate(),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="icon" variant="ghost" tooltip="Resend verification email">
          <EnvelopeSimple weight="bold" size={16} />
        </Button>
      }
      title="Resend Verification Email"
      description={userEmail}
      confirmLabel="Send Email"
      confirmPendingLabel="Sending..."
      isPending={resend.isPending}
      onConfirm={(close) =>
        resend.mutate({ id: userId }, { onSuccess: close })
      }
    >
      <p className="font-mono text-base">
        Resend verification email to <span className="font-bold">{userName}</span>?
      </p>
    </ConfirmDialog>
  );
}
