import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  useListCourses, useGetCourseAnalytics, useListTestResults, useListTests
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { useState } from "react";
import { BookOpen, TrendingUp, Users, Award } from "lucide-react";

function CourseAnalyticsCard({ courseId, title }: { courseId: number; title: string }) {
  const { data: analytics } = useGetCourseAnalytics(courseId, { query: { enabled: !!courseId } as any });

  if (!analytics) return (
    <Card>
      <CardContent className="p-4">
        <p className="font-medium text-sm mb-1">{title}</p>
<<<<<<< HEAD
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
=======
        <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold line-clamp-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-primary">{analytics.totalEnrolled}</div>
            <div className="text-xs text-muted-foreground">Enrolled</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{Math.round(analytics.avgCompletion ?? 0)}%</div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">{Math.round(analytics.avgTestScore ?? 0)}%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>
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

  const myTestIds = new Set((tests ?? []).map(t => t.id));
  const myResults = (allResults ?? []).filter(r => myTestIds.has(r.testId));

  const scoresByTest = (tests ?? []).map(t => {
    const rs = myResults.filter(r => r.testId === t.id);
    return {
      name: t.title.length > 20 ? t.title.slice(0, 20) + "…" : t.title,
      avg: rs.length ? Math.round(rs.reduce((s, r) => s + Math.round((r.correctAnswers / r.totalQuestions) * 100), 0) / rs.length) : 0,
      attempts: rs.length,
    };
  }).filter(d => d.attempts > 0);

  const recentResults = [...myResults]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 20)
    .map(r => ({
      date: new Date(r.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: Math.round((r.correctAnswers / r.totalQuestions) * 100),
    }));

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Insights into your courses and students</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "My Courses", value: courses?.length ?? 0, icon: BookOpen, color: "text-blue-600" },
            { label: "Total Students", value: (courses ?? []).reduce((s, c) => s + (c.enrolledCount ?? 0), 0), icon: Users, color: "text-green-600" },
            { label: "Tests Created", value: tests?.length ?? 0, icon: Award, color: "text-purple-600" },
            { label: "Test Attempts", value: myResults.length, icon: TrendingUp, color: "text-orange-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
<<<<<<< HEAD
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
=======
                <div className={`w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center ${s.color}`}>
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
                  <s.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scoresByTest.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Average Score by Test</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoresByTest} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} />
                    <Bar dataKey="avg" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {recentResults.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Recent Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={recentResults.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                    <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-sm mb-3">Course Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(courses ?? []).map(c => <CourseAnalyticsCard key={c.id} courseId={c.id} title={c.title} />)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
