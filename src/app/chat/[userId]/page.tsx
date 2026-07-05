"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { apiGet } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SkeletonMessages from "@/components/skeletons/SkeletonMessages";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile, Send, ArrowLeft } from "lucide-react";

interface OtherUser {
  id: string;
  full_name: string;
  profile_pic?: string;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const otherUserId = params.userId;
  const { user, isAuthenticated, loading } = useAuth();
  const {
    messages,
    isTyping,
    connected,
    reconnecting,
    readStatus,
    sendMessage,
    sendTyping,
    markRead,
    loadHistory,
  } = useChat(user?.id || "", otherUserId);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!otherUserId || !isAuthenticated) return;
    loadHistory(otherUserId);
    apiGet<OtherUser>(`/api/user/profile/${otherUserId}`)
      .then(setOtherUser)
      .catch(() => {});
  }, [otherUserId, isAuthenticated, loadHistory]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when they come into view
  const handleScroll = useCallback(() => {
    if (!bottomRef.current) return;
    // Mark the last received message as read
    const lastReceived = [...messages].reverse().find((m) => m.sender_id !== user?.id && m.id);
    if (lastReceived?.id && !readStatus[lastReceived.id]) {
      markRead(lastReceived.id);
    }
  }, [messages, user?.id, readStatus, markRead]);

  useEffect(() => {
    handleScroll();
  }, [messages.length, handleScroll]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setInput((prev) => prev + emoji.native);
    setShowEmoji(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/chat")}
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
          {otherUser?.profile_pic ? (
            <img src={otherUser.profile_pic} alt="" className="h-9 w-9 object-cover" />
          ) : (
            <span className="text-sm text-zinc-600">♫</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">
            {otherUser?.full_name || "Chat"}
          </p>
          <p className="text-[10px] text-zinc-500">
            {reconnecting
              ? "reconnecting..."
              : isTyping
              ? "typing..."
              : connected
              ? "online"
              : "offline"}
          </p>
        </div>
        {/* Connection indicator */}
        <div
          className={`h-2 w-2 rounded-full ${
            reconnecting
              ? "bg-amber-400 animate-pulse"
              : connected
              ? "bg-emerald-400"
              : "bg-zinc-600"
          }`}
          aria-label={connected ? "Connected" : reconnecting ? "Reconnecting" : "Disconnected"}
        />
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        onScroll={handleScroll}
        ref={bottomRef}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const isLastReceived =
              !isMe &&
              i ===
                messages
                  .map((m, idx) => ({ ...m, idx }))
                  .filter((m) => m.sender_id !== user?.id)
                  .slice(-1)[0]?.idx;

            return (
              <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] space-y-0.5">
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      isMe
                        ? "bg-violet-600 text-white rounded-br-md"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                    }`}
                  >
                    {msg.type === "clip_share" ? (
                      <div>
                        <span>🎵 Shared a music clip</span>
                        {msg.clip_id && (
                          <p className="text-xs opacity-70 mt-1">{msg.content}</p>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1 px-1 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.created_at && (
                      <span className="text-[10px] text-zinc-600">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {/* Read receipt — double check for own messages */}
                    {isMe && msg.id && (
                      <span
                        className={`text-[10px] ${
                          readStatus[msg.id] ? "text-violet-400" : "text-zinc-600"
                        }`}
                      >
                        {readStatus[msg.id] ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-sm">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                set="native"
                maxFrequentRows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="shrink-0 rounded-full p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            aria-label="Toggle emoji picker"
          >
            <Smile className="h-5 w-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-100 rounded-full text-sm placeholder:text-zinc-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 rounded-full h-10 w-10 bg-violet-600 hover:bg-violet-700 p-0 flex items-center justify-center disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </main>
  );
}
