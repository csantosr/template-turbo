"use client";

import { Button } from "@repo/ui";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface Props {
  impersonatedBy: string | null;
  impersonatedEmail: string;
}

export function ImpersonationBanner({ impersonatedBy, impersonatedEmail }: Props) {
  const [loading, setLoading] = useState(false);

  if (!impersonatedBy) return null;

  async function handleStop() {
    setLoading(true);
    try {
      await authClient.admin.stopImpersonating();
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between border-b-2 border-yellow-600 bg-yellow-500 px-6 py-2">
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-yellow-950">
        You are acting as <span className="underline">{impersonatedEmail}</span>
      </p>
      <Button
        onClick={handleStop}
        disabled={loading}
        className="rounded-none border-2 border-yellow-900 bg-yellow-900 px-4 font-mono text-sm font-bold uppercase tracking-widest text-yellow-100 shadow-[3px_3px_0_0_hsl(45_93%_47%)] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
      >
        {loading ? "Stopping..." : "Stop Impersonating"}
      </Button>
    </div>
  );
}
