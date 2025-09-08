"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  GraduationCap,
  Bell,
  FileText,
  Star,
  Settings,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  UserCheck,
  School,
} from "lucide-react"
import { RoleModal } from "./components/role_modal"

// Mock data
const mockUsers = [
  { user_id: 1, username: "danny", role: "teacher", fullName: "Nguyễn Văn A", email: "a@gmail.com" },
  { user_id: 2, username: "benny", role: "student", fullName: "Nguyễn Văn B", email: "b@gmail.com" },
  { user_id: 3, username: "cedric", role: "student", fullName: "Nguyễn Văn C", email: "c@gmail.com" },
  { user_id: 4, username: "dave", role: "parent", fullName: "Nguyễn Văn D", email: "d@gmail.com" },
  { user_id: 5, username: "eve", role: "manager", fullName: "Nguyễn Văn E", email: "e@gmail.com" },
  { user_id: 6, username: "frank", role: "", fullName: "Nguyễn Văn F", email: "f@gmail.com" },
]

const mockTuitions = [
  {
    tuiton_id: 1,
    studentName: "Nguyễn Văn B",
    className: "1A1",
    amount: 500000,
    status: "paid",
    dueDate: "2024-01-15",
  },
  {
    tuiton_id: 2,
    studentName: "Nguyễn Văn C",
    className: "1A2",
    amount: 500000,
    status: "pending",
    dueDate: "2024-01-15",
  },
  {
    tuiton_id: 3,
    studentName: "Nguyễn Văn G",
    className: "1A3",
    amount: 500000,
    status: "overdue",
    dueDate: "2024-01-15",
  },
]

const mockSchedules = [
  {
    schedule_id: 1,
    class: "1A1",
    day: "Monday",
    room: "101",
    date: "08/09/2025",
    type: "Weekly",
    start: "20:00",
    end: "22:00",
  },
  {
    schedule_id: 2,
    class: "1A2",
    day: "Tuesday",
    room: "102",
    date: "09/09/2025",
    type: "Once",
    start: "18:00",
    end: "20:00",
  },
  {
    schedule_id: 3,
    class: "1A3",
    day: "Wednesday",
    room: "103",
    date: "10/09/2025",
    type: "Weekly",
    start: "19:00",
    end: "21:00",
  },
]

const mockPayrolls = [
  {
    payroll_id: 1,
    teacherName: "Nguyễn Văn A",
    baseSalary: 5000000,
    bonus: 500000,
    total: 5500000,
    status: "paid",
    sentAt: "2024-01-01",
  },
  {
    payroll_id: 2,
    teacherName: "Nguyễn Văn B",
    baseSalary: 4500000,
    bonus: 300000,
    total: 4800000,
    status: "pending",
    sentAt: "2024-01-01",
  },
]

const mockTeacherReviews = [
  {
    review_id: 1,
    teacher: "Nguyễn Văn A",
    student: "Nguyễn Văn B",
    rating: 5,
    review: "Teacher is so handsome and professional",
  },
  { review_id: 2, teacher: "Nguyễn Văn A", student: "Nguyễn Văn C", rating: 4, review: "Great teaching methods" },
]

const mockEvaluations = [
  { evaluation_id: 1, student: "Nguyễn Văn B", teacher: "Nguyễn Văn A", type: "discipline", date: "2024-01-15" },
  { evaluation_id: 2, student: "Nguyễn Văn C", teacher: "Nguyễn Văn A", type: "study", date: "2024-01-16" },
]

const mockClasses = [
  { class_id: 1, name: "Class H-1", teacher: "Teacher Andy", subject: "English", capacity: 30, fee: 1500000 },
  { class_id: 2, name: "Class H-2", teacher: "Teacher Andy", subject: "Math", capacity: 25, fee: 1500000 },
  { class_id: 3, name: "Class H-3", teacher: "Teacher Andy", subject: "Physics", capacity: 20, fee: 1500000 },
]

const mockSubjects = [
  { subject_id: 1, subject: "English", classes: 20 },
  { subject_id: 2, subject: "Math", classes: 40 },
  { subject_id: 3, subject: "Physics", classes: 50 },
]

