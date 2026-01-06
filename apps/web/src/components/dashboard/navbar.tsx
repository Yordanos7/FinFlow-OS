"use client";

import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 h-20 z-10">
      {/* Search Bar */}
      <div className="relative w-full max-w-xl group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search projects, tasks..."
          className="block w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 neon-border-purple group-hover:bg-white/10"
        />
        <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:neon-glow-purple transition-all duration-300" />
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
          <Bell className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#0F172A] flex items-center justify-center text-[10px] font-bold text-white">
              3
            </span>
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-white font-semibold text-sm">Sarah T.</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 text-xs">Admin</span>
              <div className="w-2 h-2 rounded-full bg-green-500 neon-glow-blue" />
            </div>
          </div>
          <div className="group relative flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-blue-500/30 group-hover:ring-blue-500/50 transition-all">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Sarah T." 
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-y-0.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
