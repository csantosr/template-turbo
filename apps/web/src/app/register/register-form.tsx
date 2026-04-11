"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";
import { Button, Input } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  invite?: string;
  initialEmail?: string;
  initialName?: string;
}

export function RegisterForm({ invite, initialEmail = "", initialName = "" }: Props) {
  const router = useRouter();
  const isInvite = !!invite;

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const acceptInvite = trpc.user.acceptInvite.useMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isInvite) {
      // Validate token + create account
      const result = await acceptInvite.mutateAsync(
        { token: invite!, email: initialEmail!, name, password },
        {
          onError: (e) => {
            setError(e.message);
            setLoading(false);
          },
        },
      ).catch(() => null);

      if (!result) return;

      // Sign in with the new credentials
      const { error: signInError } = await signIn.email({
        email: initialEmail!,
        password,
        callbackURL: "/dashboard",
      });

      if (signInError) {
        setError(signInError.message ?? "Account created but sign in failed. Try logging in.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      return;
    }

    // Normal registration
    const { error } = await signUp.email({ name, email, password, callbackURL: "/verify-email" });

    if (error) {
      setError(error.message ?? "Registration failed");
      setLoading(false);
      return;
    }

    router.push(`/check-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Name
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => !isInvite && setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isInvite}
          className={`rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0 ${isInvite ? "cursor-not-allowed opacity-60" : ""}`}
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
          autoComplete="new-password"
          minLength={8}
          className="rounded-none border-2 border-input font-mono text-base transition-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>
      {error && (
        <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading
          ? isInvite ? "SETTING UP..." : "CREATING ACCOUNT..."
          : isInvite ? "SET PASSWORD" : "CREATE ACCOUNT"}
      </Button>
    </form>
  );
}
