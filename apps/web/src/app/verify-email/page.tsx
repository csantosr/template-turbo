"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();

  useEffect(() => {
    if (!error) {
      const timer = setTimeout(() => router.push("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-sm">
        <div className="border-2 border-border p-8">
          {error ? (
            <>
              <h1 className="mb-1 font-mono font-bold text-2xl uppercase tracking-widest">
                LINK INVALID
              </h1>
              <p className="mb-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Verification failed
              </p>
              <p className="mb-6 font-mono text-sm text-foreground">
                This verification link is invalid or has expired. Request a new one below.
              </p>
              <a
                href="/check-email"
                className="font-mono text-sm font-bold uppercase underline underline-offset-4 text-foreground"
              >
                Resend verification email
              </a>
            </>
          ) : (
            <>
              <h1 className="mb-1 font-mono font-bold text-2xl uppercase tracking-widest">
                EMAIL VERIFIED
              </h1>
              <p className="mb-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Redirecting to dashboard...
              </p>
              <p className="font-mono text-sm text-foreground">
                Your email has been verified. You are being signed in.
              </p>
            </>
          )}
        </div>
        <div className="border-2 border-border border-t-0 px-8 py-4">
          <p className="font-mono text-sm text-muted-foreground">
            <a
              href="/login"
              className="font-bold uppercase underline underline-offset-4 text-foreground"
            >
              Back to sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
