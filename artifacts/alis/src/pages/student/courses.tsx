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
import { BookOpen, Play, CheckCircle2, Search, Users, ChevronLeft, Lock, Clock, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const SUBJECTS = [
  "All", "Python Programming", "Data Science", "Artificial Intelligence",
  "Machine Learning", "DBMS", "Web Development", "Java Programming",
  "Mathematics", "Physics", "Chemistry", "English Communication",
];

const LEVELS = ["All", "beginner", "intermediate", "advanced"];

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
  const completionPct = lessons && lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  const handleMarkComplete = () => {
    if (!displayLesson || completedIds.has(displayLesson.id)) return;
    markComplete.mutate(
      { data: { lessonId: displayLesson.id, courseId, studentId } },
      { onSuccess: () => { toast.success("Lesson marked complete!"); qc.invalidateQueries(); } }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Back to Courses
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{completedIds.size}/{lessons?.length ?? 0} lessons done</span>
          <Progress value={completionPct} className="h-1.5 w-24" />
          <span className="font-semibold text-foreground">{completionPct}%</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lessons ({lessons?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {(lessons ?? []).map((lesson, i) => {
                const done = completedIds.has(lesson.id);
                const active = displayLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveId(lesson.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${active ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${active ? "font-medium text-primary" : ""}`}>{lesson.title}</p>
                      {lesson.duration && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{lesson.duration} min</p>}
                    </div>
                    {lesson.type === "video" && <Play className="w-3 h-3 text-muted-foreground shrink-0" />}
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
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{displayLesson.type} lesson{displayLesson.duration ? ` · ${displayLesson.duration} min` : ""}</p>
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
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Lock className="w-10 h-10" />
                    <p className="text-sm">No video available</p>
                  </div>
                )}
                {displayLesson.notes && (
                  <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Lesson Notes</p>
                    <p className="text-sm text-foreground leading-relaxed">{displayLesson.notes}</p>
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
  const [subject, setSubject] = useState("All");
  const [level, setLevel] = useState("All");
  const [tab, setTab] = useState<"all" | "enrolled">("all");
  const [viewing, setViewing] = useState<{ courseId: number } | null>(null);

  const { data: allCourses, isLoading } = useListCourses({});
  const { data: enrollments } = useListEnrollments({ studentId: sid }, { query: { enabled: !!sid } as any });
  const enrollCourse = useEnrollCourse();
  const qc = useQueryClient();

  const enrolledMap = new Map((enrollments ?? []).map(e => [e.courseId, e]));

  const filtered = (allCourses ?? []).filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subject === "All" || c.subject === subject;
    const matchLevel = level === "All" || c.level === level;
    const matchTab = tab === "all" || enrolledMap.has(c.id);
    return matchSearch && matchSubject && matchLevel && matchTab;
  });

  const enrolledCount = (allCourses ?? []).filter(c => enrolledMap.has(c.id)).length;

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
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Course Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse {allCourses?.length ?? 0} courses across 12 subjects</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "all" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Courses ({allCourses?.length ?? 0})
          </button>
          <button
            onClick={() => setTab("enrolled")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "enrolled" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            My Courses ({enrolledCount})
          </button>
        </div>

        {/* Search & Level Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${level === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                {l === "All" ? "All Levels" : l}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${subject === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(search || subject !== "All" || level !== "All") && (
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {allCourses?.length ?? 0} courses
            {search && <span> matching "<strong>{search}</strong>"</span>}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No courses found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setSubject("All"); setLevel("All"); }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => {
              const enrollment = enrolledMap.get(course.id);
              const enrolled = !!enrollment;
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                  <div className="h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative shrink-0 overflow-hidden">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <BookOpen className="w-10 h-10 text-primary/40" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <Badge className={`text-[10px] border-0 ${LEVEL_COLOR[course.level] ?? ""}`}>{course.level}</Badge>
                      {enrolled && <Badge className="bg-green-500 text-white text-[10px] border-0">Enrolled</Badge>}
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">{course.subject}</p>
                    <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.totalLessons} lessons</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount ?? 0} students</span>
                      <span className="text-xs text-muted-foreground truncate">{course.teacherName}</span>
                    </div>
                    {enrolled && enrollment && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round(enrollment.completionRate ?? 0)}%</span>
                        </div>
                        <Progress value={enrollment.completionRate ?? 0} className="h-1.5" />
                      </div>
                    )}
                    {enrolled ? (
                      <Button size="sm" className="w-full gap-1.5"
                        onClick={() => setViewing({ courseId: course.id })}>
                        <Play className="w-3.5 h-3.5" />
                        {(enrollment?.completionRate ?? 0) >= 100 ? "Review Course" : "Continue Learning"}
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
