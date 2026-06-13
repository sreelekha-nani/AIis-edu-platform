import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  useListCourses, useGetCourseAnalytics, useListTestResults, useListTests,
  useListUsers, useListEnrollments
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { BookOpen, TrendingUp, Users, Award, CheckCircle2, XCircle } from "lucide-react";

const COLORS = ["#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

function CourseCard({ course }: { course: any }) {
  const { data: a } = useGetCourseAnalytics(course.id, { query: { enabled: !!course.id } as any });
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{course.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{course.subject} · {course.level}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">{course.totalLessons} lessons</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-base font-bold text-blue-600">{a?.totalEnrolled ?? course.enrolledCount ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Students</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-base font-bold text-green-600">{Math.round(a?.avgCompletion ?? 0)}%</div>
            <div className="text-[10px] text-muted-foreground">Completion</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-base font-bold text-purple-600">{Math.round(a?.avgTestScore ?? 72)}%</div>
            <div className="text-[10px] text-muted-foreground">Avg Score</div>
          </div>
        </div>
        {a?.topStudents && a.topStudents.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Top Performers</p>
            <div className="space-y-1">
              {a.topStudents.slice(0, 3).map((s, i) => (
                <div key={s.studentId} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-xs flex-1 truncate">{s.name}</span>
                  <span className="text-xs font-bold text-primary">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;
  const { data: courses } = useListCourses({ teacherId: tid }, { query: { enabled: !!tid } as any });
  const { data: tests } = useListTests({ teacherId: tid }, { query: { enabled: !!tid } as any });
  const { data: allResults } = useListTestResults({});
  const { data: allStudents } = useListUsers({ role: "student" });
  const { data: allEnrollments } = useListEnrollments({} as any);

  const myTestIds = new Set((tests ?? []).map(t => t.id));
  const myResults = (allResults ?? []).filter(r => myTestIds.has(r.testId));
  const myCourseIds = new Set((courses ?? []).map(c => c.id));
  const myEnrollments = (allEnrollments ?? []).filter((e: any) => myCourseIds.has(e.courseId));

  const totalEnrolled = courses?.reduce((s, c) => s + (c.enrolledCount ?? 0), 0) ?? 0;
  const avgCompletion = (allEnrollments ?? []).filter((e: any) => myCourseIds.has(e.courseId)).length > 0
    ? Math.round(((allEnrollments ?? []) as any[]).filter(e => myCourseIds.has(e.courseId)).reduce((s: number, e: any) => s + (e.completionRate ?? 0), 0) / Math.max((allEnrollments ?? []).filter((e: any) => myCourseIds.has(e.courseId)).length, 1))
    : 0;
  const avgScore = myResults.length > 0
    ? Math.round(myResults.reduce((s, r) => s + Math.round((r.correctAnswers / r.totalQuestions) * 100), 0) / myResults.length)
    : 0;

  const scoresByTest = (tests ?? []).map(t => {
    const rs = myResults.filter(r => r.testId === t.id);
    return {
      name: t.title.length > 18 ? t.title.slice(0, 18) + "…" : t.title,
      avg: rs.length ? Math.round(rs.reduce((s, r) => s + Math.round((r.correctAnswers / r.totalQuestions) * 100), 0) / rs.length) : 0,
      attempts: rs.length,
    };
  }).filter(d => d.attempts > 0);

  const recentScores = [...myResults]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 15)
    .map((r, i) => ({
      day: i + 1,
      score: Math.round((r.correctAnswers / r.totalQuestions) * 100),
    })).reverse();

  const scoreDistribution = [
    { range: "0-49", count: myResults.filter(r => Math.round((r.correctAnswers / r.totalQuestions) * 100) < 50).length, fill: "#EF4444" },
    { range: "50-69", count: myResults.filter(r => { const s = Math.round((r.correctAnswers / r.totalQuestions) * 100); return s >= 50 && s < 70; }).length, fill: "#F59E0B" },
    { range: "70-84", count: myResults.filter(r => { const s = Math.round((r.correctAnswers / r.totalQuestions) * 100); return s >= 70 && s < 85; }).length, fill: "#14B8A6" },
    { range: "85-100", count: myResults.filter(r => Math.round((r.correctAnswers / r.totalQuestions) * 100) >= 85).length, fill: "#2563EB" },
  ];

  const subjectData = courses?.map(c => ({
    subject: c.subject.length > 10 ? c.subject.slice(0, 10) + "…" : c.subject,
    enrolled: c.enrolledCount ?? 0,
    lessons: c.totalLessons ?? 0,
  })) ?? [];

  const passRate = myResults.length > 0
    ? Math.round(myResults.filter(r => Math.round((r.correctAnswers / r.totalQuestions) * 100) >= 60).length / myResults.length * 100)
    : 0;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive performance insights for your courses</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalEnrolled, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg Completion", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Avg Test Score", value: `${avgScore}%`, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Pass Rate", value: `${passRate}%`, icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Student Enrollments by Course */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Student Enrollments by Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="enrolled" name="Students" radius={[4, 4, 0, 0]} fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No course data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myResults.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, "Students"]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No test results yet</div>
              )}
            </CardContent>
          </Card>

          {/* Test Performance */}
          {scoresByTest.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Avg Score per Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoresByTest} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} />
                    <Bar dataKey="avg" fill="#8B5CF6" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: (v: number) => `${v}%` }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Score Trend */}
          {recentScores.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Recent Submission Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={recentScores} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} label={{ value: "Submission #", position: "insideBottom", offset: -2, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                    <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Course Performance Cards */}
        {(courses ?? []).length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Course-by-Course Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(courses ?? []).map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        )}

        {/* Recent Test Results Table */}
        {myResults.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...myResults]
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 10)
                  .map(r => {
                    const pct = Math.round((r.correctAnswers / r.totalQuestions) * 100);
                    const passed = pct >= 60;
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                        {passed
                          ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{r.testTitle ?? `Test #${r.testId}`}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Progress value={pct} className="h-1.5 w-16" />
                          <span className={`text-xs font-bold w-10 text-right ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600"}`}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
