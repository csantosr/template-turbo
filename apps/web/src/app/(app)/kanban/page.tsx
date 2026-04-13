"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
} from "@repo/ui";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { CardDetailDrawer } from "./_components/card-detail-drawer";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export default function KanbanPage() {
  const utils = trpc.useUtils();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addColumnId, setAddColumnId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: board, isLoading } = trpc.kanban.getBoard.useQuery(undefined, {
    staleTime: 0,
  });

  const selectedCard =
    board?.columns.flatMap((col) => col.cards).find((card) => card.id === selectedCardId) ?? null;

  useEffect(() => {
    if (selectedCardId && !selectedCard) {
      setDrawerOpen(false);
      setSelectedCardId(null);
    }
  }, [selectedCardId, selectedCard]);

  const createCard = trpc.kanban.createCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate();
      setAddDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
    },
  });

  const deleteCard = trpc.kanban.deleteCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate();
    },
  });

  const moveCard = trpc.kanban.moveCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate();
    },
  });

  function handleAddCard(columnId: string) {
    setAddColumnId(columnId);
    setAddDialogOpen(true);
  }

  function handleCardClick(card: KanbanCard) {
    setSelectedCardId(card.id);
    setDrawerOpen(true);
  }

  function handleSubmitAdd() {
    if (!newTitle.trim() || !addColumnId) return;
    createCard.mutate({
      columnId: addColumnId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
    });
  }

  function handleDeleteCard(id: string) {
    deleteCard.mutate({ id });
  }

  function handleCardsChange(cards: KanbanCard[]) {
    if (!board) return;

    const originalCards = board.columns.flatMap(
      (col: {
        cards: {
          id: string;
          columnId: string;
          title: string;
          description: string | null;
          priority: "low" | "medium" | "high" | null;
          position: number;
        }[];
      }) => col.cards,
    );

    for (const card of cards) {
      const original = originalCards.find((c: KanbanCard) => c.id === card.id);
      if (!original) continue;

      const columnChanged = original.columnId !== card.columnId;
      const positionChanged = original.position !== card.position;

      if (columnChanged || positionChanged) {
        const targetColumnCards = cards.filter((c) => c.columnId === card.columnId);
        const newPosition = targetColumnCards.findIndex((c) => c.id === card.id);

        moveCard.mutate({
          cardId: card.id,
          targetColumnId: card.columnId,
          newPosition,
        });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          No board found
        </span>
      </div>
    );
  }

  const columns: KanbanColumn[] = board.columns.map((col: { id: string; name: string }) => ({
    id: col.id,
    title: col.name,
  }));

  const cards: KanbanCard[] = board.columns.flatMap(
    (col: {
      cards: {
        id: string;
        columnId: string;
        title: string;
        description: string | null;
        priority: "low" | "medium" | "high" | null;
        position: number;
      }[];
    }) =>
      col.cards.map((card) => ({
        id: card.id,
        columnId: card.columnId,
        title: card.title,
        description: card.description,
        priority: card.priority ?? undefined,
        position: card.position,
      })),
  );

  return (
    <div className="h-full">
      <KanbanBoard
        columns={columns}
        cards={cards}
        onCardsChange={handleCardsChange}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
        onCardClick={handleCardClick}
      />

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ADD TASK</DialogTitle>
            <DialogDescription>Create a new task in your kanban board.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="add-title"
                className="mb-1 block font-mono text-sm uppercase tracking-widest text-muted-foreground"
              >
                Title
              </label>
              <Input
                id="add-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                className="rounded-none border-2 border-border"
              />
            </div>
            <div>
              <label
                htmlFor="add-description"
                className="mb-1 block font-mono text-sm uppercase tracking-widest text-muted-foreground"
              >
                Description
              </label>
              <Input
                id="add-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
                className="rounded-none border-2 border-border"
              />
            </div>
            <div>
              <span className="mb-1 block font-mono text-sm uppercase tracking-widest text-muted-foreground">
                Priority
              </span>
              <div className="flex gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewPriority(opt.value)}
                    className={`border-2 px-3 py-1.5 font-mono text-sm uppercase tracking-widest transition-none ${
                      newPriority === opt.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              CANCEL
            </Button>
            <Button onClick={handleSubmitAdd} disabled={!newTitle.trim() || createCard.isPending}>
              {createCard.isPending ? "CREATING..." : "CREATE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardDetailDrawer
        card={selectedCard}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCardId(null);
        }}
      />
    </div>
  );
}
