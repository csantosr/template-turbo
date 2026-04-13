"use client";

import { Button, Form, FormField } from "@repo/ui";
import { registerSchema } from "@repo/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";

interface Props {
  invite?: string;
  initialEmail?: string;
  initialName?: string;
}

export function RegisterForm({ invite, initialEmail = "", initialName = "" }: Props) {
  const router = useRouter();
  const isInvite = !!invite;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptInvite = trpc.user.acceptInvite.useMutation();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = registerSchema.safeParse(data);
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

    if (isInvite) {
      const result = await acceptInvite.mutateAsync({
        token: invite!,
        email: data.email,
        name: data.name,
        password: data.password,
      });

      if (!result) return;

      const { error: signInError } = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      });

      if (signInError) {
        return;
      }

      router.push("/dashboard");
      return;
    }

    const { error } = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: "/verify-email",
    });

    if (error) return;

    router.push(`/check-email?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="name" label="Name" error={errors.name}>
        <input
          name="name"
          type="text"
          autoComplete="name"
          disabled={isSubmitting}
          defaultValue={initialName}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <FormField name="email" label="Email" error={errors.email}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          disabled={isInvite || isSubmitting}
          defaultValue={initialEmail}
          className={`flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50 ${isInvite ? "cursor-not-allowed" : ""}`}
        />
      </FormField>

      <FormField name="password" label="Password" error={errors.password}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base font-mono transition-none focus-visible:outline-none focus-visible:border-foreground disabled:opacity-50"
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting
          ? isInvite
            ? "SETTING UP..."
            : "CREATING ACCOUNT..."
          : isInvite
            ? "SET PASSWORD"
            : "CREATE ACCOUNT"}
      </Button>
    </Form>
  );
}
