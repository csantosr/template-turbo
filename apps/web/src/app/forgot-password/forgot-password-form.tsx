"use client";

import { Button, Input, toast } from "@repo/ui";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message ?? "Failed to send reset email");
      setLoading(false);
      return;
    }

    toast.success("Reset email sent");
    setSent(true);
    setLoading(false);
  }

  async function handleResend() {
    setLoading(true);
    await requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast.success("Reset email sent");
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm text-foreground">
          We sent a reset link to <span className="font-bold">{email}</span>. Click the link in that
          email to set a new password.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleResend}
          className="w-full"
        >
          {loading ? "SENDING..." : "RESEND RESET EMAIL"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      {error && (
        <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "SENDING..." : "SEND RESET LINK"}
      </Button>
    </form>
  );
}
