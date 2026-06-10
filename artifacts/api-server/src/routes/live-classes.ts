import { Router } from "express";
import { db, liveClassesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function toResponse(lc: any, teacherName: string) {
  const now = new Date();
  const scheduled = new Date(lc.scheduledAt);
  let status = "upcoming";
  if (scheduled <= now) {
    const endTime = new Date(scheduled.getTime() + lc.duration * 60000);
    status = endTime >= now ? "live" : "completed";
  }
  return {
    ...lc,
    teacherName,
    scheduledAt: lc.scheduledAt.toISOString(),
    status,
  };
}

router.get("/live-classes", async (req: any, res) => {
  const { teacherId, upcoming } = req.query as any;
  let classes = await db.select().from(liveClassesTable);
  if (teacherId) classes = classes.filter(c => c.teacherId === parseInt(teacherId));
  if (upcoming === "true") {
    const now = new Date();
    classes = classes.filter(c => new Date(c.scheduledAt) >= now);
  }
  const teachers = await db.select().from(usersTable);
  const teacherMap = new Map(teachers.map(t => [t.id, t.name]));
  res.json(classes.map(c => toResponse(c, teacherMap.get(c.teacherId) ?? "Unknown")));
});

router.post("/live-classes", async (req: any, res) => {
  const teacherId = req.userId ?? req.body.teacherId ?? 1;
  const { title, subject, description, scheduledAt, duration, meetingLink } = req.body;
  const inserted = await db.insert(liveClassesTable).values({
    title, subject, description, teacherId,
    scheduledAt: new Date(scheduledAt),
    duration, meetingLink,
  }).returning();
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, teacherId));
  res.status(201).json(toResponse(inserted[0], teacher[0]?.name ?? "Unknown"));
});

router.patch("/live-classes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, subject, description, scheduledAt, duration, meetingLink } = req.body;
  const updates: any = {};
  if (title) updates.title = title;
  if (subject) updates.subject = subject;
  if (description) updates.description = description;
  if (scheduledAt) updates.scheduledAt = new Date(scheduledAt);
  if (duration) updates.duration = duration;
  if (meetingLink) updates.meetingLink = meetingLink;
  const updated = await db.update(liveClassesTable).set(updates).where(eq(liveClassesTable.id, id)).returning();
  if (!updated[0]) { res.status(404).json({ error: "Not found" }); return; }
  const teacher = await db.select().from(usersTable).where(eq(usersTable.id, updated[0].teacherId));
  res.json(toResponse(updated[0], teacher[0]?.name ?? "Unknown"));
});

router.delete("/live-classes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(liveClassesTable).where(eq(liveClassesTable.id, id));
  res.status(204).end();
});

export default router;
