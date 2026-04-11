import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("role", {
  id: text("id").primaryKey(), // e.g. "superadmin", "admin", "member"
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
