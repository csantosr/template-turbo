"use client";

import { X } from "@phosphor-icons/react";
import { cn } from "../lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Drawer({ open, onClose, children, title, className }: DrawerProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close drawer"
        className={cn(
          "fixed inset-0 z-40 cursor-default bg-black/50 opacity-0 transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 ease-out",
          "sm:w-[480px]",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          {title && <h2 className="font-mono text-sm uppercase tracking-[0.2em]">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
          >
            <X weight="bold" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
