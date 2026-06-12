import { Router } from "express";
import { db, assignmentsTable, assignmentSubmissionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/assignments", async (req: any, res) => {
  const { teacherId, subject } = req.query as any;
  let assignments = await db.select().from(assignmentsTable);
  if (teacherId) assignments = assignments.filter(a => a.teacherId === parseInt(teacherId));
  if (subject) assignments = assignments.filter(a => a.subject.toLowerCase() === subject.toLowerCase());
  const teachers = await db.select().from(usersTable);
  const teacherMap = new Map(teachers.map(t => [t.id, t.name]));
  const result = assignments.map(a => ({
    ...a,
    teacherName: teacherMap.get(a.teacherId) ?? "Unknown",
    dueDate: a.dueDate.toISOString(),
    createdAt: a.createdAt.toISOString(),
  })).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  res.json(result);
});

router.post("/assignments", async (req: any, res) => {
  const { title, description, subject, dueDate, maxScore, courseId } = req.body;
  const teacherId = req.userId ?? 1;
  const [inserted] = await db.insert(assignmentsTable).values({
    title, description, subject, teacherId,
    dueDate: new Date(dueDate),
    maxScore: maxScore ?? 100,
    courseId: courseId ?? null,
  }).returning();
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, teacherId));
  res.status(201).json({ ...inserted, teacherName: teacher[0]?.name ?? "Unknown", dueDate: inserted.dueDate.toISOString(), createdAt: inserted.createdAt.toISOString() });
});

router.get("/assignments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Assignment not found" }); return; }
  const a = rows[0];
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, a.teacherId));
  res.json({ ...a, teacherName: teacher[0]?.name ?? "Unknown", dueDate: a.dueDate.toISOString(), createdAt: a.createdAt.toISOString() });
});

router.post("/assignments/:id/submit", async (req: any, res) => {
  const assignmentId = parseInt(req.params.id);
  const { studentId, content } = req.body;
  const [inserted] = await db.insert(assignmentSubmissionsTable).values({
    assignmentId, studentId: studentId ?? req.userId, content,
  }).returning();
  res.status(201).json({ ...inserted, submittedAt: inserted.submittedAt.toISOString() });
});

router.get("/assignments/:id/submissions", async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const subs = await db.select().from(assignmentSubmissionsTable).where(eq(assignmentSubmissionsTable.assignmentId, assignmentId));
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.name]));
  res.json(subs.map(s => ({ ...s, studentName: userMap.get(s.studentId) ?? "Unknown", submittedAt: s.submittedAt.toISOString() })));
});

export default router;
