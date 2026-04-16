"use client";

import { Button, Form, FormField } from "@repo/ui";
import { loginSchema } from "@repo/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });

    if (error) {
      if (error.status === 403 && error.message?.toLowerCase().includes("banned")) {
        setErrors({ password: error.message });
      } else if (error.status === 403) {
      } else {
        setErrors({ password: error.message ?? "Sign in failed" });
      }
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="email" label="Email" error={errors.email}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <FormField name="password" label="Password" error={errors.password}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <div className="text-right">
        <a
          href="/forgot-password"
          className="font-mono text-sm font-bold uppercase underline underline-offset-4 text-foreground"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="mt-2 flex w-full items-center justify-center gap-2 border-2 border-input bg-transparent font-mono uppercase"
      >
        {isGoogleLoading ? (
          "redirecting..."
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Google">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </>
        )}
      </Button>

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-mono uppercase text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
      </Button>
    </Form>
  );
}
