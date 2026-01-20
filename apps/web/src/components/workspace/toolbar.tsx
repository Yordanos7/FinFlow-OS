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
import { AIAssistantModal } from './ai-assistant-modal';
import { toast } from 'sonner';

interface ToolbarProps {
  onAITask?: (message: string) => Promise<string>;
  onImport?: (data: any[][]) => boolean;
}

export function Toolbar({ onAITask, onImport }: ToolbarProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading toast
    const loadingToast = toast.loading(`Reading ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          toast.dismiss(loadingToast);
          toast.error("File is empty");
          return;
        }
        
        // Robust CSV parsing handling quoted values containing delimiters
        const rows: any[][] = [];
        // Split by newlines that are not inside quotes
        const lines = text.split(/\r?\n/);
        
        for (const line of lines) {
          if (!line.trim()) continue; // Skip empty lines
          
          const row: any[] = [];
          let currentCell = '';
          let insideQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
                // Escaped quote
                currentCell += '"';
                i++;
              } else {
                insideQuotes = !insideQuotes;
              }
            } else if (char === ',' && !insideQuotes) {
              row.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          row.push(currentCell.trim()); // Push last cell
          rows.push(row);
        }

        console.log("📊 Parsed CSV:", rows.length, "rows");

        if (rows.length === 0) {
          toast.dismiss(loadingToast);
          toast.error("No data found in file");
          return;
        }

        if (onImport) {
          const success = onImport(rows);
          toast.dismiss(loadingToast);
          
          if (success) {
            toast.success(`✅ Loaded ${rows.length} rows × ${rows[0]?.length || 0} columns`, {
              duration: 3000,
            });
          } else {
            toast.error("Failed to load data into spreadsheet");
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error("Import handler not available");
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error("CSV Import Error:", error);
        toast.error("Failed to parse CSV file");
      } finally {
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
       toast.dismiss(loadingToast);
       toast.error("Failed to read file");
       if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };
  
  const handleAIAssistant = () => {
    setIsModalOpen(true);
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all neon-border-blue group"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          AI Assistant
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all neon-border-blue group"
        >
          <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          Import
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          className="hidden" 
          accept=".csv"
        />
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold transition-all neon-glow-blue hover:scale-105 active:scale-95 group">
          <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          Export
        </button>
      </div>

      <AIAssistantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRunTask={onAITask || (async () => "")}
      />
    </div>
  );
}
