import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  useGetParentChildren, useListEnrollments, useGetStudentAnalytics,
  useListTestResults, useGetRecommendations
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle2, XCircle, BrainCircuit, TrendingUp } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

function ChildDetail({ child }: { child: any }) {
  const { data: enrollments } = useListEnrollments({ studentId: child.id }, { query: { enabled: true } as any });
  const { data: analytics } = useGetStudentAnalytics(child.id, { query: { enabled: true } as any });
  const { data: results } = useListTestResults({ studentId: child.id }, { query: { enabled: true } as any });
  const { data: aiData } = useGetRecommendations(child.id, { query: { enabled: true } as any });

  const avgScore = analytics?.avgTestScore ?? 0;
  const completion = analytics
    ? Math.round((analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100)
    : 0;
  const attendance = analytics?.attendance ?? 0;
  const subjectPerf = analytics?.subjectPerformance ?? [];
  const sorted = [...(results ?? [])].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl">
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-lg">{child.name}</h2>
              <p className="text-sm text-muted-foreground">{child.email}</p>
              {child.grade && <Badge variant="secondary" className="text-xs mt-1">{child.grade}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: `${Math.round(avgScore)}%`, color: avgScore >= 70 ? "text-green-600" : "text-red-600" },
          { label: "Completion", value: `${completion}%`, color: "text-blue-600" },
          { label: "Attendance", value: `${Math.round(attendance)}%`, color: "text-purple-600" },
          { label: "Tests Taken", value: results?.length ?? 0, color: "text-orange-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="ai">AI Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {(enrollments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Not enrolled in any courses</p>
          ) : (enrollments ?? []).map(e => (
            <Card key={e.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">{e.courseSubject}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium">{Math.round(e.completionRate)}%</div>
                  <Progress value={e.completionRate} className="h-1.5 w-20 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="results" className="space-y-3 mt-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No tests taken yet</p>
          ) : sorted.map(r => {
            const pct = Math.round((r.correctAnswers / r.totalQuestions) * 100);
            return (
              <Card key={r.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  {pct >= 60
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.testTitle}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-bold shrink-0 ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                    {pct}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          {aiData ? (
            <>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Learning Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Learning Style</p>
                      <p className="font-medium capitalize">{aiData.learningStyle ?? "—"}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="font-medium capitalize">{aiData.learningSpeed ?? "—"}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Strong Subjects</p>
                      <p className="font-medium text-green-700">{(aiData.strongSubjects ?? []).join(", ") || "—"}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Needs Attention</p>
                      <p className="font-medium text-red-700">{(aiData.weakSubjects ?? []).join(", ") || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {subjectPerf.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Subject Performance</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={subjectPerf}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {(aiData.recommendations ?? []).length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">AI Recommendations</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {(aiData.recommendations ?? []).map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-700">{rec.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No AI profile available yet</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ParentChildren() {
  const { user } = useAuth();
  const { data: children, isLoading } = useGetParentChildren(user?.id ?? 0, { query: { enabled: !!user?.id } as any });
  const [activeChild, setActiveChild] = useState<number | null>(null);
  const child = (children ?? []).find(c => c.id === activeChild);

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground text-sm mt-1">Detailed overview of each child's progress</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(children ?? []).map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChild(activeChild === c.id ? null : c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${activeChild === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {c.name.charAt(0).toUpperCase()}
              </span>
              {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : child ? (
          <ChildDetail child={child} />
        ) : (children ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">No children linked to your account</CardContent></Card>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-sm">Select a child above to view their detailed profile</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
