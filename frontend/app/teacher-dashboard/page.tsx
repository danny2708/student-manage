"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../src/contexts/AuthContext";
import type { LoginResponse } from "../../src/services/api/auth";
import { toast } from "react-hot-toast";

import NotificationManagement from "../manager-dashboard/dashboard_components/notification/NotificationManagement";
import PersonalScheduleModal from "../manager-dashboard/dashboard_components/personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";

import { useTeacher } from "../../src/hooks/useTeacher";
import type { TeacherStats } from "../../src/services/api/teacher";

import { Sidebar, TeacherDashboardContent } from "./DashboardComponents";

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
const AttendanceManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/attendance/AttendanceManagement"),
  { ssr: false }
);

export default function TeacherDashboard() {
  const { user, logout } = useAuth() as { user: LoginResponse | null; logout: () => void };
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["academic"]);
  const [visitedSections, setVisitedSections] = useState<string[]>(["dashboard"]);

  const [searchTerms] = useState({
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

  const { teacherStats, fetchTeacherStats, loading, error } = useTeacher();

  useEffect(() => {
    if (user) {
      fetchTeacherStats(user.user_id).catch(() => {});
    }
  }, [fetchTeacherStats, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id]);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const stats: TeacherStats = {
    class_taught: teacherStats?.class_taught ?? 0,
    schedules: teacherStats?.schedules ?? 0,
    reviews: teacherStats?.reviews ?? 0,
    rate: teacherStats?.rate ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setSection={setSection}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        onLogout={handleLogout}
        onOpenAccount={() => setShowAccountModal(true)}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPersonalSchedule(true)}
              className="px-3 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-500 cursor-pointer"
            >
              My Schedule
            </button>
            <NotificationManagement />
          </div>
        </div>

        {/* Dashboard view */}
        <div className={activeSection === "dashboard" ? "block" : "hidden"}>
          <TeacherDashboardContent stats={stats} />
        </div>

        {/* Attendance */}
        {visitedSections.includes("attendance") && (
          <div className={activeSection === "attendance" ? "block" : "hidden"}>
            <AttendanceManagement />
          </div>
        )}

        {/* Schedule */}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement />
          </div>
        )}

        {/* Class */}
        {visitedSections.includes("class") && (
          <div className={activeSection === "class" ? "block" : "hidden"}>
            <ClassManagement />
          </div>
        )}

        {/* Evaluation */}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={() => {}} />
          </div>
        )}

        {/* Payroll */}
        {visitedSections.includes("payroll") && (
          <div className={activeSection === "payroll" ? "block" : "hidden"}>
            <PayrollManagement />
          </div>
        )}

        {/* Teacher Review */}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.reviews} updateSearchTerm={() => {}} />
          </div>
        )}

        {/* Report */}
        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block" : "hidden"}>
            <p>Report Management Component Placeholder</p>
          </div>
        )}

        {/* Personal Schedule modal */}
        <PersonalScheduleModal open={showPersonalSchedule} onClose={() => setShowPersonalSchedule(false)} />

        {/* Account modal overlay */}
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
                {user && <UserAccountModal user={user} onClose={() => setShowAccountModal(false)} />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spinner overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
