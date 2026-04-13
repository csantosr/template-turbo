/**
 * RBAC seed script — idempotent, safe to re-run.
 *
 * Run with:  pnpm --filter @repo/db db:seed:rbac
 *
 * What it does:
 *   1. Upserts system roles: superadmin, admin, member
 *   2. Grants superadmin EVERY permission in the PERMISSIONS registry
 *   3. Grants admin a curated default set
 *   4. member gets read-only defaults
 *
 * Re-run whenever PERMISSIONS grows — superadmin auto-gains new permissions.
 */

import { config } from "dotenv";

config({ path: "../../apps/web/.env", quiet: true });

import { ALL_PERMISSIONS } from "@repo/validators";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/index";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url);
const db = drizzle(client, { schema });

const SYSTEM_ROLES: { id: string; name: string; description: string }[] = [
  {
    id: "superadmin",
    name: "Super Admin",
    description: "Full access to everything. Permissions managed automatically.",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Manages users and settings.",
  },
  {
    id: "member",
    name: "Member",
    description: "Standard member with read-only access.",
  },
];

/** Permissions granted to the admin role by default */
const ADMIN_PERMISSIONS = ALL_PERMISSIONS.filter(
  ({ resource, action }) =>
    // admins can do everything with users except impersonate
    (resource === "users" && action !== "impersonate") ||
    resource === "settings" ||
    // admins can read roles and assign them but not create/delete
    (resource === "roles" && (action === "read" || action === "assign")) ||
    resource === "activity" ||
    // admins can fully manage kanban
    resource === "kanban",
);

/** Permissions granted to the member role by default — settings and kanban read */
const MEMBER_PERMISSIONS = ALL_PERMISSIONS.filter(
  ({ resource, action }) =>
    (resource === "settings" && action === "read") || (resource === "kanban" && action === "read"),
);

const ROLE_PERMISSIONS: Record<string, { resource: string; action: string }[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  member: MEMBER_PERMISSIONS,
};

async function seed() {
  console.log("Seeding RBAC roles and permissions…");

  for (const role of SYSTEM_ROLES) {
    const existing = await db.query.roles.findFirst({
      where: eq(schema.roles.id, role.id),
    });

    if (existing) {
      await db
        .update(schema.roles)
        .set({ name: role.name, description: role.description, updatedAt: new Date() })
        .where(eq(schema.roles.id, role.id));
      console.log(`  Updated role: ${role.id}`);
    } else {
      await db.insert(schema.roles).values({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  Created role: ${role.id}`);
    }
  }

  for (const [roleId, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    // Delete existing and re-insert (handles removed permissions cleanly)
    await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, roleId));

    if (permissions.length > 0) {
      await db.insert(schema.rolePermissions).values(
        permissions.map((p) => ({
          id: crypto.randomUUID(),
          roleId,
          resource: p.resource,
          action: p.action,
          createdAt: new Date(),
        })),
      );
    }
    console.log(`  Synced ${permissions.length} permissions for role: ${roleId}`);
  }

  const allUserRoles = await db.query.userRoles.findMany();
  const usersByRole = new Map<string, Set<string>>();
  for (const ur of allUserRoles) {
    if (!usersByRole.has(ur.userId)) usersByRole.set(ur.userId, new Set());
    usersByRole.get(ur.userId)?.add(ur.roleId);
  }

  let syncedCount = 0;
  for (const [userId, roleIds] of usersByRole) {
    const roleString = [...roleIds].join(",") || "member";
    await db
      .update(schema.users)
      .set({ role: roleString, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
    syncedCount++;
  }
  console.log(`  Synced role field for ${syncedCount} user(s)`);

  console.log("Done.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
