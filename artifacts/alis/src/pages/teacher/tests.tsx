import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListTests, useCreateTest, useListTestResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Plus, Trash2, Clock, Users, BarChart2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SUBJECTS = ["Mathematics", "Science", "English", "History", "Physics", "Chemistry", "Biology", "Computer Science"];

type QInput = { text: string; options: [string, string, string, string]; correctOption: number; explanation: string };

function emptyQ(): QInput {
  return { text: "", options: ["", "", "", ""], correctOption: 0, explanation: "" };
}

export default function TeacherTests() {
  const { user } = useAuth();
  const tid = user?.id ?? 0;
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<QInput[]>([emptyQ()]);

  const { data: tests, isLoading } = useListTests({ teacherId: tid }, { query: { enabled: !!tid } as any });
  const { data: allResults } = useListTestResults({});
  const createTest = useCreateTest();
  const qc = useQueryClient();

  const setQ = (i: number, field: keyof QInput, value: any) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };
  const setOpt = (qi: number, oi: number, value: string) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = [...q.options] as [string, string, string, string];
      opts[oi] = value;
      return { ...q, options: opts };
    }));
  };

  const handleCreate = () => {
    if (!title.trim() || questions.some(q => !q.text.trim())) {
      toast.error("Fill in all required fields"); return;
    }
    createTest.mutate(
      {
        data: {
          title, subject, duration: Number(duration),
          questions: questions.map(q => ({ ...q, order: 0 })),
        }
      },
      {
        onSuccess: () => {
          setShowForm(false); setTitle(""); setQuestions([emptyQ()]); qc.invalidateQueries();
          toast.success("Test created!");
        },
        onError: () => toast.error("Failed to create test"),
      }
    );
  };

  const resultsForTest = (testId: number) => (allResults ?? []).filter(r => r.testId === testId);
  const avgScore = (testId: number) => {
    const rs = resultsForTest(testId);
    if (!rs.length) return null;
    return Math.round(rs.reduce((s, r) => s + Math.round((r.correctAnswers / r.totalQuestions) * 100), 0) / rs.length);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tests</h1>
            <p className="text-muted-foreground text-sm mt-1">Build and manage assessments</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> New Test
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Create Test</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Test title" value={title} onChange={e => setTitle(e.target.value)} className="sm:col-span-1" />
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(e.target.value)} min={5} max={180} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Questions</h3>
                  <Button size="sm" variant="outline" onClick={() => setQuestions(p => [...p, emptyQ()])}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                  </Button>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{qi + 1}</span>
                      <Input
                        placeholder="Question text"
                        value={q.text}
                        onChange={e => setQ(qi, "text", e.target.value)}
                        className="flex-1 bg-background"
                      />
                      {questions.length > 1 && (
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive"
                          onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-8">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-background ${q.correctOption === oi ? "border-green-400 bg-green-500/5" : ""}`}>
                          <button
                            onClick={() => setQ(qi, "correctOption", oi)}
                            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${q.correctOption === oi ? "border-green-500 bg-green-500" : "border-border"}`}
                          >
                            {q.correctOption === oi && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </button>
                          <Input
                            placeholder={`Option ${oi + 1}`}
                            value={opt}
                            onChange={e => setOpt(qi, oi, e.target.value)}
                            className="border-0 shadow-none p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
                          />
                        </div>
                      ))}
                    </div>
                    <Input
                      placeholder="Explanation (optional)"
                      value={q.explanation}
                      onChange={e => setQ(qi, "explanation", e.target.value)}
                      className="ml-8 text-xs bg-background"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={createTest.isPending}>Create Test</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (tests ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center"><PenTool className="w-12 h-12 text-muted mx-auto mb-3" /><p className="text-muted-foreground text-sm">No tests yet.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(tests ?? []).map(test => {
              const avg = avgScore(test.id);
              const attempts = resultsForTest(test.id).length;
              return (
                <Card key={test.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <PenTool className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm">{test.title}</h3>
                        <Badge variant="secondary" className="text-xs">{test.subject}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration} min</span>
                        <span>{test.totalQuestions} Qs</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{attempts} attempts</span>
                        {avg !== null && <span className="flex items-center gap-1 font-medium text-foreground"><BarChart2 className="w-3 h-3" />Avg: {avg}%</span>}
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
