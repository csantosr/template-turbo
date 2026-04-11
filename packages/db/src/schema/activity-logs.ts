import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const activityLogs = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  detail: text("detail"),
  status: text("status").notNull().default("success"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
