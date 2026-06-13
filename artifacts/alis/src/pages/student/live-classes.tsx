import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListLiveClasses } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, Video, CheckCircle2, Users } from "lucide-react";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function isValidUrl(url: string) {
  try { return Boolean(new URL(url)); } catch { return false; }
}
function getProvider(url: string) {
  if (url.includes("meet.google.com")) return "Google Meet";
  if (url.includes("zoom.us")) return "Zoom";
  if (url.includes("teams.microsoft.com")) return "MS Teams";
  return "Join Class";
}

const STATUS_BADGE: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
};

export default function StudentLiveClasses() {
  const { data: all, isLoading } = useListLiveClasses({});

  const live = (all ?? []).filter(c => c.status === "live");
  const upcoming = (all ?? []).filter(c => c.status === "upcoming");
  const past = (all ?? []).filter(c => c.status === "completed");

  const renderClass = (cls: any, isPast = false) => {
    const validLink = isValidUrl(cls.meetingLink ?? "");
    const provider = validLink ? getProvider(cls.meetingLink) : "No Link";
    const isLive = cls.status === "live";

    return (
      <Card key={cls.id} className={`transition-shadow hover:shadow-sm ${isLive ? "border-green-300 bg-green-50/30" : isPast ? "opacity-70" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-green-100" : isPast ? "bg-gray-100" : "bg-primary/10"}`}>
              {isLive
                ? <span className="text-xl">🔴</span>
                : isPast
                ? <CheckCircle2 className="w-5 h-5 text-gray-400" />
                : <Video className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-sm">{cls.title}</h3>
                <Badge className={`text-[10px] border-0 ${STATUS_BADGE[cls.status ?? "upcoming"]}`}>
                  {isLive ? "🔴 LIVE NOW" : cls.status === "upcoming" ? "Upcoming" : "Completed"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{cls.subject} · {cls.teacherName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(cls.scheduledAt)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(cls.scheduledAt)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.duration} min</span>
              </div>
            </div>
            {!isPast && validLink ? (
              <a
                href={cls.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant={isLive ? "default" : "outline"}
                  className={`shrink-0 gap-1.5 ${isLive ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isLive ? "Attend Class" : provider}
                </Button>
              </a>
            ) : isPast ? (
              <Badge className="shrink-0 text-xs bg-gray-100 text-gray-500 border-0">Completed</Badge>
            ) : (
              <Button size="sm" variant="outline" disabled className="shrink-0 text-muted-foreground">
                No Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Live Classes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {(all?.length ?? 0)} classes scheduled · Click "Attend Class" to join via Google Meet
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <span className="text-sm">🔴</span>
              </div>
              <div>
                <p className="text-lg font-bold">{live.length}</p>
                <p className="text-[10px] text-muted-foreground">Live Now</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{upcoming.length}</p>
                <p className="text-[10px] text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{past.length}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          <>
            {live.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Now
                </h2>
                <div className="space-y-3">{live.map(c => renderClass(c))}</div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Sessions</h2>
                <div className="space-y-3">{upcoming.map(c => renderClass(c))}</div>
              </div>
            )}

            {upcoming.length === 0 && live.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Video className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No upcoming classes</p>
                </CardContent>
              </Card>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past Classes</h2>
                <div className="space-y-2">{past.map(c => renderClass(c, true))}</div>
              </div>
            )}
          </>
        )}

        {/* Info Banner */}
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Joining a Live Class</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Click <strong>"Attend Class"</strong> or <strong>"Google Meet"</strong> to open the meeting in a new tab.
                All classes use Google Meet. Make sure your camera and microphone permissions are enabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
