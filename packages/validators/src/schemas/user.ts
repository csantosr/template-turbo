import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or less" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or less" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z
    .string()
    .min(1, { message: "Role is required" })
    .max(50, { message: "Role must be 50 characters or less" }),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character" })
    .max(100, { message: "Name must be 100 characters or less" })
    .optional(),
  role: z
    .string()
    .min(1, { message: "Role must be at least 1 character" })
    .max(50, { message: "Role must be 50 characters or less" })
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
