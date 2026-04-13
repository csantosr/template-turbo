import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "../lib/utils";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export function Form({ className, ...props }: FormProps) {
  return <form className={cn("flex flex-col gap-4", className)} {...props} />;
}

interface FormFieldProps {
  name: string;
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <LabelPrimitive.Root
          htmlFor={name}
          className="font-mono text-sm uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </LabelPrimitive.Root>
      )}
      {children}
      {error && <p className="font-mono text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="border border-destructive px-3 py-2 font-mono text-sm uppercase tracking-wide text-destructive">
      {error}
    </p>
  );
}
