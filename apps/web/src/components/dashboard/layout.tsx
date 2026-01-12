"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

import styles from "../../app/stars.module.css";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full text-white overflow-hidden relative" style={{
      background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)"
    }}>
      {/* Dynamic Background Effects */}
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      <div className={styles.stars3}></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar - Controlled by State */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
