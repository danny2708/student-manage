"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../src/hooks/useAuth";
import type { LoginResponse } from "../../src/services/api/auth";

import {
  BookOpen,
  Calendar,
  Bell,
  FileText,
  Star,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react";

// reuse common modals/components from manager dashboard
import { UserAccountModal } from "../user_account";
import { UserInfoModal } from "../manager-dashboard/showInfo/UserAccountModal";
import { ActionModal } from "../manager-dashboard/showInfo/action_modal";
import { CreateModal } from "../manager-dashboard/showInfo/create_modal";
import { ShowInfoModal } from "../manager-dashboard/showInfo/ShowInfoModal";

// dynamic imports — reuse existing where possible
const AttendanceManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/attendance/AttendanceManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);
const ScheduleManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);
const ClassManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/class/ClassManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);
const EvaluationManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/EvaluationManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);
const PayrollManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/payroll/PayrollManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);
const TeacherReviewManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/TeacherReviewManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);

// new dynamic components you need to implement (stubbed)
const ReportManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/report/ReportManagement"),
  { ssr: false, loading: () => <p>Loading...</p> }
);

// Teacher hook (expected)
import { useTeacher } from "../../src/hooks/useTeacher";

type TeacherStats = {
  class_taught: number;
  schedules: number;
  reviews: number;
  rate: number;
};

