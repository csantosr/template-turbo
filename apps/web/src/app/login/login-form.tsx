"use client";

import { sendVerificationEmail, signIn } from "@/lib/auth-client";
import { Button, Input } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [banned, setBanned] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setBanned(null);
    setLoading(true);

    const { error } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (error) {
      if (error.status === 403 && error.message?.toLowerCase().includes("banned")) {
        setBanned(error.message);
      } else if (error.status === 403) {
        setUnverified(true);
      } else {
        setError(error.message ?? "Sign in failed");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleResend() {
    setLoading(true);
    await sendVerificationEmail({ email, callbackURL: "/verify-email" });
    setResent(true);
    setLoading(false);
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
          onChange={(e) => { setEmail(e.target.value); setUnverified(false); setResent(false); setBanned(null); }}
          required
          autoComplete="email"
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      {error && (
        <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
          {error}
        </p>
      )}
      {banned && (
        <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
          {banned}
        </p>
      )}
      {unverified && (
        <div className="flex flex-col gap-2 border border-border px-3 py-2">
          <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
            Please verify your email before signing in.
          </p>
          {resent ? (
            <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
              Email sent — check your inbox.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-mono text-sm font-bold uppercase underline underline-offset-4 text-foreground text-left"
            >
              {loading ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
            </button>
          )}
        </div>
      )}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "SIGNING IN..." : "SIGN IN"}
      </Button>
    </form>
  );
}
