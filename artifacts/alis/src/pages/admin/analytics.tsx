import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetPlatformAnalytics, useListUsers, useListTestResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { Users, BookOpen, TrendingUp, Award, Activity, Target } from "lucide-react";

const COLORS = ["#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useGetPlatformAnalytics();
  const { data: users } = useListUsers({});
  const { data: allResults } = useListTestResults({});

  const roleDistribution = (() => {
    const counts: Record<string, number> = {};
    (users ?? []).forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  const scoreDistribution = (() => {
    const buckets: Record<string, number> = { "0–39": 0, "40–59": 0, "60–74": 0, "75–89": 0, "90–100": 0 };
    (allResults ?? []).forEach(r => {
      const pct = Math.round((r.correctAnswers / r.totalQuestions) * 100);
      if (pct < 40) buckets["0–39"]++;
      else if (pct < 60) buckets["40–59"]++;
      else if (pct < 75) buckets["60–74"]++;
      else if (pct < 90) buckets["75–89"]++;
      else buckets["90–100"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  })();

  const stats = [
    { label: "Total Students", value: analytics?.totalStudents ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Teachers", value: analytics?.totalTeachers ?? 0, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Courses", value: analytics?.totalCourses ?? 0, icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Enrollments", value: analytics?.totalEnrollments ?? 0, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Avg Test Score", value: `${Math.round(analytics?.avgTestScore ?? 0)}%`, icon: Award, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Completion Rate", value: `${Math.round(analytics?.completionRate ?? 0)}%`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive platform-wide insights</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly activity */}
          {(analytics?.weeklyActivity ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Weekly Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics!.weeklyActivity}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#actGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Subject breakdown */}
          {(analytics?.subjectBreakdown ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Courses by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics!.subjectBreakdown} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Role distribution */}
          {roleDistribution.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Score distribution */}
          {scoreDistribution.some(d => d.count > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreDistribution} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
