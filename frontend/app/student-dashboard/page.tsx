"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../src/contexts/AuthContext";
import { useStudents } from "../../src/contexts/StudentContext";
import NotificationManagement from "../manager-dashboard/dashboard_components/notification/NotificationManagement";
import PersonalScheduleModal from "../manager-dashboard/dashboard_components/personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";
import type { StudentStats } from "../../src/services/api/student";

import { Sidebar, StudentDashboardContent } from "./DashboardComponents";
import { AnimatePresence, motion } from "framer-motion";

// dynamic subpages
const EvaluationModal = dynamic(() => import("./StudentEvaluationModal"), { ssr: false });
const ScheduleManagement = dynamic(() => import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement"), { ssr: false });
const ClassManagement = dynamic(() => import("../manager-dashboard/dashboard_components/class/ClassManagement"), { ssr: false });
const TeacherReviewManagement = dynamic(() => import("./TeacherReviewModal"), { ssr: false });
const ReportManagement = dynamic(() => import("../manager-dashboard/dashboard_components/report/ReportManagement"), { ssr: false });

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth() as { user: any; logout: () => void };
  const { fetchStudentStats } = useStudents();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [visitedSections, setVisitedSections] = useState<string[]>(["overview"]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);

  useEffect(() => {
    if (!fetchStudentStats || !user?.user_id) return;
    let mountedFlag = true;
    fetchStudentStats(user.user_id)
      .then((res) => {
        if (!mountedFlag) return;
        setStudentStats(res ?? null);
      })
      .catch((err) => console.error("Failed to fetch student stats:", err));
    return () => {
      mountedFlag = false;
    };
  }, [fetchStudentStats, user?.user_id]);

  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id]);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const statsForContent: StudentStats = {
    classes_enrolled: studentStats?.classes_enrolled ?? 0,
    gpa: studentStats?.gpa ?? 0,
    study_point: studentStats?.study_point ?? 0,
    discipline_point: studentStats?.discipline_point ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 cursor-pointer">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setSection={setSection}
        onOpenAccount={() => setShowAccountModal(true)}
        onLogout={handleLogout}
        user={user}
        mounted={mounted}
      />

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back{mounted && user?.username ? `, ${user.username} !` : "!"}</h1>
            <p className="text-gray-600 mt-1">Manage your studies, schedules and track your progress</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowPersonalSchedule(true)} className="px-3 py-2 bg-slate-700 text-white rounded" >
              <Calendar className="h-4 w-4 mr-2 inline-block" />
              My Schedule
            </Button>

            <NotificationManagement />
          </div>
        </div>

        {/* Dashboard / Sections */}
        <div className={activeSection === "overview" ? "block" : "hidden"}>
          <StudentDashboardContent stats={statsForContent} onOpenSchedule={() => setShowPersonalSchedule(true)} />
        </div>

        {/* Evaluation */}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationModal
              userRole="student"
            />
          </div>
        )}

        {/* Schedule */}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement/>
          </div>
        )}

        {/* Classes */}
        {visitedSections.includes("classes") && (
          <div className={activeSection === "classes" ? "block" : "hidden"}>
            <ClassManagement/>
          </div>
        )}

        {/* Teacher Review */}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement userRole="student" studentUserId={user?.user_id} />
          </div>
        )}

        {/* Report */}
        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block" : "hidden"}>
            <ReportManagement
              isOpen={activeSection === "report"}
              onClose={() => setSection("overview")}
              userRole="student"
            />
          </div>
        )}

        {/* Modals */}
        <PersonalScheduleModal open={showPersonalSchedule} onClose={() => setShowPersonalSchedule(false)} />
      </main>

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
  );
}
