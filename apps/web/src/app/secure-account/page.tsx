import { Suspense } from "react";
import { SecureAccountForm } from "./secure-account-form";

export default function SecureAccountPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Security alert
        </p>
        <h1 className="mb-8 font-mono text-2xl font-bold uppercase tracking-tight">
          Secure Your Account
        </h1>
        <Suspense>
          <SecureAccountForm />
        </Suspense>
      </div>
    </main>
  );
}
