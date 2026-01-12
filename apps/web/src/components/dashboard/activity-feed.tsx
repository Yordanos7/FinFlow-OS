"use client";

import React from "react";
import { RefreshCw, FileText, UserPlus, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    icon: FileText,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-400/10",
    time: "Today, 10:30 AM",
    description: "Sarah T. approved a budget request for Project Alpha.",
  },
  {
    icon: UserPlus,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-400/10",
    time: "Today, 09:15 AM",
    description: "New task assigned to Team Beta by John D.",
  },
  {
    icon: Trophy,
    iconColor: "text-pink-400",
    bgColor: "bg-pink-400/10",
    time: "Yesterday, 4:45 PM",
    description: "Project Gamma milestone achieved by Emily R.",
  },
  {
    icon: Clock,
    iconColor: "text-gray-400",
    bgColor: "bg-gray-400/10",
    time: "Yesterday, 2:00 PM",
    description: "System update scheduled for 12:00 AM, Oct 15.",
  },
];

export function ActivityFeed() {
  return (
    <div className="glass-card flex flex-col h-full rounded-3xl overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <h5 className="text-white font-bold">Recent Activity</h5>
        <button className="text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {activities.map((activity, i) => (
          <div key={i} className="flex gap-4 group">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", activity.bgColor)}>
              <activity.icon className={cn("w-5 h-5", activity.iconColor)} />
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{activity.time}</p>
              <p className="text-gray-200 text-sm leading-relaxed">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
