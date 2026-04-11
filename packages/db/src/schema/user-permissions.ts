import { boolean, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userPermissions = pgTable(
  "user_permission",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    /** true = explicit grant, false = explicit deny (overrides role grants) */
    granted: boolean("granted").notNull(),
    grantedBy: text("granted_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique("user_permission_unique").on(t.userId, t.resource, t.action)],
);
