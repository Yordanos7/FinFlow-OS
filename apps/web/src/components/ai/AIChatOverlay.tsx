import { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { Bot, MessageSquare, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@/utils/trpc";

export function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use React Query manually to bypass the buggy v11 proxy
  // In a real app, this would come from a context/URL
  const { data: company } = useQuery({
    queryKey: ["company", "get", "demo-corp"],
    queryFn: () => trpcClient.company.get.query({ slug: "demo-corp" }),
    enabled: isOpen,
    retry: false,
  });

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Bot className="h-6 w-6 absolute transition-all duration-300 group-hover:scale-0 opacity-100 group-hover:opacity-0" />
            <MessageSquare className="h-6 w-6 absolute transition-all duration-300 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100" />
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="w-[400px] h-[600px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {company ? (
            <ChatWindow 
              companyId={company.id} 
              isOpen={true} 
              onClose={() => setIsOpen(false)} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                <p>Loading company context...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
