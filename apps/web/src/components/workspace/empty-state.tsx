"use client";

import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onImport: (data: any[][]) => boolean;
}

export function EmptyState({ onImport }: EmptyStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(`Reading ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          toast.dismiss(loadingToast);
          toast.error("File is empty");
          setIsLoading(false);
          return;
        }
        
        // Robust CSV parsing matching Toolbar logic
        const rows: any[][] = [];
        const lines = text.split(/\r?\n/);
        
        for (const line of lines) {
          if (!line.trim()) continue; 
          
          const row: any[] = [];
          let currentCell = '';
          let insideQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
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
          row.push(currentCell.trim());
          rows.push(row);
        }

        if (rows.length === 0) {
          toast.dismiss(loadingToast);
          toast.error("No data found in file");
          setIsLoading(false);
          return;
        }

        toast.dismiss(loadingToast);
        // Add artificial delay for "processing" feel and smooth UI transition
        setTimeout(() => {
          const success = onImport(rows);
          if (success) {
            toast.success("File imported successfully!");
          } else {
            toast.error("Failed to load data");
            setIsLoading(false);
          }
        }, 800);

      } catch (error) {
        toast.dismiss(loadingToast);
        console.error("CSV Import Error:", error);
        toast.error("Failed to parse CSV file");
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
       toast.dismiss(loadingToast);
       toast.error("Failed to read file");
       setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 animate-in fade-in duration-500">
      <div 
        className={cn(
          "max-w-2xl w-full p-12 glass-card rounded-3xl border border-white/5 flex flex-col items-center text-center transition-all duration-300",
          isDragging && "border-blue-500/50 bg-blue-500/5 scale-[1.02]",
          "hover:border-white/10"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 relative group">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:blur-2xl transition-all" />
          <FileSpreadsheet className="w-10 h-10 text-blue-400 relative z-10" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center z-20">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-blue-400" />
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">Start Your Analysis</h2>
        <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed">
          Import your CSV data to unlock the power of AI-driven analytics. Drag and drop your file here or click below to upload.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? "Processing..." : "Import CSV File"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
        </div>

        <p className="mt-8 text-sm text-slate-500 font-medium">
          Supported formats: .CSV
        </p>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden" 
          accept=".csv"
        />
      </div>
    </div>
  );
}
