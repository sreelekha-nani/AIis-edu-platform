import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  teacherId: integer("teacher_id").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chaptersTable = pgTable("chapters", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  chapterId: integer("chapter_id"),
  title: text("title").notNull(),
  type: text("type").notNull().default("video"),
  youtubeUrl: text("youtube_url"),
  youtubeId: text("youtube_id"),
  notes: text("notes"),
  pdfUrl: text("pdf_url"),
  order: integer("order").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const insertChapterSchema = createInsertSchema(chaptersTable).omit({ id: true, createdAt: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chaptersTable.$inferSelect;

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
