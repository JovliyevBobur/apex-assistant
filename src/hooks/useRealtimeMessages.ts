import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export function useRealtimeMessages(
  conversationId: string | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            content: string;
            role: string;
          };

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Check if we already have this content as an optimistic update
            const lastMsg = prev[prev.length - 1];
            if (
              lastMsg &&
              lastMsg.role === newMsg.role &&
              lastMsg.content === newMsg.content &&
              !lastMsg.id.match(/^[0-9a-f]{8}-/)
            ) {
              // Replace optimistic message with real one
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, id: newMsg.id } : m
              );
            }
            return [...prev, { id: newMsg.id, content: newMsg.content, role: newMsg.role as "user" | "assistant" }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages]);
}
