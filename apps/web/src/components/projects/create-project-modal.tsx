"use client";

import React, { useState, useEffect } from "react";
import { X, Rocket, Calendar, Users, Briefcase, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full max-w-lg glass-card rounded-[32px] overflow-hidden transition-all duration-500 transform",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        )}
      >
        {/* Header */}
        <div className="relative p-8 pb-0 flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Rocket className="w-3 h-3" />
              New Project
            </div>
            <h2 className="text-2xl font-bold text-white">Create New Project</h2>
            <p className="text-gray-400 text-sm">Fill in the details to launch your next mission.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Type className="w-3 h-3 text-blue-400" />
                Project Name
              </Label>
              <Input 
                id="name" 
                placeholder="e.g. Q1 Marketing Campaign" 
                className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3 h-3 text-purple-400" />
                Description
              </Label>
              <textarea 
                id="description" 
                rows={3}
                placeholder="Briefly describe the project goals..." 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-blue-500/50 focus:outline-none focus:border-blue-500/30 transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-gray-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-pink-400" />
                  Due Date
                </Label>
                <Input 
                  id="due-date" 
                  type="date"
                  className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-blue-500/50 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team" className="text-gray-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3 text-cyan-400" />
                  Team Size
                </Label>
                <Input 
                  id="team" 
                  type="number"
                  placeholder="3-5"
                  className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-12 font-bold"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-500/20"
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
