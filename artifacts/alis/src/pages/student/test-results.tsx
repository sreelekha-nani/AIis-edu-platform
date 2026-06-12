import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListTestResults } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

export default function StudentResults() {
  const { user } = useAuth();
  const sid = user?.id ?? 0;
  const { data: results, isLoading } = useListTestResults({ studentId: sid }, { query: { enabled: !!sid } as any });

  const sorted = [...(results ?? [])].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const avg = results?.length
    ? Math.round(results.reduce((s, r) => s + Math.round((r.correctAnswers / r.totalQuestions) * 100), 0) / results.length)
    : 0;
  const passed = (results ?? []).filter(r => Math.round((r.correctAnswers / r.totalQuestions) * 100) >= 60).length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test Results</h1>
          <p className="text-muted-foreground text-sm mt-1">Your assessment history and performance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Tests Taken", value: results?.length ?? 0, icon: Clock, color: "text-blue-600" },
            { label: "Average Score", value: `${avg}%`, icon: TrendingUp, color: "text-purple-600" },
            { label: "Passed", value: passed, icon: CheckCircle2, color: "text-green-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No tests taken yet</p>
              <p className="text-sm text-muted-foreground mt-1">Go to Assessments to take your first test</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map(result => {
              const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
              const passed = pct >= 60;
              return (
                <Card key={result.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${passed ? "bg-green-100" : "bg-red-100"}`}>
                        {passed
                          ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                          : <XCircle className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm truncate">{result.testTitle}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">{result.subject}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {result.correctAnswers}/{result.totalQuestions} correct · {new Date(result.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-2xl font-bold shrink-0 ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                        {pct}%
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
