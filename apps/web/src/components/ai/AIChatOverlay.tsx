import { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { Bot, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "../../utils/trpc";

export function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  
  // In a real app, this would come from a context/URL
  // For now, we fetch the demo company we set up
  const { data: company } = trpc.company.get.useQuery(
    { slug: "demo-corp" },
    { 
      retry: false, 
      staleTime: Infinity 
    }
  );

  if (!company) {
    // If we can't find the company or haven't loaded yet,
    // don't show the chat (or show a loading state if preferred)
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center z-50 hover:bg-cyan-400 transition-colors group"
          >
            <Bot size={28} className="text-white group-hover:rotate-12 transition-transform" />
            
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow 
            companyId={company.id} 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
