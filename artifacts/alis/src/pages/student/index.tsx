import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BrainCircuit, Book, Target, CheckCircle, PlaySquare,
  CalendarDays, Clock, TrendingUp, Zap, BarChart2, ArrowRight
} from "lucide-react";
import {
  useListEnrollments,
  useGetRecommendations,
  useListLiveClasses,
  useListTests,
  useListTestResults,
  useGetStudentAnalytics,
} from "@workspace/api-client-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const sid = user?.id ?? 0;

  const { data: enrollments, isLoading: enrollmentsLoading } = useListEnrollments(
    { studentId: sid }, { query: { enabled: !!sid } as any }
  );
  const { data: aiData, isLoading: aiLoading } = useGetRecommendations(sid, {
    query: { enabled: !!sid } as any
  });
  const { data: liveClasses, isLoading: classesLoading } = useListLiveClasses({ upcoming: true });
  const { data: tests } = useListTests({});
  const { data: results } = useListTestResults({ studentId: sid }, { query: { enabled: !!sid } as any });
  const { data: analytics } = useGetStudentAnalytics(sid, { query: { enabled: !!sid } as any });

  const completionRate = analytics
    ? Math.round((analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100)
    : 0;
  const avgScore = analytics?.avgTestScore ?? 0;
  const progressData = analytics?.progressOverTime ?? [];
  const subjectData = analytics?.subjectPerformance ?? [];

  const radarData = subjectData.map((s) => ({ subject: s.subject.slice(0, 8), score: s.value }));

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-outfit">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground">Here's your learning overview for today.</p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Enrolled Courses", value: enrollments?.length ?? 0, icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Lessons Done", value: analytics?.completedLessons ?? 0, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
            { label: "Tests Taken", value: results?.length ?? 0, icon: BarChart2, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Avg Score", value: `${Math.round(avgScore)}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* AI Learning Profile */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuit className="text-primary w-5 h-5" />
                  AI Learning Profile
                </CardTitle>
                <CardDescription>Personalized insights based on your activity</CardDescription>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : aiData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-background p-3 rounded-xl border border-border/60 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Style</p>
                        <p className="font-semibold text-sm">{aiData.learningStyle}</p>
                      </div>
                      <div className="bg-background p-3 rounded-xl border border-border/60 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Speed</p>
                        <p className="font-semibold text-sm">{aiData.learningSpeed}</p>
                      </div>
                      <div className="bg-background p-3 rounded-xl border border-border/60 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Strong In</p>
                        <p className="font-semibold text-sm truncate">{aiData.strongSubjects?.slice(0,2).join(", ")}</p>
                      </div>
                      <div className="bg-background p-3 rounded-xl border border-border/60 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Engagement</p>
                        <p className="font-semibold text-sm text-primary">{aiData.engagementScore}/100</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5 text-xs">
                        <span className="text-muted-foreground font-medium">Overall Completion</span>
                        <span className="font-semibold">{aiData.completionRate}%</span>
                      </div>
                      <Progress value={aiData.completionRate} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete some lessons to generate your AI profile.</p>
                )}
              </CardContent>
            </Card>

            {/* Progress Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" name="Progress %" stroke="#2563EB" fill="url(#progressGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Courses */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Active Courses</CardTitle>
                  <CardDescription>Your current learning paths</CardDescription>
                </div>
                <Link href="/student/courses" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  Browse all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : enrollments?.length ? (
                  <div className="space-y-3">
                    {enrollments.map((enr) => (
                      <Link key={enr.id} href={`/student/courses/${enr.courseId}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border cursor-pointer">
                          {enr.courseThumbnail ? (
                            <img src={enr.courseThumbnail} alt={enr.courseTitle} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Book className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{enr.courseTitle}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{enr.courseSubject}</p>
                            <div className="flex items-center gap-2">
                              <Progress value={enr.completionRate} className="h-1.5 flex-1" />
                              <span className="text-xs font-semibold text-muted-foreground">{Math.round(enr.completionRate)}%</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Book className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No courses enrolled yet.</p>
                    <Link href="/student/courses" className="text-xs text-primary hover:underline mt-1 inline-block">Browse courses →</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : aiData?.recommendations?.length ? (
                  <div className="space-y-2.5">
                    {aiData.recommendations.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                        <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-xs">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                          <Badge variant="outline" className="text-[10px] mt-1.5 h-4 px-1.5">
                            {rec.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Keep learning to get personalized recommendations.</p>
                )}
              </CardContent>
            </Card>

            {/* Subject Performance Radar */}
            {radarData.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Subject Scores</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Classes */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Upcoming
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <Skeleton className="h-24" />
                ) : liveClasses?.length ? (
                  <div className="space-y-2.5">
                    {liveClasses.slice(0, 3).map((lc) => (
                      <div key={lc.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                          <PlaySquare className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{lc.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(lc.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No upcoming sessions.</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tests */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {tests?.length ? (
                  <div className="space-y-2">
                    {tests.slice(0, 3).map((t) => (
                      <Link key={t.id} href="/student/tests">
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:bg-muted/30 cursor-pointer transition-colors">
                          <div>
                            <p className="text-xs font-medium">{t.title}</p>
                            <p className="text-xs text-muted-foreground">{t.subject} · {t.duration} min</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tests scheduled.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
