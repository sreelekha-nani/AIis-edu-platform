import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  useListCourses, useListEnrollments, useEnrollCourse,
  useListLessons, useMarkLessonComplete, useListProgress
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { BookOpen, Play, CheckCircle2, Search, Users, ChevronLeft, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function CourseViewer({ courseId, onBack, studentId }: {
  courseId: number; onBack: () => void; studentId: number;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { data: lessons } = useListLessons(courseId);
  const { data: progress } = useListProgress({ courseId, studentId });
  const markComplete = useMarkLessonComplete();
  const qc = useQueryClient();

  const completedIds = new Set((progress ?? []).map((p: any) => p.lessonId));
  const displayLesson = lessons?.find(l => l.id === activeId) ?? lessons?.[0] ?? null;

  const handleMarkComplete = () => {
    if (!displayLesson) return;
    markComplete.mutate(
      { data: { lessonId: displayLesson.id, courseId, studentId } },
      { onSuccess: () => { toast.success("Lesson marked complete!"); qc.invalidateQueries(); } }
    );
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lessons ({lessons?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {(lessons ?? []).map((lesson, i) => {
                const done = completedIds.has(lesson.id);
                const active = (displayLesson?.id) === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveId(lesson.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${active ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-sm flex-1 truncate ${active ? "font-medium text-primary" : ""}`}>{lesson.title}</span>
                    {lesson.type === "video" && <Play className="w-3 h-3 text-gray-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {displayLesson ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{displayLesson.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{displayLesson.type} lesson</p>
                  </div>
                  <Button
                    size="sm"
                    variant={completedIds.has(displayLesson.id) ? "outline" : "default"}
                    onClick={handleMarkComplete}
                    disabled={completedIds.has(displayLesson.id) || markComplete.isPending}
                    className="shrink-0 gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {completedIds.has(displayLesson.id) ? "Completed" : "Mark Done"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayLesson.youtubeId ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${displayLesson.youtubeId}`}
                      title={displayLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Lock className="w-10 h-10" />
                    <p className="text-sm">No video available</p>
                  </div>
                )}
                {displayLesson.notes && (
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayLesson.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <p className="text-muted-foreground text-sm">Select a lesson to start learning</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCourses() {
  const { user } = useAuth();
  const sid = user?.id ?? 0;
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<{ courseId: number } | null>(null);

  const { data: allCourses, isLoading } = useListCourses({});
  const { data: enrollments } = useListEnrollments({ studentId: sid }, { query: { enabled: !!sid } as any });
  const enrollCourse = useEnrollCourse();
  const qc = useQueryClient();

  const enrolledMap = new Map((enrollments ?? []).map(e => [e.courseId, e]));
  const filtered = (allCourses ?? []).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnroll = (courseId: number) => {
    enrollCourse.mutate(
      { data: { courseId, studentId: sid } },
      {
        onSuccess: () => { toast.success("Enrolled successfully!"); qc.invalidateQueries(); },
        onError: () => toast.error("Failed to enroll"),
      }
    );
  };

  if (viewing) {
    return (
      <DashboardLayout role="student">
        <CourseViewer courseId={viewing.courseId} studentId={sid} onBack={() => setViewing(null)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and enroll in available courses</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => {
              const enrollment = enrolledMap.get(course.id);
              const enrolled = !!enrollment;
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative shrink-0">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      : <BookOpen className="w-10 h-10 text-primary/40" />
                    }
                    {enrolled && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">Enrolled</Badge>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{course.title}</h3>
                      <Badge variant="secondary" className={`text-xs shrink-0 ${LEVEL_COLOR[course.level] ?? ""}`}>
                        {course.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{course.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.totalLessons} lessons</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount ?? 0}</span>
                    </div>
                    {enrolled && enrollment && (
                      <Progress value={enrollment.completionRate} className="h-1.5 mb-3" />
                    )}
                    {enrolled ? (
                      <Button size="sm" className="w-full gap-1.5"
                        onClick={() => setViewing({ courseId: course.id })}>
                        <Play className="w-3.5 h-3.5" />
                        {(enrollment?.completionRate ?? 0) === 100 ? "Review" : "Continue"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full"
                        onClick={() => handleEnroll(course.id)} disabled={enrollCourse.isPending}>
                        Enroll Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
