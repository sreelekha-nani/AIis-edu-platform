import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus, Users, Calendar, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const tok = () => localStorage.getItem("alis_token") ?? "";
const hdr = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

const SUBJECTS = [
  "Python Programming", "Data Science", "Artificial Intelligence", "Machine Learning",
  "DBMS", "Web Development", "Java Programming", "Mathematics",
  "Physics", "Chemistry", "English Communication", "Biology",
];

async function fetchAssignments() {
  const r = await fetch(`${BASE}/api/assignments`, { headers: hdr() });
  return r.json();
}
async function fetchSubmissions(assignmentId: number) {
  const r = await fetch(`${BASE}/api/assignments/${assignmentId}/submissions`, { headers: hdr() });
  return r.json();
}
async function createAssignment(data: any) {
  const r = await fetch(`${BASE}/api/assignments`, { method: "POST", headers: hdr(), body: JSON.stringify(data) });
  if (!r.ok) throw new Error("Failed to create");
  return r.json();
}

function daysUntilDue(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function AssignmentRow({ assignment, teacherId }: { assignment: any; teacherId: number }) {
  const [open, setOpen] = useState(false);
  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ["submissions", assignment.id],
    queryFn: () => fetchSubmissions(assignment.id),
    enabled: open,
  });

  const isOwn = assignment.teacherId === teacherId;
  const days = daysUntilDue(assignment.dueDate);
  const isOverdue = days < 0;

  return (
    <Card className={`hover:shadow-sm transition-shadow ${!isOwn ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? "bg-red-50" : "bg-muted"}`}>
            <ClipboardList className={`w-5 h-5 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight">{assignment.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{assignment.subject} · {assignment.teacherName}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{assignment.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-xs text-muted-foreground">{new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                <Badge className={`text-[10px] mt-1 border-0 ${isOverdue ? "bg-red-100 text-red-700" : days <= 3 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                  {isOverdue ? "Overdue" : `${days}d left`}
                </Badge>
              </div>
            </div>
            {isOwn && (
              <button
                onClick={() => setOpen(!open)}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Users className="w-3 h-3" />
                View submissions
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            {open && isOwn && (
              <div className="mt-3 border-t pt-3 space-y-2">
                {subsLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (subs ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">No submissions yet</p>
                ) : (
                  (subs ?? []).map((sub: any) => (
                    <div key={sub.id} className="p-2.5 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{sub.studentName ?? `Student #${sub.studentId}`}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(sub.submittedAt).toLocaleString()}</p>
                          {sub.content && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{sub.content.slice(0, 120)}{sub.content.length > 120 ? "..." : ""}"</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          {sub.grade != null ? (
                            <Badge className="text-[10px] bg-green-100 text-green-700 border-0">{sub.grade}/{assignment.maxScore}</Badge>
                          ) : (
                            <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-0">Pending review</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeacherAssignments() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mine">("mine");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "Python Programming",
    dueDate: "", maxScore: "100",
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAssignments,
    enabled: !!tid,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createAssignment(data),
    onSuccess: () => {
      toast.success("Assignment created!");
      setShowForm(false);
      setForm({ title: "", description: "", subject: "Python Programming", dueDate: "", maxScore: "100" });
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: () => toast.error("Failed to create assignment"),
  });

  const all = (assignments ?? []) as any[];
  const mine = all.filter(a => a.teacherId === tid);
  const displayed = (filter === "mine" ? mine : all).filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase())
  );

  const overdue = mine.filter(a => daysUntilDue(a.dueDate) < 0).length;
  const upcoming7 = mine.filter(a => { const d = daysUntilDue(a.dueDate); return d >= 0 && d <= 7; }).length;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and review student submissions</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Assignment title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <Select value={form.subject} onValueChange={v => setForm(p => ({ ...p, subject: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Assignment description and instructions *" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Due Date *</label>
                  <Input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Score</label>
                  <Input type="number" value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))} min={10} max={100} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createMutation.mutate({ ...form, teacherId: tid, maxScore: Number(form.maxScore) })}
                  disabled={!form.title || !form.dueDate || !form.description || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><ClipboardList className="w-4 h-4 text-blue-600" /></div>
              <div><p className="text-lg font-bold">{mine.length}</p><p className="text-[10px] text-muted-foreground">My Assignments</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-orange-600" /></div>
              <div><p className="text-lg font-bold">{upcoming7}</p><p className="text-[10px] text-muted-foreground">Due in 7 days</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-red-600" /></div>
              <div><p className="text-lg font-bold">{overdue}</p><p className="text-[10px] text-muted-foreground">Overdue</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button onClick={() => setFilter("mine")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "mine" ? "bg-white shadow text-foreground" : "text-muted-foreground"}`}>
              My Assignments ({mine.length})
            </button>
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "all" ? "bg-white shadow text-foreground" : "text-muted-foreground"}`}>
              All ({all.length})
            </button>
          </div>
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : displayed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No assignments found</p>
              <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5" /> Create your first assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayed.map((a: any) => <AssignmentRow key={a.id} assignment={a} teacherId={tid} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
