"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="rounded-none border-2 border-foreground px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-foreground hover:text-background"
    >
      SIGN OUT
    </Button>
  );
}
