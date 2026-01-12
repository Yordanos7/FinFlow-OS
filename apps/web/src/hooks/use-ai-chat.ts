import { useState } from "react";
import { trpc } from "../utils/trpc";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
};

export function useAIChat(companyId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const utils = trpc.useUtils();

  const sendMessageMutation = trpc.ai.sendMessage.useMutation({
    onSuccess: (data) => {
      // Replace the optimistic loading message with the real response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          { id: crypto.randomUUID(), role: "assistant", content: data.message },
        ];
      });
      // Invalidate queries to refresh history if we were fetching it
      utils.ai.getConversations.invalidate();
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: "Sorry, I encountered an error due to: " + error.message 
        },
      ]);
    }
  });

  const sendMessage = (text: string) => {
    // 1. Add user message immediately
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    // 2. Add temporary loading message
    const loadingMsg: Message = {
      id: "loading-placeholder",
      role: "assistant",
      content: "Thinking...",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    // 3. Fire mutation
    sendMessageMutation.mutate({
      message: text,
      companyId,
    });
  };

  return {
    messages,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
  };
}
