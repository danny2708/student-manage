"use client";

import {
  BookOpen,
  Calendar,
  Users,
  Star,
  FileText,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  DollarSign,
} from "lucide-react";

/* ---------------- ParentDashboardContent ---------------- */
export function ParentDashboardContent({ onOpenSchedule }: { onOpenSchedule: () => void }) {
  return (
    <div className="space-y-8">
      {/* Hero / quick summary */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Parent Overview</h2>
            <p className="text-indigo-100 mt-1">Summary of your study activity</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions & recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={onOpenSchedule} className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">View Schedule</div>
                  <div className="text-sm text-gray-600">Open your upcoming classes</div>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Study Materials</div>
                  <div className="text-sm text-gray-600">Open course resources</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">Assignment graded</div>
                <div className="text-sm text-gray-600">Math - 2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-gray-900">New announcement</div>
                <div className="text-sm text-gray-600">Course updates - Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
type SidebarProps = {
  activeSection: string;
  setSection: (id: string) => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  user?: any;
  mounted?: boolean;
};

export function Sidebar({ activeSection, setSection, onOpenAccount, onLogout, user, mounted }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between border-r border-gray-200">
      <div>
        <div className="flex items-center gap-3 font-bold text-xl text-blue-600 mb-6">
          <BookOpen className="h-8 w-8" />
          <span className="tracking-wide">Parent Management</span>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <div
          className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
          onClick={onOpenAccount}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            {mounted ? (user?.username ?? "Parent") : "Parent"}
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <nav className="space-y-1">
          <SidebarLink id="overview" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Dashboard" />
          <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={Star} text="Evaluation" />
          <SidebarLink id="children" activeSection={activeSection} setSection={setSection} icon={Users} text="Children" />
          <SidebarLink id="tuition" activeSection={activeSection} setSection={setSection} icon={DollarSign} text="Tuition" />
          <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
        </nav>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}


function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  const isActive = activeSection === id;
  return (
    <button
      onClick={() => setSection(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{text}</span>
    </button>
  );
}

