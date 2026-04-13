import { chatThreads } from "@repo/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const chatRouter = router({
  createThread: protectedProcedure.mutation(async ({ ctx }) => {
    const id = crypto.randomUUID();
    await ctx.db.insert(chatThreads).values({
      id,
      userId: ctx.session.user.id,
      messages: [],
    });
    return { id };
  }),

  listThreads: protectedProcedure.query(async ({ ctx }) => {
    const threads = await ctx.db.query.chatThreads.findMany({
      where: eq(chatThreads.userId, ctx.session.user.id),
      orderBy: (chatThreads, { desc }) => [desc(chatThreads.updatedAt)],
    });
    return threads.map((t) => ({
      id: t.id,
      title: t.title,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }),

  getThread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.query.chatThreads.findFirst({
        where: eq(chatThreads.id, input.id),
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        return null;
      }
      return {
        id: thread.id,
        title: thread.title,
        messages: thread.messages,
      };
    }),

  deleteThread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.query.chatThreads.findFirst({
        where: eq(chatThreads.id, input.id),
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        throw new Error("Thread not found");
      }
      await ctx.db.delete(chatThreads).where(eq(chatThreads.id, input.id));
      return { success: true };
    }),

  updateThreadTitle: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.query.chatThreads.findFirst({
        where: eq(chatThreads.id, input.id),
      });
      if (!thread || thread.userId !== ctx.session.user.id) {
        throw new Error("Thread not found");
      }
      await ctx.db
        .update(chatThreads)
        .set({ title: input.title, updatedAt: new Date() })
        .where(eq(chatThreads.id, input.id));
      return { success: true };
    }),
});
