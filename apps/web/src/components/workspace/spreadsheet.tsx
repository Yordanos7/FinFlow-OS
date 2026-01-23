"use client";

import React, { useCallback, useMemo } from 'react';
import { 
  DataEditor, 
  GridCellKind,
  CompactSelection,
  type GridSelection 
} from "@glideapps/glide-data-grid";
import type { 
  GridCell, 
  GridColumn, 
  Item, 
  EditableGridCell, 
  Theme 
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";

// Theme configuration for Dark/Neon aesthetic
const theme: Partial<Theme> = {
  accentColor: "#3b82f6",       // blue-500
  accentLight: "rgba(59, 130, 246, 0.2)",
  textDark: "#ffffff",          // text color
  textMedium: "#94a3b8",        // text-gray-400
  textLight: "#64748b",         // text-gray-500
  bgCell: "#0F172A",            // bg-slate-900 (cell background)
  bgHeader: "#1E293B",          // bg-slate-800 (header background)
  bgHeaderHasFocus: "#334155",
  borderColor: "#334155",       // border-slate-700
  baseFontStyle: "13px Inter, sans-serif",
  headerFontStyle: "bold 13px Inter, sans-serif",
};

interface SpreadsheetProps {
  rowCount: number;
  colCount: number;
  selection: { row: number; col: number; endRow: number; endCol: number };
  onSelect: (selection: { row: number; col: number; endRow: number; endCol: number }) => void;
  getCellValue: (row: number, col: number) => any;
  getCellStyle: (row: number, col: number) => { align?: 'left' | 'center' | 'right' };
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
  getCellValue,
  getCellStyle,
  onCellUpdate,
  getColWidth,
  handleColResize,
  onSelect,
  selection: externalSelection,
  dataRevision
}: SpreadsheetProps) {
  
  // Columns definition (dynamically generated for A, B, C...)
  // We use key=i to ensure stability
  const columns = useMemo<GridColumn[]>(() => {
    return Array.from({ length: colCount }, (_, i) => ({
      title: String.fromCharCode(65 + i), // A, B, C...
      width: getColWidth(i),
      id: String(i)
    }));
  }, [colCount, getColWidth]);

  // Data Accessor Callback (The core bridge)
  const getCellContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell; // Glide uses [col, row]
    const val = getCellValue(row, col); // Our hook uses (row, col)
    const style = getCellStyle(row, col);

    const strVal = val === null || val === undefined ? "" : String(val);

    // Determine basic rendering style
    const isFormula = strVal.startsWith('=');
    const isNumber = !isFormula && !isNaN(Number(strVal)) && strVal !== '';
    
    // Default alignment: Number/Formula -> Right, Text -> Left
    // If style.align is set, use it.
    let align: "left" | "center" | "right" | undefined = style.align;
    if (!align) {
        align = isNumber || isFormula ? "right" : "left";
    }

    return {
      kind: GridCellKind.Text,
      allowOverlay: true,
      displayData: strVal,
      data: strVal,
      contentAlign: align,
      readonly: false,
    };
  }, [getCellValue, getCellStyle, dataRevision]); // depend on dataRevision to force update

  // Handle Edits
  const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
    if (newValue.kind !== GridCellKind.Text) return;
    const [col, row] = cell;
    onCellUpdate(row, col, newValue.data);
  }, [onCellUpdate]);

  // Controlled Selection Logic
  const gridSelection = useMemo<GridSelection>(() => {
    return {
      current: {
        cell: [externalSelection.col, externalSelection.row] as [number, number],
        range: {
          x: externalSelection.col,
          y: externalSelection.row,
          width: Math.max(1, (externalSelection.endCol - externalSelection.col) + 1),
          height: Math.max(1, (externalSelection.endRow - externalSelection.row) + 1),
        },
        rangeStack: [],
      },
      columns: CompactSelection.empty(),
      rows: CompactSelection.empty(),
    };
  }, [externalSelection]);

  const onGridSelectionChange = useCallback((selection: GridSelection) => {
    const current = selection.current;
    if (current && current.range) {
       onSelect({
         row: current.range.y,
         col: current.range.x,
         endRow: current.range.y + current.range.height - 1,
         endCol: current.range.x + current.range.width - 1,
       });
    } else if (current && current.cell) {
       onSelect({
         row: current.cell[1],
         col: current.cell[0],
         endRow: current.cell[1],
         endCol: current.cell[0],
       });
    }
  }, [onSelect]);

  return (
    <div className="w-full h-full min-h-[400px] border-none overflow-hidden rounded-md relative">
      <DataEditor
        width="100%"
        height="100%"
        rows={rowCount}
        columns={columns}
        getCellContent={getCellContent}
        onCellEdited={onCellEdited}
        gridSelection={gridSelection}
        onGridSelectionChange={onGridSelectionChange}
        onColumnResize={(col, newSize) => handleColResize(Number(col.id), newSize)}
        theme={theme}
        rowHeight={32}
        keybindings={{ selectAll: true }}
        getCellsForSelection={true}
        smoothScrollX={true}
        smoothScrollY={true}
        rowMarkers="number" // Show 1, 2, 3...
        // Enable built-in features
        freezeColumns={0}
      />
    </div>
  );
}
