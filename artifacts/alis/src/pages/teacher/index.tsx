import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users, Book, PenTool, Plus, PlaySquare, TrendingUp,
  ArrowRight, Clock, GraduationCap, BarChart2
} from "lucide-react";
import {
  useListCourses, useListTests, useListLiveClasses,
  useListEnrollments, useGetCourseAnalytics, useListTestResults, useListUsers
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#2563EB", "#0EA5E9", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;

  const { data: courses, isLoading: coursesLoading } = useListCourses(
    { teacherId: tid }, { query: { enabled: !!tid } as any }
  );
  const { data: tests, isLoading: testsLoading } = useListTests(
    { teacherId: tid }, { query: { enabled: !!tid } as any }
  );
  const { data: liveClasses, isLoading: classesLoading } = useListLiveClasses(
    { teacherId: tid }, { query: { enabled: !!tid } as any }
  );
  const { data: students } = useListUsers({ role: "student" });
  const { data: allResults } = useListTestResults({});

  const upcomingClasses = liveClasses?.filter(lc => lc.status === "upcoming") ?? [];
  const completedClasses = liveClasses?.filter(lc => lc.status === "completed") ?? [];

  const totalEnrolled = courses?.reduce((s, c) => s + (c.enrolledCount ?? 0), 0) ?? 0;

  // Build subject performance from courses taught
  const subjectData = courses?.map((c) => ({
    subject: c.subject.slice(0, 10),
    enrolled: c.enrolledCount ?? 0,
    lessons: c.totalLessons ?? 0,
  })) ?? [];

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              Welcome, {user?.name?.split(" ").slice(0, 2).join(" ")} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.subject ? `${user.subject} · ` : ""}Manage your courses, tests, and students.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild size="sm" className="gap-2">
              <Link href="/teacher/courses">
                <Plus className="w-4 h-4" /> New Course
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/teacher/tests">
                <PenTool className="w-4 h-4" /> New Test
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/teacher/live-classes">
                <PlaySquare className="w-4 h-4" /> Schedule Class
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "My Courses", value: courses?.length ?? 0, icon: Book, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Total Students", value: totalEnrolled, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "My Tests", value: tests?.length ?? 0, icon: PenTool, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Live Classes", value: liveClasses?.length ?? 0, icon: PlaySquare, color: "text-amber-500", bg: "bg-amber-500/10" },
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Courses */}
          <div className="xl:col-span-2 space-y-6">
            {/* Course Enrollment Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Student Enrollments by Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coursesLoading ? <Skeleton className="h-48" /> : subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="enrolled" name="Students" radius={[4, 4, 0, 0]}>
                        {subjectData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No course data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* My Courses Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">My Courses</CardTitle>
                  <CardDescription>Manage and track your courses</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-primary text-xs gap-1">
                  <Link href="/teacher/courses">View all <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : courses?.length ? (
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Book className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">{course.title}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">{course.level}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{course.subject} · {course.totalLessons ?? 0} lessons</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{course.enrolledCount ?? 0} students enrolled</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Book className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted-foreground">No courses yet.</p>
                    <Button asChild size="sm" className="mt-3 gap-1">
                      <Link href="/teacher/courses"><Plus className="w-3 h-3" /> Create your first course</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* My Tests */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">My Tests</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-primary text-xs gap-1">
                  <Link href="/teacher/tests">All <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {testsLoading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                ) : tests?.length ? (
                  <div className="space-y-2">
                    {tests.slice(0, 4).map((test) => (
                      <div key={test.id} className="p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium truncate flex-1">{test.title}</p>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">{test.duration}m</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{test.subject}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No tests created yet.</p>
                    <Button asChild size="sm" variant="outline" className="mt-2 gap-1 text-xs">
                      <Link href="/teacher/tests"><Plus className="w-3 h-3" /> Create test</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Live Classes */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Live Classes</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-primary text-xs gap-1">
                  <Link href="/teacher/live-classes">All <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <Skeleton className="h-24" />
                ) : upcomingClasses.length ? (
                  <div className="space-y-2.5">
                    {upcomingClasses.slice(0, 3).map((lc) => (
                      <div key={lc.id} className="p-3 rounded-xl border border-border/60 bg-muted/20">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium truncate flex-1">{lc.title}</p>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-green-600 border-green-200 shrink-0 ml-1">
                            upcoming
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lc.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {" · "}{lc.duration}m
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No upcoming sessions.</p>
                    <Button asChild size="sm" variant="outline" className="mt-2 gap-1 text-xs">
                      <Link href="/teacher/live-classes"><Plus className="w-3 h-3" /> Schedule class</Link>
                    </Button>
                  </div>
                )}
                {completedClasses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">{completedClasses.length} class{completedClasses.length > 1 ? "es" : ""} completed</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start gap-2" size="sm">
                  <Link href="/teacher/courses"><Plus className="w-4 h-4" /> Create New Course</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/teacher/tests"><PenTool className="w-4 h-4" /> Build a Test</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/teacher/live-classes"><PlaySquare className="w-4 h-4" /> Schedule Live Class</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/teacher/students"><Users className="w-4 h-4" /> View Students</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/teacher/analytics"><TrendingUp className="w-4 h-4" /> Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
