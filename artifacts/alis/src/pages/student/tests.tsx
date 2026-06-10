import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListTests, useGetTest, useSubmitTest, useListTestResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function TestRunner({ testId, studentId, onBack }: { testId: number; studentId: number; onBack: () => void }) {
  const { data: test } = useGetTest(testId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const submitTest = useSubmitTest();
  const qc = useQueryClient();

  if (!test) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const answered = Object.keys(answers).length;
  const total = test.questions?.length ?? 0;

  const handleSubmit = () => {
    if (answered < total) {
      toast.error(`Please answer all ${total} questions`);
      return;
    }
    const answerList = Object.entries(answers).map(([qid, opt]) => ({
      questionId: Number(qid),
      selectedOption: opt,
    }));
    submitTest.mutate(
      { id: testId, data: { studentId, answers: answerList } },
      {
        onSuccess: (res) => { setResult(res); setSubmitted(true); qc.invalidateQueries(); },
        onError: () => toast.error("Failed to submit test"),
      }
    );
  };

  if (submitted && result) {
    const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
    const passed = pct >= 60;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Back to Tests
        </Button>
        <Card>
          <CardHeader className="text-center pb-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
              {passed ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
            </div>
            <CardTitle className="text-2xl">{passed ? "Well Done!" : "Keep Practicing"}</CardTitle>
            <p className="text-muted-foreground text-sm">{test.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-1 ${passed ? "text-green-600" : "text-red-600"}`}>{pct}%</div>
              <p className="text-sm text-muted-foreground">{result.correctAnswers} of {result.totalQuestions} correct</p>
            </div>
            <Progress value={pct} className="h-3" />
            <div className="space-y-3 pt-2">
              {test.questions?.map((q, i) => {
                const selected = answers[q.id];
                const correct = q.correctOption;
                const isRight = selected === correct;
                return (
                  <div key={q.id} className={`p-3 rounded-lg border ${isRight ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-2">
                      {isRight ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{i + 1}. {q.text}</p>
                        <p className="text-xs text-muted-foreground">Your answer: <span className={isRight ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{q.options[selected]}</span></p>
                        {!isRight && <p className="text-xs text-muted-foreground">Correct: <span className="text-green-600 font-medium">{q.options[correct]}</span></p>}
                        {q.explanation && <p className="text-xs text-blue-600 mt-1 italic">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ChevronLeft className="w-4 h-4" /> Exit Test
      </Button>
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{test.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{test.subject}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {test.duration} min
            </div>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{answered}/{total} answered</span>
            </div>
            <Progress value={(answered / Math.max(total, 1)) * 100} className="h-1.5" />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {test.questions?.map((q, i) => (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm font-medium">{q.text}</p>
              </div>
              <div className="ml-8 space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                      answers[q.id] === oi
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[q.id] === oi ? "border-primary bg-primary" : "border-gray-300"}`}>
                      {answers[q.id] === oi && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {answered < total && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {total - answered} question{total - answered !== 1 ? "s" : ""} remaining
            </div>
          )}
          <Button className="w-full" onClick={handleSubmit} disabled={submitTest.isPending}>
            {submitTest.isPending ? "Submitting..." : "Submit Test"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentTests() {
  const { user } = useAuth();
  const sid = user?.id ?? 0;
  const [taking, setTaking] = useState<number | null>(null);

  const { data: tests, isLoading } = useListTests({});
  const { data: results } = useListTestResults({ studentId: sid }, { query: { enabled: !!sid } as any });

  const takenIds = new Set((results ?? []).map(r => r.testId));

  if (taking) {
    return (
      <DashboardLayout role="student">
        <TestRunner testId={taking} studentId={sid} onBack={() => setTaking(null)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground text-sm mt-1">Test your knowledge and track your progress</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {(tests ?? []).map(test => {
              const taken = takenIds.has(test.id);
              const lastResult = (results ?? []).filter(r => r.testId === test.id).sort((a, b) =>
                new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              )[0];
              return (
                <Card key={test.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{test.title}</h3>
                          <Badge variant="secondary" className="text-xs">{test.subject}</Badge>
                          {taken && <Badge className="bg-green-100 text-green-700 text-xs border-0">Completed</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration} min</span>
                          <span>{test.totalQuestions} questions</span>
                          {lastResult && <span className="font-medium text-foreground">Last score: {Math.round((lastResult.correctAnswers / lastResult.totalQuestions) * 100)}%</span>}
                        </div>
                      </div>
                      <Button size="sm" variant={taken ? "outline" : "default"} onClick={() => setTaking(test.id)}>
                        {taken ? "Retake" : "Start Test"}
                      </Button>
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
