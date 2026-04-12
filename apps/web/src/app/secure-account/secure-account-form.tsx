"use client";

import { Button } from "@repo/ui";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export function SecureAccountForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const secureAccount = trpc.user.secureAccount.useMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    setProcessing(true);

    secureAccount.mutate(
      { token },
      {
        onSuccess: (data) => {
          setEmail(data.email);
          setDone(true);
          setProcessing(false);
        },
        onError: (err) => {
          setError(err.message ?? "Something went wrong.");
          setProcessing(false);
        },
      },
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-mono text-base">
          All sessions have been signed out. A password reset email has been sent to{" "}
          <span className="font-bold">{email}</span>.
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          Check your inbox to set a new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
      <p className="font-mono text-base">
        Click the button below to secure your account. This will:
      </p>
      <ul className="font-mono text-sm text-muted-foreground list-disc list-inside space-y-1">
        <li>Sign out all active sessions</li>
        <li>Send a password reset link to your email</li>
        <li>Log a security alert on your account</li>
      </ul>
      {error && (
        <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={processing}>
        {processing ? "SECURING..." : "SECURE MY ACCOUNT"}
      </Button>
    </form>
  );
}
