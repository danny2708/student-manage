"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  Star as StarIcon,
  Wallet,
  LogOut,
  User as UserIcon,
  Users,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

import type { TeacherStats } from "../../src/services/api/teacher"; 
import { Star } from "lucide-react";

export type { TeacherStats };

/* ---------- StatCard & Dashboard Content ---------- */

export function StatCard({
  title,
  value,
  variant = "cyan",
}: {
  title: string;
  value: React.ReactNode;
  variant?: "emerald" | "orange" | "cyan" | "purple" | "red" | "slate";
}) {
  const variantClasses: Record<string, string> = {
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    cyan: "bg-cyan-500",
    purple: "bg-violet-500",
    red: "bg-red-500",
    slate: "bg-slate-700",
  };
  const bg = variantClasses[variant] ?? variantClasses.cyan;

  return (
    <div className={`${bg} rounded-lg p-4 shadow-md text-white flex-1 flex flex-col items-center justify-center text-center`}>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold mt-2 flex items-center gap-2">{value}</div>
    </div>
  );
}

export function TeacherDashboardContent({ stats }: { stats: TeacherStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Classes Taught" value={stats.class_taught} variant="emerald" />
        <StatCard title="Schedules" value={stats.schedules} variant="cyan" />
        <StatCard
          title="Reviews"
          value={
            <>
              <span className="font-medium">{stats.reviews}</span>
            </>
          }
          variant="orange"
        />
        <StatCard
                    title="Rate"
                    value={
                        <>
                            <span className="font-medium">{stats.rate}</span>
                            <Star className="h-8 w-8 text-yellow-400 drop-shadow-sm fill-current" />
                        </>
                    }
                    variant="purple"
                />
      </div>
    </div>
  );
}

/* ---------- Sidebar + helpers (exported) ---------- */

type SidebarProps = {
  activeSection: string;
  setSection: (id: string) => void;
  expandedCategories: string[];
  toggleCategory: (id: string) => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  user?: any;
};

export function Sidebar({
  activeSection,
  setSection,
  expandedCategories,
  toggleCategory,
  onLogout,
  onOpenAccount,
  user,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 font-extrabold text-xl text-cyan-400">
            <BookOpen className="h-10 w-10" />
            <span className="tracking-wide">Student Management</span>
          </div>
        </div>

        {/* Thêm dòng kẻ giữa "Teacher Dashboard" và user avatar */}
        <div className="border-t border-gray-700 my-4" />

        <div
          className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
          onClick={onOpenAccount}
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <button onClick={onOpenAccount} className="text-sm text-gray-300 underline-offset-2 hover:underline">
            {user?.username ?? "Teacher"}
          </button>
        </div>

        {/* Thêm dòng kẻ giữa user avatar và "Dashboard" */}
        <div className="border-t border-gray-700 my-4" />

        <nav className="space-y-2">
          {/* Dashboard link - default state */}
          <SidebarLink id="dashboard" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Dashboard" />

          <Category name="academic" title="Academic" icon={BookOpen} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
            <SidebarLink id="attendance" activeSection={activeSection} setSection={setSection} icon={Users} text="Attendances" />
            <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
            <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Classes" />
            <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={StarIcon} text="Evaluations" />
          </Category>

          <Category name="personal" title="Personal" icon={Wallet} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
            <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={FileText} text="Payrolls" />
            <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={StarIcon} text="Teacher reviews" />
            <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
          </Category>
        </nav>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
}

export function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setSection(id);
      }}
      className={`block px-3 py-2 rounded-lg transition-colors ${activeSection === id ? "bg-cyan-500 text-white" : "hover:bg-gray-700"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {text}
      </div>
    </a>
  );
}

export function Category({ name, title, icon: Icon, expandedCategories, toggleCategory, children }: any) {
  return (
    <div>
      <button onClick={() => toggleCategory(name)} className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {title}
        </div>
        {expandedCategories.includes(name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {expandedCategories.includes(name) && <div className="space-y-1 mt-2 pl-4">{children}</div>}
    </div>
  );
}
