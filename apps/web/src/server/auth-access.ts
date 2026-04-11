/**
 * Better Auth access control setup.
 *
 * This only governs what Better Auth's admin plugin features (ban, impersonate,
 * revoke sessions, etc.) each role can perform. It is NOT our custom RBAC
 * system — that lives in packages/validators/src/permissions.ts + the DB.
 */
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

/** Admin — full BA admin capabilities */
export const adminRole = ac.newRole({
  ...adminAc.statements,
});

/**
 * Superadmin — same as admin plus can impersonate other admins.
 * The `impersonate-admins` action is what unlocks that.
 */
export const superAdminRole = ac.newRole({
  ...adminAc.statements,
  user: ["impersonate-admins", ...adminAc.statements.user],
});
