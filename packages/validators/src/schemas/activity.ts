import { z } from "zod";

export const activityFilterSchema = z.object({
  action: z.string().optional(),
  status: z.enum(["success", "failed"]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type ActivityFilterInput = z.infer<typeof activityFilterSchema>;
