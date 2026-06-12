import { Router } from "express";
import { db, discussionsTable, repliesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function enrichDiscussion(d: any, withReplies = false) {
  const author = await db.select().from(usersTable).where(eq(usersTable.id, d.authorId));
  const replies = await db.select().from(repliesTable).where(eq(repliesTable.discussionId, d.id));
  const enrichedReplies = await Promise.all(replies.map(async r => {
    const rAuthor = await db.select().from(usersTable).where(eq(usersTable.id, r.authorId));
    return {
      ...r,
      authorName: rAuthor[0]?.name ?? "Unknown",
      authorAvatar: rAuthor[0]?.avatar ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }));
  return {
    ...d,
    authorName: author[0]?.name ?? "Unknown",
    authorAvatar: author[0]?.avatar ?? null,
    repliesCount: replies.length,
    createdAt: d.createdAt.toISOString(),
    replies: withReplies ? enrichedReplies : [],
  };
}

router.get("/discussions", async (req: any, res) => {
  const { subject, search } = req.query as any;
  let posts = await db.select().from(discussionsTable);
  if (subject) posts = posts.filter(p => p.subject.toLowerCase() === subject.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.body.toLowerCase().includes(s));
  }
  const results = await Promise.all(posts.map(p => enrichDiscussion(p, true)));
  res.json(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post("/discussions", async (req: any, res) => {
  const authorId = req.userId ?? 1;
  const { title, body, subject } = req.body;
  const inserted = await db.insert(discussionsTable).values({ title, body, subject, authorId }).returning();
  res.status(201).json(await enrichDiscussion(inserted[0], true));
});

router.post("/discussions/:id/replies", async (req: any, res) => {
  const discussionId = parseInt(req.params.id);
  const { body, authorId } = req.body;
  const author = authorId ?? req.userId ?? 1;
  const inserted = await db.insert(repliesTable).values({ discussionId, body, authorId: author }).returning();
  const rAuthor = await db.select().from(usersTable).where(eq(usersTable.id, author));
  res.status(201).json({
    ...inserted[0],
    authorName: rAuthor[0]?.name ?? "Unknown",
    authorAvatar: rAuthor[0]?.avatar ?? null,
    createdAt: inserted[0].createdAt.toISOString(),
  });
});

router.post("/discussions/:id/like", async (req, res) => {
  const id = parseInt(req.params.id);
  const posts = await db.select().from(discussionsTable).where(eq(discussionsTable.id, id));
  if (!posts[0]) { res.status(404).json({ error: "Not found" }); return; }
  const updated = await db.update(discussionsTable)
    .set({ likes: (posts[0].likes ?? 0) + 1 })
    .where(eq(discussionsTable.id, id))
    .returning();
  res.json(await enrichDiscussion(updated[0], false));
});

export default router;
