"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../src/hooks/useAuth"
import type { LoginResponse } from "../../src/services/api/auth"
import {
  BookOpen,
  Calendar,
  FileText,
  Star,
  Wallet,
  LogOut,
  UserIcon,
  Users,
  ChevronDown,
  BarChart3,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react"

import { BaseCard } from "./ui/base-card"
import { BaseButton } from "./ui/base-button"
import { useSchedules } from "../hooks/use-schedules"

const ScheduleManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/schedule/ScheduleManagement"),
  { ssr: false },
)
const ClassManagement = dynamic(() => import("../manager-dashboard/dashboard_components/class/ClassManagement"), {
  ssr: false,
})
const EvaluationManagement = dynamic(() => import("../manager-dashboard/dashboard_components/EvaluationManagement"), {
  ssr: false,
})
const PayrollManagement = dynamic(() => import("../manager-dashboard/dashboard_components/payroll/PayrollManagement"), {
  ssr: false,
})
const TeacherReviewManagement = dynamic(
  () => import("../manager-dashboard/dashboard_components/TeacherReviewManagement"),
  { ssr: false },
)

import NotificationManagement from "./notification-management"
import PersonalScheduleModal from "./personal-schedule-modal"
import { UserAccountModal } from "../user_account"

import { useTeacher } from "../../src/hooks/useTeacher"

type TeacherStats = {
  class_taught: number
  schedules: number
  reviews: number
  rate: number
}

