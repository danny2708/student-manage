"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Users, Star, FileText, GraduationCap, Bell, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../src/contexts/AuthContext";
import { useStudents } from "../../src/contexts/StudentContext";
import NotificationManagement from "../manager-dashboard/dashboard_components/notification/NotificationManagement";
import PersonalScheduleModal from "../manager-dashboard/dashboard_components/personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";
import { StudentStats} from "../../src/services/api/student";
// Dynamic imports for sub-pages (ssr: false)
const EvaluationManagement = dynamic(() => import("../manager-dashboard/dashboard_components/EvaluationManagement").catch(()=>import("../manager-dashboard/dashboard_components/EvaluationManagement")), { ssr: false, loading: () => <p>Loading...</p> });
const ScheduleManagement = dynamic(() => import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement").catch(()=>import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement")), { ssr: false, loading: () => <p>Loading...</p> });
const ClassManagement = dynamic(() => import("../manager-dashboard/dashboard_components/class/ClassManagement").catch(()=>import("../manager-dashboard/dashboard_components/class/ClassManagement")), { ssr: false, loading: () => <p>Loading...</p> });
const TeacherReviewManagement = dynamic(() => import("../manager-dashboard/dashboard_components/TeacherReviewManagement").catch(()=>import("../manager-dashboard/dashboard_components/TeacherReviewManagement")), { ssr: false, loading: () => <p>Loading...</p> });
const ReportManagement = dynamic(() => import("../manager-dashboard/dashboard_components/report/ReportManagement").catch(()=>import("../manager-dashboard/dashboard_components/report/ReportManagement")), { ssr: false, loading: () => <p>Loading...</p> });


export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth() as { user: any; logout: () => void };
  const { studentStats, fetchStudentStats } = useStudents() as any;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [visitedSections, setVisitedSections] = useState<string[]>(["overview"]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["academic"]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);

  const [searchTerms, setSearchTerms] = useState({
    evaluation: "",
    schedule: "",
    classes: "",
    teacherReview: "",
    report: "",
  });

  const updateSearchTerm = (section: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [section]: value }));
  };

  useEffect(() => {
    // fetch initial student stats (if hook exposes fetch)
    if (fetchStudentStats) fetchStudentStats(user.user_id).catch(() => {});
  }, [fetchStudentStats]);

  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id]);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const stats: StudentStats = {
    classes_enrolled: studentStats?.classes_enrolled ?? 0,
    gpa: studentStats?.gpa ?? 0,
    study_point: studentStats?.study_point ?? 0,
    discipline_point: studentStats?.discipline_point ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between border-r border-gray-200">
        <div>
          <div className="flex items-center gap-3 font-bold text-xl text-blue-600 mb-6">
            <BookOpen className="h-8 w-8" />
            <span className="tracking-wide">StudentHub</span>
          </div>

          <div className="border-t border-gray-200 my-4" />

          <div
            className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
            onClick={() => setShowAccountModal(true)}
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {mounted ? (user?.username ?? "Student") : "Student"}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4" />

          <nav className="space-y-1">
            <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={Star} text="Evaluation" />
            <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedule" />
            <SidebarLink id="classes" activeSection={activeSection} setSection={setSection} icon={Users} text="Classes" />
            <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={GraduationCap} text="Teacher Review" />
            <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
          </nav>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back{mounted && user?.display_name ? `, ${user.display_name}` : "!"}</h1>
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
          <div className="space-y-8">
            {/* Hero / quick summary */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Student Overview</h2>
                  <p className="text-indigo-100 mt-1">Summary of your study activity</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Classes Enrolled" value={String(stats.classes_enrolled)} icon={BookOpen} />
              <StatCard title="GPA" value={String(stats.gpa)} icon={TrendingUpIcon} />
              <StatCard title="Study Points" value={String(stats.study_point)} icon={AwardIcon} />
              <StatCard title="Discipline Points" value={String(stats.discipline_point)} icon={AlertIcon} />
            </div>

            {/* Quick actions & recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">View Schedule</div>
                        <div className="text-sm text-gray-600">Open your upcoming classes</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
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
        </div>

        {/* Evaluation */}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Schedule */}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement searchTerm={searchTerms.schedule} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Classes */}
        {visitedSections.includes("classes") && (
          <div className={activeSection === "classes" ? "block" : "hidden"}>
            <ClassManagement searchTerm={searchTerms.classes} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Teacher Review */}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.teacherReview} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Report */}
        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block" : "hidden"}>
            <ReportManagement searchTerm={searchTerms.report} updateSearchTerm={updateSearchTerm} />
          </div>
        )}

        {/* Modals */}
        <PersonalScheduleModal open={showPersonalSchedule} onClose={() => setShowPersonalSchedule(false)} />

        {showAccountModal && user && <UserAccountModal user={user} open={showAccountModal} onClose={() => setShowAccountModal(false)} />}
      </main>
    </div>
  );
}

/* ----------------- Helper components ----------------- */

// Simple stat card using provided icons
function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl p-5 shadow-sm bg-white border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">{title}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
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

/* ---------- Small icon aliases to avoid missing imports ---------- */
// If you already imported these above, ignore; they are here to avoid TS errors:
function TrendingUpIcon(props: any) {
  return <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17l6-6 4 4 8-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function AwardIcon(props: any) {
  return <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="6" strokeWidth="2"/><path d="M8 14v6l4-2 4 2v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function AlertIcon(props: any) {
  return <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86l-8.55 14.84A2 2 0 0 0 3.64 21h16.72a2 2 0 0 0 1.9-2.3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2"/></svg>;
}
