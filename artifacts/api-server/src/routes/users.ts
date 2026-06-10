import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

function safeUser(u: any) {
  const { passwordHash: _ph, ...rest } = u;
  return rest;
}

router.get("/users", async (req: any, res) => {
  let rows = await db.select().from(usersTable);
  const { role, search } = req.query as any;
  if (role) rows = rows.filter(u => u.role === role);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }
  res.json(rows.map(safeUser));
});

router.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!users[0]) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(users[0]));
});

router.patch("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, bio, subject, grade, avatar } = req.body;
  const updates: any = {};
  if (name) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (subject !== undefined) updates.subject = subject;
  if (grade !== undefined) updates.grade = grade;
  if (avatar !== undefined) updates.avatar = avatar;
  const updated = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated[0]) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(updated[0]));
});

router.get("/users/:id/children", async (req, res) => {
  const parentId = parseInt(req.params.id);
  const children = await db.select().from(usersTable).where(eq(usersTable.parentId, parentId));
  res.json(children.map(safeUser));
});

export default router;
