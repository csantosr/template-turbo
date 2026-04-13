"use client";

import { EnvelopeSimple } from "@phosphor-icons/react";
import { Button, toast } from "@repo/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 30;

interface Props {
  email: string;
}

export function CheckInboxForm({ email }: Props) {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`reset_cooldown_${email}`);
    if (stored) {
      const remaining = Math.ceil((parseInt(stored, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem(`reset_cooldown_${email}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, email]);

  async function handleResend() {
    setIsSending(true);
    try {
      await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast.success("Reset email sent");
      const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(`reset_cooldown_${email}`, expiresAt.toString());
      setCooldown(COOLDOWN_SECONDS);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setIsSending(false);
    }
  }

  const isOnCooldown = cooldown > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <EnvelopeSimple weight="fill" className="size-12 text-foreground" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          We sent a password reset link to
        </p>
        <p className="font-mono text-base font-bold">{email}</p>
      </div>

      <Button onClick={handleResend} disabled={isSending || isOnCooldown} className="w-full">
        {isSending ? "SENDING..." : isOnCooldown ? `RESEND IN ${cooldown}s` : "RESEND EMAIL"}
      </Button>

      <p className="text-center font-mono text-sm text-muted-foreground">
        <Link
          href="/login"
          className="uppercase underline underline-offset-4 hover:text-foreground"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
