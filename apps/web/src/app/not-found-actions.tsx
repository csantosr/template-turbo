"use client";

import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";

export function NotFoundActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Button
        asChild
        className="h-auto rounded-none border-2 border-primary px-8 py-4 font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        <a href="/">GO HOME</a>
      </Button>
      <Button
        className="h-auto rounded-none border-2 border-primary px-8 py-4 font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        onClick={() => router.back()}
      >
        GO BACK
      </Button>
    </div>
  );
}
