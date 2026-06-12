import { Router } from "express";
import { db, testsTable, questionsTable, testResultsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/tests", async (req: any, res) => {
  const { courseId, teacherId } = req.query as any;
  let tests = await db.select().from(testsTable);
  if (courseId) tests = tests.filter(t => t.courseId === parseInt(courseId));
  if (teacherId) tests = tests.filter(t => t.teacherId === parseInt(teacherId));
  const allQ = await db.select().from(questionsTable);
  const qMap = new Map<number, number>();
  for (const q of allQ) qMap.set(q.testId, (qMap.get(q.testId) ?? 0) + 1);
  res.json(tests.map(t => ({
    ...t,
    totalQuestions: qMap.get(t.id) ?? 0,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/tests", async (req: any, res) => {
  const teacherId = req.userId ?? 1;
  const { title, subject, courseId, duration, questions } = req.body;
  const inserted = await db.insert(testsTable).values({
    title, subject, courseId: courseId ?? null, teacherId, duration: duration ?? 30,
  }).returning();
  const test = inserted[0];
  if (questions && Array.isArray(questions)) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await db.insert(questionsTable).values({
        testId: test.id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation ?? null,
        order: i,
      });
    }
  }
  res.status(201).json({ ...test, totalQuestions: questions?.length ?? 0, createdAt: test.createdAt.toISOString() });
});

router.get("/tests/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const tests = await db.select().from(testsTable).where(eq(testsTable.id, id));
  if (!tests[0]) { res.status(404).json({ error: "Test not found" }); return; }
  const questions = await db.select().from(questionsTable).where(eq(questionsTable.testId, id));
  res.json({
    ...tests[0],
    totalQuestions: questions.length,
    createdAt: tests[0].createdAt.toISOString(),
    questions: questions.sort((a, b) => a.order - b.order),
  });
});

router.post("/tests/:id/submit", async (req: any, res) => {
  const testId = parseInt(req.params.id);
  const studentId = req.body.studentId ?? req.userId;
  const { answers } = req.body;
  const questions = await db.select().from(questionsTable).where(eq(questionsTable.testId, testId));
  const qMap = new Map(questions.map(q => [q.id, q]));
  let correct = 0;
  const answerResults = (answers ?? []).map((a: any) => {
    const q = qMap.get(a.questionId);
    const isCorrect = q ? q.correctOption === a.selectedOption : false;
    if (isCorrect) correct++;
    return {
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      correctOption: q?.correctOption ?? 0,
      isCorrect,
      explanation: q?.explanation ?? null,
    };
  });
  const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
  const test = await db.select().from(testsTable).where(eq(testsTable.id, testId));
  const inserted = await db.insert(testResultsTable).values({
    testId, studentId,
    score: Math.round(score * 10) / 10,
    totalQuestions: questions.length,
    correctAnswers: correct,
    answers: JSON.stringify(answerResults),
  }).returning();
  res.json({
    ...inserted[0],
    testTitle: test[0]?.title ?? "Unknown",
    subject: test[0]?.subject ?? "",
    submittedAt: inserted[0].submittedAt.toISOString(),
    answers: answerResults,
  });
});

router.get("/test-results", async (req: any, res) => {
  const { studentId, testId } = req.query as any;
  let results = await db.select().from(testResultsTable);
  if (studentId) results = results.filter(r => r.studentId === parseInt(studentId));
  if (testId) results = results.filter(r => r.testId === parseInt(testId));
  const allTests = await db.select().from(testsTable);
  const testMap = new Map(allTests.map(t => [t.id, t]));
  res.json(results.map(r => ({
    ...r,
    testTitle: testMap.get(r.testId)?.title ?? "Unknown",
    subject: testMap.get(r.testId)?.subject ?? "",
    submittedAt: r.submittedAt.toISOString(),
    answers: JSON.parse(r.answers),
  })));
});

export default router;
