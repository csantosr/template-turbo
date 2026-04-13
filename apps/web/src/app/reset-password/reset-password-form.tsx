"use client";

import { Button, Form, FormField, toast } from "@repo/ui";
import { resetPasswordSchema } from "@repo/validators";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const callbackURL = searchParams.get("callbackURL") ?? "/login";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = resetPasswordSchema.safeParse(data);
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

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error(error.message ?? "Link is invalid or has expired");
      setIsSubmitting(false);
      return;
    }

    toast.success("Password reset");
    router.push(callbackURL);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="password" label="New Password" error={errors.password}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <FormField name="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "SAVING..." : "SET PASSWORD"}
      </Button>
    </Form>
  );
}
