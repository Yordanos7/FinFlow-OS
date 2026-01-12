import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../hooks/use-ai-chat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  X, 
  Maximize2, 
  Sparkles,
  Loader2
} from "lucide-react";

interface ChatWindowProps {
  companyId: string; // We'll need to pass this
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ companyId, isOpen, onClose }: ChatWindowProps) {
  const { messages, sendMessage, isLoading } = useAIChat(companyId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-[400px] h-[600px] bg-[#0f1115] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f1115]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">FinFlow AI</h3>
            <span className="text-xs text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Sparkles className="text-cyan-400" size={32} />
            </div>
            <p className="text-sm text-gray-400">
              Ask me about your finances, budget, or projects. I can generate reports and analyze data.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {["Profit margin?", "Draft Q1 Report", "Budget status?", "Identify risks"].map((q) => (
                <button 
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="p-2 text-xs bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors text-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === "assistant" 
                  ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400" 
                  : "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                }
              `}>
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
              </div>
              
              <div className={`
                max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed
                ${msg.role === "assistant" 
                  ? "bg-white/5 text-gray-200 border border-white/5" 
                  : "bg-cyan-600/20 text-white border border-cyan-500/20"
                }
              `}>
                {msg.content}
                {msg.isLoading && (
                  <span className="flex items-center gap-1 mt-1 opacity-50">
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce delay-75" />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce delay-150" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-[#0f1115]">
        <div className="relative flex items-center bg-black/20 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 p-3 outline-none min-h-[44px]"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 mr-1 rounded-lg text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
