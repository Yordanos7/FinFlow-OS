"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import * as ReactWindow from 'react-window';
import { cn } from '@/lib/utils';

interface SpreadsheetProps {
  rowCount: number;
  colCount: number;
  selection: { row: number; col: number; endRow: number; endCol: number };
  onSelect: (row: number, col: number) => void;
  getCellValue: (row: number, col: number) => any;
  onCellUpdate: (row: number, col: number, value: string) => void;
  getColWidth: (index: number) => number;
  getRowHeight: (index: number) => number;
  handleColResize: (index: number, width: number) => void;
  handleRowResize: (index: number, height: number) => void;
  dataRevision?: number;
}

export function Spreadsheet({ 
  rowCount, 
  colCount, 
  selection, 
  onSelect, 
  getCellValue,
  onCellUpdate,
  getColWidth,
  getRowHeight,
  handleColResize,
  handleRowResize,
  dataRevision
}: SpreadsheetProps) {
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<any>(null);
  // Auto-sizing logic equivalent
  const { ref: containerRef, size } = useElementSize();

  // Handle react-window import compatibility
  const VariableSizeGrid = (ReactWindow as any).VariableSizeGrid || ReactWindow.VariableSizeGrid;

  // Keyboard Navigation
  // Force grid refresh on data change
  useEffect(() => {
    if (gridRef.current && dataRevision !== undefined) {
      gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }, [dataRevision]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing) return;
      
      let { row, col } = selection;
      let handled = true;

      switch(e.key) {
        case 'ArrowUp': row = Math.max(0, row - 1); break;
        case 'ArrowDown': row = Math.min(rowCount - 1, row + 1); break;
        case 'ArrowLeft': col = Math.max(0, col - 1); break;
        case 'ArrowRight': col = Math.min(colCount - 1, col + 1); break;
        case 'Tab': 
          e.preventDefault();
          col = Math.min(colCount - 1, col + 1); 
          break;
        case 'Enter': 
          e.preventDefault();
          setEditing({ row, col });
          return;
        default: handled = false;
      }

      if (handled) {
        onSelect(row, col);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, editing, rowCount, colCount, onSelect]);

  const Cell = useCallback(({ columnIndex, rowIndex, style, data }: any) => {
    const { selection, editing, getCellValue, onSelect, onCellUpdate, setEditing, getColWidth, handleColResize } = data;
    
    // Column header (A, B, C...)
    if (rowIndex === 0 && columnIndex > 0) {
      return (
        <div style={style} className="bg-[#1E293B] border-r border-b border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-400 select-none relative group">
          {String.fromCharCode(65 + columnIndex - 1)}
          {/* Resize Handle */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 hover:bg-blue-500 cursor-col-resize z-20"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startWidth = getColWidth(columnIndex - 1);
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const diff = moveEvent.clientX - startX;
                handleColResize(columnIndex - 1, startWidth + diff);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (gridRef.current) gridRef.current.resetAfterIndices({ columnIndex });
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>
      );
    }
    
    // Corner Header
    if (rowIndex === 0 && columnIndex === 0) {
      return (
        <div style={style} className="bg-[#1E293B] border-r border-b border-white/10 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white/20 transform rotate-45" />
        </div>
      );
    }
    
    // Row numbers (1, 2, 3...)
    if (columnIndex === 0) {
      return (
        <div style={style} className="bg-[#1E293B] border-r border-b border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 select-none relative group">
          {rowIndex}
          <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    }

    const r = rowIndex - 1;
    const c = columnIndex - 1;
    const isSelected = selection.row === r && selection.col === c;
    const isEditing = editing?.row === r && editing?.col === c;
    const value = getCellValue(r, c);

    return (
      <div 
        style={style}
        className={cn(
          "border-b border-r border-white/5 text-sm flex items-center px-2 transition-colors duration-0 select-none relative",
          isSelected ? "z-10 bg-blue-500/5" : "hover:bg-white/[0.02]",
          "cursor-cell"
        )}
        onClick={() => onSelect(r, c)}
        onDoubleClick={() => setEditing({ row: r, col: c })}
      >
        {isSelected && !isEditing && (
          <div className="absolute inset-[-1px] border-[2px] border-blue-500 z-20 neon-glow-blue pointer-events-none">
            <div className="absolute bottom-[-5px] right-[-5px] w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-sm pointer-events-auto cursor-crosshair box-shadow-sm" />
          </div>
        )}

        {isEditing ? (
          <input
            autoFocus
            className="absolute inset-0 w-full h-full bg-[#0F172A] text-white px-2 focus:outline-none z-30 font-medium border-2 border-blue-500"
            defaultValue={value}
            onBlur={(e) => {
              onCellUpdate(r, c, e.target.value);
              setEditing(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onCellUpdate(r, c, (e.target as HTMLInputElement).value);
                setEditing(null);
                onSelect(Math.min(rowCount - 1, r + 1), c);
              }
              if (e.key === 'Escape') setEditing(null);
            }}
          />
        ) : (
          <span className={cn(
            "truncate w-full h-full flex items-center",
            typeof value === 'number' || (typeof value === 'string' && value.startsWith('=')) ? "justify-end" : "justify-start",
            isSelected ? "text-blue-200" : "text-gray-300"
          )}>
            {value}
          </span>
        )}
      </div>
    );
  }, [selection, editing, getCellValue, onSelect, onCellUpdate, rowCount]);

  const itemData = useMemo(() => ({
    selection,
    editing,
    getCellValue,
    onSelect,
    onCellUpdate,
    setEditing,
    getColWidth,
    handleColResize,
    dataRevision
  }), [selection, editing, getCellValue, onSelect, onCellUpdate, getColWidth, handleColResize, dataRevision]);

  if (!VariableSizeGrid) return null;

  return (
    <div className="flex-1 bg-[#0F172A] relative overflow-hidden custom-scrollbar select-none" ref={containerRef}>
      {size.width > 0 && size.height > 0 && (
        <VariableSizeGrid
          key={dataRevision}
          ref={gridRef}
          columnCount={colCount + 1}
          columnWidth={(index: number) => index === 0 ? 50 : getColWidth(index - 1)}
          height={size.height}
          rowCount={rowCount + 1}
          rowHeight={(index: number) => index === 0 ? 30 : getRowHeight(index - 1)}
          width={size.width}
          itemData={itemData}
        >
          {Cell}
        </VariableSizeGrid>
      )}
    </div>
  );
}

// Helper hook for size
function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
