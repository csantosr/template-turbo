/**
 * Central permission registry — the source of truth for every resource/action
 * that exists in the system.
 *
 * HOW TO ADD NEW PERMISSIONS:
 *   1. Add the resource (or new actions to an existing resource) below.
 *   2. Run `pnpm db:seed:rbac` — superadmin auto-gains every permission here.
 *   3. Use `requirePermission("resource", "action")` in new tRPC procedures.
 *
 * TypeScript will error at build time if you reference a resource/action that
 * isn't in this file, preventing silent mismatches.
 */
export const PERMISSIONS = {
  users: ["create", "read", "update", "delete", "ban", "impersonate"],
  roles: ["create", "read", "update", "delete", "assign"],
  settings: ["read", "update"],
  activity: ["read"],
  userDeletions: ["read", "restore"],
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Action<R extends Resource> = (typeof PERMISSIONS)[R][number];

/** Flat list of every permission as { resource, action } — useful for UIs. */
export const ALL_PERMISSIONS = (
  Object.entries(PERMISSIONS) as [Resource, readonly string[]][]
).flatMap(([resource, actions]) => actions.map((action) => ({ resource, action })));
