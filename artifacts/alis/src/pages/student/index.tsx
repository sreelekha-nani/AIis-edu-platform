import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Book, Target, CheckCircle, TrendingUp, PlaySquare, CalendarDays, Clock } from "lucide-react";
import { 
  useListEnrollments, 
  useGetRecommendations,
  useListLiveClasses,
  useListTests,
  useListTestResults,
  useGetStudentAnalytics
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useListEnrollments({ studentId: user?.id });
  const { data: recommendations, isLoading: recLoading } = useGetRecommendations({ query: { enabled: !!user?.id } });
  const { data: liveClasses, isLoading: classesLoading } = useListLiveClasses({ upcoming: true });
  const { data: tests, isLoading: testsLoading } = useListTests({});
  const { data: results, isLoading: resultsLoading } = useListTestResults({ studentId: user?.id });
  const { data: analytics } = useGetStudentAnalytics(user?.id || 0, { query: { enabled: !!user?.id } });

  const aiProfile = recommendations?.[0] ? {
    learningStyle: "Visual",
    learningSpeed: "Moderate",
    strongSubjects: ["Math", "Physics"],
    weakSubjects: ["Chemistry"],
    completionRate: analytics?.completionRate || 0,
    engagementScore: 85
  } : null; // In a real app this would come from a specific endpoint

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-outfit">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your learning journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Profile Card */}
          <Card className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary w-5 h-5" />
                AI Learning Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recLoading ? <Skeleton className="h-32 w-full" /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-background p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Learning Style</div>
                    <div className="font-semibold text-lg">{aiProfile?.learningStyle || "Assessing..."}</div>
                  </div>
                  <div className="bg-background p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Strong Subjects</div>
                    <div className="font-semibold">{aiProfile?.strongSubjects?.join(", ") || "Assessing..."}</div>
                  </div>
                  <div className="bg-background p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Engagement</div>
                    <div className="font-semibold text-lg text-primary">{aiProfile?.engagementScore || 0}/100</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Book className="w-4 h-4" /> Enrolled Courses
                </div>
                <div className="font-bold">{enrollments?.length || 0}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" /> Tests Completed
                </div>
                <div className="font-bold">{results?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Courses */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Active Courses</CardTitle>
              <CardDescription>Your current learning paths</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[400px]">
              {enrollmentsLoading ? (
                <div className="space-y-4"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
              ) : enrollments?.length ? (
                <div className="space-y-4">
                  {enrollments.map((enr) => (
                    <Link key={enr.id} href={`/student/courses/${enr.courseId}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer">
                        {enr.courseThumbnail ? (
                          <img src={enr.courseThumbnail} alt={enr.courseTitle} className="w-16 h-16 rounded-md object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                            <Book className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{enr.courseTitle}</h4>
                          <p className="text-xs text-muted-foreground mb-2 truncate">{enr.courseSubject}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={enr.completionRate} className="h-2 flex-1" />
                            <span className="text-xs font-medium">{Math.round(enr.completionRate)}%</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No courses enrolled yet. <Link href="/student/courses" className="text-primary hover:underline">Browse courses</Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations & Upcoming */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : recommendations?.length ? (
                  <div className="space-y-3">
                    {recommendations.slice(0,3).map((rec) => (
                      <div key={rec.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-sm">{rec.title}</h5>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Keep learning to get personalized recommendations.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Upcoming
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classesLoading || testsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="space-y-3">
                    {liveClasses?.slice(0, 2).map((lc) => (
                      <div key={lc.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <PlaySquare className="w-8 h-8 text-secondary" />
                          <div>
                            <p className="text-sm font-medium">{lc.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(lc.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!liveClasses?.length && !tests?.length && (
                      <p className="text-sm text-muted-foreground">No upcoming classes or tests.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
