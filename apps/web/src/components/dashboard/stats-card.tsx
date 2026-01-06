"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  variant: "blue" | "purple" | "cyan" | "pink";
  trend?: string;
  chart?: "sparkline" | "none";
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant, 
  trend,
  chart = "none"
}: StatsCardProps) {
  const variantStyles = {
    blue: "bg-blue-500/20 text-blue-400 neon-glow-blue",
    purple: "bg-purple-500/20 text-purple-400 neon-glow-purple",
    cyan: "bg-cyan-500/20 text-cyan-400 neon-glow-blue",
    pink: "bg-pink-500/20 text-pink-400 neon-glow-purple",
  };

  return (
    <div className="glass-card p-6 rounded-3xl group hover:bg-white/[0.07] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>

      {chart === "sparkline" && (
        <div className="mt-4 h-12 w-full flex items-end gap-1">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-500 group-hover:bg-opacity-100 bg-opacity-60",
                variantStyles[variant].split(' ')[0]
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
