"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  pointerWithin,
  rectIntersection,
  type UniqueIdentifier,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsThree, Plus } from "@phosphor-icons/react";
import { createContext, useContext, useState } from "react";
import { cn } from "../lib/utils";

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high" | null;
  position: number;
}

interface KanbanDragContextValue {
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

const KanbanDragContext = createContext<KanbanDragContextValue>({
  isDragging: false,
  setIsDragging: () => {},
});

interface KanbanCardItemProps {
  card: KanbanCard;
  onDelete?: (id: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  isDragging?: boolean;
}

function KanbanCardItem({ card, onDelete, onCardClick, isDragging }: KanbanCardItemProps) {
  const { isDragging: isBoardDragging } = useContext(KanbanDragContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: "border-muted-foreground text-muted-foreground",
    medium: "border-yellow-600 dark:border-yellow-400 text-yellow-600 dark:text-yellow-400",
    high: "border-destructive text-destructive",
  };

  function handleClick() {
    if (isBoardDragging || isSortableDragging) return;
    if (onCardClick) {
      onCardClick(card);
    }
  }

  return (
    <button
      ref={setNodeRef as React.Ref<HTMLButtonElement>}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      type="button"
      className={cn(
        "group relative flex w-full flex-col gap-2 border-2 border-border bg-background p-4 text-left transition-shadow select-none",
        "shadow-[4px_4px_0_0_hsl(var(--foreground))]",
        "cursor-grab active:cursor-grabbing",
        (isSortableDragging || isDragging) && "opacity-50",
        !isSortableDragging && !isDragging && "hover:shadow-none",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 font-mono text-sm font-bold uppercase leading-tight">
          {card.title}
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onCardClick) {
              onCardClick(card);
            }
          }}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-foreground"
        >
          <DotsThree weight="bold" size={20} />
        </button>
      </div>
      {card.description && (
        <span className="font-mono text-xs text-muted-foreground">{card.description}</span>
      )}
      {card.priority && card.priority !== "medium" && (
        <span
          className={cn(
            "mt-1 w-fit border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest",
            priorityColors[card.priority],
          )}
        >
          {card.priority}
        </span>
      )}
    </button>
  );
}

interface KanbanColumnContainerProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  onAddCard?: (columnId: string) => void;
  onDeleteCard?: (id: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  isOver?: boolean;
}

function KanbanColumnContainer({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onCardClick,
  isOver,
}: KanbanColumnContainerProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-2 border-border bg-secondary">
      <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
        <span className="font-mono text-sm uppercase tracking-[0.3em]">{column.title}</span>
        <span className="font-mono text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-3 p-3 transition-colors",
          (isOver || isDroppableOver) && "bg-accent/50",
        )}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="flex flex-1 items-center justify-center border-2 border-dashed border-border">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              No tasks
            </span>
          </div>
        )}
        {onAddCard && (
          <button
            type="button"
            onClick={() => onAddCard(column.id)}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-border py-2 font-mono text-sm uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
          >
            <Plus weight="bold" size={16} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardsChange?: (cards: KanbanCard[]) => void;
  onAddCard?: (columnId: string) => void;
  onDeleteCard?: (id: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
}

export function KanbanBoard({
  columns,
  cards,
  onCardsChange,
  onAddCard,
  onDeleteCard,
  onCardClick,
  className,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localCards, setLocalCards] = useState<KanbanCard[]>(cards);

  if (cards !== localCards && activeId === null) {
    setLocalCards(cards);
  }

  const activeCard = activeId ? localCards.find((c) => c.id === activeId) : null;

  const dragContext = {
    isDragging,
    setIsDragging,
  };

  function findColumn(id: UniqueIdentifier): KanbanColumn | undefined {
    return columns.find((c) => c.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    setIsDragging(true);
  }

  function handleDragOver(event: DragOverEvent) {
    const overIdValue = event.over?.id ?? null;
    setOverId(overIdValue);

    if (!overIdValue || !onCardsChange) return;

    const activeCardId = String(event.active.id);

    const activeCardItem = localCards.find((c) => c.id === activeCardId);
    if (!activeCardItem) return;

    const overColumn = findColumn(overIdValue);
    if (!overColumn) return;

    if (activeCardItem.columnId === overColumn.id) return;

    setLocalCards((prev) => {
      const newCards = prev.map((c) => {
        if (c.id === activeCardId) {
          return { ...c, columnId: overColumn.id };
        }
        return c;
      });
      onCardsChange?.(newCards);
      return newCards;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setIsDragging(false);

    if (!over || !onCardsChange) return;

    const activeCardId = String(active.id);
    const overIdStr = String(over.id);

    const activeCardItem = localCards.find((c) => c.id === activeCardId);
    if (!activeCardItem) return;

    const overCard = localCards.find((c) => c.id === overIdStr);
    const overColumn = findColumn(over.id);

    const newCards = [...localCards];

    if (overCard) {
      const overCardColumnId = overCard.columnId;
      const sourceColumnId = activeCardItem.columnId;

      if (sourceColumnId === overCardColumnId) {
        const columnCards = localCards
          .filter((c) => c.columnId === sourceColumnId)
          .sort((a, b) => a.position - b.position);

        const oldIndex = columnCards.findIndex((c) => c.id === activeCardId);
        const newIndex = columnCards.findIndex((c) => c.id === overIdStr);

        if (oldIndex !== newIndex) {
          const reordered = arrayMove(columnCards, oldIndex, newIndex);
          reordered.forEach((c, idx) => {
            const cardIdx = newCards.findIndex((nc) => nc.id === c.id);
            if (cardIdx !== -1) {
              const existing = newCards[cardIdx];
              if (existing) newCards[cardIdx] = { ...existing, position: idx };
            }
          });
        }
      } else {
        const targetColumnCards = localCards
          .filter((c) => c.columnId === overCardColumnId)
          .sort((a, b) => a.position - b.position);

        const newIndex = targetColumnCards.findIndex((c) => c.id === overIdStr);

        targetColumnCards.forEach((c, idx) => {
          const cardIdx = newCards.findIndex((nc) => nc.id === c.id);
          if (cardIdx !== -1) {
            const existing = newCards[cardIdx];
            if (existing) newCards[cardIdx] = { ...existing, position: idx };
          }
        });

        const activeCardIdx = newCards.findIndex((c) => c.id === activeCardId);
        if (activeCardIdx !== -1) {
          const existing = newCards[activeCardIdx];
          if (existing) {
            newCards[activeCardIdx] = {
              ...existing,
              columnId: overCardColumnId,
              position: newIndex,
            };
          }
        }
      }
    } else if (overColumn) {
      const targetColumnCards = localCards
        .filter((c) => c.columnId === overColumn.id)
        .sort((a, b) => a.position - b.position);

      const activeCardIdx = newCards.findIndex((c) => c.id === activeCardId);
      if (activeCardIdx !== -1) {
        const existing = newCards[activeCardIdx];
        if (existing) {
          newCards[activeCardIdx] = {
            ...existing,
            columnId: overColumn.id,
            position: targetColumnCards.length,
          };
        }
      }
    }

    setLocalCards(newCards);
    onCardsChange(newCards);
  }

  return (
    <KanbanDragContext.Provider value={dragContext}>
      <DndContext
        collisionDetection={(args) => {
          const first = pointerWithin(args);
          if (first && first.length > 0) return first;
          return rectIntersection(args);
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={cn("flex h-full gap-4 overflow-x-auto p-4", className)}>
          {columns.map((column) => {
            const columnCards = localCards
              .filter((c) => c.columnId === column.id)
              .sort((a, b) => a.position - b.position);

            return (
              <KanbanColumnContainer
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={onAddCard}
                onDeleteCard={onDeleteCard}
                onCardClick={onCardClick}
                isOver={overId === column.id}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeCard && (
            <div className="w-72 opacity-90">
              <KanbanCardItem card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </KanbanDragContext.Provider>
  );
}
