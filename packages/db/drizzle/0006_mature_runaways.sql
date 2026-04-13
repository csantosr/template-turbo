CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "kanban_board" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'My Board' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kanban_card" (
	"id" text PRIMARY KEY NOT NULL,
	"column_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" "priority",
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kanban_column" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kanban_board" ADD CONSTRAINT "kanban_board_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanban_card" ADD CONSTRAINT "kanban_card_column_id_kanban_column_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."kanban_column"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanban_column" ADD CONSTRAINT "kanban_column_board_id_kanban_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."kanban_board"("id") ON DELETE cascade ON UPDATE no action;