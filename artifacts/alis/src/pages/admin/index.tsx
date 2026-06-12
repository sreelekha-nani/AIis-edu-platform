import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users, Book, PenTool, TrendingUp, GraduationCap,
  BarChart2, BrainCircuit, ArrowRight, Activity, Award
} from "lucide-react";
import {
  useGetPlatformAnalytics, useListUsers, useListCourses, useListTests
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { Link } from "wouter";

const PIE_COLORS = ["#2563EB", "#0EA5E9", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#F97316"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformAnalytics();
  const { data: users, isLoading: usersLoading } = useListUsers({});
  const { data: courses } = useListCourses({});
  const { data: tests } = useListTests({});

  const students = users?.filter(u => u.role === "student") ?? [];
  const teachers = users?.filter(u => u.role === "teacher") ?? [];
  const parents = users?.filter(u => u.role === "parent") ?? [];
  const admins = users?.filter(u => u.role === "admin") ?? [];

  const weeklyActivity = analytics?.weeklyActivity ?? [];
  const subjectBreakdown = analytics?.subjectBreakdown ?? [];

  const pieData = subjectBreakdown.map((s, i) => ({
    name: s.subject,
    value: s.value,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const roleData = [
    { name: "Students", value: students.length, fill: "#2563EB" },
    { name: "Teachers", value: teachers.length, fill: "#14B8A6" },
    { name: "Parents", value: parents.length, fill: "#8B5CF6" },
    { name: "Admins", value: admins.length, fill: "#F59E0B" },
  ];

  const recentUsers = users?.slice(-6).reverse() ?? [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Admin Dashboard 🛡️</h1>
            <p className="text-muted-foreground mt-1">Platform-wide overview and management.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/admin/users"><Users className="w-4 h-4" /> Manage Users</Link>
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/analytics"><BarChart2 className="w-4 h-4" /> Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Students", value: analytics?.totalStudents ?? students.length, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Teachers", value: teachers.length, icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
            { label: "Parents", value: parents.length, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Courses", value: analytics?.totalCourses ?? courses?.length ?? 0, icon: Book, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Tests", value: tests?.length ?? 0, icon: PenTool, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "Enrollments", value: analytics?.totalEnrollments ?? 0, icon: Activity, color: "text-green-500", bg: "bg-green-50" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{analyticsLoading || usersLoading ? "—" : s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-blue-50/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Avg Completion Rate</p>
                <p className="text-3xl font-bold text-primary">{analytics?.completionRate ?? 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Avg Test Score</p>
                <p className="text-3xl font-bold text-teal-600">{analytics?.avgTestScore ?? 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Users (7d)</p>
                <p className="text-3xl font-bold text-purple-600">{analytics?.activeUsers ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Charts */}
          <div className="xl:col-span-2 space-y-6">
            {/* Weekly Activity Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Platform Activity</CardTitle>
                <CardDescription>Total student minutes logged per day</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-48" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" name="Minutes" stroke="#2563EB" fill="url(#actGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Subject Breakdown Bar */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Courses by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-48" /> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={subjectBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Courses" radius={[4, 4, 0, 0]}>
                        {subjectBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* User Role Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? <Skeleton className="h-40" /> : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={roleData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                          {roleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {roleData.map((r) => (
                        <div key={r.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.fill }} />
                          <span className="text-xs text-muted-foreground">{r.name}: <strong>{r.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Users</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-primary text-xs gap-1">
                  <Link href="/admin/users">All <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm text-primary shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize shrink-0">{u.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start gap-2" size="sm">
                  <Link href="/admin/users"><Users className="w-4 h-4" /> User Management</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/admin/courses"><Book className="w-4 h-4" /> Course Oversight</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Link href="/admin/analytics"><BarChart2 className="w-4 h-4" /> Platform Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
