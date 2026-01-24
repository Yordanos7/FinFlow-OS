"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { ProjectCard } from "@/components/dashboard/project-card";
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List,
  MoreVertical,
  Rocket,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

const projectsData = [
  {
    name: "Website Redesign",
    description: "Refreshed UI for the main site with modern design principles.",
    progress: 45,
    variant: "blue" as const,
    dueDate: "Oct 25",
    tags: ["PM", "Dev", "Design"],
    status: "Active",
    team: [
      { name: "John", avatar: "https://i.pravatar.cc/150?u=1" },
      { name: "Sarah", avatar: "https://i.pravatar.cc/150?u=2" },
      { name: "Mike", avatar: "https://i.pravatar.cc/150?u=3" },
    ]
  },
  {
    name: "Mobile App Launch",
    description: "Preparing for iOS and Android release with final beta testing.",
    progress: 80,
    variant: "purple" as const,
    dueDate: "Nov 10",
    tags: ["Mobile", "QA"],
    status: "In Review",
    team: [
      { name: "Alex", avatar: "https://i.pravatar.cc/150?u=4" },
      { name: "Maria", avatar: "https://i.pravatar.cc/150?u=5" },
      { name: "Chris", avatar: "https://i.pravatar.cc/150?u=6" },
      { name: "Sita", avatar: "https://i.pravatar.cc/150?u=7" },
    ]
  },
  {
    name: "Internal Tools Migration",
    description: "Updating the CRM and HR systems to the new platform.",
    progress: 25,
    variant: "pink" as const,
    dueDate: "Dec 1",
    tags: ["Backup", "IT"],
    status: "Active",
    team: [
      { name: "David", avatar: "https://i.pravatar.cc/150?u=8" },
      { name: "Lee", avatar: "https://i.pravatar.cc/150?u=9" },
    ]
  },
  {
    name: "Client Dashboard",
    description: "Building a custom dashboard for high-value clients.",
    progress: 100,
    variant: "blue" as const,
    dueDate: "Sep 30",
    tags: ["Frontend", "API"],
    status: "Completed",
    team: [
      { name: "Sarah", avatar: "https://i.pravatar.cc/150?u=2" },
      { name: "Mike", avatar: "https://i.pravatar.cc/150?u=3" },
    ]
  }
];

export default function Projects({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || project.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = [
    { label: "Total Projects", value: projectsData.length, icon: Rocket, color: "text-blue-400" },
    { label: "Active", value: projectsData.filter(p => p.status === "Active").length, icon: Clock, color: "text-purple-400" },
    { label: "Completed", value: projectsData.filter(p => p.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "In Review", value: projectsData.filter(p => p.status === "In Review").length, icon: AlertCircle, color: "text-amber-400" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">Projects</h1>
            <p className="text-gray-400">Manage, track, and collaborate on all your company projects.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-6 h-auto font-bold shadow-lg shadow-blue-500/20 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Project
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl flex items-center gap-4">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {["All", "Active", "In Review", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === tab 
                    ? "bg-white/10 text-white border border-white/20 shadow-inner" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "bg-white/10 text-blue-400" : "text-gray-500 hover:text-white")}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "bg-white/10 text-blue-400" : "text-gray-500 hover:text-white")}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <ProjectCard key={i} {...project} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:bg-white/10 transition-all group">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  project.variant === "blue" ? "bg-blue-500/20 text-blue-400" :
                  project.variant === "purple" ? "bg-purple-500/20 text-purple-400" :
                  "bg-pink-500/20 text-pink-400"
                )}>
                  <Rocket className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{project.description}</p>
                </div>

                <div className="w-full md:w-32">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Progress</span>
                    <span className="text-xs text-white font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                         project.variant === "blue" ? "bg-blue-500" :
                         project.variant === "purple" ? "bg-purple-500" :
                         "bg-pink-500"
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex -space-x-2 shrink-0">
                  {project.team.map((member, j) => (
                    <img key={j} src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border-2 border-[#090A0F]" />
                  ))}
                </div>

                <div className="shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {project.status}
                </div>

                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="p-6 rounded-full bg-white/5 border border-white/10">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">No projects found</h3>
              <p className="text-gray-400">Try adjusting your search or filters.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(""); setActiveTab("All"); }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Clear all filters
            </Button>
          </div>
        )}

        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
