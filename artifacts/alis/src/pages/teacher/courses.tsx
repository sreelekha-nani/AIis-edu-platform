import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  useListCourses, useCreateCourse, useDeleteCourse,
  useListLessons, useCreateLesson, useDeleteLesson
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, ChevronLeft, Play, FileText, PlusCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SUBJECTS = ["Mathematics", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology", "Computer Science"];
const LEVELS = ["beginner", "intermediate", "advanced"];

function LessonManager({ courseId, onBack }: { courseId: number; onBack: () => void }) {
  const { data: lessons } = useListLessons(courseId);
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "video", youtubeUrl: "", notes: "", order: 1 });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    createLesson.mutate(
      { courseId, data: { ...form, order: (lessons?.length ?? 0) + 1 } as any },
      {
        onSuccess: () => { setShowForm(false); setForm({ title: "", type: "video", youtubeUrl: "", notes: "", order: 1 }); qc.invalidateQueries(); toast.success("Lesson added!"); },
        onError: () => toast.error("Failed to add lesson"),
      }
    );
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </Button>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Manage Lessons</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <PlusCircle className="w-4 h-4" /> Add Lesson
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-sm">New Lesson</h3>
            <Input placeholder="Lesson title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              {form.type === "video" && (
                <Input placeholder="YouTube URL" value={form.youtubeUrl} onChange={e => setForm(p => ({ ...p, youtubeUrl: e.target.value }))} />
              )}
            </div>
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={createLesson.isPending}>Add Lesson</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {(lessons ?? []).length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">No lessons yet. Add your first lesson above.</CardContent></Card>
        ) : (lessons ?? []).map((lesson, i) => (
          <Card key={lesson.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
<<<<<<< HEAD
                {lesson.type === "video" ? <Play className="w-4 h-4 text-primary shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground/80 shrink-0" />}
=======
                {lesson.type === "video" ? <Play className="w-4 h-4 text-primary shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 shrink-0" />}
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
                <span className="text-sm font-medium truncate">{lesson.title}</span>
                <Badge variant="secondary" className="text-xs capitalize">{lesson.type}</Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
<<<<<<< HEAD
                className="w-7 h-7 text-red-500 hover:bg-destructive/10 shrink-0"
=======
                className="w-7 h-7 text-red-500 hover:bg-red-50 shrink-0"
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
                onClick={() => deleteLesson.mutate({ id: lesson.id }, { onSuccess: () => qc.invalidateQueries() })}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TeacherCourses() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;
  const [showForm, setShowForm] = useState(false);
  const [managing, setManaging] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", subject: "Mathematics", level: "beginner" });

  const { data: courses, isLoading } = useListCourses({ teacherId: tid }, { query: { enabled: !!tid } as any });
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const qc = useQueryClient();

  const handleCreate = () => {
    if (!form.title.trim()) return;
    createCourse.mutate(
      { data: { ...form } },
      {
        onSuccess: () => { setShowForm(false); setForm({ title: "", description: "", subject: "Mathematics", level: "beginner" }); qc.invalidateQueries(); toast.success("Course created!"); },
        onError: () => toast.error("Failed to create course"),
      }
    );
  };

  if (managing !== null) {
    return (
      <DashboardLayout role="teacher">
        <LessonManager courseId={managing} onBack={() => setManaging(null)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage your courses</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> New Course
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Create New Course</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Course title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.subject} onValueChange={v => setForm(p => ({ ...p, subject: v }))}>
                  <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.level} onValueChange={v => setForm(p => ({ ...p, level: v }))}>
                  <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={createCourse.isPending}>Create Course</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
<<<<<<< HEAD
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (courses ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center"><BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No courses yet. Create your first!</p></CardContent></Card>
=======
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (courses ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No courses yet. Create your first!</p></CardContent></Card>
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
        ) : (
          <div className="space-y-3">
            {(courses ?? []).map(course => (
              <Card key={course.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm">{course.title}</h3>
                        <Badge variant="secondary" className="text-xs">{course.subject}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{course.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.totalLessons} lessons · {course.enrolledCount ?? 0} enrolled</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setManaging(course.id)}>Manage Lessons</Button>
                      <Button
                        size="icon" variant="ghost"
<<<<<<< HEAD
                        className="w-8 h-8 text-red-500 hover:bg-destructive/10"
=======
                        className="w-8 h-8 text-red-500 hover:bg-red-50"
>>>>>>> d2d5346de3679531ff816bc58f47ca15715413e4
                        onClick={() => deleteCourse.mutate({ id: course.id }, { onSuccess: () => qc.invalidateQueries() })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
