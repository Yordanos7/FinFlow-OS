"use client";

import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Table as TableIcon,
  ChevronDown,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onAITask?: (message: string) => Promise<string>;
}

export function Toolbar({ onAITask }: ToolbarProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleAIAssistant = async () => {
    const task = window.prompt("What massive task should the AI do?");
    if (!task || !onAITask) return;
    
    setIsProcessing(true);
    try {
      const result = await onAITask(task);
      alert("AI Result: " + result);
    } catch (e) {
      alert("AI Task failed. Check your API keys.");
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: Underline, label: 'Underline' },
    { type: 'divider' },
    { icon: AlignLeft, label: 'Left' },
    { icon: AlignCenter, label: 'Center' },
    { icon: AlignRight, label: 'Right' },
    { type: 'divider' },
    { icon: TableIcon, label: 'Borders', hasArrow: true },
    { icon: Plus, label: 'Insert', hasArrow: true },
    { icon: Trash2, label: 'Delete', hasArrow: true },
  ];

  return (
    <div className="flex items-center gap-1 p-1 px-4 bg-white/5 border-b border-white/10 overflow-x-auto whitespace-nowrap hide-scrollbar">
      {/* File & Edit Actions */}
      <div className="flex items-center gap-4 mr-6 pr-6 border-r border-white/10">
        <button className="text-white hover:text-blue-400 text-sm font-medium transition-colors">File</button>
        <button className="text-white hover:text-blue-400 text-sm font-medium transition-colors">Edit</button>
        <button className="text-white hover:text-blue-400 text-sm font-medium transition-colors">View</button>
      </div>

      {/* Formatting Tools */}
      {tools.map((tool, i) => {
        if (tool.type === 'divider') {
          return <div key={i} className="h-6 w-px bg-white/10 mx-2" />;
        }
        
        const Icon = tool.icon!;
        return (
          <button
            key={i}
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all group"
            title={tool.label}
          >
            <Icon className="w-4 h-4" />
            {tool.hasArrow && <ChevronDown className="w-3 h-3 opacity-50" />}
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Export/Import Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleAIAssistant}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all neon-border-blue group disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          )}
          AI Assistant
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all neon-border-blue group">
          <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          Import
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold transition-all neon-glow-blue hover:scale-105 active:scale-95 group">
          <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          Export
        </button>
      </div>
    </div>
  );
}
