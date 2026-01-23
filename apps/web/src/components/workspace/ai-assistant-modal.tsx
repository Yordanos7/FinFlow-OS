"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  History, 
  ChevronLeft,
  MessageSquare,
  Plus,
  Zap,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { trpcClient } from '@/utils/trpc';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTask: (message: string, conversationId?: string) => Promise<{ analysis: string; conversationId: string }>;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
  timestamp: Date;
}

export function AIAssistantModal({ isOpen, onClose, onRunTask }: AIAssistantModalProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Greetings. I am your FinFlow Advisor. How may I assist you with your spreadsheets today?",
      timestamp: new Date()
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch History on Open
  useEffect(() => {
    if (isOpen) {
      trpcClient.ai.getConversations.query({ companyId: 'cmkbkmxr60001g7w1ogn6jax5' })
        .then(data => {
          // Limit to 5 most recent history items
          const items = data.slice(0, 5).map((c: any) => ({
            id: c.id,
            title: c.title,
            date: new Date(c.updatedAt),
            messages: c.messages as any[]
          }));
          setHistoryItems(items);
        })
        .catch(err => console.error("Failed to fetch history", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "A fresh consultation starts. I am your FinFlow Advisor. How may I assist you with your spreadsheets today?",
      timestamp: new Date()
    }]);
    setQuery('');
  };

  const handleHistoryItemSelect = (item: any) => {
    setActiveConversationId(item.id);
    const historyMessages = item.messages.map((m: any, idx: number) => ({
        id: `hist-${item.id}-${idx}`,
        role: m.role,
        content: m.content,
        timestamp: item.date
    }));
    setMessages(historyMessages);
    // Auto-close sidebar on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!query.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsProcessing(true);

    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'assistant',
      content: "Analyzing royal archives...",
      isThinking: true,
      timestamp: new Date()
    }]);

    try {
      const result = await onRunTask(userMsg.content, activeConversationId || undefined);
      
      setMessages(prev => prev.map(m => 
        m.id === thinkingId ? {
          ...m,
          content: result.analysis,
          isThinking: false
        } : m
      ));

      // Update active conversation ID if this was the first message
      if (!activeConversationId && result.conversationId) {
        setActiveConversationId(result.conversationId);
      }

      // Re-fetch history to include the new interaction
      trpcClient.ai.getConversations.query({ companyId: 'cmkbkmxr60001g7w1ogn6jax5' })
        .then(data => {
          const items = data.slice(0, 5).map((c: any) => ({
            id: c.id,
            title: c.title,
            date: new Date(c.updatedAt),
            messages: c.messages as any[]
          }));
          setHistoryItems(items);
        });

    } catch (error) {
       setMessages(prev => prev.map(m => 
        m.id === thinkingId ? {
          ...m,
          content: "My apologies, I encountered an error fulfilling your request.",
          isThinking: false
        } : m
      ));
      toast.error("Assistant Encountered Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-5xl h-[85vh] flex overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative bg-[#0F1025]"
          >
             {/* Royal Background Elements */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Sidebar (History) */}
            <motion.div 
              animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
              className="flex-shrink-0 border-r border-white/5 bg-slate-900/40 backdrop-blur-xl relative hidden md:flex md:flex-col"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-100/80">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">History</span>
                </div>
                <button onClick={handleNewChat} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-1 group" title="New Chat">
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    <span className="text-[10px] font-bold hidden group-hover:inline">NEW</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                 {historyItems.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs italic">
                        No previous sessions found.
                    </div>
                 )}
                 {historyItems.map(item => (
                   <button 
                     key={item.id} 
                     onClick={() => handleHistoryItemSelect(item)}
                     className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all group",
                        activeConversationId === item.id 
                            ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" 
                            : "bg-transparent border-transparent hover:bg-white/5"
                     )}
                   >
                      <div className={cn(
                        "text-sm font-medium truncate",
                        activeConversationId === item.id ? "text-indigo-300" : "text-slate-300 group-hover:text-white"
                      )}>{item.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{item.date.toLocaleDateString()}</div>
                   </button>
                 ))}
              </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-br from-transparent to-slate-900/20">
              
              {/* Header */}
              <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20">
                           <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                              <Crown className="w-5 h-5 text-amber-400" />
                           </div>
                        </div>
                        <div>
                           <h3 className="font-bold text-white text-lg leading-none">FinFlow Advisor</h3>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] text-emerald-400/80 font-medium tracking-wider uppercase">Online</span>
                           </div>
                        </div>
                    </div>
                 </div>

                 <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
                 {messages.map((msg) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={cn(
                        "flex gap-4 max-w-3xl",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                       <div className={cn(
                         "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                         msg.role === 'assistant' ? "bg-indigo-600 shadow-indigo-500/20" : "bg-slate-700"
                       )}>
                          {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                       </div>
                       
                       <div className={cn(
                         "p-4 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm border",
                         msg.role === 'assistant' 
                           ? "bg-indigo-950/40 border-indigo-500/20 text-indigo-50 rounded-tl-none" 
                           : "bg-slate-800/80 border-slate-700 text-slate-100 rounded-tr-none"
                       )}>
                          {msg.isThinking ? (
                            <div className="flex items-center gap-2 text-indigo-300">
                               <Sparkles className="w-4 h-4 animate-pulse" />
                               <span className="animate-pulse font-medium">{msg.content}</span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          )}
                          <div className={cn(
                            "text-[10px] mt-2 opacity-50",
                            msg.role === 'assistant' ? "text-indigo-200" : "text-slate-400"
                          )}>
                             {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                    </motion.div>
                 ))}
                 
                 {/* Spacer for scroll */}
                 <div className="h-4" />
              </div>

              {/* Input Area */}
              <div className="p-6 pt-2">
                 <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                       <textarea
                         value={query}
                         onChange={(e) => setQuery(e.target.value)}
                         onKeyDown={handleKeyDown}
                         placeholder="Ask me to analyze your data or perform a task..."
                         disabled={isProcessing}
                         className="flex-1 bg-transparent border-none p-4 text-white placeholder:text-slate-500 focus:ring-0 resize-none h-14 max-h-32 py-4 custom-scrollbar"
                       />
                       <div className="pr-2 flex items-center gap-1">
                          <button 
                            onClick={handleSend}
                            disabled={!query.trim() || isProcessing}
                            className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                          >
                             {isProcessing ? <Zap className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
                          </button>
                       </div>
                    </div>
                 </div>
                 <p className="text-center text-[10px] text-slate-600 mt-3 font-medium">
                    FinFlow Advisor AI can make mistakes. Verify important financial data.
                 </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