export default function TeacherDashboard() {
  const { user } = useAuth() as { user: LoginResponse | null }
  const router = useRouter()
  const { schedules, loading: schedulesLoading } = useSchedules()

  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["academic"])
  const [visitedSections, setVisitedSections] = useState<string[]>(["dashboard"])

  const [searchTerms, setSearchTerms] = useState({
    attendance: "",
    schedule: "",
    classes: "",
    evaluation: "",
    payroll: "",
    reviews: "",
    report: "",
  })

  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false)

  const { teacherStats, fetchTeacherStats, fetchPersonalSchedule } = useTeacher() as any

  useEffect(() => {
    if (fetchTeacherStats) {
      if (user?.user_id !== undefined) fetchTeacherStats(user.user_id).catch(() => {})
      else fetchTeacherStats().catch(() => {})
    }
  }, [fetchTeacherStats, user?.user_id])

  const setSection = (id: string) => {
    setActiveSection(id)
    if (!visitedSections.includes(id)) setVisitedSections((prev) => [...prev, id])
  }

  const stats: TeacherStats = {
    class_taught: teacherStats?.class_taught ?? schedules.length,
    schedules: teacherStats?.schedules ?? schedules.length,
    reviews: teacherStats?.reviews ?? 0,
    rate: teacherStats?.rate ?? 0,
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="w-72 glass-card border-r border-border/50 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">EduDash</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">Teacher Portal</p>
          </div>

          <BaseCard
            variant="glass"
            className="mb-6 p-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowAccountModal(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.username ?? "Teacher"}</p>
                <p className="text-sm text-muted-foreground">{schedulesLoading ? "Loading..." : "Online"}</p>
              </div>
            </div>
          </BaseCard>

          <nav className="space-y-2">
            <Category
              name="academic"
              title="Academic"
              icon={BookOpen}
              expandedCategories={expandedCategories}
              toggleCategory={(id: any) => {
                setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
              }}
            >
              <SidebarLink
                id="attendance"
                activeSection={activeSection}
                setSection={setSection}
                icon={Users}
                text="Attendances"
              />
              <SidebarLink
                id="schedule"
                activeSection={activeSection}
                setSection={setSection}
                icon={Calendar}
                text="Schedules"
              />
              <SidebarLink
                id="class"
                activeSection={activeSection}
                setSection={setSection}
                icon={BookOpen}
                text="Classes"
              />
              <SidebarLink
                id="evaluation"
                activeSection={activeSection}
                setSection={setSection}
                icon={Star}
                text="Evaluations"
              />
            </Category>

            <Category
              name="personal"
              title="Personal"
              icon={Wallet}
              expandedCategories={expandedCategories}
              toggleCategory={(id: any) => {
                setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
              }}
            >
              <SidebarLink
                id="payroll"
                activeSection={activeSection}
                setSection={setSection}
                icon={FileText}
                text="Payrolls"
              />
              <SidebarLink
                id="teacher-review"
                activeSection={activeSection}
                setSection={setSection}
                icon={Star}
                text="Teacher reviews"
              />
              <SidebarLink
                id="report"
                activeSection={activeSection}
                setSection={setSection}
                icon={FileText}
                text="Report"
              />
            </Category>
          </nav>
        </div>

        <div className="border-t border-border/50 pt-4">
          <BaseButton
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={() => {
              localStorage.removeItem("token")
              router.push("/login")
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Log out
          </BaseButton>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">Welcome back, {user?.username ?? "Teacher"}</h1>
            <p className="text-muted-foreground">
              Manage your classes, schedules, and track your progress
              {schedules.length > 0 && <span className="ml-2 text-primary">• {schedules.length} active schedules</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BaseButton variant="outline" onClick={() => setShowPersonalSchedule(true)} disabled={schedulesLoading}>
              <Calendar className="h-4 w-4 mr-2" />
              {schedulesLoading ? "Loading..." : "My Schedule"}
            </BaseButton>
            <NotificationManagement />
          </div>
        </div>

        <div className={activeSection === "dashboard" ? "block animate-fade-in-up" : "hidden"}>
          <TeacherDashboardContent stats={stats} />
        </div>

        {visitedSections.includes("attendance") && (
          <div className={activeSection === "attendance" ? "block animate-fade-in-up" : "hidden"}>
            <p>Attendance Management Component Placeholder</p>
          </div>
        )}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block animate-fade-in-up" : "hidden"}>
            <ScheduleManagement
              searchTerm={searchTerms.schedule}
              updateSearchTerm={() => {}}
              handleCreateNew={() => {}}
              handleTableRowClick={() => {}}
            />
          </div>
        )}
        {visitedSections.includes("class") && (
          <div className={activeSection === "class" ? "block animate-fade-in-up" : "hidden"}>
            <ClassManagement
              searchTerm={searchTerms.classes}
              updateSearchTerm={() => {}}
              handleCreateNew={() => {}}
              handleClassCardClick={() => {}}
            />
          </div>
        )}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block animate-fade-in-up" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={() => {}} />
          </div>
        )}
        {visitedSections.includes("payroll") && (
          <div className={activeSection === "payroll" ? "block animate-fade-in-up" : "hidden"}>
            <PayrollManagement
              searchTerm={searchTerms.payroll}
              updateSearchTerm={() => {}}
              handleCreateNew={() => {}}
              handleTableRowClick={() => {}}
            />
          </div>
        )}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block animate-fade-in-up" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.reviews} updateSearchTerm={() => {}} />
          </div>
        )}
        {visitedSections.includes("report") && (
          <div className={activeSection === "report" ? "block animate-fade-in-up" : "hidden"}>
            <p>Report Management Component Placeholder</p>
          </div>
        )}

        <PersonalScheduleModal
          open={showPersonalSchedule}
          onClose={() => setShowPersonalSchedule(false)}
          fetchSchedule={fetchPersonalSchedule}
        />

        <AnimatePresence>
          {showAccountModal && (
            <UserAccountModal user={user} open={showAccountModal} onClose={() => setShowAccountModal(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TeacherDashboardContent({ stats }: { stats: TeacherStats }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Classes Taught"
          value={stats.class_taught.toString()}
          icon={BookOpen}
          trend="+12%"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Active Schedules"
          value={stats.schedules.toString()}
          icon={Clock}
          trend="+5%"
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Student Reviews"
          value={stats.reviews.toString()}
          icon={Award}
          trend="+8%"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.rate}%`}
          icon={TrendingUp}
          trend="+3%"
          color="from-orange-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BaseCard variant="glass" className="col-span-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Quick Overview</h3>
          </div>
          <p className="text-muted-foreground mb-6 text-pretty">
            Manage your teaching activities efficiently with quick access to your most important tools and insights.
          </p>
          <div className="flex gap-3 flex-wrap">
            <BaseButton size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              My Classes
            </BaseButton>
            <BaseButton variant="secondary" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </BaseButton>
            <BaseButton variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </BaseButton>
          </div>
        </BaseCard>

        <BaseCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm">New student review received</p>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm">Schedule updated for tomorrow</p>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <p className="text-sm">Payroll processed</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: string
  icon: any
  trend: string
  color: string
}) {
  return (
    <BaseCard variant="glass" className="p-6 hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-sm font-medium text-green-500">{trend}</span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </BaseCard>
  )
}

function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  const isActive = activeSection === id

  return (
    <button
      onClick={() => setSection(id)}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
        isActive
          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{text}</span>
    </button>
  )
}

function Category({ name, title, icon: Icon, expandedCategories, toggleCategory, children }: any) {
  const isExpanded = expandedCategories.includes(name)

  return (
    <div className="mb-4">
      <button
        onClick={() => toggleCategory(name)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-accent/30 rounded-xl transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 mt-2 pl-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
