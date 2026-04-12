import { activityLogs, roles, sessions, userRoles, users, verifications } from "@repo/db";
import { InviteEmail, ResetPasswordEmail, sendEmail, WelcomeEmail } from "@repo/email";
import { updateUserSchema } from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { and, count, eq, ilike, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { createElement } from "react";
import { z } from "zod";
import { auth } from "@/server/auth";
import { env } from "../../../env";
import { protectedProcedure, publicProcedure, requirePermission, router } from "../trpc";

export const userRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return { greeting: `Hello, ${input.name ?? "world"}!` };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),

  list: requirePermission("users", "read")
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, role, status, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (search) {
        conditions.push(or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)));
      }
      if (role) conditions.push(ilike(users.role, role));
      if (status) conditions.push(eq(users.status, status));
      conditions.push(isNull(users.deletedAt));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countRows] = await Promise.all([
        ctx.db
          .select()
          .from(users)
          .where(where)
          .orderBy(users.createdAt)
          .limit(pageSize)
          .offset(offset),
        ctx.db.select({ total: count() }).from(users).where(where),
      ]);

      const userIds = rows.map((u) => u.id);
      const assignedRoles =
        userIds.length > 0
          ? await ctx.db
              .select({ userId: userRoles.userId, roleId: roles.id, roleName: roles.name })
              .from(userRoles)
              .innerJoin(roles, eq(userRoles.roleId, roles.id))
              .where(inArray(userRoles.userId, userIds))
          : [];

      const rolesByUserId = new Map<string, { id: string; name: string }[]>();
      for (const r of assignedRoles) {
        const list = rolesByUserId.get(r.userId) ?? [];
        list.push({ id: r.roleId, name: r.roleName });
        rolesByUserId.set(r.userId, list);
      }

      return {
        users: rows.map((u) => ({ ...u, roles: rolesByUserId.get(u.id) ?? [] })),
        total: Number(countRows[0]?.total ?? 0),
      };
    }),

  invite: requirePermission("users", "create")
    .input(z.object({ name: z.string().min(1).max(100), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const { name, email } = input;

      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with that email already exists.",
        });
      }

      const token = crypto.randomUUID();
      await ctx.db.insert(verifications).values({
        id: crypto.randomUUID(),
        identifier: email,
        value: token,
        expiresAt: new Date(Date.now() + 86_400_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/register?invite=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

      await sendEmail({
        to: email,
        subject: "You've been invited",
        react: createElement(InviteEmail, {
          name,
          inviterName: ctx.session.user.name,
          role: "member",
          url: inviteUrl,
        }),
      });

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "INVITE",
        detail: `Invited ${email}`,
        status: "success",
      });

      return { success: true };
    }),

  acceptInvite: publicProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email(),
        name: z.string().min(1).max(100),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { token, email, name, password } = input;

      const verification = await ctx.db.query.verifications.findFirst({
        where: (v, { and, eq }) => and(eq(v.identifier, email), eq(v.value, token)),
      });

      if (!verification) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite link." });
      }
      if (verification.expiresAt < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This invite link has expired." });
      }

      const result = await auth.api.signUpEmail({
        body: { name, email, password },
        asResponse: false,
      });

      if (!result?.user?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account.",
        });
      }

      await ctx.db.update(users).set({ emailVerified: true }).where(eq(users.email, email));

      await ctx.db.delete(verifications).where(eq(verifications.id, verification.id));

      void sendEmail({
        to: email,
        subject: `Welcome to template, ${name}!`,
        react: createElement(WelcomeEmail, {
          name,
          appUrl: env.NEXT_PUBLIC_APP_URL,
        }),
      });

      return { success: true };
    }),

  update: requirePermission("users", "update")
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input;
      const updates: Record<string, unknown> = {};
      if (fields.name !== undefined) updates.name = fields.name;
      if (fields.role !== undefined) updates.role = fields.role;
      if (fields.status !== undefined) updates.status = fields.status;

      if (Object.keys(updates).length === 0) return { success: true };

      const [updated] = await ctx.db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "UPDATE",
        detail: `Updated ${updated.email}`,
        status: "success",
      });

      return { success: true };
    }),

  remove: requirePermission("users", "delete")
    .input(z.object({ id: z.string(), reason: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      await ctx.db.delete(sessions).where(eq(sessions.userId, input.id));

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "REMOVE",
        detail: `Soft-deleted ${updated.email}${input.reason ? `: ${input.reason}` : ""}`,
        status: "success",
      });

      return { success: true };
    }),

  resendVerification: requirePermission("users", "update")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      if (user.emailVerified) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email is already verified." });
      }

      await auth.api.sendVerificationEmail({
        body: { email: user.email, callbackURL: "/verify-email" },
      });

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "RESEND_VERIFICATION",
        detail: `Verification resent for ${user.email}`,
        status: "success",
      });

      return { success: true };
    }),

  resetPassword: requirePermission("users", "update")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const token = crypto.randomUUID();
      await ctx.db.insert(verifications).values({
        id: crypto.randomUUID(),
        identifier: user.email,
        value: token,
        expiresAt: new Date(Date.now() + 3_600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&callbackURL=/login`;

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: createElement(ResetPasswordEmail, { url: resetUrl, name: user.name }),
      });

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "PASSWORD_RESET",
        detail: `Reset sent for ${user.email}`,
        status: "success",
      });

      return { success: true };
    }),

  ban: requirePermission("users", "ban")
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().max(500).optional(),
        expiresIn: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, reason, expiresIn } = input;

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const banExpires = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      // Write ban fields directly — bypasses BA's own role check which conflicts
      // with our comma-separated role field. Permission already guarded above.
      await ctx.db
        .update(users)
        .set({ banned: true, banReason: reason ?? null, banExpires, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Revoke all active sessions so the ban takes effect immediately
      await ctx.db.delete(sessions).where(eq(sessions.userId, userId));

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "BAN",
        detail: `Banned ${user.email}${reason ? `: ${reason}` : ""}`,
        status: "success",
      });

      return { success: true };
    }),

  unban: requirePermission("users", "ban")
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      await ctx.db
        .update(users)
        .set({ banned: false, banReason: null, banExpires: null, updatedAt: new Date() })
        .where(eq(users.id, input.userId));

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "UNBAN",
        detail: `Unbanned ${user.email}`,
        status: "success",
      });

      return { success: true };
    }),

  listDeleted: requirePermission("userDeletions", "read")
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const baseConditions = [isNotNull(users.deletedAt)] as const;
      const searchConditions = search
        ? ([or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))] as const)
        : [];
      const allConditions = [...baseConditions, ...searchConditions];

      const where = and(...allConditions);

      const [rows, countRows] = await Promise.all([
        ctx.db
          .select()
          .from(users)
          .where(where)
          .orderBy(users.createdAt)
          .limit(pageSize)
          .offset(offset),
        ctx.db.select({ total: count() }).from(users).where(where),
      ]);

      return {
        users: rows,
        total: Number(countRows[0]?.total ?? 0),
      };
    }),

  restore: requirePermission("userDeletions", "restore")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      if (!user.deletedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is not deleted." });
      }

      await ctx.db
        .update(users)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(users.id, input.id));

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "RESTORE",
        detail: `Restored ${user.email}`,
        status: "success",
      });

      return { success: true };
    }),
});
