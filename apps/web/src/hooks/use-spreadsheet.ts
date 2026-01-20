"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { HyperFormula } from 'hyperformula';
import { trpcClient } from '@/utils/trpc';

interface CellData {
  value: any;
  formula: string;
}

interface Selection {
  row: number;
  col: number;
  endRow: number;
  endCol: number;
}

export function useSpreadsheet(initialData: any[][] = [[]]) {
  const [activeSheetId, setActiveSheetId] = useState<number>(0);
  const [sheets, setSheets] = useState<string[]>(['Sheet1']);
  
  // Enhanced State
  const [selection, setSelection] = useState<Selection>({ row: 0, col: 0, endRow: 0, endCol: 0 });
  const [colWidths, setColWidths] = useState<{ [key: number]: number }>({});
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const [dataRevision, setDataRevision] = useState(0);
  
  // Initialize HyperFormula
  const hf = useMemo(() => {
    return HyperFormula.buildEmpty({
      licenseKey: 'gpl-v3',
    });
  }, []);

  useEffect(() => {
    try {
      if (hf.countSheets() === 0) {
        hf.addSheet('Sheet1');
        if (initialData.length > 0) {
          hf.setSheetContent(0, initialData);
        }
      }
    } catch (e) {
      console.error("HF Init Error", e);
    }
  }, [hf, initialData]);

  const getCellValue = useCallback((row: number, col: number, sheet: number = activeSheetId) => {
    try {
      const cellValue = hf.getCellValue({ sheet, row, col });
      if (cellValue instanceof Error) return '#ERROR!';
      return cellValue === undefined ? '' : cellValue;
    } catch (e) {
      return '';
    }
  }, [hf, activeSheetId, dataRevision]); // Added dataRevision here

  const getCellFormula = useCallback((row: number, col: number, sheet: number = activeSheetId) => {
    try {
      return hf.getCellFormula({ sheet, row, col }) || '';
    } catch (e) {
      return '';
    }
  }, [hf, activeSheetId]);

  const updateCell = useCallback((row: number, col: number, value: string, sheet: number = activeSheetId) => {
    try {
      hf.setCellContents({ sheet, row, col }, [[value]]);
      setDataRevision(prev => prev + 1);
    } catch (e) {
      console.error('Update cell error:', e);
    }
  }, [hf, activeSheetId]);

  const addSheet = useCallback((name: string) => {
    const sheetName = name || `Sheet${sheets.length + 1}`;
    hf.addSheet(sheetName);
    setSheets(prev => [...prev, sheetName]);
  }, [hf, sheets.length]);

  // Resizing Logic
  const handleColResize = (colIndex: number, newWidth: number) => {
    setColWidths(prev => ({ ...prev, [colIndex]: Math.max(50, newWidth) }));
  };

  const handleRowResize = (rowIndex: number, newHeight: number) => {
    setRowHeights(prev => ({ ...prev, [rowIndex]: Math.max(25, newHeight) }));
  };

  const getColWidth = (index: number) => colWidths[index] || 100;
  const getRowHeight = (index: number) => rowHeights[index] || 25;

  return {
    hf,
    activeSheetId,
    setActiveSheetId,
    selection,
    setSelection,
    sheets,
    addSheet,
    getCellValue,
    getCellFormula,
    updateCell,
    processTaskWithAI: async (message: string, companyId: string) => {
      try {
        // 1. Snapshot current data
        const data = hf.getSheetValues(activeSheetId);
        
        // 2. Call AI
        const result = await trpcClient.ai.runComplexTask.mutate({
          message,
          data,
          companyId
        });

        // 3. Apply updates
        if (result.updates && Array.isArray(result.updates)) {
          result.updates.forEach((update: any) => {
            hf.setCellContents(
              { sheet: activeSheetId, row: update.row, col: update.col }, 
              [[update.formula || update.value]]
            );
          });
          setDataRevision(prev => prev + 1);
        }
        
        return result.analysis;
      } catch (e) {
        console.error("AI Task failed in processTaskWithAI:", e);
        throw e;
      }
    },
    importData: (data: any[][]): boolean => {
      try {
        console.log("📊 Starting import to sheet", activeSheetId);
        console.log("📊 Data rows:", data.length, "First 3 rows:", data.slice(0, 3));
        
        // validate data
        if (!Array.isArray(data) || data.length === 0) {
          console.error("❌ Invalid data import: empty or not an array");
          return false;
        }

        // Check if data has actual content
        const hasContent = data.some(row => row.some(cell => cell !== '' && cell != null));
        if (!hasContent) {
          console.error("❌ Invalid data import: no actual content found");
          return false;
        }

        // Set sheet content
        try {
          console.log("📊 Setting sheet content...");
          hf.setSheetContent(activeSheetId, data);
          console.log("✅ Sheet content set successfully");
        } catch (sheetError) {
          console.error("❌ Sheet update failed:", sheetError);
          return false;
        }

        // Force a revision update to trigger UI re-render
        setDataRevision(prev => {
          const newRevision = prev + 1;
          console.log("📊 Data revision updated:", prev, "->", newRevision);
          return newRevision;
        });
        
        // Reset selection to top-left
        setSelection({ row: 0, col: 0, endRow: 0, endCol: 0 });
        
        console.log("✅ Import completed successfully");
        return true;
      } catch (e) {
        console.error('❌ Import data error:', e);
        return false;
      }
    },
    handleColResize,
    handleRowResize,
    getColWidth,
    getRowHeight,
    rowCount: 1000,
    colCount: 26,
    dataRevision
  };
}
