"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonList } from "@/components/skeletons/SkeletonListItem";

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_pic: string;
  last_message: string;
  last_message_at: string | null;
}

export default function ChatListPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const setUnreadCount = useUIStore((s) => s.setUnreadCount);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiGet<{ conversations: Conversation[] }>("/api/chat/conversations")
      .then((d) => {
        setConversations(d.conversations);
        // Set unread count for nav badge (placeholder — real count needs separate endpoint)
        setUnreadCount(d.conversations.length);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [isAuthenticated, setUnreadCount]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">Messages</h1>

        {dataLoading ? (
          <SkeletonList count={5} />
        ) : conversations.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">💬</div>
              <h2 className="text-lg font-semibold text-zinc-200">No messages yet</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Match with people to start chatting
              </p>
              <Button
                onClick={() => router.push("/matches")}
                className="mt-4 bg-violet-600 hover:bg-violet-700"
              >
                Find Matches
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.other_user_id}`)}
                className="w-full text-left"
              >
                <Card className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {conv.other_user_pic ? (
                        <img src={conv.other_user_pic} alt="" className="h-12 w-12 object-cover" />
                      ) : (
                        <span className="text-lg text-zinc-600">♫</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {conv.other_user_name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{conv.last_message}</p>
                    </div>
                    {conv.last_message_at && (
                      <span className="text-[10px] text-zinc-600 shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
