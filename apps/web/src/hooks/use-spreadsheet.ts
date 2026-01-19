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
  }, [hf, activeSheetId]);

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
      // Force re-render shallow update
      setSelection(prev => ({ ...prev })); 
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
      // 1. Snapshot current data
      const data = hf.getSheetContent(activeSheetId);
      
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
        setSelection(prev => ({ ...prev }));
      }
      
      return result.analysis;
    },
    handleColResize,
    handleRowResize,
    getColWidth,
    getRowHeight,
    rowCount: 1000,
    colCount: 26,
  };
}
