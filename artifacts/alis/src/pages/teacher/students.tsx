import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListUsers, useListEnrollments, useListTestResults, useGetStudentAnalytics } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { User, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

function StudentRow({ student }: { student: any }) {
  const { data: enrollments } = useListEnrollments({ studentId: student.id }, { query: { enabled: !!student.id } as any });
  const { data: results } = useListTestResults({ studentId: student.id }, { query: { enabled: !!student.id } as any });
  const { data: analytics } = useGetStudentAnalytics(student.id, { query: { enabled: !!student.id } as any });

  const avgScore = analytics?.avgTestScore ?? 0;
  const completion = analytics
    ? Math.round((analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100)
    : 0;
  const testsCount = results?.length ?? 0;
  const coursesCount = enrollments?.length ?? 0;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm">{student.name}</span>
              {student.grade && <Badge variant="secondary" className="text-xs">{student.grade}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
            <div>
              <div className="text-sm font-bold">{coursesCount}</div>
              <div className="text-xs text-muted-foreground">Courses</div>
            </div>
            <div>
              <div className="text-sm font-bold">{testsCount}</div>
              <div className="text-xs text-muted-foreground">Tests</div>
            </div>
            <div>
              <div className={`text-sm font-bold ${avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {Math.round(avgScore)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="w-20">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completion}%</span>
              </div>
              <Progress value={completion} className="h-1.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeacherStudents() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = useListUsers({ role: "student" });

  const filtered = (students ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor student progress and performance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {filtered.length} students
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center"><User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No students found</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(student => <StudentRow key={student.id} student={student} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
