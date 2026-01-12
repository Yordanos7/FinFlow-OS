"use client";

import { DashboardLayout } from "@/components/dashboard/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { 
  Rocket, 
  Users, 
  Wallet, 
  CheckCircle2 
} from "lucide-react";
import { AIChatOverlay } from "@/components/ai/AIChatOverlay";

export default function Dashboard({ session }: { session: any }) {
  const stats = [
    {
      title: "Total Projects",
      value: "24",
      subtitle: "+2 this week",
      icon: Rocket,
      variant: "blue" as const,
      trend: "12%",
    },
    {
      title: "Active Teams",
      value: "8",
      subtitle: "+1 new member",
      icon: Users,
      variant: "purple" as const,
      trend: "5%",
    },
    {
      title: "Total Budget",
      value: "1.2M Birr",
      subtitle: "85% utilized",
      icon: Wallet,
      variant: "cyan" as const,
    },
    {
      title: "Completion Rate",
      value: "67%",
      subtitle: "Weekly average",
      icon: CheckCircle2,
      variant: "pink" as const,
      chart: "sparkline" as const,
    },
  ];

  const projects = [
    {
      name: "Website Redesign",
      description: "Refreshed UI for the main site.",
      progress: 45,
      variant: "blue" as const,
      dueDate: "Oct 25",
      tags: ["PM", "Dev", "Design"],
      team: [
        { name: "John", avatar: "https://i.pravatar.cc/150?u=1" },
        { name: "Sarah", avatar: "https://i.pravatar.cc/150?u=2" },
        { name: "Mike", avatar: "https://i.pravatar.cc/150?u=3" },
      ]
    },
    {
      name: "Mobile App Launch",
      description: "Preparing for iOS and Android release.",
      progress: 80,
      variant: "purple" as const,
      dueDate: "Nov 10",
      team: [
        { name: "Alex", avatar: "https://i.pravatar.cc/150?u=4" },
        { name: "Maria", avatar: "https://i.pravatar.cc/150?u=5" },
        { name: "Chris", avatar: "https://i.pravatar.cc/150?u=6" },
        { name: "Sita", avatar: "https://i.pravatar.cc/150?u=7" },
      ]
    },
    {
      name: "Internal Tools Migration",
      description: "Updating the CRM and HR systems.",
      progress: 25,
      variant: "pink" as const,
      dueDate: "Dec 1",
      team: [
        { name: "David", avatar: "https://i.pravatar.cc/150?u=8" },
        { name: "Lee", avatar: "https://i.pravatar.cc/150?u=9" },
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white">Company Overview</h2>
          <p className="text-gray-400">Welcome back, {session?.user?.name || "Sarah"}. Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white border-b-2 border-blue-500 pb-2">Active Projects</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <ProjectCard key={i} {...project} />
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-4 h-full">
            <ActivityFeed />
          </div>
        </div>
      </div>
      <AIChatOverlay />
    </DashboardLayout>
  );
}
