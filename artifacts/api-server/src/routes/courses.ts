import { Router } from "express";
import { db, coursesTable, chaptersTable, lessonsTable, enrollmentsTable, usersTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";

const router = Router();

function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

router.get("/courses", async (req: any, res) => {
  const { teacherId, category, search } = req.query as any;
  let courses = await db.select().from(coursesTable);
  if (teacherId) courses = courses.filter(c => c.teacherId === parseInt(teacherId));
  if (category) courses = courses.filter(c => c.subject.toLowerCase() === category.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
  }
  const teachers = await db.select().from(usersTable);
  const teacherMap = new Map(teachers.map(t => [t.id, t.name]));
  const enrollmentCounts = await db.select().from(enrollmentsTable);
  const countMap = new Map<number, number>();
  for (const e of enrollmentCounts) {
    countMap.set(e.courseId, (countMap.get(e.courseId) ?? 0) + 1);
  }
  const allLessons = await db.select().from(lessonsTable);
  const lessonMap = new Map<number, number>();
  for (const l of allLessons) {
    lessonMap.set(l.courseId, (lessonMap.get(l.courseId) ?? 0) + 1);
  }
  const result = courses.map(c => ({
    ...c,
    teacherName: teacherMap.get(c.teacherId) ?? "Unknown",
    enrolledCount: countMap.get(c.id) ?? 0,
    totalLessons: lessonMap.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/courses", async (req: any, res) => {
  const teacherId = req.userId ?? 1;
  const { title, description, subject, level, thumbnail } = req.body;
  const inserted = await db.insert(coursesTable).values({
    title, description, subject, level, thumbnail, teacherId,
  }).returning();
  const c = inserted[0];
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, c.teacherId));
  res.status(201).json({
    ...c,
    teacherName: teacher[0]?.name ?? "Unknown",
    enrolledCount: 0,
    totalLessons: 0,
    createdAt: c.createdAt.toISOString(),
  });
});

router.get("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  if (!courses[0]) { res.status(404).json({ error: "Course not found" }); return; }
  const c = courses[0];
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, c.teacherId));
  const chapters = await db.select().from(chaptersTable).where(eq(chaptersTable.courseId, id));
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, id));
  const lessonsByChapter = new Map<number | null, any[]>();
  for (const l of lessons) {
    const key = l.chapterId ?? null;
    if (!lessonsByChapter.has(key)) lessonsByChapter.set(key, []);
    lessonsByChapter.get(key)!.push({ ...l, isCompleted: false });
  }
  const sortedChapters = chapters.sort((a, b) => a.order - b.order).map(ch => ({
    ...ch,
    lessons: (lessonsByChapter.get(ch.id) ?? []).sort((a, b) => a.order - b.order),
  }));
  if (lessonsByChapter.has(null) && sortedChapters.length === 0) {
    sortedChapters.push({
      id: 0,
      courseId: id,
      title: "Main Content",
      order: 0,
      createdAt: new Date(),
      lessons: (lessonsByChapter.get(null) ?? []).sort((a: any, b: any) => a.order - b.order),
    });
  }
  const enrollCount = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.courseId, id));
  res.json({
    ...c,
    teacherName: teacher[0]?.name ?? "Unknown",
    enrolledCount: enrollCount.length,
    totalLessons: lessons.length,
    createdAt: c.createdAt.toISOString(),
    chapters: sortedChapters,
  });
});

router.patch("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, subject, level, thumbnail } = req.body;
  const updates: any = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (subject) updates.subject = subject;
  if (level) updates.level = level;
  if (thumbnail !== undefined) updates.thumbnail = thumbnail;
  const updated = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, id)).returning();
  if (!updated[0]) { res.status(404).json({ error: "Course not found" }); return; }
  const c = updated[0];
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, c.teacherId));
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, id));
  res.json({
    ...c,
    teacherName: teacher[0]?.name ?? "Unknown",
    enrolledCount: 0,
    totalLessons: lessons.length,
    createdAt: c.createdAt.toISOString(),
  });
});

router.delete("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(coursesTable).where(eq(coursesTable.id, id));
  res.status(204).end();
});

// Lessons nested under courses
router.get("/courses/:courseId/lessons", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId));
  res.json(lessons.sort((a, b) => a.order - b.order).map(l => ({ ...l, isCompleted: false })));
});

router.post("/courses/:courseId/lessons", async (req: any, res) => {
  const courseId = parseInt(req.params.courseId);
  const { title, type, chapterId, youtubeUrl, notes, pdfUrl, order, duration } = req.body;
  const youtubeId = extractYoutubeId(youtubeUrl);
  const inserted = await db.insert(lessonsTable).values({
    courseId, title, type: type ?? "video",
    chapterId: chapterId ?? null,
    youtubeUrl: youtubeUrl ?? null, youtubeId,
    notes: notes ?? null, pdfUrl: pdfUrl ?? null,
    order: order ?? 0, duration: duration ?? 0,
  }).returning();
  res.status(201).json({ ...inserted[0], isCompleted: false });
});

// Individual lesson routes
router.get("/lessons/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
  if (!lessons[0]) { res.status(404).json({ error: "Lesson not found" }); return; }
  res.json({ ...lessons[0], isCompleted: false });
});

router.patch("/lessons/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, youtubeUrl, notes, pdfUrl, order, duration } = req.body;
  const updates: any = {};
  if (title) updates.title = title;
  if (youtubeUrl !== undefined) {
    updates.youtubeUrl = youtubeUrl;
    updates.youtubeId = extractYoutubeId(youtubeUrl);
  }
  if (notes !== undefined) updates.notes = notes;
  if (pdfUrl !== undefined) updates.pdfUrl = pdfUrl;
  if (order !== undefined) updates.order = order;
  if (duration !== undefined) updates.duration = duration;
  const updated = await db.update(lessonsTable).set(updates).where(eq(lessonsTable.id, id)).returning();
  if (!updated[0]) { res.status(404).json({ error: "Lesson not found" }); return; }
  res.json({ ...updated[0], isCompleted: false });
});

router.delete("/lessons/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
  res.status(204).end();
});

export default router;
