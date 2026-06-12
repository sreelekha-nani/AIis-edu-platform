import { Router } from "express";
import { db, enrollmentsTable, lessonProgressTable, coursesTable, lessonsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/enrollments", async (req: any, res) => {
  const { studentId, courseId } = req.query as any;
  let enrollments = await db.select().from(enrollmentsTable);
  if (studentId) enrollments = enrollments.filter(e => e.studentId === parseInt(studentId));
  if (courseId) enrollments = enrollments.filter(e => e.courseId === parseInt(courseId));

  const courses = await db.select().from(coursesTable);
  const courseMap = new Map(courses.map(c => [c.id, c]));
  const allLessons = await db.select().from(lessonsTable);
  const lessonsByCoourse = new Map<number, number>();
  for (const l of allLessons) {
    lessonsByCoourse.set(l.courseId, (lessonsByCoourse.get(l.courseId) ?? 0) + 1);
  }
  const allProgress = await db.select().from(lessonProgressTable);
  const progressMap = new Map<string, number>();
  for (const p of allProgress) {
    progressMap.set(`${p.studentId}-${p.courseId}`, (progressMap.get(`${p.studentId}-${p.courseId}`) ?? 0) + 1);
  }

  const result = enrollments.map(e => {
    const course = courseMap.get(e.courseId);
    const totalLessons = lessonsByCoourse.get(e.courseId) ?? 0;
    const completed = progressMap.get(`${e.studentId}-${e.courseId}`) ?? 0;
    const completionRate = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
    return {
      id: e.id,
      studentId: e.studentId,
      courseId: e.courseId,
      courseTitle: course?.title ?? "Unknown Course",
      courseThumbnail: course?.thumbnail ?? null,
      courseSubject: course?.subject ?? "",
      enrolledAt: e.enrolledAt.toISOString(),
      completionRate: Math.round(completionRate * 10) / 10,
    };
  });
  res.json(result);
});

router.post("/enrollments", async (req: any, res) => {
  const studentId = req.body.studentId ?? req.userId;
  const { courseId } = req.body;
  if (!studentId || !courseId) {
    res.status(400).json({ error: "studentId and courseId required" });
    return;
  }
  const existing = await db.select().from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)));
  if (existing.length > 0) {
    const course = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    res.status(201).json({
      ...existing[0],
      courseTitle: course[0]?.title ?? "Unknown",
      courseThumbnail: course[0]?.thumbnail ?? null,
      courseSubject: course[0]?.subject ?? "",
      enrolledAt: existing[0].enrolledAt.toISOString(),
      completionRate: 0,
    });
    return;
  }
  const inserted = await db.insert(enrollmentsTable).values({ studentId, courseId }).returning();
  const course = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
  res.status(201).json({
    ...inserted[0],
    courseTitle: course[0]?.title ?? "Unknown",
    courseThumbnail: course[0]?.thumbnail ?? null,
    courseSubject: course[0]?.subject ?? "",
    enrolledAt: inserted[0].enrolledAt.toISOString(),
    completionRate: 0,
  });
});

router.get("/progress", async (req: any, res) => {
  const { studentId, courseId } = req.query as any;
  let rows = await db.select().from(lessonProgressTable);
  if (studentId) rows = rows.filter(r => r.studentId === parseInt(studentId));
  if (courseId) rows = rows.filter(r => r.courseId === parseInt(courseId));
  res.json(rows.map(r => ({ ...r, completedAt: r.completedAt.toISOString() })));
});

router.post("/progress", async (req: any, res) => {
  const studentId = req.body.studentId ?? req.userId;
  const { lessonId, courseId, timeSpent } = req.body;
  if (!lessonId || !courseId) {
    res.status(400).json({ error: "lessonId and courseId required" });
    return;
  }
  const existing = await db.select().from(lessonProgressTable)
    .where(and(eq(lessonProgressTable.studentId, studentId), eq(lessonProgressTable.lessonId, lessonId)));
  if (existing.length > 0) {
    res.status(201).json({ ...existing[0], completedAt: existing[0].completedAt.toISOString() });
    return;
  }
  const inserted = await db.insert(lessonProgressTable).values({
    studentId, lessonId, courseId, timeSpent: timeSpent ?? 0,
  }).returning();
  res.status(201).json({ ...inserted[0], completedAt: inserted[0].completedAt.toISOString() });
});

export default router;
