import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, FileText, CheckCircle2, ChevronLeft, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const token = () => localStorage.getItem("alis_token") ?? "";

async function fetchAssignments() {
  const r = await fetch(`${BASE}/api/assignments`, { headers: { Authorization: `Bearer ${token()}` } });
  return r.json();
}

async function fetchMySubmissions(studentId: number) {
  if (!studentId) return [];
  const r = await fetch(`${BASE}/api/assignments`, { headers: { Authorization: `Bearer ${token()}` } });
  const list = await r.json();
  const subs: any[] = [];
  for (const a of list.slice(0, 5)) {
    try {
      const r2 = await fetch(`${BASE}/api/assignments/${a.id}/submissions`, { headers: { Authorization: `Bearer ${token()}` } });
      const s = await r2.json();
      const mine = (s || []).find((x: any) => x.studentId === studentId);
      if (mine) subs.push({ ...mine, assignmentId: a.id });
    } catch {}
  }
  return subs;
}

async function submitAssignment(assignmentId: number, studentId: number, content: string) {
  const r = await fetch(`${BASE}/api/assignments/${assignmentId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ studentId, content }),
  });
  if (!r.ok) throw new Error("Failed to submit");
  return r.json();
}

function daysUntilDue(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const SUBJECT_COLORS: Record<string, string> = {
  "Python Programming": "bg-blue-50 text-blue-700 border-blue-200",
  "Data Science": "bg-teal-50 text-teal-700 border-teal-200",
  "Artificial Intelligence": "bg-violet-50 text-violet-700 border-violet-200",
  "Machine Learning": "bg-purple-50 text-purple-700 border-purple-200",
  "DBMS": "bg-orange-50 text-orange-700 border-orange-200",
  "Web Development": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Java Programming": "bg-red-50 text-red-700 border-red-200",
  "Mathematics": "bg-pink-50 text-pink-700 border-pink-200",
  "Physics": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Chemistry": "bg-green-50 text-green-700 border-green-200",
  "English Communication": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function StudentAssignments() {
  const { user } = useAuth();
  const sid = user?.id ?? 0;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAssignments,
    enabled: !!sid,
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      submitAssignment(id, sid, content),
    onSuccess: () => {
      toast.success("Assignment submitted successfully!");
      setSelected(null);
      setAnswer("");
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: () => toast.error("Failed to submit assignment"),
  });

  const all = (assignments ?? []) as any[];
  const now = Date.now();

  const displayed = filter === "upcoming"
    ? all.filter(a => new Date(a.dueDate).getTime() > now)
    : all;

  const overdue = all.filter(a => new Date(a.dueDate).getTime() < now).length;
  const upcoming7 = all.filter(a => { const d = daysUntilDue(a.dueDate); return d >= 0 && d <= 7; }).length;

  if (selected) {
    const days = daysUntilDue(selected.dueDate);
    return (
      <DashboardLayout role="student">
        <div className="max-w-2xl mx-auto space-y-5">
          <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setAnswer(""); }} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back to Assignments
          </Button>
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Badge className={`text-[10px] border mb-2 ${SUBJECT_COLORS[selected.subject] ?? "bg-muted text-muted-foreground"}`}>
                    {selected.subject}
                  </Badge>
                  <CardTitle className="text-lg">{selected.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">By {selected.teacherName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-sm font-semibold">{formatDueDate(selected.dueDate)}</p>
                  <Badge className={`text-[10px] mt-1 ${days < 0 ? "bg-destructive/10 text-destructive" : days <= 3 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                    {days < 0 ? "Overdue" : days === 0 ? "Due today!" : `${days} days left`}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assignment Instructions</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />Max Score: {selected.maxScore} points</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {formatDueDate(selected.dueDate)}</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Submission</label>
                <Textarea
                  placeholder="Write your answer here. For coding assignments, paste your code. For written assignments, type your response directly..."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={10}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">{answer.length} characters</p>
              </div>
              {answer.length < 20 && answer.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Please provide a more complete answer before submitting.
                </div>
              )}
              <Button
                className="w-full gap-2"
                onClick={() => submitMutation.mutate({ id: selected.id, content: answer })}
                disabled={answer.trim().length < 20 || submitMutation.isPending}
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit your work and track deadlines</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{all.length}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{upcoming7}</p>
                <p className="text-[10px] text-muted-foreground">Due in 7 days</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{overdue}</p>
                <p className="text-[10px] text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "upcoming" ? "bg-white shadow text-foreground" : "text-muted-foreground"}`}
          >
            Upcoming ({all.filter(a => new Date(a.dueDate).getTime() > now).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === "all" ? "bg-white shadow text-foreground" : "text-muted-foreground"}`}
          >
            All ({all.length})
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No assignments found</p>
              <p className="text-xs mt-1">Great job staying on top of your work!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayed.map((a: any) => {
              const days = daysUntilDue(a.dueDate);
              const isOverdue = days < 0;
              const isUrgent = days >= 0 && days <= 3;
              return (
                <Card
                  key={a.id}
                  className={`hover:shadow-sm transition-all cursor-pointer ${isOverdue ? "border-destructive/30 bg-destructive/5" : isUrgent ? "border-orange-300 bg-orange-50/30" : ""}`}
                  onClick={() => setSelected(a)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? "bg-destructive/10" : isUrgent ? "bg-orange-100" : "bg-muted"}`}>
                        <FileText className={`w-5 h-5 ${isOverdue ? "text-destructive" : isUrgent ? "text-orange-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.subject} · {a.teacherName}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.description}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-xs text-muted-foreground">{formatDueDate(a.dueDate)}</p>
                            <Badge className={`text-[10px] mt-1 ${isOverdue ? "bg-destructive/10 text-destructive border-0" : isUrgent ? "bg-orange-100 text-orange-700 border-0" : "bg-muted text-muted-foreground border-0"}`}>
                              {isOverdue ? "Overdue" : days === 0 ? "Due today" : `${days}d left`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
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
