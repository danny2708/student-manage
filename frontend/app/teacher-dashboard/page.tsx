"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../src/hooks/useAuth";
import type { LoginResponse } from "../../src/services/api/auth";
import {
  BookOpen,
  Calendar,
  FileText,
  Star,
  Wallet,
  LogOut,
  User as UserIcon,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// dynamic imports
const ScheduleManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement"),
  { ssr: false }
);
const ClassManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/class/ClassManagement"),
  { ssr: false }
);
const EvaluationManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/EvaluationManagement"),
  { ssr: false }
);
const PayrollManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/payroll/PayrollManagement"),
  { ssr: false }
);
const TeacherReviewManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/TeacherReviewManagement"),
  { ssr: false }
);

import NotificationManagement from "./notification/NotificationManagement";
import PersonalScheduleModal from "./personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";

import { useTeacher } from "../../src/hooks/useTeacher";
import { TeacherStats } from "../../src/services/api/teacher";

export default function TeacherDashboard() {
  const { user } = useAuth() as { user: LoginResponse | null };
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["academic"]);
  const [visitedSections, setVisitedSections] = useState<string[]>(["dashboard"]);

  const [searchTerms, setSearchTerms] = useState({
    attendance: "",
    schedule: "",
    classes: "",
    evaluation: "",
    payroll: "",
    reviews: "",
    report: "",
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);

  // hooks
  // useTeacher may provide different signatures; we will call it defensively below
  const teacherHook = useTeacher() as any;
  const { teacherStats } = teacherHook || {};

  // safe call to fetchTeacherStats: some hook versions expect an id param, some do not.
  useEffect(() => {
    const safeFetch = async () => {
      if (!teacherHook) return;
      const fn = teacherHook.fetchTeacherStats;
      if (typeof fn !== "function") return;

      try {
        // if function declared params >= 1 and we have user id, pass it
        if (fn.length >= 1 && user?.user_id !== undefined) {
          await fn(user.user_id);
        } else {
          await fn();
        }
      } catch (err) {
        // swallow (or console) — component should not crash if fetch fails
        // you can add toast here if desired
        // console.error("fetchTeacherStats failed:", err);
      }
    };

    safeFetch();
    // intentionally only depend on the function reference and user id
  }, [teacherHook, teacherHook?.fetchTeacherStats, user?.user_id]);

  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id]);
  };

  const stats: TeacherStats = {
    class_taught: teacherStats?.class_taught ?? 0,
    schedules: teacherStats?.schedules ?? 0,
    reviews: teacherStats?.reviews ?? 0,
    rate: teacherStats?.rate ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
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
            <button
              onClick={() => setShowAccountModal(true)}
              className="text-sm text-gray-300 underline-offset-2 hover:underline"
            >
              {user?.username ?? "Teacher"}
            </button>
          </div>

          <nav className="space-y-2">
            <Category
              name="academic"
              title="Academic"
              icon={BookOpen}
              expandedCategories={expandedCategories}
              toggleCategory={(id: any) => {
                setExpandedCategories((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                );
              }}
            >
              <SidebarLink id="attendance" activeSection={activeSection} setSection={setSection} icon={Users} text="Attendances" />
              <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
              <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Classes" />
              <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={Star} text="Evaluations" />
            </Category>

            <Category
              name="personal"
              title="Personal"
              icon={Wallet}
              expandedCategories={expandedCategories}
              toggleCategory={(id: any) => {
                setExpandedCategories((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                );
              }}
            >
              <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={FileText} text="Payrolls" />
              <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={Star} text="Teacher reviews" />
              <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
            </Category>
          </nav>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPersonalSchedule(true)}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Open Personal Schedule
            </button>

            <NotificationManagement />
          </div>
        </div>

        <div className={activeSection === "dashboard" ? "block" : "hidden"}>
          <TeacherDashboardContent stats={stats} />
        </div>

        {visitedSections.includes("attendance") && (
          <div className={activeSection === "attendance" ? "block" : "hidden"}>
            <p>Attendance Management Component Placeholder</p>
          </div>
        )}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement
              searchTerm={searchTerms.schedule}
              updateSearchTerm={() => {}}
              handleCreateNew={() => {}}
              handleTableRowClick={() => {}}
            />
          </div>
        )}
        {visitedSections.includes("class") && (
          <div className={activeSection === "class" ? "block" : "hidden"}>
            <ClassManagement />
          </div>
        )}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={() => {}} />
          </div>
        )}
        {visitedSections.includes("payroll") && (
          <div className={activeSection === "payroll" ? "block" : "hidden"}>
            <PayrollManagement />
          </div>
        )}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.reviews} updateSearchTerm={() => {}} />
          </div>
        )}
        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block" : "hidden"}>
            <p>Report Management Component Placeholder</p>
          </div>
        )}

        {/* Personal Schedule modal */}
        <PersonalScheduleModal
          open={showPersonalSchedule}
          onClose={() => setShowPersonalSchedule(false)}
          fetchSchedule={teacherHook?.fetchPersonalSchedule}
        />

        {/* UserAccountModal rendered as overlay with high z-index so it is always on top */}
        <AnimatePresence>
          {showAccountModal && (
            <motion.div
              key="useraccount-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center"
            >
              {/* backdrop */}
              <motion.button
                aria-label="close"
                onClick={() => setShowAccountModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 bg-black"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />

              {/* modal content */}
              <motion.div
                initial={{ y: 12, opacity: 0, scale: 0.995 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.18 }}
                className="relative w-[90vw] max-w-4xl mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {user && (
                  <UserAccountModal user={user} onClose={() => setShowAccountModal(false)} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Small helpers ---------- */
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
      {expandedCategories.includes(name) && <div className="space-y-1 mt-2 pl-4">{children}</div>}
    </div>
  );
}
