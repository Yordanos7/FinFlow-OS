"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  avatar: string;
}

interface ProjectCardProps {
  name: string;
  description: string;
  progress: number;
  team: TeamMember[];
  dueDate: string;
  variant: "blue" | "purple" | "pink";
  tags?: string[];
}

export function ProjectCard({
  name,
  description,
  progress,
  team,
  dueDate,
  variant,
  tags
}: ProjectCardProps) {
  const gradientStyles = {
    blue: "from-blue-500 to-blue-400 neon-glow-blue",
    purple: "from-purple-600 to-purple-400 neon-glow-purple",
    pink: "from-pink-600 to-pink-400 neon-glow-purple",
  };

  return (
    <div className="glass-card p-6 rounded-3xl hover:bg-white/[0.07] transition-all duration-300">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-white mb-1">{name}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      <div className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Progress</span>
            <span className="text-white text-sm font-bold">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", gradientStyles[variant])}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer: Team & Info */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex -space-x-3">
            {team.map((member, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-[#1E293B] overflow-hidden bg-[#1E293B]"
                title={member.name}
              >
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
            ))}
            {tags && tags.map((tag, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-[#1E293B] bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-400"
              >
                {tag}
              </div>
            ))}
          </div>
          
          <div className="text-right">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block">Due Date</span>
            <span className="text-gray-300 text-xs font-semibold">{dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
