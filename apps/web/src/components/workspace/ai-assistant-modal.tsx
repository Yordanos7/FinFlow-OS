"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Bot, CheckCircle2, AlertCircle, Table as TableIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { trpcClient } from '@/utils/trpc';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTask: (message: string) => Promise<string>;
}

interface AIState {
  step: 'idle' | 'reading' | 'reasoning' | 'updating' | 'completed' | 'error';
  message: string;
}

const STEPS = [
  { id: 'reading', label: 'Reading Data', icon: TableIcon },
  { id: 'reasoning', label: 'AI Reasoning', icon: Bot },
  { id: 'updating', label: 'Applying Changes', icon: Sparkles },
] as const;

export function AIAssistantModal({ isOpen, onClose, onRunTask }: AIAssistantModalProps) {
  const [task, setTask] = useState('');
  const [state, setState] = useState<AIState>({ step: 'idle', message: '' });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // History State
  const [showHistory, setShowHistory] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);


  // Real History Fetching
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  React.useEffect(() => {
     if (isOpen) {
         trpcClient.ai.getConversations.query({ companyId: 'default-company' })
            .then(data => {
                const items = data.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    date: new Date(c.updatedAt).toLocaleTimeString(),
                    status: 'completed',
                    messages: c.messages as any[]
                }));
                setHistoryItems(items);
            })
            .catch(err => console.error("Failed to fetch history", err));
     }
  }, [isOpen]);


  const handleRun = async () => {
    if (!task.trim()) return;
    
    setState({ step: 'reading', message: 'Analyzing spreadsheet context...' });
    setError(null);
    setResult(null);
    setSelectedHistoryId(null);
    
    try {
      // Simulate reading for UI feel
      await new Promise(r => setTimeout(r, 800));
      
      setState({ step: 'reasoning', message: 'Generating financial insights...' });
      const response = await onRunTask(task);
      
      setState({ step: 'updating', message: 'Updating spreadsheet cells...' });
      // Simulate update application
      await new Promise(r => setTimeout(r, 600));

      setResult(response);
      setState({ step: 'completed', message: 'Task completed successfully!' });
      toast.success("AI Spreadsheet Updated");
    } catch (e) {
      setError("I encountered an issue processing your request.");
      setState({ step: 'error', message: 'Execution failed' });
      toast.error("AI Task Failed");
    }
  };

  const isProcessing = state.step !== 'idle' && state.step !== 'completed' && state.step !== 'error';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl h-[600px] bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative flex"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />
            
            {/* History Sidebar (Folder Mode) */}
            <div className="w-64 border-r border-white/5 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Bot className="w-3 h-3" /> History
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {historyItems.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                // Load history item state
                                setTask(item.title);
                                const lastMessage = item.messages[item.messages.length - 1];
                                if (lastMessage?.role === 'assistant') {
                                    setResult(lastMessage.content);
                                    setState({ step: 'completed', message: 'Loaded from history' });
                                } else {
                                     // Just show query if no result
                                    setResult(null);
                                    setState({ step: 'idle', message: 'Ready to retry' });
                                }
                                setSelectedHistoryId(item.id);
                            }}
                            className={cn(
                                "w-full text-left p-3 rounded-xl border transition-all text-xs group",
                                selectedHistoryId === item.id 
                                    ? "bg-cyan-500/10 border-cyan-500/30 text-white" 
                                    : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            <div className="font-medium truncate mb-1">{item.title}</div>
                            <div className="flex items-center justify-between opacity-60">
                                <span>{item.date}</span>
                                {item.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                    <p className="text-xs text-slate-400">Financial Intelligence Kernel</p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 disabled:opacity-50" 
                    disabled={isProcessing}
                >
                    <X className="w-6 h-6" />
                </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                {!result && !error ? (
                    <div className="space-y-6">
                    {isProcessing ? (
                        <div className="space-y-8 py-4">
                        <div className="flex justify-between items-center relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
                            {STEPS.map((s, i) => {
                            const stepsList = ['reading', 'reasoning', 'updating', 'completed'];
                            const isActive = state.step === s.id;
                            const isPast = stepsList.indexOf(state.step) > stepsList.indexOf(s.id);
                            const Icon = s.icon;
                            
                            return (
                                <div key={s.id} className="flex flex-col items-center gap-3 relative bg-[#0F172A] px-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                    isActive ? "bg-cyan-500/20 border-cyan-400 neon-glow-blue scale-110" : 
                                    isPast ? "bg-emerald-500/20 border-emerald-400" : "bg-white/5 border-white/10"
                                )}>
                                    <Icon className={cn("w-6 h-6", isActive ? "text-cyan-400" : isPast ? "text-emerald-400" : "text-white/20")} />
                                </div>
                                <span className={cn("text-[10px] font-bold uppercase tracking-tighter transition-colors", isActive ? "text-cyan-400" : isPast ? "text-emerald-400" : "text-white/20")}>
                                    {s.label}
                                </span>
                                </div>
                            );
                            })}
                        </div>
                        
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                            <span className="text-sm font-medium text-white animate-pulse">{state.message}</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                animate={{ width: state.step === 'reading' ? '33%' : state.step === 'reasoning' ? '66%' : '90%' }}
                                transition={{ duration: 0.8 }}
                            />
                            </div>
                        </div>
                        </div>
                    ) : (
                        <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">What financial task should I perform?</label>
                            <textarea
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            placeholder="e.g., 'Summarize revenue' or 'Identify missing data'"
                            className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none shadow-inner"
                            />
                        </div>
                        <button
                            onClick={handleRun}
                            disabled={!task.trim()}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg shadow-lg neon-glow-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Execute Instruction
                        </button>
                        </>
                    )}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className={cn("p-6 rounded-2xl border backdrop-blur-md", error ? "bg-red-500/5 border-red-500/20" : "bg-cyan-500/5 border-cyan-500/20")}>
                        <div className="flex items-start gap-4">
                        {error ? <AlertCircle className="w-6 h-6 text-red-400 mt-1" /> : <CheckCircle2 className="w-6 h-6 text-cyan-400 mt-1" />}
                        <div className="space-y-3 flex-1 overflow-hidden">
                            <p className="font-bold text-white text-lg">{error ? "Analysis Failed" : "Insights Generated"}</p>
                            <div className="text-slate-300 leading-relaxed text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
                            {error || result}
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => { setResult(null); setError(null); setTask(''); setState({ step: 'idle', message: '' }); setSelectedHistoryId(null); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold">New Task</button>
                    </div>
                    </motion.div>
                )}
                </div>
                {/* Footer */}
                <div className="px-8 py-4 bg-white/5 flex items-center justify-between border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {isProcessing ? "Kernel Busy" : "Kernel Ready"}
                </span>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] text-slate-600 font-mono">HASH: 78F3..A1</span>
                    <span className="text-[10px] text-slate-500 font-medium">FinFlow AI v2.2</span>
                </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
