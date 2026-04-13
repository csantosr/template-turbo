import { kanbanBoards, kanbanCards, kanbanColumns } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, requirePermission, router } from "../trpc";

export const kanbanRouter = router({
  getBoard: requirePermission("kanban", "read").query(async ({ ctx }) => {
    const board = await ctx.db.query.kanbanBoards.findFirst({
      where: eq(kanbanBoards.userId, ctx.session.user.id),
    });

    if (!board) {
      const boardId = crypto.randomUUID();
      const columnIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

      const now = new Date();
      await ctx.db.insert(kanbanBoards).values({
        id: boardId,
        userId: ctx.session.user.id,
        name: "My Board",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanColumns).values({
        id: columnIds[0]!,
        boardId,
        name: "TODO",
        position: 0,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanColumns).values({
        id: columnIds[1]!,
        boardId,
        name: "IN PROGRESS",
        position: 1,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanColumns).values({
        id: columnIds[2]!,
        boardId,
        name: "DONE",
        position: 2,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanCards).values({
        id: crypto.randomUUID(),
        columnId: columnIds[0]!,
        title: "Welcome to Kanban",
        description: "Drag cards between columns to move them. Click + to add new tasks.",
        priority: "low",
        position: 0,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanCards).values({
        id: crypto.randomUUID(),
        columnId: columnIds[0]!,
        title: "Add more tasks",
        description: "Use the + button in each column to create new cards.",
        priority: "medium",
        position: 1,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert(kanbanCards).values({
        id: crypto.randomUUID(),
        columnId: columnIds[1]!,
        title: "Try dragging",
        description: "Move this card to DONE when you're ready.",
        priority: "high",
        position: 0,
        createdAt: now,
        updatedAt: now,
      });

      const newBoard = await ctx.db.query.kanbanBoards.findFirst({
        where: eq(kanbanBoards.userId, ctx.session.user.id),
      });

      if (!newBoard) return null;

      const columns = await ctx.db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.boardId, newBoard.id))
        .orderBy(asc(kanbanColumns.position));

      const columnsWithCards = await Promise.all(
        columns.map(async (col) => {
          const cards = await ctx.db
            .select()
            .from(kanbanCards)
            .where(eq(kanbanCards.columnId, col.id))
            .orderBy(asc(kanbanCards.position));
          return { ...col, cards };
        }),
      );

      return { ...newBoard, columns: columnsWithCards };
    }

    const columns = await ctx.db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.boardId, board.id))
      .orderBy(asc(kanbanColumns.position));

    const columnsWithCards = await Promise.all(
      columns.map(async (col) => {
        const cards = await ctx.db
          .select()
          .from(kanbanCards)
          .where(eq(kanbanCards.columnId, col.id))
          .orderBy(asc(kanbanCards.position));
        return { ...col, cards };
      }),
    );

    return { ...board, columns: columnsWithCards };
  }),

  createCard: requirePermission("kanban", "create")
    .input(
      z.object({
        columnId: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { columnId, title, description, priority } = input;

      const maxPosResult = await ctx.db
        .select({ maxPos: kanbanCards.position })
        .from(kanbanCards)
        .where(eq(kanbanCards.columnId, columnId));

      const maxPos = maxPosResult[0]?.maxPos ?? -1;

      const now = new Date();
      const card = await ctx.db.insert(kanbanCards).values({
        id: crypto.randomUUID(),
        columnId,
        title,
        description: description ?? null,
        priority,
        position: maxPos + 1,
        createdAt: now,
        updatedAt: now,
      });

      return card;
    }),

  updateCard: requirePermission("kanban", "update")
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      if (Object.keys(updates).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      const setFields: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.title !== undefined) setFields.title = updates.title;
      if (updates.description !== undefined) setFields.description = updates.description ?? null;
      if (updates.priority !== undefined) setFields.priority = updates.priority;

      const [updated] = await ctx.db
        .update(kanbanCards)
        .set(setFields)
        .where(eq(kanbanCards.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      return updated;
    }),

  deleteCard: requirePermission("kanban", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(kanbanCards)
        .where(eq(kanbanCards.id, input.id))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      return { success: true };
    }),

  moveCard: requirePermission("kanban", "update")
    .input(
      z.object({
        cardId: z.string(),
        targetColumnId: z.string(),
        newPosition: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cardId, targetColumnId, newPosition } = input;

      const card = await ctx.db.query.kanbanCards.findFirst({
        where: eq(kanbanCards.id, cardId),
      });

      if (!card) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      const sourceColumnId = card.columnId;
      const now = new Date();

      if (sourceColumnId === targetColumnId) {
        const cardsInColumn = await ctx.db
          .select()
          .from(kanbanCards)
          .where(eq(kanbanCards.columnId, sourceColumnId))
          .orderBy(asc(kanbanCards.position));

        const oldIndex = cardsInColumn.findIndex((c) => c.id === cardId);
        if (oldIndex === -1) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Card not found in column" });
        }

        const updates: { id: string; position: number }[] = [];
        const cardsToMove = cardsInColumn.filter((c) => c.id !== cardId);

        cardsToMove.splice(newPosition, 0, card);
        cardsToMove.forEach((c, idx) => {
          if (c.position !== idx) {
            updates.push({ id: c.id, position: idx });
          }
        });

        await Promise.all(
          updates.map((u) =>
            ctx.db
              .update(kanbanCards)
              .set({ position: u.position, updatedAt: now })
              .where(eq(kanbanCards.id, u.id)),
          ),
        );
      } else {
        const sourceCards = await ctx.db
          .select()
          .from(kanbanCards)
          .where(eq(kanbanCards.columnId, sourceColumnId))
          .orderBy(asc(kanbanCards.position));

        const targetCards = await ctx.db
          .select()
          .from(kanbanCards)
          .where(eq(kanbanCards.columnId, targetColumnId))
          .orderBy(asc(kanbanCards.position));

        const sourceUpdates = sourceCards
          .filter((c) => c.id !== cardId)
          .map((c, idx) => ({ id: c.id, position: idx }));

        const targetUpdates = [...targetCards];
        targetUpdates.splice(newPosition, 0, card);
        const targetUpdatesNew = targetUpdates.map((c, idx) => ({
          id: c.id,
          position: idx,
          columnId: c.id === cardId ? targetColumnId : c.columnId,
        }));

        await Promise.all([
          ...sourceUpdates.map((u) =>
            ctx.db
              .update(kanbanCards)
              .set({ position: u.position, updatedAt: now })
              .where(eq(kanbanCards.id, u.id)),
          ),
          ...targetUpdatesNew.map((u) =>
            ctx.db
              .update(kanbanCards)
              .set({
                position: u.position,
                columnId: u.columnId,
                updatedAt: now,
              })
              .where(eq(kanbanCards.id, u.id)),
          ),
        ]);
      }

      return { success: true };
    }),
});
