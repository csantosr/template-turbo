import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or less" }),
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const acceptInviteSchema = z.object({
  token: z.string(),
  email: z.email({ message: "Please enter a valid email address" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or less" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const inviteUserClientSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or less" }),
  email: z.email({ message: "Please enter a valid email address" }),
});

export type InviteUserClientInput = z.infer<typeof inviteUserClientSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createRoleSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Role ID is required" })
    .max(50, { message: "Role ID must be 50 characters or less" })
    .regex(/^[a-z0-9_-]+$/, {
      message: "Role ID must contain only lowercase letters, numbers, hyphens, and underscores",
    }),
  name: z
    .string()
    .min(1, { message: "Display name is required" })
    .max(100, { message: "Display name must be 100 characters or less" }),
  description: z
    .string()
    .max(500, { message: "Description must be 500 characters or less" })
    .optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const banUserSchema = z.object({
  userId: z.string(),
  reason: z.string().max(500, { message: "Reason must be 500 characters or less" }).optional(),
  expiresIn: z.number().int().positive().optional(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
