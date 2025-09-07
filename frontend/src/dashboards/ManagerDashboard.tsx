"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  GraduationCap,
  Bell,
  FileText,
  Star,
  Search,
  Filter,
  Settings,
  LayoutDashboard,
  Wallet,
  UserCheck,
  School,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { UserModal } from "../components/manager_modals/user_modal"
import { TuitionModal } from "../components/manager_modals/tuition_modal"
import { RoleModal } from "../components/manager_modals/role_modal"

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
  { tuition_id: 1, studentName: "Nguyễn Văn B", className: "1A1", amount: 500000, status: "pauser_id", dueDate: "2024-01-15" },
  { tuition_id: 2, studentName: "Nguyễn Văn C", className: "1A2", amount: 500000, status: "pending", dueDate: "2024-01-15" },
  { tuition_id: 3, studentName: "Nguyễn Văn G", className: "1A3", amount: 500000, status: "overdue", dueDate: "2024-01-15" },
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

export function ManagerDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["general"])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
    setShowRoleModal(true)
  }

  const renderDashboardContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs opacity-80 mt-1">Active classes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs opacity-80 mt-1">Active teachers</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs opacity-80 mt-1">Enrolled students</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2</div>
                <p className="text-xs opacity-80 mt-1">Today's classes</p>
              </CardContent>
            </Card>
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
      )
    }

    return (
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <Button variant="outline" size="sm" className="border-gray-200 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Content based on active section */}
        {activeSection === "user" && <UserModal users={filteredUsers} onUserClick={handleUserClick} />}

        {activeSection === "tuition" && <TuitionModal tuitions={mockTuitions} />}

        {/* Placeholder for other sections */}
        {!["user", "tuition"].includes(activeSection) && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} section coming soon...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 min-h-screen">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">StudentManagement</h1>
                <p className="text-gray-400 text-xs">Manager Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {sidebarCategories.map((category) => {
              const CategoryIcon = category.icon
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-gray-300 hover:bg-gray-800 hover:text-white group"
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{category.label}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              activeSection === item.id
                                ? "bg-cyan-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="h-4 w-4" />
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
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-lg min-h-[calc(100vh-3rem)]">
            <div className="p-6">{renderDashboardContent()}</div>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}


export default ManagerDashboard;