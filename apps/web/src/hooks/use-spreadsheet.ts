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
  const [cellStyles, setCellStyles] = useState<Record<string, { align?: 'left' | 'center' | 'right' }>>({});
  
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
      
      // Handle all error types from HyperFormula
      if (cellValue === null || cellValue === undefined) return '';
      if (cellValue instanceof Error) return '#ERROR!';
      if (typeof cellValue === 'object' && cellValue !== null && 'type' in cellValue) {
        // DetailedCellError has a 'type' property
        return '#ERROR!';
      }
      
      return cellValue;
    } catch (e) {
      return '';
    }
  }, [hf, activeSheetId]); // Removed dataRevision to prevent cascade re-renders

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
      // Silently handle errors
    }
  }, [hf, activeSheetId]);

  const addSheet = useCallback((name: string) => {
    const sheetName = name || `Sheet${sheets.length + 1}`;
    hf.addSheet(sheetName);
    setSheets(prev => [...prev, sheetName]);
  }, [hf, sheets.length]);

  // Resizing Logic
  const handleColResize = useCallback((colIndex: number, newWidth: number) => {
    setColWidths(prev => ({ ...prev, [colIndex]: Math.max(50, newWidth) }));
  }, []);

  const handleRowResize = useCallback((rowIndex: number, newHeight: number) => {
    setRowHeights(prev => ({ ...prev, [rowIndex]: Math.max(25, newHeight) }));
  }, []);

  const getColWidth = useCallback((index: number) => colWidths[index] || 120, [colWidths]);
  const getRowHeight = useCallback((index: number) => rowHeights[index] || 32, [rowHeights]);

  // --- Structure Manipulation ---
  const insertRow = useCallback((index: number) => {
    try {
      // addRows(sheetId, [row, amount])
      hf.addRows(activeSheetId, [index, 1]);
      setDataRevision(prev => prev + 1);
    } catch (e) { console.error(e); }
  }, [hf, activeSheetId]);

  const insertCol = useCallback((index: number) => {
    try {
        hf.addColumns(activeSheetId, [index, 1]);
        setDataRevision(prev => prev + 1);
    } catch (e) { console.error(e); }
  }, [hf, activeSheetId]);

  const deleteRow = useCallback((index: number) => {
      try {
        hf.removeRows(activeSheetId, [index, 1]);
        setDataRevision(prev => prev + 1);
      } catch (e) { console.error(e); }
  }, [hf, activeSheetId]);

  const deleteCol = useCallback((index: number) => {
      try {
        hf.removeColumns(activeSheetId, [index, 1]);
        setDataRevision(prev => prev + 1);
      } catch (e) { console.error(e); }
  }, [hf, activeSheetId]);

  // --- Styling ---
  const setAlignment = useCallback((align: 'left' | 'center' | 'right') => {
      setCellStyles(prev => {
          const next = { ...prev };
          // Apply to current selection range
          for (let r = selection.row; r <= selection.endRow; r++) {
              for (let c = selection.col; c <= selection.endCol; c++) {
                  const key = `${r},${c}`;
                  next[key] = { ...next[key], align };
              }
          }
          return next;
      });
      setDataRevision(prev => prev + 1); // Trigger re-render
  }, [selection]);

  const getCellStyle = useCallback((row: number, col: number) => {
      return cellStyles[`${row},${col}`] || {};
  }, [cellStyles]);


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
    processTaskWithAI: async (message: string, companyId: string, conversationId?: string) => {
      try {
        // 1. Snapshot current data
        const data = hf.getSheetValues(activeSheetId);
        
        // 2. Call AI
        const result = await trpcClient.ai.runComplexTask.mutate({
          message,
          data,
          companyId,
          conversationId
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
        
        return {
          analysis: result.analysis,
          conversationId: result.conversationId
        };
      } catch (e) {
        throw e;
      }
    },
    importData: (data: any[][]): boolean => {
      try {
        // validate data
        if (!Array.isArray(data) || data.length === 0) {
          return false;
        }

        // Check if data has actual content
        const hasContent = data.some(row => row.some(cell => cell !== '' && cell != null));
        if (!hasContent) {
          return false;
        }

        // Set sheet content
        try {
          hf.setSheetContent(activeSheetId, data);
        } catch (sheetError) {
          return false;
        }

        // Force a revision update to trigger UI re-render
        setDataRevision(prev => prev + 1);
        
        // Reset selection to top-left
        setSelection({ row: 0, col: 0, endRow: 0, endCol: 0 });
        
        return true;
      } catch (e) {
        return false;
      }
    },
    handleColResize,
    handleRowResize,
    getColWidth,
    getRowHeight,
    rowCount: 1000,
    colCount: 26,
    dataRevision,
    // New Exports
    insertRow,
    insertCol,
    deleteRow,
    deleteCol,
    setAlignment,
    getCellStyle
  };
}
