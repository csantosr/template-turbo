"use client";

import { sendVerificationEmail } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@repo/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    await sendVerificationEmail({ email, callbackURL: "/verify-email" });
    setResent(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-sm">
        <div className="border-2 border-border p-8">
          <h1 className="mb-1 font-mono font-bold text-2xl uppercase tracking-widest">
            CHECK YOUR EMAIL
          </h1>
          <p className="mb-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Verify your address to continue
          </p>
          {email ? (
            <p className="mb-6 font-mono text-sm text-foreground">
              We sent a verification link to{" "}
              <span className="font-bold">{email}</span>. Click the link in that
              email to activate your account.
            </p>
          ) : (
            <p className="mb-6 font-mono text-sm text-foreground">
              We sent a verification link to your email address. Click the link
              to activate your account.
            </p>
          )}
          {resent ? (
            <p className="border border-border px-3 py-2 font-mono text-sm uppercase tracking-wide text-muted-foreground">
              Email resent — check your inbox.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={loading || !email}
              onClick={handleResend}
              className="w-full"
            >
              {loading ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
            </Button>
          )}
        </div>
        <div className="border-2 border-border border-t-0 px-8 py-4">
          <p className="font-mono text-sm text-muted-foreground">
            Already verified?{" "}
            <a
              href="/login"
              className="font-bold uppercase underline underline-offset-4 text-foreground"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
