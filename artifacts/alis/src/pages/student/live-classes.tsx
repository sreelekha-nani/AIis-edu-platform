import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListLiveClasses } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, Video } from "lucide-react";

function formatDate(dt: string) {
  const d = new Date(dt);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const STATUS_BADGE: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  live: "bg-green-100 text-green-700 animate-pulse",
  completed: "bg-gray-100 text-gray-600",
};

export default function StudentLiveClasses() {
  const { data: all, isLoading } = useListLiveClasses({});

  const upcoming = (all ?? []).filter(c => c.status === "upcoming" || c.status === "live");
  const past = (all ?? []).filter(c => c.status === "completed");

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Live Classes</h1>
          <p className="text-muted-foreground text-sm mt-1">Join scheduled sessions with your teachers</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming & Live</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : upcoming.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No upcoming classes scheduled</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map(cls => (
                <Card key={cls.id} className={`hover:shadow-sm transition-shadow ${cls.status === "live" ? "border-green-300 bg-green-50/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm">{cls.title}</h3>
                          <Badge className={`text-xs border-0 ${STATUS_BADGE[cls.status ?? "upcoming"]}`}>
                            {cls.status === "live" ? "🔴 LIVE" : "Upcoming"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{cls.subject} · {cls.teacherName}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(cls.scheduledAt)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(cls.scheduledAt)} · {cls.duration} min</span>
                        </div>
                      </div>
                      <Button size="sm" variant={cls.status === "live" ? "default" : "outline"} asChild className="shrink-0 gap-1.5">
                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {cls.status === "live" ? "Join Now" : "Join Link"}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past Classes</h2>
            <div className="space-y-3">
              {past.map(cls => (
                <Card key={cls.id} className="opacity-70">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{cls.title}</h3>
                        <p className="text-xs text-muted-foreground">{cls.subject} · {formatDate(cls.scheduledAt)} · {formatTime(cls.scheduledAt)}</p>
                      </div>
                      <Badge className="text-xs bg-gray-100 text-gray-500 border-0">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
