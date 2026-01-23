"use client";

import React, { useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/layout";
import { Toolbar } from "@/components/workspace/toolbar";
import { FormulaBar } from "@/components/workspace/formula-bar";
import { Spreadsheet } from "@/components/workspace/spreadsheet";
import { SheetTabs } from "@/components/workspace/sheet-tabs";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";

export default function WorkspacePage() {
  const initialData = useMemo(() => [
    ['Sales Report - Q1', '', '', '', ''],
    ['Month', 'Units', 'Price', 'Revenue', 'Status'],
    ['January', 150, 29.99, '=B3*C3', '✓ Done'],
    ['February', 220, 29.99, '=B4*C4', '✓ Done'],
    ['March', 180, 34.99, '=B5*C5', '⚠ Pending'],
    ['TOTAL', '=SUM(B3:B5)', '', '=SUM(D3:D5)', ''],
  ], []);

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
    dataRevision
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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.4))] bg-[#0F172A] overflow-hidden gap-3">
        {/* Workspace Toolbar */}
        <Toolbar 
          onAITask={(msg) => processTaskWithAI(msg, 'default-company')} 
          onImport={importData}
        />

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
        <div className="flex-1 relative bg-[#0F172A] p-4">
          <div className="w-full h-full rounded-2xl overflow-hidden glass-card">
        <Spreadsheet 
              rowCount={rowCount}
              colCount={colCount}
              selection={selection}
              onSelect={handleSelect}
              getCellValue={getCellValue}
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
      </div>
    </DashboardLayout>
  );
}
