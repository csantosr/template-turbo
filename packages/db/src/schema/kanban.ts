import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const kanbanBoards = pgTable("kanban_board", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull().default("My Board"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const kanbanColumns = pgTable("kanban_column", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .references(() => kanbanBoards.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const kanbanCards = pgTable("kanban_card", {
  id: text("id").primaryKey(),
  columnId: text("column_id")
    .references(() => kanbanColumns.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: priorityEnum("priority"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
