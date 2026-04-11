"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const DialogCloseCtx = createContext<() => void>(() => {});

export function useDialogClose() {
  return useContext(DialogCloseCtx);
}

export interface ActionDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
  onOpenChange?: (open: boolean) => void;
}

export function ActionDialog({
  trigger,
  title,
  description,
  children,
  onOpenChange,
}: ActionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  const close = () => handleChange(false);

  return (
    <DialogCloseCtx.Provider value={close}>
      <Dialog open={open} onOpenChange={handleChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {typeof children === "function" ? children({ close }) : children}
        </DialogContent>
      </Dialog>
    </DialogCloseCtx.Provider>
  );
}

interface ConfirmFooterProps {
  onConfirm: (close: () => void) => void;
  confirmLabel: string;
  confirmPendingLabel?: string;
  isPending?: boolean;
  variant?: "default" | "destructive";
  cancelLabel?: string;
}

function ConfirmFooter({
  onConfirm,
  confirmLabel,
  confirmPendingLabel,
  isPending,
  variant = "default",
  cancelLabel,
}: ConfirmFooterProps) {
  const close = useDialogClose();
  return (
    <DialogFooter>
      <Button
        variant="outline"
        onClick={close}
        className="rounded-none border-2 border-border px-4 font-mono text-sm uppercase tracking-widest transition-none hover:bg-secondary"
      >
        {cancelLabel ?? "Cancel"}
      </Button>
      <Button
        onClick={() => onConfirm(close)}
        disabled={isPending}
        className={
          variant === "destructive"
            ? "rounded-none border-2 border-destructive px-6 font-mono text-sm font-bold uppercase tracking-widest text-destructive shadow-[4px_4px_0_0_hsl(var(--destructive))] transition-none hover:translate-x-px hover:translate-y-px hover:bg-destructive hover:text-destructive-foreground hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            : "rounded-none border-2 border-primary px-6 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
        }
      >
        {isPending && confirmPendingLabel ? confirmPendingLabel : confirmLabel}
      </Button>
    </DialogFooter>
  );
}

export interface ConfirmDialogProps extends Omit<ActionDialogProps, "children"> {
  children?: ReactNode;
  onConfirm: (close: () => void) => void;
  confirmLabel: string;
  confirmPendingLabel?: string;
  isPending?: boolean;
  variant?: "default" | "destructive";
  cancelLabel?: string;
}

export function ConfirmDialog({
  children,
  onConfirm,
  confirmLabel,
  confirmPendingLabel,
  isPending,
  variant = "default",
  cancelLabel,
  ...actionDialogProps
}: ConfirmDialogProps) {
  return (
    <ActionDialog {...actionDialogProps}>
      <>
        {children}
        <ConfirmFooter
          onConfirm={onConfirm}
          confirmLabel={confirmLabel}
          confirmPendingLabel={confirmPendingLabel}
          isPending={isPending}
          variant={variant}
          cancelLabel={cancelLabel}
        />
      </>
    </ActionDialog>
  );
}
