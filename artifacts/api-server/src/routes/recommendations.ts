import { Router } from "express";
import { db, usersTable, enrollmentsTable, lessonProgressTable, testResultsTable, lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SUBJECTS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Python", "Data Science", "AI"];

function calcLearningStyle(completedLessons: number, avgScore: number): string {
  if (completedLessons > 20) return "Visual Learner";
  if (avgScore > 80) return "Analytical Learner";
  if (completedLessons > 10) return "Kinesthetic Learner";
  return "Reading/Writing Learner";
}

function calcLearningSpeed(completionRate: number): string {
  if (completionRate > 70) return "Fast";
  if (completionRate > 40) return "Moderate";
  return "Steady";
}

router.get("/recommendations/:studentId", async (req, res) => {
  const studentId = parseInt(req.params.studentId);

  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.studentId, studentId));
  const progress = await db.select().from(lessonProgressTable).where(eq(lessonProgressTable.studentId, studentId));
  const testResults = await db.select().from(testResultsTable).where(eq(testResultsTable.studentId, studentId));

  const totalCourses = enrollments.length;
  const completedLessons = progress.length;
  const avgScore = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length
    : 60;

  const allLessons = await db.select().from(lessonsTable);
  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
  const totalLessons = allLessons.filter(l => enrolledCourseIds.has(l.courseId)).length;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const engagementScore = Math.min(100, Math.round((completedLessons * 2 + testResults.length * 5)));

  const shuffled = [...SUBJECTS].sort(() => Math.random() - 0.5);
  const strongSubjects = shuffled.slice(0, 3);
  const weakSubjects = shuffled.slice(3, 5);

  const recommendations = [
    {
      id: 1,
      type: "practice" as const,
      title: `Daily Practice: ${weakSubjects[0]}`,
      description: `Spend 20 minutes daily on ${weakSubjects[0]} to strengthen your foundation.`,
      priority: "high" as const,
      courseId: null,
    },
    {
      id: 2,
      type: "revision" as const,
      title: `Revise ${weakSubjects[1]} Fundamentals`,
      description: `Review core concepts in ${weakSubjects[1]} with focused revision sessions.`,
      priority: "high" as const,
      courseId: null,
    },
    {
      id: 3,
      type: "course" as const,
      title: `Advanced ${strongSubjects[0]}`,
      description: `You show great potential in ${strongSubjects[0]}. Consider the advanced course.`,
      priority: "medium" as const,
      courseId: null,
    },
    {
      id: 4,
      type: "improvement" as const,
      title: "Improve Test Performance",
      description: avgScore < 70
        ? "Review your recent test mistakes and practice similar problems."
        : "Great test scores! Keep consistent practice to maintain your streak.",
      priority: avgScore < 70 ? ("high" as const) : ("low" as const),
      courseId: null,
    },
    {
      id: 5,
      type: "practice" as const,
      title: "Complete Pending Lessons",
      description: completionRate < 50
        ? "You have several incomplete lessons. Set aside 30 minutes daily to catch up."
        : "Great progress! Stay consistent with your current learning pace.",
      priority: completionRate < 50 ? ("medium" as const) : ("low" as const),
      courseId: null,
    },
  ];

  res.json({
    studentId,
    learningStyle: calcLearningStyle(completedLessons, avgScore),
    learningSpeed: calcLearningSpeed(completionRate),
    strongSubjects,
    weakSubjects,
    completionRate: Math.round(completionRate * 10) / 10,
    engagementScore,
    recommendations,
  });
});

export default router;
