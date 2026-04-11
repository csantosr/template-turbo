import { activityLogs } from "@repo/db";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requirePermission, router } from "../trpc";

export const activityRouter = router({
  list: requirePermission("activity", "read")
    .input(
      z.object({
        action: z.string().optional(),
        status: z.enum(["success", "failed"]).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { action, status, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (action) conditions.push(eq(activityLogs.action, action));
      if (status) conditions.push(eq(activityLogs.status, status));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countRows] = await Promise.all([
        ctx.db
          .select()
          .from(activityLogs)
          .where(where)
          .orderBy(desc(activityLogs.createdAt))
          .limit(pageSize)
          .offset(offset),
        ctx.db.select({ total: count() }).from(activityLogs).where(where),
      ]);

      return { logs: rows, total: Number(countRows[0]?.total ?? 0) };
    }),
});
