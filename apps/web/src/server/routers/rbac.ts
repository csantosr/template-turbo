import {
  activityLogs,
  db as _db,
  rolePermissions,
  roles,
  userPermissions,
  userRoles,
  users,
} from "@repo/db";

type Db = typeof _db;
import { ALL_PERMISSIONS } from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, requirePermission, router } from "../trpc";
import { getUserEffectivePermissions } from "../rbac";

export const rbacRouter = router({
  /** List all roles with their permissions. Any authenticated user can read. */
  listRoles: protectedProcedure.query(async ({ ctx }) => {
    const allRoles = await ctx.db.query.roles.findMany({
      orderBy: (r, { asc }) => asc(r.name),
    });
    const allPerms = await ctx.db.query.rolePermissions.findMany();

    return allRoles.map((role) => ({
      ...role,
      permissions: allPerms
        .filter((p) => p.roleId === role.id)
        .map((p) => ({ resource: p.resource, action: p.action })),
    }));
  }),

  /** Create a new role. */
  createRole: requirePermission("roles", "create")
    .input(
      z.object({
        id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.id),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Role ID already exists." });
      }

      await ctx.db.insert(roles).values({
        id: input.id,
        name: input.name,
        description: input.description ?? null,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "ROLE_CREATE",
        detail: `Created role "${input.id}"`,
        status: "success",
      });

      return { success: true };
    }),

  /** Replace the full permission set for a role. */
  updateRolePermissions: requirePermission("roles", "update")
    .input(
      z.object({
        roleId: z.string(),
        permissions: z.array(
          z.object({ resource: z.string(), action: z.string() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
      });
      if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      if (role.id === "superadmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Superadmin permissions are managed automatically.",
        });
      }

      // Validate that all provided permissions exist in PERMISSIONS registry
      const validKeys = new Set(ALL_PERMISSIONS.map((p) => `${p.resource}:${p.action}`));
      for (const p of input.permissions) {
        if (!validKeys.has(`${p.resource}:${p.action}`)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unknown permission: ${p.resource}:${p.action}`,
          });
        }
      }

      // Replace permissions atomically
      await ctx.db.delete(rolePermissions).where(eq(rolePermissions.roleId, input.roleId));
      if (input.permissions.length > 0) {
        await ctx.db.insert(rolePermissions).values(
          input.permissions.map((p) => ({
            id: crypto.randomUUID(),
            roleId: input.roleId,
            resource: p.resource,
            action: p.action,
            createdAt: new Date(),
          })),
        );
      }

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "ROLE_UPDATE_PERMISSIONS",
        detail: `Updated permissions for role "${input.roleId}"`,
        status: "success",
      });

      return { success: true };
    }),

  /** Delete a non-system role. */
  deleteRole: requirePermission("roles", "delete")
    .input(z.object({ roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
      });
      if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      if (role.isSystem) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System roles cannot be deleted." });
      }

      await ctx.db.delete(roles).where(eq(roles.id, input.roleId));

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "ROLE_DELETE",
        detail: `Deleted role "${input.roleId}"`,
        status: "success",
      });

      return { success: true };
    }),

  /** Assign a role to a user. */
  assignRole: requirePermission("roles", "assign")
    .input(z.object({ userId: z.string(), roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [targetUser, role] = await Promise.all([
        ctx.db.query.users.findFirst({ where: eq(users.id, input.userId) }),
        ctx.db.query.roles.findFirst({ where: eq(roles.id, input.roleId) }),
      ]);
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });

      // Upsert — silently succeed if already assigned
      const existing = await ctx.db.query.userRoles.findFirst({
        where: and(
          eq(userRoles.userId, input.userId),
          eq(userRoles.roleId, input.roleId),
        ),
      });
      if (!existing) {
        await ctx.db.insert(userRoles).values({
          id: crypto.randomUUID(),
          userId: input.userId,
          roleId: input.roleId,
          assignedBy: ctx.session.user.id,
          createdAt: new Date(),
        });
      }

      // Sync comma-sep role field so Better Auth admin operations still work
      await syncUserRoleField(ctx.db, input.userId);

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "ROLE_ASSIGN",
        detail: `Assigned role "${input.roleId}" to ${targetUser.email}`,
        status: "success",
      });

      return { success: true };
    }),

  /** Remove a role from a user. */
  revokeRole: requirePermission("roles", "assign")
    .input(z.object({ userId: z.string(), roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

      await ctx.db
        .delete(userRoles)
        .where(
          and(eq(userRoles.userId, input.userId), eq(userRoles.roleId, input.roleId)),
        );

      await syncUserRoleField(ctx.db, input.userId);

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: "ROLE_REVOKE",
        detail: `Revoked role "${input.roleId}" from ${targetUser.email}`,
        status: "success",
      });

      return { success: true };
    }),

  /** Grant or deny a specific permission directly on a user (overrides role). */
  setUserPermission: requirePermission("roles", "update")
    .input(
      z.object({
        userId: z.string(),
        resource: z.string(),
        action: z.string(),
        granted: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

      const validKeys = new Set(ALL_PERMISSIONS.map((p) => `${p.resource}:${p.action}`));
      if (!validKeys.has(`${input.resource}:${input.action}`)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unknown permission: ${input.resource}:${input.action}`,
        });
      }

      // Upsert
      const existing = await ctx.db.query.userPermissions.findFirst({
        where: and(
          eq(userPermissions.userId, input.userId),
          eq(userPermissions.resource, input.resource),
          eq(userPermissions.action, input.action),
        ),
      });

      if (existing) {
        await ctx.db
          .update(userPermissions)
          .set({ granted: input.granted, grantedBy: ctx.session.user.id })
          .where(eq(userPermissions.id, existing.id));
      } else {
        await ctx.db.insert(userPermissions).values({
          id: crypto.randomUUID(),
          userId: input.userId,
          resource: input.resource,
          action: input.action,
          granted: input.granted,
          grantedBy: ctx.session.user.id,
          createdAt: new Date(),
        });
      }

      await ctx.db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        action: input.granted ? "PERMISSION_GRANT" : "PERMISSION_DENY",
        detail: `${input.granted ? "Granted" : "Denied"} ${input.resource}:${input.action} for ${targetUser.email}`,
        status: "success",
      });

      return { success: true };
    }),

  /** Remove a per-user permission override entirely (falls back to role). */
  removeUserPermission: requirePermission("roles", "update")
    .input(
      z.object({
        userId: z.string(),
        resource: z.string(),
        action: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.resource, input.resource),
            eq(userPermissions.action, input.action),
          ),
        );
      return { success: true };
    }),

  /** Get all effective permissions for a user (resolved from roles + overrides). */
  getUserEffectivePermissions: requirePermission("users", "read")
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getUserEffectivePermissions(input.userId);
    }),

  /** Get a user's roles and per-user permission overrides. */
  getUserRbac: requirePermission("users", "read")
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [assignedUserRoles, overrides] = await Promise.all([
        ctx.db.query.userRoles.findMany({
          where: eq(userRoles.userId, input.userId),
        }),
        ctx.db.query.userPermissions.findMany({
          where: eq(userPermissions.userId, input.userId),
        }),
      ]);

      // Attach role metadata
      const roleIds = assignedUserRoles.map((ur) => ur.roleId);
      const roleRecords =
        roleIds.length > 0
          ? await ctx.db.query.roles.findMany({
              where: (r, { inArray }) => inArray(r.id, roleIds),
            })
          : [];
      const rolesById = new Map(roleRecords.map((r) => [r.id, r]));

      return {
        roles: assignedUserRoles.map((ur) => ({
          ...ur,
          role: rolesById.get(ur.roleId) ?? null,
        })),
        overrides,
      };
    }),

  /** List every permission in the registry (for building UIs). */
  listAvailablePermissions: protectedProcedure.query(() => {
    return ALL_PERMISSIONS;
  }),

  /**
   * Returns the current user's effective permissions as a flat string array
   * ("resource:action"). No special permission required — self-service.
   * Use this in client components to decide which buttons to render.
   */
  myPermissions: protectedProcedure.query(async ({ ctx }) => {
    const perms = await getUserEffectivePermissions(ctx.session.user.id);
    return perms.map((p) => `${p.resource}:${p.action}`);
  }),
});

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/** Keep user.role (comma-sep) in sync with user_roles table. */
async function syncUserRoleField(db: Db, userId: string) {
  const assigned = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
  });
  const roleString = assigned.map((r) => r.roleId).join(",") || "member";
  await db.update(users).set({ role: roleString, updatedAt: new Date() }).where(eq(users.id, userId));
}
