import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useGetParentChildren, useListTestResults, useGetStudentAnalytics, useListEnrollments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CheckCircle2, XCircle, TrendingUp, BookOpen } from "lucide-react";

function ChildReport({ child }: { child: any }) {
  const { data: analytics } = useGetStudentAnalytics(child.id, { query: { enabled: true } as any });
  const { data: results } = useListTestResults({ studentId: child.id }, { query: { enabled: true } as any });
  const { data: enrollments } = useListEnrollments({ studentId: child.id }, { query: { enabled: true } as any });

  const avgScore = analytics?.avgTestScore ?? 0;
  const completion = analytics
    ? Math.round((analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100)
    : 0;
  const subjectData = analytics?.subjectPerformance ?? [];
  const recentResults = [...(results ?? [])].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">
            {child.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-base">{child.name}</CardTitle>
            {child.grade && <Badge variant="secondary" className="text-xs mt-0.5">{child.grade}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">{Math.round(avgScore)}%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">{completion}%</div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-lg font-bold text-purple-600">{enrollments?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Courses</div>
          </div>
        </div>

        {/* Subject performance chart */}
        {subjectData.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Subject Performance</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={subjectData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`]} />
                <Bar dataKey="value" fill="#2563EB" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent results */}
        {recentResults.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Tests</p>
            <div className="space-y-1.5">
              {recentResults.map(r => {
                const pct = Math.round((r.correctAnswers / r.totalQuestions) * 100);
                return (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    {pct >= 60 ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    <span className="flex-1 truncate">{r.testTitle}</span>
                    <span className={`font-bold ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course progress */}
        {(enrollments ?? []).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Course Progress</p>
            <div className="space-y-2">
              {(enrollments ?? []).map(e => (
                <div key={e.id}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="truncate flex-1 mr-2">{e.courseTitle}</span>
                    <span className="font-medium shrink-0">{Math.round(e.completionRate)}%</span>
                  </div>
                  <Progress value={e.completionRate} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentReports() {
  const { user } = useAuth();
  const { data: children, isLoading } = useGetParentChildren(user?.id ?? 0, { query: { enabled: !!user?.id } as any });

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Progress Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive academic reports for each child</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (children ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">No children linked to your account</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(children ?? []).map(child => <ChildReport key={child.id} child={child} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
