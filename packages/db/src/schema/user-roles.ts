import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { users } from "./users";

export const userRoles = pgTable(
  "user_role",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedBy: text("assigned_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique("user_role_unique").on(t.userId, t.roleId)],
);
