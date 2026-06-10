import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { createHash } from "crypto";

const router = Router();

function hashPassword(pw: string) {
  return createHash("sha256").update(pw + "alis_salt_2024").digest("hex");
}

function makeToken(userId: number, role: string) {
  const payload = Buffer.from(JSON.stringify({ userId, role, ts: Date.now() })).toString("base64");
  return payload;
}

function parseToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return payload;
  } catch {
    return null;
  }
}

// Middleware: attach user to req if token present
export async function authMiddleware(req: any, _res: any, next: any) {
  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const parsed = parseToken(token);
    if (parsed) {
      req.userId = parsed.userId;
      req.userRole = parsed.role;
    }
  }
  next();
}

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  const user = users[0];
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = makeToken(user.id, user.role);
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.post("/auth/register", async (req, res) => {
  const { name, email, password, role, parentEmail } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "All fields required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  let parentId: number | null = null;
  if (parentEmail && role === "student") {
    const parents = await db.select().from(usersTable).where(eq(usersTable.email, parentEmail.toLowerCase()));
    if (parents[0]) parentId = parents[0].id;
  }
  const inserted = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    parentId,
  }).returning();
  const newUser = inserted[0];
  const token = makeToken(newUser.id, newUser.role);
  const { passwordHash: _ph, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req: any, res) => {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId));
  const user = users[0];
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
