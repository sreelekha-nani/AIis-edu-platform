import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const discussionsTable = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: integer("author_id").notNull(),
  subject: text("subject").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const repliesTable = pgTable("replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull(),
  body: text("body").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiscussionSchema = createInsertSchema(discussionsTable).omit({ id: true, createdAt: true, likes: true });
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussionsTable.$inferSelect;

export const insertReplySchema = createInsertSchema(repliesTable).omit({ id: true, createdAt: true });
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Reply = typeof repliesTable.$inferSelect;
