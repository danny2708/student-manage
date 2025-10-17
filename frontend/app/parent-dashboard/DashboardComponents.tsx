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
<<<<<<< HEAD
=======
<<<<<<< HEAD
} from "lucide-react";

/* ---------------- ParentDashboardContent ---------------- */
export function ParentDashboardContent({ onOpenSchedule }: { onOpenSchedule: () => void }) {
=======
>>>>>>> temp-merge
  ClipboardList, // Icon mới cho Tuition/Bill
  MessageSquare, // Icon mới cho Contact
} from "lucide-react";
import React from "react";

/* ---------------- ParentDashboardContent ---------------- */
export function ParentDashboardContent({ onOpenSchedule, onGoToEvaluation, onGoToTuition, onGoToChildren }: { onOpenSchedule: () => void; onGoToEvaluation: () => void; onGoToTuition: () => void; onGoToChildren: () => void; }) {
<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
  return (
    <div className="space-y-8">
      {/* Hero / quick summary */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Parent Overview</h2>
<<<<<<< HEAD
            <p className="text-indigo-100 mt-1">Summary of your family's study activity</p>
=======
<<<<<<< HEAD
            <p className="text-indigo-100 mt-1">Summary of your study activity</p>
=======
            <p className="text-indigo-100 mt-1">Summary of your family's study activity</p>
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
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
=======
>>>>>>> temp-merge
      {/* Quick actions Section (Đã thêm nhiều nút hơn) */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            Quick Access Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* 1. View Schedule (Lịch học) */}
          <QuickActionButton 
            onClick={onOpenSchedule} 
            icon={Calendar} 
            title="View Schedule" 
            subtitle="Open your children's upcoming classes"
            color="blue"
          />

          {/* 2. Study Materials (Tài liệu học) */}
          <QuickActionButton 
            onClick={() => console.log('Go to Study Materials')} 
            icon={BookOpen} 
            title="Study Materials" 
            subtitle="Access course resources and homework"
            color="green"
          />

          {/* 3. Check Evaluation (Kết quả học tập) */}
          <QuickActionButton 
            onClick={onGoToEvaluation} 
            icon={Star} 
            title="Child's Evaluation" 
            subtitle="View performance, grades, and reports"
            color="purple"
          />
          
          {/* 4. Tuition/Billing (Thanh toán) */}
          <QuickActionButton 
            onClick={onGoToTuition} 
            icon={ClipboardList} 
            title="Tuition & Payments" 
            subtitle="Check bills and payment history"
            color="yellow"
          />

          {/* 5. Contact Teacher (Liên hệ giáo viên) */}
          <QuickActionButton 
            onClick={() => console.log('Go to Contact Teacher')} 
            icon={MessageSquare} 
            title="Contact Teacher" 
            subtitle="Direct message the class teacher"
            color="pink"
          />
          
          {/* 6. Children Management (Quản lý con cái) */}
          <QuickActionButton 
            onClick={onGoToChildren} 
            icon={Users} 
            title="Children Overview" 
            subtitle="Manage profiles and course enrollment"
            color="indigo"
          />
        </div>
      </div>

      {/* Recent Activity Section (Giữ nguyên) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder: Để lại khu vực này trống hoặc có thể dùng cho thông báo/tiến độ */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                <div className="flex items-start gap-3 border-b pb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                        <div className="font-medium text-gray-900">Assignment graded (Child A)</div>
                        <div className="text-sm text-gray-600">Math - 2 hours ago</div>
                    </div>
                </div>
                <div className="flex items-start gap-3 border-b pb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                        <div className="font-medium text-gray-900">Tuition overdue notice</div>
                        <div className="text-sm text-gray-600">September Invoice - 1 day ago</div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                        <div className="font-medium text-gray-900">New announcement from School</div>
                        <div className="text-sm text-gray-600">Holiday Schedule - Yesterday</div>
                    </div>
                </div>
            </div>
<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
<<<<<<< HEAD
// (Giữ nguyên Sidebar và SidebarLink vì chúng đã đúng)
=======
<<<<<<< HEAD
=======
// (Giữ nguyên Sidebar và SidebarLink vì chúng đã đúng)
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> temp-merge
/* ---------------- Helper Component: Quick Action Button ---------------- */

// Component mới để dễ dàng tái sử dụng các nút hành động nhanh
function QuickActionButton({ onClick, icon: Icon, title, subtitle, color }: {
    onClick: () => void;
    icon: any;
    title: string;
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'yellow' | 'pink' | 'indigo'; // Thêm màu sắc để dễ tùy chỉnh
}) {
    const baseClasses = `w-full text-left p-4 rounded-xl transition-all border shadow-sm cursor-pointer`;
    
    // Tùy chỉnh màu sắc dựa trên prop 'color'
    const colorClasses = {
        blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600",
        green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-600",
        purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600",
        yellow: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-600",
        pink: "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-600",
        indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-600",
    };
    
    const iconColor = colorClasses[color].split(" ").find(c => c.startsWith('text-')) || 'text-gray-600';

    return (
        <button onClick={onClick} className={`${baseClasses} ${colorClasses[color]}`}>
            <div className="flex items-start gap-4">
                <Icon className={`h-6 w-6 ${iconColor}`} />
                <div>
                    <div className="font-semibold text-gray-900">{title}</div>
                    <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
                </div>
            </div>
        </button>
    );
}
<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
