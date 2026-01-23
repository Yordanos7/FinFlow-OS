"use client";

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { FormulaBar } from "@/components/workspace/formula-bar";
import { SheetTabs } from "@/components/workspace/sheet-tabs";
import { EmptyState } from "@/components/workspace/empty-state";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import dynamic from 'next/dynamic';

const Spreadsheet = dynamic(
  () => import("@/components/workspace/spreadsheet").then((mod) => mod.Spreadsheet),
  { ssr: false }
);

export default function WorkspacePage() {
  const [hasData, setHasData] = useState(false);

  // Initialize with empty data structure
  const initialData = useMemo(() => [[]], []);

  const {
    selection,
    setSelection,
    sheets,
    activeSheetId,
    setActiveSheetId,
    addSheet,
    getCellValue,
    getCellFormula,
    updateCell,
    rowCount,
    colCount,
    getColWidth,
    getRowHeight,
    handleColResize,
    handleRowResize,
    processTaskWithAI,
    importData,
    dataRevision,
    insertRow,
    insertCol,
    deleteRow,
    deleteCol,
    setAlignment,
    getCellStyle
  } = useSpreadsheet(initialData);

  const activeFormula = useMemo(() => {
    return getCellFormula(selection.row, selection.col);
  }, [selection, getCellFormula]);

  const handleSelect = React.useCallback((newSelection: { row: number; col: number; endRow: number; endCol: number }) => {
    setSelection(newSelection);
  }, [setSelection]);

  const handleCellUpdate = React.useCallback((r: number, c: number, v: string) => {
    updateCell(r, c, v);
  }, [updateCell]);
  
  const handleImport = React.useCallback((data: any[][]) => {
     const success = importData(data);
     if (success) {
        setHasData(true);
     }
     return success;
  }, [importData]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.4))] bg-[#0F172A] overflow-hidden gap-3">
        {/* Workspace Toolbar */}
        <Toolbar 
          onAITask={(msg) => processTaskWithAI(msg, 'default-company')} 
          onImport={handleImport}
          onInsertRow={(i) => insertRow(selection.row + i)}
          onDeleteRow={() => deleteRow(selection.row)}
          onInsertCol={(i) => insertCol(selection.col + i)}
          onDeleteCol={() => deleteCol(selection.col)}
          onSetAlign={setAlignment}
          onExport={() => {
             // Basic Export (Optional: move to hook)
             alert("Export feature coming soon! (Data is in HyperFormula)");
          }}
        />

        {hasData ? (
          <>
            {/* Formula Bar */}
            <FormulaBar 
              selection={selection}
              formula={activeFormula}
              onFormulaChange={(v) => {
                // Live preview could go here
              }}
              onFormulaSubmit={() => {
                // Finalize changes
              }}
            />

            {/* Main Grid Area */}
            <div className="flex-1 relative bg-[#0F172A] p-4 animate-in fade-in duration-300">
              <div className="w-full h-full rounded-2xl overflow-hidden glass-card">
              <Spreadsheet 
                  rowCount={rowCount}
                  colCount={colCount}
                  selection={selection}
                  onSelect={handleSelect}
                  getCellValue={getCellValue}
                  getCellStyle={getCellStyle}
                  onCellUpdate={handleCellUpdate}
                  getColWidth={getColWidth}
                  getRowHeight={getRowHeight}
                  handleColResize={handleColResize}
                  handleRowResize={handleRowResize}
                  dataRevision={dataRevision}
                />
              </div>
            </div>

            {/* Sheet Tabs */}
            <SheetTabs 
              sheets={sheets}
              activeSheetId={activeSheetId}
              onSheetChange={setActiveSheetId}
              onAddSheet={() => addSheet('')}
            />
          </>
        ) : (
           <div className="flex-1 relative bg-[#0F172A] p-4">
               <EmptyState onImport={handleImport} />
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
