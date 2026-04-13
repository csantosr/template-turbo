"use client";

import { Button, Form, FormField, toast } from "@repo/ui";
import { type LoginInput, loginSchema } from "@repo/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
      </Button>
    </Form>
  );
}
