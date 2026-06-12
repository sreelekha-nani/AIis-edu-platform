import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function safeUser(u: any) {
  const { passwordHash: _ph, ...rest } = u;
  return rest;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "alis_salt_2024").digest("hex");
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

router.post("/users", async (req: any, res) => {
  const { name, email, password, role, grade, subject } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password, and role are required" }); return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing[0]) { res.status(409).json({ error: "Email already in use" }); return; }
  const passwordHash = hashPassword(password);
  const created = await db.insert(usersTable).values({
    name, email: email.toLowerCase(), passwordHash, role, grade: grade ?? null, subject: subject ?? null,
  }).returning();
  res.status(201).json(safeUser(created[0]));
});

router.patch("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, bio, subject, grade, avatar, role } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (subject !== undefined) updates.subject = subject;
  if (grade !== undefined) updates.grade = grade;
  if (avatar !== undefined) updates.avatar = avatar;
  if (role !== undefined) updates.role = role;
  const updated = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated[0]) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(updated[0]));
});

router.delete("/users/:id", async (req: any, res) => {
  const id = parseInt(req.params.id);
  const requestingUserId = req.user?.userId;
  if (id === requestingUserId) {
    res.status(400).json({ error: "Cannot delete your own account" }); return;
  }
  const deleted = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted[0]) { res.status(404).json({ error: "User not found" }); return; }
  res.status(204).send();
});

router.get("/users/:id/children", async (req, res) => {
  const parentId = parseInt(req.params.id);
  const children = await db.select().from(usersTable).where(eq(usersTable.parentId, parentId));
  res.json(children.map(safeUser));
});

export default router;
