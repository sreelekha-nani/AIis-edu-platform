import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useListDiscussions, useCreateDiscussion, useReplyDiscussion, useLikeDiscussion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Heart, Plus, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function DiscussionCard({ disc, userId }: { disc: any; userId: number }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const likeDisc = useLikeDiscussion();
  const replyDisc = useReplyDiscussion();
  const qc = useQueryClient();

  const handleLike = () => {
    likeDisc.mutate({ id: disc.id }, { onSuccess: () => qc.invalidateQueries() });
  };
  const handleReply = () => {
    if (!reply.trim()) return;
    replyDisc.mutate(
      { id: disc.id, data: { body: reply, authorId: userId } },
      { onSuccess: () => { setReply(""); qc.invalidateQueries(); toast.success("Reply posted!"); } }
    );
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {disc.authorName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{disc.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{disc.authorName} · {new Date(disc.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{disc.subject}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{disc.body}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            {disc.likes}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {disc.repliesCount} replies
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {open && (
          <div className="pt-2 space-y-3 border-t">
            {(disc.replies ?? []).map((r: any) => (
              <div key={r.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {r.authorName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium">{r.authorName}</p>
                  <p className="text-xs text-gray-700 mt-0.5">{r.body}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="text-sm h-9"
                onKeyDown={e => e.key === "Enter" && handleReply()}
              />
              <Button size="sm" onClick={handleReply} disabled={replyDisc.isPending} className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentDiscussions() {
  const { user } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubject, setNewSubject] = useState("General");

  const { data: discussions, isLoading } = useListDiscussions({});
  const createDisc = useCreateDiscussion();
  const qc = useQueryClient();

  const handleCreate = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    createDisc.mutate(
      { data: { title: newTitle, body: newBody, subject: newSubject } },
      {
        onSuccess: () => {
          setShowNew(false); setNewTitle(""); setNewBody(""); setNewSubject("General");
          qc.invalidateQueries(); toast.success("Discussion posted!");
        },
      }
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discussions</h1>
            <p className="text-muted-foreground text-sm mt-1">Ask questions and learn together</p>
          </div>
          <Button size="sm" onClick={() => setShowNew(!showNew)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {showNew && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Start a Discussion</h3>
              <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Textarea placeholder="What's on your mind?" value={newBody} onChange={e => setNewBody(e.target.value)} rows={3} />
              <div className="flex items-center gap-3">
                <Input placeholder="Subject (e.g. Math)" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="max-w-[160px]" />
                <Button size="sm" onClick={handleCreate} disabled={createDisc.isPending}>Post</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (discussions ?? []).length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">No discussions yet. Start one!</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {(discussions ?? []).map(disc => (
              <DiscussionCard key={disc.id} disc={disc} userId={user?.id ?? 0} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
