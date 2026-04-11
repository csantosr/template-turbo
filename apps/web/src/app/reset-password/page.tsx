import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Set new password
        </p>
        <h1 className="mb-8 font-mono text-2xl font-bold uppercase tracking-tight">
          Reset Password
        </h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
