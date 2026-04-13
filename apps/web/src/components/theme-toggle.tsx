"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`flex h-9 w-20 shrink-0 items-center justify-center border-2 border-current font-mono text-sm uppercase tracking-widest hover:bg-foreground hover:text-background${!mounted ? " pointer-events-none opacity-0" : ""}`}
    >
      <span suppressHydrationWarning>{resolvedTheme === "dark" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
