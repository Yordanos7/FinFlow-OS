import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpcClient, queryClient } from "@/utils/trpc";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
};

export function useAIChat(companyId: string) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm FinFlowOs AI. How can I help you analyze your business today?",
    },
  ]);

  const mutation = useMutation({
    mutationFn: async (input: { message: string, companyId: string }) => {
      return await trpcClient.ai.sendMessage.mutate(input);
    },
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
      queryClient.invalidateQueries({ queryKey: [['ai', 'getConversations']] });
    },
    onError: (error) => {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          { 
            id: crypto.randomUUID(), 
            role: "assistant", 
            content: "Sorry, I encountered an error due to: " + error.message 
          },
        ];
      });
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
    mutation.mutate({
      message: text,
      companyId,
    });
  };

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
  };
}