export default function TeacherDashboard() {
  const { user } = useAuth() as { user: LoginResponse | null };
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "academic",
  ]);
  const [visitedSections, setVisitedSections] = useState<string[]>([
    "dashboard",
  ]);

  const [searchTerms, setSearchTerms] = useState({
    attendance: "",
    schedule: "",
    classes: "",
    evaluation: "",
    payroll: "",
    reviews: "",
    report: "",
  });

  // modal / selection states (similar to manager)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserInfo, setShowUserInfo] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<any>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // notifications
  const { teacherStats, fetchTeacherStats, notifications, fetchNotifications } =
    useTeacher() as {
      teacherStats?: TeacherStats | null;
      fetchTeacherStats?: () => Promise<void>;
      notifications?: Array<{ id: string; title: string; body?: string; time?: string }>;
      fetchNotifications?: () => Promise<void>;
    };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);

  useEffect(() => {
    // initial load teacher stats + notifications
    if (fetchTeacherStats) fetchTeacherStats();
    if (fetchNotifications) fetchNotifications();
  }, [fetchTeacherStats, fetchNotifications]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const updateSearchTerm = (section: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [section]: value }));
  };

  const handleTableRowClick = (type: string, data: any) => {
    if (type === "user") setSelectedUser(data);
    else setShowActionModal({ type, data });
  };

  const handleShowInfo = () => {
    if (showActionModal) {
      setShowInfoModal(showActionModal);
      setShowActionModal(null);
    }
  };

  const handleUserShowInfo = () => {
    if (selectedUser) {
      setShowUserInfo(selectedUser);
      setSelectedUser(null);
    }
  };

  const handleCreateNew = (type: string) => {
    setShowCreateModal(type);
  };

  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id]);
  };

  // default teacher stat values
  const stats: TeacherStats = {
    class_taught: teacherStats?.class_taught ?? 0,
    schedules: teacherStats?.schedules ?? 0,
    reviews: teacherStats?.reviews ?? 0,
    rate: teacherStats?.rate ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-4 font-extrabold text-xl text-cyan-400">
              <BookOpen className="h-10 w-10" />
              <span className="tracking-wide">Teacher Dashboard</span>
            </div>
          </div>

          <div
            className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
            onClick={() => setShowAccountModal(true)}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm text-gray-300">{user?.username ?? "Teacher"}</span>
          </div>

          <nav className="space-y-2">
            {/* ACADEMIC */}
            <Category
              name="academic"
              title="Academic"
              icon={BookOpen}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
            >
              <SidebarLink id="attendance" activeSection={activeSection} setSection={setSection} icon={Users} text="Attendances" />
              <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
              <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Classes" />
              <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={Star} text="Evaluations" />
            </Category>

            {/* PERSONAL */}
            <Category
              name="personal"
              title="Personal"
              icon={Wallet}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
            >
              <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={FileText} text="Payrolls" />
              <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={Star} text="Teacher reviews" />
              <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
            </Category>
          </nav>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>

 {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Top bar: dashboard header + notification bell + personal schedule */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPersonalSchedule(true)}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Open Personal Schedule
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((s) => !s);
                  if (fetchNotifications) fetchNotifications();
                }}
                className="p-2 rounded-full hover:bg-gray-200/10"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b">
                    <strong>Notifications</strong>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-gray-100 border-b">
                          <div className="font-medium">{n.title}</div>
                          {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
                          <div className="text-xs text-gray-400 mt-1">{n.time ?? ""}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    )}
                  </div>
                  <div className="p-2 text-center border-t">
                    <button className="text-sm text-cyan-600 hover:underline">View all</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT PAGES */}
        <div className={activeSection === "dashboard" ? "block" : "hidden"}>
          <TeacherDashboardContent stats={stats} />
        </div>

        {visitedSections.includes("attendance") && (
          <div className={activeSection === "attendance" ? "block" : "hidden"}>
            <AttendanceManagement searchTerm={searchTerms.attendance} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick} />
          </div>
        )}

        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement searchTerm={searchTerms.schedule} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick} />
          </div>
        )}

        {visitedSections.includes("class") && (
          <div className={activeSection === "class" ? "block" : "hidden"}>
            <ClassManagement searchTerm={searchTerms.classes} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleClassCardClick={(c:any)=>handleTableRowClick("class",c)} />
          </div>
        )}

        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={updateSearchTerm}/>
          </div>
        )}

        {visitedSections.includes("payroll") && (
          <div className={activeSection === "payroll" ? "block" : "hidden"}>
            <PayrollManagement searchTerm={searchTerms.payroll} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>
          </div>
        )}

        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.reviews} updateSearchTerm={updateSearchTerm}/>
          </div>
        )}

        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block" : "hidden"}>
            <ReportManagement searchTerm={searchTerms.report} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Modals reused from manager */}
        {showUserInfo && <Modal><UserInfoModal user={showUserInfo} onClose={()=>setShowUserInfo(null)} onChangeRole={()=>setShowUserInfo(null)} /></Modal>}
        {selectedUser && <Modal><RoleModal onShowInfo={handleUserShowInfo} onClose={()=>setSelectedUser(null)} onDelete={()=>{}} user={selectedUser} /></Modal>}
        {showActionModal && <Modal><ActionModal onClose={()=>setShowActionModal(null)} onShowInfo={handleShowInfo} onDelete={()=>{}} /></Modal>}
        {showCreateModal && <Modal><CreateModal type={showCreateModal} onClose={()=>setShowCreateModal(null)} onCreate={()=>{}} /></Modal>}
        {showInfoModal && <Modal><ShowInfoModal type={showInfoModal.type} data={showInfoModal.data} onClose={()=>setShowInfoModal(null)} /></Modal>}
        {showAccountModal && user && <Modal dark onClose={()=>setShowAccountModal(false)}><UserAccountModal user={user} onClose={()=>setShowAccountModal(false)}/></Modal>}

        {/* Personal Schedule modal */}
        {showPersonalSchedule && (
          <Modal dark onClose={() => setShowPersonalSchedule(false)}>
            <PersonalSchedule onClose={() => setShowPersonalSchedule(false)} />
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ----------------- Small helper components ----------------- */

function TeacherDashboardContent({ stats }: { stats: TeacherStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Classes Taught" value={stats.class_taught.toString()} />
        <StatCard title="Schedules" value={stats.schedules.toString()} />
        <StatCard title="Reviews" value={stats.reviews.toString()} />
        <StatCard title="Rate" value={`${stats.rate}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-700 border-slate-600 rounded-lg p-4">
          <h3 className="text-white text-lg font-semibold mb-2">Overview</h3>
          <p className="text-slate-300">Quick summary and shortcuts for your classes, schedules, and reports.</p>
          <div className="mt-4">
            {/* shortcuts */}
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-cyan-500 rounded text-white">My Classes</button>
              <button className="px-3 py-2 bg-slate-600 rounded text-white">My Schedules</button>
              <button className="px-3 py-2 bg-slate-600 rounded text-white">Create Report</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 border-slate-600 rounded-lg p-4">
          <h3 className="text-white text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-slate-300">Recent important alerts will appear here.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-slate-700 border-slate-600 rounded-lg p-4">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="text-3xl font-bold text-white mt-2">{value}</div>
    </div>
  );
}

function PersonalSchedule({ onClose }: { onClose: () => void }) {
  // Simple custom schedule modal — you can replace with a full calendar lib
  const sample = [
    { time: "08:00", title: "Math - Grade 10", room: "A1" },
    { time: "10:00", title: "Physics - Grade 11", room: "B2" },
    { time: "14:00", title: "Office Hours", room: "Online" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 text-black dark:text-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Personal Schedule</h2>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-slate-200 rounded">Close</button>
        </div>
      </div>

      <div className="space-y-3">
        {sample.map((s, i) => (
          <div key={i} className="p-3 border rounded bg-slate-50 dark:bg-slate-700">
            <div className="font-medium">{s.title}</div>
            <div className="text-sm text-slate-600">{s.time} • {s.room}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reused small components (Sidebar, Category, Modal) ---------- */

function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setSection(id);
      }}
      className={`block px-3 py-2 rounded-lg transition-colors ${
        activeSection === id ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {text}
      </div>
    </a>
  );
}

function Category({ name, title, icon: Icon, expandedCategories, toggleCategory, children }: any) {
  return (
    <div>
      <button
        onClick={() => toggleCategory(name)}
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {title}
        </div>
        {expandedCategories.includes(name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {expandedCategories.includes(name) && (
        <div className="space-y-1 mt-2 pl-4">{children}</div>
      )}
    </div>
  );
}

function Modal({ children, dark = false, onClose }: any) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${dark ? "bg-black/30" : ""}`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}