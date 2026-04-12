"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRANDING } from "@/lib/branding";

const TABS = [
  { id: "product", label: "PRODUCT" },
  { id: "pricing", label: "PRICING" },
  { id: "faq", label: "FAQ" },
] as const;

export function LandingNav() {
  const [active, setActive] = useState<string>("product");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const tab of TABS) {
      const el = document.getElementById(tab.id);
      if (!el) continue;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(tab.id);
        },
        { rootMargin: "-40% 0px -55% 0px" },
      );

      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, []);

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex items-center px-6 md:px-16">
        <Link href="/" className="mr-6 shrink-0 py-3">
          <Image
            src={BRANDING.logo.full}
            alt={BRANDING.name}
            width={100}
            height={20}
            className="h-5 w-auto"
          />
        </Link>
        <div className="flex flex-1 overflow-x-auto">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => scrollTo(e, tab.id)}
              className={`shrink-0 border-b-2 px-6 py-4 font-mono text-sm uppercase tracking-widest transition-none ${
                active === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <div className="shrink-0 pl-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
