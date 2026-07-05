"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export interface ChatMessage {
  id?: string;
  conversation_id?: string;
  sender_id: string;
  type: "text" | "emoji" | "clip_share" | "typing" | "read_receipt";
  content: string;
  clip_id?: string;
  read_at?: string;
  created_at?: string;
}

export function useChat(userId: string, otherUserId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const connect = useCallback(() => {
    if (!userId || !mountedRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      setConnected(true);
      setReconnecting(false);
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

      // Auth via first message
      const token = localStorage.getItem("access_token");
      if (token) {
        ws.send(JSON.stringify({ type: "auth", token }));
      }
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg: ChatMessage = JSON.parse(event.data);

        if (msg.type === "typing") {
          setIsTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
          return;
        }

        if (msg.type === "read_receipt" && msg.id) {
          setReadStatus((prev) => ({ ...prev, [msg.id!]: true }));
          return;
        }

        if (msg.sender_id !== userId) {
          setMessages((prev) => [...prev, msg]);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      // Schedule a reconnect with exponential backoff.
      setReconnecting(true);
      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connectRef.current();
      }, delay);
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      ws.close();
    };
  }, [userId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string, type: "text" | "clip_share" = "text", clipId?: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !otherUserId) return;

      const data: Record<string, unknown> = { content };
      if (clipId) data.clip_id = clipId;

      ws.send(JSON.stringify({ type, to: otherUserId, data }));

      setMessages((prev) => [
        ...prev,
        {
          sender_id: userId,
          type,
          content,
          clip_id: clipId,
          created_at: new Date().toISOString(),
        },
      ]);
    },
    [userId, otherUserId]
  );

  const sendTyping = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !otherUserId) return;
    ws.send(JSON.stringify({ type: "typing", to: otherUserId }));
  }, [otherUserId]);

  const markRead = useCallback(
    (messageId: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !otherUserId) return;
      ws.send(
        JSON.stringify({
          type: "read_receipt",
          to: otherUserId,
          data: { message_id: messageId },
        })
      );
    },
    [otherUserId]
  );

  const loadHistory = useCallback(async (conversationPartnerId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(
        `${apiUrl}/api/chat/messages/${conversationPartnerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail on history load
    }
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    connected,
    reconnecting,
    readStatus,
    sendMessage,
    sendTyping,
    markRead,
    loadHistory,
  };
}
