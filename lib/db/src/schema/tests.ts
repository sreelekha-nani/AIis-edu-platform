import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testsTable = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  courseId: integer("course_id"),
  teacherId: integer("teacher_id").notNull(),
  duration: integer("duration").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  text: text("text").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  explanation: text("explanation"),
  order: integer("order").notNull().default(0),
});

export const testResultsTable = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  studentId: integer("student_id").notNull(),
  score: real("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull().default(0),
  answers: text("answers").notNull().default("[]"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestSchema = createInsertSchema(testsTable).omit({ id: true, createdAt: true });
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof testsTable.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;

export const insertTestResultSchema = createInsertSchema(testResultsTable).omit({ id: true, submittedAt: true });
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResultsTable.$inferSelect;
