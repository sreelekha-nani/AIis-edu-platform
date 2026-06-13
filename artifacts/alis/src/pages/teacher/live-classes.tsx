import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListLiveClasses, useCreateLiveClass, useDeleteLiveClass } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Plus, Trash2, Calendar, Clock, ExternalLink, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SUBJECTS = [
  "Python Programming", "Data Science", "Artificial Intelligence", "Machine Learning",
  "DBMS", "Web Development", "Java Programming", "Mathematics", "Physics",
  "Chemistry", "English Communication", "Biology",
];

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function isValidUrl(url: string) {
  try { return Boolean(new URL(url)); } catch { return false; }
}

const STATUS_BADGE: Record<string, string> = {
  upcoming: "bg-blue-500/10 text-blue-600",
  live: "bg-green-500/10 text-green-600",
  completed: "bg-muted text-muted-foreground",
};

export default function TeacherLiveClasses() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", subject: "Python Programming", description: "",
    scheduledAt: "", duration: "60", meetingLink: ""
  });

  const { data: classes, isLoading } = useListLiveClasses({ teacherId: tid }, { query: { enabled: !!tid } as any });
  const createClass = useCreateLiveClass();
  const deleteClass = useDeleteLiveClass();
  const qc = useQueryClient();

  const handleCreate = () => {
    if (!form.title.trim() || !form.scheduledAt || !form.meetingLink.trim()) {
      toast.error("Title, date/time and meeting link are required"); return;
    }
    if (!isValidUrl(form.meetingLink)) {
      toast.error("Please enter a valid URL (e.g. https://meet.google.com/xxx)"); return;
    }
    createClass.mutate(
      { data: { ...form, duration: Number(form.duration), teacherId: tid } },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ title: "", subject: "Python Programming", description: "", scheduledAt: "", duration: "60", meetingLink: "" });
          qc.invalidateQueries();
          toast.success("Class scheduled!");
        },
        onError: () => toast.error("Failed to schedule class"),
      }
    );
  };

  const upcoming = (classes ?? []).filter(c => c.status !== "completed");
  const past = (classes ?? []).filter(c => c.status === "completed");

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Classes</h1>
            <p className="text-muted-foreground text-sm mt-1">Schedule and manage virtual sessions · {(classes ?? []).length} total</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Schedule Class
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule New Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Class title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <Select value={form.subject} onValueChange={v => setForm(p => ({ ...p, subject: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className="sm:col-span-2" />
                <Input type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} min={15} max={180} />
              </div>
              <div>
                <Input
                  placeholder="Meeting link * (e.g. https://meet.google.com/abc-defg-hij)"
                  value={form.meetingLink}
                  onChange={e => setForm(p => ({ ...p, meetingLink: e.target.value }))}
                  className={form.meetingLink && !isValidUrl(form.meetingLink) ? "border-destructive" : ""}
                />
                {form.meetingLink && !isValidUrl(form.meetingLink) && (
                  <p className="text-xs text-destructive mt-1">Please enter a valid URL starting with https://</p>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Paste your Google Meet, Zoom, or MS Teams link above. Students will see a clickable button to join.
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={createClass.isPending}>
                  {createClass.isPending ? "Scheduling..." : "Schedule Class"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming & Live</h2>
                <div className="space-y-3">
                  {upcoming.map(cls => (
                    <Card key={cls.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          {cls.status === "live" ? <span className="text-lg">🔴</span> : <Video className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm">{cls.title}</h3>
                            <Badge className={`text-[10px] border-0 ${STATUS_BADGE[cls.status ?? "upcoming"]}`}>
                              {cls.status === "live" ? "🔴 LIVE" : "Upcoming"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{cls.subject}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(cls.scheduledAt)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(cls.scheduledAt)} · {cls.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isValidUrl(cls.meetingLink ?? "") ? (
                            <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5" /> Start Class
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="text-muted-foreground">No Link</Button>
                          )}
                          <Button
                            size="icon" variant="ghost" className="w-8 h-8 text-red-500 hover:bg-destructive/10"
                            onClick={() => deleteClass.mutate({ id: cls.id }, { onSuccess: () => { qc.invalidateQueries(); toast.success("Class deleted"); } })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past Classes ({past.length})</h2>
                <div className="space-y-2">
                  {past.map(cls => (
                    <Card key={cls.id} className="opacity-60">
                      <CardContent className="p-3 flex items-center gap-3">
                        <Video className="w-4 h-4 text-muted-foreground/80 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{cls.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">{cls.subject} · {formatDate(cls.scheduledAt)}</span>
                        </div>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0">Completed</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No classes scheduled yet.</p>
                  <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4" /> Schedule your first class
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
