"use client";

import { Button, Input, toast } from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const callbackURL = searchParams.get("callbackURL") ?? "/login";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      setError(error.message ?? "Link is invalid or has expired.");
      setLoading(false);
      return;
    }

    toast.success("Password reset");
    router.push(callbackURL);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          New Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Confirm Password
        </label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "SAVING..." : "SET PASSWORD"}
      </Button>
    </form>
  );
}
