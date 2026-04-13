"use client";

import { Button, Form, FormField } from "@repo/ui";
import { forgotPasswordSchema } from "@repo/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
    };

    const result = forgotPasswordSchema.safeParse(data);
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

    await requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    router.push(`/check-inbox?email=${encodeURIComponent(data.email)}`);
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

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
      </Button>
    </Form>
  );
}
