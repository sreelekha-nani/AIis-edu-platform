import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users, Book, CheckCircle, TrendingUp, CalendarDays,
  ArrowRight, GraduationCap, BarChart2, BrainCircuit, PlaySquare
} from "lucide-react";
import {
  useGetParentChildren, useListEnrollments, useGetStudentAnalytics,
  useListTestResults, useListLiveClasses, useGetRecommendations
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from "recharts";
import { Link } from "wouter";

const COLORS = ["#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B"];

function ChildCard({ child }: { child: any }) {
  const { data: enrollments } = useListEnrollments({ studentId: child.id }, { query: { enabled: !!child.id } as any });
  const { data: analytics } = useGetStudentAnalytics(child.id, { query: { enabled: !!child.id } as any });
  const { data: results } = useListTestResults({ studentId: child.id }, { query: { enabled: !!child.id } as any });
  const { data: aiData } = useGetRecommendations(child.id, { query: { enabled: !!child.id } as any });

  const avgScore = analytics?.avgTestScore ?? 0;
  const completion = analytics
    ? Math.round((analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100)
    : 0;
  const attendance = analytics?.attendance ?? 0;

  const subjectPerf = analytics?.subjectPerformance ?? [];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {child.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-base">{child.name}</CardTitle>
            <CardDescription>{child.grade ?? "Student"} · {child.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-lg font-bold text-blue-600">{enrollments?.length ?? 0}</p>
            <p className="text-[10px] text-blue-500 font-medium">Courses</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-green-50 border border-green-100">
            <p className="text-lg font-bold text-green-600">{Math.round(avgScore)}%</p>
            <p className="text-[10px] text-green-500 font-medium">Avg Score</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-purple-50 border border-purple-100">
            <p className="text-lg font-bold text-purple-600">{attendance}%</p>
            <p className="text-[10px] text-purple-500 font-medium">Attendance</p>
          </div>
        </div>

        {/* Completion Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Course Completion</span>
            <span className="font-semibold">{Math.round(completion)}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        {/* Subject Performance */}
        {subjectPerf.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Subject Performance</p>
            <div className="space-y-1.5">
              {subjectPerf.map((s) => (
                <div key={s.subject} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 truncate">{s.subject}</span>
                  <Progress value={s.value} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-8 text-right">{Math.round(s.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Test Results */}
        {results && results.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Recent Tests</p>
            <div className="space-y-1.5">
              {results.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-xs font-medium">{r.testTitle ?? `Test #${r.testId}`}</p>
                    <p className="text-[10px] text-muted-foreground">{r.subject ?? ""}</p>
                  </div>
                  <Badge
                    variant={r.score >= 70 ? "default" : "destructive"}
                    className="text-[10px] h-4 px-1.5"
                  >
                    {Math.round(r.score)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestion */}
        {aiData && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-blue-50/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-primary">AI Insight</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {child.name.split(" ")[0]} is a <strong>{aiData.learningStyle}</strong> at a <strong>{aiData.learningSpeed}</strong> pace.
              {aiData.weakSubjects?.length
                ? ` Needs more focus on ${aiData.weakSubjects[0]}.`
                : " Keep up the great work!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: children, isLoading } = useGetParentChildren(user?.id ?? 0, {
    query: { enabled: !!user?.id } as any
  });
  const { data: liveClasses } = useListLiveClasses({ upcoming: true });

  const totalCourses = 0;

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-outfit">
            Parent Dashboard 👨‍👩‍👧
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your {children?.length === 1 ? "child's" : "children's"} academic progress.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Children", value: children?.length ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Upcoming Classes", value: liveClasses?.length ?? 0, icon: PlaySquare, color: "text-green-500", bg: "bg-green-50" },
            { label: "Total Courses", value: children?.length ? children.length * 2 : 0, icon: Book, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Reports Available", value: children?.length ?? 0, icon: BarChart2, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((s) => (
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

        {/* Children Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : children?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No children linked to your account</p>
              <p className="text-sm mt-1">Ask your child to register with your email as parent email.</p>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Classes Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Upcoming Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liveClasses?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveClasses.slice(0, 6).map((lc) => (
                  <div key={lc.id} className="p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2 mb-1">
                      <PlaySquare className="w-4 h-4 text-secondary shrink-0" />
                      <p className="text-xs font-medium truncate">{lc.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{lc.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lc.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-1.5">{lc.duration} min</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming classes scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
