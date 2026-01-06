"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Rocket,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Projects", icon: Rocket, href: "/projects" },
  { name: "Team", icon: Users, href: "/team" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div 
      className={cn(
        "relative flex flex-col h-full glass-card border-none transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 neon-glow-blue">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        {!isCollapsed && (
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            FinFlowOs
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white neon-border-blue" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full neon-glow-blue" />
              )}
              <item.icon className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-blue-400" : "group-hover:text-blue-400"
              )} />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-6 text-gray-400 hover:text-white flex items-center gap-4 transition-colors border-t border-white/5"
      >
        {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        {!isCollapsed && <span className="font-medium">Collapse</span>}
      </button>
    </div>
  );
}
