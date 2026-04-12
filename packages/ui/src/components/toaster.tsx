"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-center gap-3 !border-2 !border-black bg-background p-4 font-mono shadow-[4px_4px_0_0_black] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
          title: "text-sm font-bold uppercase tracking-widest text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton:
            "border-2 border-border bg-transparent px-3 py-1 font-mono text-sm uppercase tracking-widest text-foreground transition-none hover:bg-secondary",
          cancelButton:
            "border-2 border-border bg-transparent px-3 py-1 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-none hover:bg-secondary",
          closeButton:
            "absolute right-1 top-1 border-0 bg-transparent text-muted-foreground hover:text-foreground",
          success: "!border-black text-green-600 shadow-[4px_4px_0_0_black] dark:text-green-400",
          error: "!border-black text-destructive shadow-[4px_4px_0_0_hsl(var(--destructive))]",
          info: "!border-black",
        },
      }}
    />
  );
}
