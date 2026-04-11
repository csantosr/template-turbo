import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const inviteUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.string().min(1).max(50),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(50).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
