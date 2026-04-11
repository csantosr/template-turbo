import { db, rolePermissions, userPermissions, userRoles } from "@repo/db";
import { and, eq, inArray } from "drizzle-orm";

export async function checkPermission(
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> {
  const superadminRow = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, "superadmin")),
  });
  if (superadminRow) return true;

  const override = await db.query.userPermissions.findFirst({
    where: and(
      eq(userPermissions.userId, userId),
      eq(userPermissions.resource, resource),
      eq(userPermissions.action, action),
    ),
  });
  if (override !== undefined) return override.granted;

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

export async function getUserEffectivePermissions(
  userId: string,
): Promise<{ resource: string; action: string }[]> {
  const superadminRow = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, "superadmin")),
  });
  if (superadminRow) {
    return db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, "superadmin"),
      columns: { resource: true, action: true },
    });
  }

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

  const overrides = await db.query.userPermissions.findMany({
    where: eq(userPermissions.userId, userId),
  });

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
