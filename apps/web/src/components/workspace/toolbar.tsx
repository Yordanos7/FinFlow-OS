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
  Loader2,
  FileText,
  Scissors,
  Copy,
  Clipboard,
  Undo,
  Redo,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIAssistantModal } from './ai-assistant-modal';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";

interface ToolbarProps {
  onAITask?: (message: string, conversationId?: string) => Promise<{ analysis: string; conversationId: string }>;
  onImport?: (data: any[][]) => boolean;
  onExport?: () => void;
  // Edit Actions
  onInsertRow?: (index: number) => void;
  onDeleteRow?: (index: number) => void;
  onInsertCol?: (index: number) => void;
  onDeleteCol?: (index: number) => void;
  // Formatting
  onSetAlign?: (align: 'left' | 'center' | 'right') => void;
  activeSheetId?: number; // for context
}

export function Toolbar({ 
  onAITask, 
  onImport, 
  onExport,
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
  onSetAlign
}: ToolbarProps) {
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

  return (
    <div className="flex items-center gap-2 p-3 px-5 bg-white/5 border-b border-white/10 overflow-x-auto whitespace-nowrap hide-scrollbar">
      <div className="flex items-center gap-2 mr-6 pr-6 border-r border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-white hover:text-blue-400 hover:bg-white/5 cursor-pointer outline-none transition-colors")}>
            File
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-[#1e293b] border-slate-700 text-white">
            <DropdownMenuGroup>
              <DropdownMenuLabel>File Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="focus:bg-blue-500/20 focus:text-blue-400 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" /> Import CSV...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport} className="focus:bg-blue-500/20 focus:text-blue-400 cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Export to CSV
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-white hover:text-blue-400 hover:bg-white/5 cursor-pointer outline-none transition-colors")}>
            Edit
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-[#1e293b] border-slate-700 text-white">
             <DropdownMenuGroup>
                <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" disabled><Undo className="w-4 h-4 mr-2" /> Undo</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" disabled><Redo className="w-4 h-4 mr-2" /> Redo</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuLabel>Rows & Columns</DropdownMenuLabel>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="focus:bg-white/10 cursor-pointer"><Plus className="w-4 h-4 mr-2" /> Insert</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-[#1e293b] border-slate-700 text-white">
                        <DropdownMenuItem onClick={() => onInsertRow?.(0)} className="focus:bg-blue-500/20 cursor-pointer">Insert Row Above</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertRow?.(1)} className="focus:bg-blue-500/20 cursor-pointer">Insert Row Below</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => onInsertCol?.(0)} className="focus:bg-blue-500/20 cursor-pointer">Insert Column Left</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertCol?.(1)} className="focus:bg-blue-500/20 cursor-pointer">Insert Column Right</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="focus:bg-white/10 cursor-pointer text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-[#1e293b] border-slate-700 text-white">
                        <DropdownMenuItem onClick={() => onDeleteRow?.(0)} className="focus:bg-red-500/20 text-red-400 cursor-pointer">Delete Selected Row</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteCol?.(0)} className="focus:bg-red-500/20 text-red-400 cursor-pointer">Delete Selected Column</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
             </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-white hover:text-blue-400 hover:bg-white/5 cursor-pointer outline-none transition-colors")}>
             View
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-[#1e293b] border-slate-700 text-white">
               <DropdownMenuGroup>
                   <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><TableIcon className="w-4 h-4 mr-2" /> Gridlines</DropdownMenuItem>
                   <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><MoreHorizontal className="w-4 h-4 mr-2" /> Freeze Panes</DropdownMenuItem>
               </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Formatting Tools */}
      <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Bold className="w-4 h-4" /></button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Italic className="w-4 h-4" /></button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <button onClick={() => onSetAlign?.('left')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><AlignLeft className="w-4 h-4" /></button>
          <button onClick={() => onSetAlign?.('center')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => onSetAlign?.('right')} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><AlignRight className="w-4 h-4" /></button>
      </div>

      <div className="flex-1" />

      {/* Export/Import Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleAIAssistant}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all neon-border-blue group"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          AI Assistant
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all neon-border-blue group"
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
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold transition-all neon-glow-blue hover:scale-105 active:scale-95 group">
          <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          Export
        </button>
      </div>

      <AIAssistantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRunTask={onAITask || (async (m: string, c?: string) => ({ analysis: "", conversationId: "" }))}
      />
    </div>
  );
}