const sidebarCategories = [
  {
    id: "general",
    label: "General Management",
    icon: LayoutDashboard,
    items: [
      { id: "dashboard", label: "Dashboard", icon: Calendar },
      { id: "notification", label: "Notification", icon: Bell },
    ],
  },
  {
    id: "financial",
    label: "Financial Management",
    icon: Wallet,
    items: [
      { id: "tuition", label: "Tuition", icon: DollarSign },
      { id: "payroll", label: "Payroll", icon: FileText },
    ],
  },
  {
    id: "user",
    label: "User Management",
    icon: UserCheck,
    items: [
      { id: "user", label: "User", icon: Users },
      { id: "evaluation", label: "Evaluation", icon: Settings },
      { id: "teacher-review", label: "Teacher review", icon: Star },
    ],
  },
  {
    id: "academics",
    label: "Academics Management",
    icon: School,
    items: [
      { id: "class", label: "Class", icon: BookOpen },
      { id: "subject", label: "Subject", icon: GraduationCap },
      { id: "schedule", label: "Schedule", icon: Calendar },
    ],
  },
]

export default function ManagerDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [searchTerms, setSearchTerms] = useState({
    user: "",
    tuition: "",
    schedule: "",
    payroll: "",
    teacherReview: "",
    evaluation: "",
    class: "",
    subject: "",
  })
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["general"])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
  }

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerms.user.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerms.user.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerms.user.toLowerCase()),
  )

  const updateSearchTerm = (section: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [section]: value }))
  }

  const renderDashboardContent = () => {
    return (
      <>
        <style jsx>{`
          .stat-card-emerald {
            background: #10b981 !important;
            color: white !important;
          }
          .stat-card-orange {
            background: #f97316 !important;
            color: white !important;
          }
          .stat-card-cyan {
            background: #06b6d4 !important;
            color: white !important;
          }
          .stat-card-red {
            background: #ef4444 !important;
            color: white !important;
          }
          .stat-card-emerald *,
          .stat-card-orange *,
          .stat-card-cyan *,
          .stat-card-red * {
            color: white !important;
          }
        `}</style>
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card-emerald rounded-lg shadow-lg p-6">
              <div className="pb-2">
                <h3 className="text-sm font-medium opacity-90">Class</h3>
              </div>
              <div>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs opacity-80 mt-1">Active classes</p>
              </div>
            </div>

            <div className="stat-card-orange rounded-lg shadow-lg p-6">
              <div className="pb-2">
                <h3 className="text-sm font-medium opacity-90">Teacher</h3>
              </div>
              <div>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs opacity-80 mt-1">Active teachers</p>
              </div>
            </div>

            <div className="stat-card-cyan rounded-lg shadow-lg p-6">
              <div className="pb-2">
                <h3 className="text-sm font-medium opacity-90">Student</h3>
              </div>
              <div>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs opacity-80 mt-1">Enrolled students</p>
              </div>
            </div>

            <div className="stat-card-red rounded-lg shadow-lg p-6">
              <div className="pb-2">
                <h3 className="text-sm font-medium opacity-90">Schedule</h3>
              </div>
              <div>
                <div className="text-3xl font-bold">2</div>
                <p className="text-xs opacity-80 mt-1">Today's classes</p>
              </div>
            </div>
          </div>

          {/* Calendar Widget */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-emerald-700">
                <div className="text-lg font-semibold mb-2">February 2024</div>
                <div className="grid grid-cols-7 gap-2 text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="font-medium p-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => (
                    <div key={i} className="p-2 hover:bg-emerald-200 rounded cursor-pointer">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case "user":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerms.user}
                  onChange={(e) => updateSearchTerm("user", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                      USERNAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      ROLE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                      FULL NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">
                      EMAIL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      onClick={() => handleUserClick(user)}
                      className="hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3 text-sm text-gray-300">{user.user_id}</td>
                      <td className="px-3 py-3 text-sm text-cyan-400 break-words">{user.username}</td>
                      <td className="px-3 py-3">
                        {user.role ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "teacher"
                                ? "bg-orange-100 text-orange-800"
                                : user.role === "student"
                                  ? "bg-green-100 text-green-800"
                                  : user.role === "parent"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "manager"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            No role
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300 break-words max-w-32">{user.fullName}</td>
                      <td className="px-3 py-3 text-sm text-cyan-400 break-words max-w-40">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case "tuition":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Tuition Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerms.tuition}
                  onChange={(e) => updateSearchTerm("tuition", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">
                      STUDENT NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      CLASS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                      AMOUNT
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      STATUS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                      DUE DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {mockTuitions.map((tuition) => (
                    <tr key={tuition.tuiton_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-300">{tuition.tuiton_id}</td>
                      <td className="px-3 py-3 text-sm text-gray-300 break-words">{tuition.studentName}</td>
                      <td className="px-3 py-3 text-sm text-cyan-400">{tuition.className}</td>
                      <td className="px-3 py-3 text-sm text-gray-300">{(tuition.amount / 1000).toFixed(0)}K ₫</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tuition.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : tuition.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tuition.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">{tuition.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case "schedule":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchTerms.schedule}
                  onChange={(e) => updateSearchTerm("schedule", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
                      ID
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      CLASS
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      DAY
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      ROOM
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                      DATE
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      TYPE
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      START
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      END
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {mockSchedules.map((schedule) => (
                    <tr key={schedule.schedule_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.schedule_id}</td>
                      <td className="px-2 py-3 text-sm text-cyan-400">{schedule.class}</td>
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.day}</td>
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.room}</td>
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.date}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.type === "Weekly" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {schedule.type}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.start}</td>
                      <td className="px-2 py-3 text-sm text-gray-300">{schedule.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case "payroll":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search payrolls..."
                  value={searchTerms.payroll}
                  onChange={(e) => updateSearchTerm("payroll", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                      TEACHER NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      BASE SALARY
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      BONUS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      TOTAL
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                      STATUS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                      SENT AT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {mockPayrolls.map((payroll) => (
                    <tr key={payroll.payroll_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-300">{payroll.payroll_id}</td>
                      <td className="px-3 py-3 text-sm text-gray-300 break-words">{payroll.teacherName}</td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        {(payroll.baseSalary / 1000000).toFixed(1)}M ₫
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">{(payroll.bonus / 1000).toFixed(0)}K ₫</td>
                      <td className="px-3 py-3 text-sm text-gray-300">{(payroll.total / 1000000).toFixed(1)}M ₫</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payroll.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">{payroll.sentAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case "teacher-review":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Teacher Review Management</h2>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerms.teacherReview}
                onChange={(e) => updateSearchTerm("teacherReview", e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <Star className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {mockTeacherReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{review.review_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{review.teacher}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{review.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-yellow-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 break-words max-w-xs">{review.review}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      case "evaluation":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Evaluation Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchTerms.evaluation}
                  onChange={(e) => updateSearchTerm("evaluation", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Settings className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      STUDENT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      TEACHER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {mockEvaluations.map((evaluation) => (
                    <tr key={evaluation.evaluation_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.evaluation_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.student}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.teacher}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evaluation.type === "discipline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {evaluation.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case "class":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerms.class}
                  onChange={(e) => updateSearchTerm("class", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockClasses.map((classItem) => (
                <div
                  key={classItem.class_id}
                  className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-white shadow-lg"
                >
                  <div className="text-lg font-bold mb-2">{classItem.name}</div>
                  <div className="text-sm opacity-90 mb-1">Teacher: {classItem.teacher}</div>
                  <div className="text-sm opacity-90 mb-1">Subject: {classItem.subject}</div>
                  <div className="text-sm opacity-90 mb-1">Capacity: {classItem.capacity}</div>
                  <div className="text-sm opacity-90">Fee: {classItem.fee.toLocaleString()} ₫</div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg p-4 text-white shadow-lg flex items-center justify-center cursor-pointer hover:from-cyan-500 hover:to-cyan-600 transition-colors">
                <div className="text-center">
                  <div className="text-4xl mb-2">+</div>
                  <div className="text-sm">Add New Class</div>
                </div>
              </div>
            </div>
          </div>
        )
      case "subject":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Subject Management</h2>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerms.subject}
                  onChange={(e) => updateSearchTerm("subject", e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      SUBJECT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      CLASSES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {mockSubjects.map((subject) => (
                    <tr key={subject.subject_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{subject.subject_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{subject.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{subject.classes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                Add subject
              </button>
            </div>
          </div>
        )
      default:
        return renderDashboardContent()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 bg-gray-900 min-h-screen">
          {/* Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-xs">StudentManagement</h1>
                <p className="text-gray-400 text-xs">Manager Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {sidebarCategories.map((category) => {
              const CategoryIcon = category.icon
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors text-gray-300 hover:bg-gray-800 hover:text-white group"
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{category.label}</span>
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="ml-3 space-y-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSectionClick(item.id)}
                            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                              activeSection === item.id
                                ? "bg-cyan-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="h-3 w-3" />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 relative">
          <div className="bg-white rounded-lg shadow-lg min-h-[calc(100vh-3rem)]">
            <div className="p-6">{renderMainContent()}</div>
          </div>

          {selectedUser && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setSelectedUser(null)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <RoleModal user={selectedUser} onClose={() => setSelectedUser(null)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
