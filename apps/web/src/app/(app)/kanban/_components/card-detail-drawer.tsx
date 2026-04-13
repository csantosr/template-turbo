"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { Button, Drawer, Input } from "@repo/ui";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/trpc/client";

const cardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardDetailDrawerProps {
  card: {
    id: string;
    title: string;
    description?: string | null;
    priority?: "low" | "medium" | "high" | null;
  } | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function CardDetailDrawer({ card, open, onClose, onDelete }: CardDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const updateCard = trpc.kanban.updateCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate();
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  useEffect(() => {
    if (card) {
      reset({
        title: card.title,
        description: card.description ?? "",
        priority: card.priority ?? "medium",
      });
    }
    setIsEditing(false);
  }, [card, reset]);

  function handleClose() {
    setIsEditing(false);
    reset();
    onClose();
  }

  function onSubmit(data: CardFormData) {
    if (!card) return;
    updateCard.mutate({
      id: card.id,
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
    });
  }

  if (!card) return null;

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const priorityColors = {
    low: "text-muted-foreground",
    medium: "text-yellow-600 dark:text-yellow-400",
    high: "text-destructive",
  };

  return (
    <Drawer open={open} onClose={handleClose}>
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide">{card.title}</h1>
            {!isEditing && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <PencilSimple weight="bold" size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (card) {
                      onDelete?.(card.id);
                      onClose();
                    }
                  }}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                >
                  <Trash weight="bold" size={20} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="card-title"
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Title
                </label>
                <Input id="card-title" {...register("title")} className="rounded-none border-2" />
                {errors.title && (
                  <span className="font-mono text-xs text-destructive">{errors.title.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="card-description"
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Description
                </label>
                <textarea
                  id="card-description"
                  {...register("description")}
                  rows={4}
                  className="rounded-none border-2 border-input bg-background px-3 py-2 font-mono text-sm"
                />
                {errors.description && (
                  <span className="font-mono text-xs text-destructive">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Priority
                </span>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        reset({
                          title: card.title,
                          description: card.description ?? "",
                          priority: p,
                        })
                      }
                      className={`border-2 px-3 py-1.5 font-mono text-sm uppercase tracking-widest transition-none ${
                        p === "low"
                          ? "border-muted-foreground text-muted-foreground"
                          : p === "medium"
                            ? "border-yellow-600 dark:border-yellow-400 text-yellow-600 dark:text-yellow-400"
                            : "border-destructive text-destructive"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="flex-1 rounded-none border-2"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || updateCard.isPending}
                  className="flex-1 rounded-none border-2"
                >
                  {updateCard.isPending ? "SAVING..." : "SAVE"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Description
                </span>
                <p className="font-mono text-sm leading-relaxed">
                  {card.description || "No description"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Priority
                </span>
                <span
                  className={`w-fit border px-3 py-1 font-mono text-sm uppercase tracking-widest ${priorityColors[card.priority ?? "medium"]}`}
                >
                  {priorityLabels[card.priority ?? "medium"]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
