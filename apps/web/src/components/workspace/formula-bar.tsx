"use client";

import React, { useEffect, useState } from 'react';
import { FunctionSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaBarProps {
  selection: { row: number; col: number };
  formula: string;
  onFormulaChange: (value: string) => void;
  onFormulaSubmit: () => void;
}

export function FormulaBar({ selection, formula, onFormulaChange, onFormulaSubmit }: FormulaBarProps) {
  const [localValue, setLocalValue] = useState(formula);

  useEffect(() => {
    setLocalValue(formula);
  }, [formula]);

  const cellLabel = `${String.fromCharCode(65 + selection.col)}${selection.row + 1}`;

  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 border-b border-white/10 glass-card">
      {/* Cell Coordinate Display */}
      <div className="flex items-center justify-center min-w-[60px] h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm neon-glow-blue">
        {cellLabel}
      </div>

      <div className="h-6 w-px bg-white/10 mx-1" />

      {/* Formula Icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg text-purple-400">
        <FunctionSquare className="w-5 h-5" />
      </div>

      {/* Formula Input */}
      <div className="flex-1 relative group">
        <input
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onFormulaChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onFormulaSubmit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Enter formula or value..."
          className="w-full h-8 bg-transparent text-white px-3 focus:outline-none placeholder-gray-600 font-mono text-sm"
        />
        <div className="absolute inset-x-0 bottom-[-2px] h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full neon-glow-purple" />
      </div>
    </div>
  );
}
