import { db } from "@repo/db";
import { rolePermissions, userPermissions, userRoles } from "@repo/db";
import { and, eq, inArray } from "drizzle-orm";

/**
 * Resolve whether a user has a given permission.
 *
 * Resolution order (first match wins):
 *   1. User is in the "superadmin" role → always true
 *   2. Explicit user_permission entry → grants or denies regardless of roles
 *   3. Any of the user's roles grants the permission → true
 *   4. Default → false
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> {
  // 1. Check if user is superadmin (short-circuit — no further DB queries needed)
  const superadminRow = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, "superadmin")),
  });
  if (superadminRow) return true;

  // 2. Check explicit per-user override
  const override = await db.query.userPermissions.findFirst({
    where: and(
      eq(userPermissions.userId, userId),
      eq(userPermissions.resource, resource),
      eq(userPermissions.action, action),
    ),
  });
  if (override !== undefined) return override.granted;

  // 3. Check role permissions
  const roles = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
  });
  if (roles.length === 0) return false;

  const roleIds = roles.map((r) => r.roleId);
  const match = await db.query.rolePermissions.findFirst({
    where: and(
      inArray(rolePermissions.roleId, roleIds),
      eq(rolePermissions.resource, resource),
      eq(rolePermissions.action, action),
    ),
  });

  return match !== undefined;
}

/**
 * Fetch every effective permission for a user, merging role grants with
 * per-user overrides. Returns an array of { resource, action } objects.
 */
export async function getUserEffectivePermissions(
  userId: string,
): Promise<{ resource: string; action: string }[]> {
  // Superadmin — all permissions
  const superadminRow = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, "superadmin")),
  });
  if (superadminRow) {
    return db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, "superadmin"),
      columns: { resource: true, action: true },
    });
  }

  // Role-based grants
  const roles = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
  });
  const roleIds = roles.map((r) => r.roleId);

  const roleGrants =
    roleIds.length > 0
      ? await db.query.rolePermissions.findMany({
          where: inArray(rolePermissions.roleId, roleIds),
          columns: { resource: true, action: true },
        })
      : [];

  // Per-user overrides
  const overrides = await db.query.userPermissions.findMany({
    where: eq(userPermissions.userId, userId),
  });

  // Merge: start with role grants, apply overrides
  const map = new Map<string, boolean>();
  for (const g of roleGrants) map.set(`${g.resource}:${g.action}`, true);
  for (const o of overrides) map.set(`${o.resource}:${o.action}`, o.granted);

  return Array.from(map.entries())
    .filter(([, granted]) => granted)
    .map(([key]) => {
      const [resource, action] = key.split(":");
      return { resource: resource!, action: action! };
    });
}
