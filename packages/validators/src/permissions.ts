export const PERMISSIONS = {
  users: ["create", "read", "update", "delete", "ban", "impersonate"],
  roles: ["create", "read", "update", "delete", "assign"],
  settings: ["read", "update"],
  activity: ["read"],
  userDeletions: ["read", "restore"],
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Action<R extends Resource> = (typeof PERMISSIONS)[R][number];

export const ALL_PERMISSIONS = (
  Object.entries(PERMISSIONS) as [Resource, readonly string[]][]
).flatMap(([resource, actions]) => actions.map((action) => ({ resource, action })));
