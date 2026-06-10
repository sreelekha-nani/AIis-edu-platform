import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListCourses, useDeleteCourse, useGetCourseAnalytics } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Users, Trash2, TrendingUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function CourseRow({ course }: { course: any }) {
  const { data: analytics } = useGetCourseAnalytics(course.id, { query: { enabled: true } as any });
  const deleteCourse = useDeleteCourse();
  const qc = useQueryClient();

  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-gray-50/60 transition-colors border-b last:border-b-0">
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{course.title}</p>
          <p className="text-xs text-muted-foreground">{course.teacherName}</p>
        </div>
      </div>
      <div className="col-span-2 hidden sm:block">
        <Badge variant="secondary" className="text-xs">{course.subject}</Badge>
      </div>
      <div className="col-span-2 hidden md:block">
        <Badge className={`text-xs border-0 ${LEVEL_COLOR[course.level] ?? ""}`}>{course.level}</Badge>
      </div>
      <div className="col-span-2 text-center">
        <div className="flex items-center gap-1 text-sm font-medium">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {course.enrolledCount ?? 0}
        </div>
      </div>
      <div className="col-span-1 text-right">
        <Button
          size="icon" variant="ghost"
          className="w-7 h-7 text-red-500 hover:bg-red-50"
          onClick={() => {
            deleteCourse.mutate(
              { id: course.id },
              { onSuccess: () => { qc.invalidateQueries(); toast.success("Course deleted"); }, onError: () => toast.error("Failed to delete") }
            );
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const { data: courses, isLoading } = useListCourses({});

  const subjects = [...new Set((courses ?? []).map(c => c.subject))].sort();
  const filtered = (courses ?? []).filter(c =>
    (subject === "all" || c.subject === subject) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalEnrolled = (courses ?? []).reduce((s, c) => s + (c.enrolledCount ?? 0), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Oversight</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor all platform courses</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div><p className="text-2xl font-bold">{courses?.length ?? 0}</p><p className="text-xs text-muted-foreground">Total Courses</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div><p className="text-2xl font-bold">{totalEnrolled}</p><p className="text-xs text-muted-foreground">Total Enrollments</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div><p className="text-2xl font-bold">{subjects.length}</p><p className="text-xs text-muted-foreground">Subjects</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground shrink-0">{filtered.length} courses</div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">No courses found</CardContent></Card>
        ) : (
          <Card>
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-xs font-semibold text-muted-foreground bg-gray-50/80 rounded-t-xl border-b">
              <div className="col-span-5">Course</div>
              <div className="col-span-2 hidden sm:block">Subject</div>
              <div className="col-span-2 hidden md:block">Level</div>
              <div className="col-span-2">Students</div>
              <div className="col-span-1" />
            </div>
            {filtered.map(course => <CourseRow key={course.id} course={course} />)}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
