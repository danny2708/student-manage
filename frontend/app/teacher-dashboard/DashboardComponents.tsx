"use client";

import React, { useEffect, useState } from "react";
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
  TrendingUp,
  Clock,
  Award,
  Star,
  User,
} from "lucide-react";

import type { TeacherStats } from "../../src/services/api/teacher";
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
    emerald: "from-emerald-500 to-emerald-400",
    orange: "from-orange-500 to-orange-400",
    cyan: "from-cyan-500 to-cyan-400",
    purple: "from-violet-500 to-violet-400",
    red: "from-red-500 to-red-400",
    slate: "from-slate-700 to-slate-600",
  };
  const gradient = variantClasses[variant] ?? variantClasses.cyan;

  return (
    <div className={`rounded-xl p-5 shadow-sm bg-white border border-gray-100`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
          {/* icon placeholder; keep empty so no unexpected block inside p */}
          <div className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-green-500" />
      </div>

      {/* Use DIVs instead of P to avoid block-in-p problems */}
      <div className="text-sm text-muted-foreground mb-1 text-gray-600">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export function TeacherDashboardContent({ stats, onOpenSchedule, setSection }: { stats: TeacherStats, onOpenSchedule: () => void, setSection: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, Teacher!</h2>
            <div className="text-purple-100">Ready to inspire and educate today?</div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Classes Taught" value={stats.class_taught} variant="emerald" />
        <StatCard title="Schedules" value={stats.schedules} variant="cyan" />
        <StatCard title="Reviews" value={<span className="font-medium">{stats.reviews}</span>} variant="orange" />
        <StatCard
          title="Rate"
          value={
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.rate}</span>
              <Star className="h-5 w-5 text-yellow-400 " />
            </div>
          }
          variant="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button onClick={onOpenSchedule} className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">View Today's Schedule</div>
                  <div className="text-sm text-gray-600">Check your classes for today</div>
                </div>
              </div>
            </button>
            <button onClick={() => setSection("attendance")} className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Take Attendance</div>
                  <div className="text-sm text-gray-600">Mark student attendance</div>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Grade Assignments</div>
                  <div className="text-sm text-gray-600">Review and grade student work</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Math Class - Grade 10A</div>
                <div className="text-sm text-gray-600">Completed 2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Assignment Graded</div>
                <div className="text-sm text-gray-600">Physics homework - 4 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">New Student Review</div>
                <div className="text-sm text-gray-600">5-star rating received - Yesterday</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Schedule Updated</div>
                <div className="text-sm text-gray-600">Chemistry lab added - 2 days ago</div>
              </div>
            </div>
          </div>
        </div>
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
  // mounted guard to avoid SSR/client mismatch for username
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between border-r border-gray-200">
      <div>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 font-bold text-xl text-blue-600">
            <BookOpen className="h-8 w-8" />
            <span className="tracking-wide">Student Management</span>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <div
          // clickable area, but avoid nested interactive element inside
          className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
          onClick={onOpenAccount}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>

          {/* Use non-interactive element for label to avoid nested button */}
          <div className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            {mounted ? (user?.username ?? "Teacher") : "Teacher"}
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <nav className="space-y-1">
          <SidebarLink id="dashboard" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Dashboard" />

          <Category name="academic" title="Academic" icon={BookOpen} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
            <SidebarLink id="attendance" activeSection={activeSection} setSection={setSection} icon={Users} text="Attendances" />
            <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
            <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Classes" />
            <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={StarIcon} text="Evaluations" />
          </Category>

          <Category name="personal" title="Personal" icon={User} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
            <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={Wallet} text="Payrolls" />
            <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={StarIcon} text="Teacher reviews" />
            <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
          </Category>
        </nav>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
}

export function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  const isActive = activeSection === id;

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setSection(id);
      }}
      className={`block px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-blue-500 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="font-medium">{text}</span>
      </div>
    </a>
  );
}

export function Category({ name, title, icon: Icon, expandedCategories, toggleCategory, children }: any) {
  const isExpanded = expandedCategories.includes(name);

  return (
    <div className="mb-3">
      <button
        onClick={() => toggleCategory(name)}
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-700"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span className="font-semibold">{title}</span>
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {isExpanded && <div className="space-y-1 mt-2 pl-4">{children}</div>}
    </div>
  );
}
