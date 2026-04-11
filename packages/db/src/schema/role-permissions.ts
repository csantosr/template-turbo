import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { roles } from "./roles";

export const rolePermissions = pgTable(
  "role_permission",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique("role_permission_unique").on(t.roleId, t.resource, t.action)],
);
