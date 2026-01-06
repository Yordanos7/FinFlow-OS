"use client";

import React from 'react';
import { Plus, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetTabsProps {
  sheets: string[];
  activeSheetId: number;
  onSheetChange: (id: number) => void;
  onAddSheet: () => void;
}

export function SheetTabs({ sheets, activeSheetId, onSheetChange, onAddSheet }: SheetTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1 px-4 bg-white/5 border-t border-white/10 h-10 overflow-x-auto hide-scrollbar">
      {/* Sheets List Icon */}
      <button className="p-1 text-gray-500 hover:text-white transition-colors mr-2">
        <List className="w-4 h-4" />
      </button>

      {/* Tabs */}
      <div className="flex items-center">
        {sheets.map((sheet, i) => {
          const isActive = activeSheetId === i;
          return (
            <button
              key={i}
              onClick={() => onSheetChange(i)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-1 h-8 rounded-t-lg transition-all text-xs font-bold whitespace-nowrap overflow-hidden group",
                isActive 
                  ? "bg-[#1E293B] text-blue-400" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 neon-glow-blue" />
              )}
              {sheet}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 transition-transform duration-300",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
              )} />
            </button>
          );
        })}
      </div>

      {/* Add New Sheet */}
      <button 
        onClick={onAddSheet}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-white/5 transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
