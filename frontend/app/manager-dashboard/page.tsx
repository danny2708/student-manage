"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "../../src/hooks/useAuth"
import type { LoginResponse } from "../../src/services/api/auth"

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
  LogOut,
  User as UserIcon,
} from "lucide-react"
import { RoleModal } from "./users_management/role_modal"
import { UserInfoModal } from "./showInfo/user_info_modal"
import { ActionModal } from "./showInfo/action_modal"
import { CreateModal } from "./showInfo/create_modal"
import { ShowInfoModal } from "./showInfo/ShowInfoModal"
import { UserAccountModal } from "../user_account"

// Import components
import DashboardContent from "./dashboard_components/DashboardContent"
import UserManagement from "./dashboard_components/user/UserManagement"
import TuitionManagement from "./dashboard_components/tuition/TuitionManagement"
import ScheduleManagement from "./dashboard_components/schedule/ScheduleManagement"
import PayrollManagement from "./dashboard_components/payroll/PayrollManagement"
import TeacherReviewManagement from "./dashboard_components/TeacherReviewManagement"
import EvaluationManagement from "./dashboard_components/EvaluationManagement"
import ClassManagement from "./dashboard_components/class/ClassManagement"
import SubjectManagement from "./dashboard_components/SubjectManagement"

export default function ManagerDashboard() {
  const { user } = useAuth() as { user: LoginResponse | null } 
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
  const [showUserInfo, setShowUserInfo] = useState<any>(null)
  const [showActionModal, setShowActionModal] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState<any>(null)
  const [showAccountModal, setShowAccountModal] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const router = useRouter()

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    console.log("Đăng xuất thành công!")
    localStorage.removeItem("token");
    router.push("/login")
  }

  const handleAccountClick = () => {
    setShowAccountModal(true)
  }

  // Hàm đóng modal tài khoản
  const handleCloseAccountModal = () => {
    setShowAccountModal(false)
  }

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const updateSearchTerm = (section: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [section]: value }))
  }

  const handleTableRowClick = (type: string, data: any) => {
    if (type === "user") {
      setSelectedUser(data)
    } else {
      setShowActionModal({ type, data })
    }
  }

  const handleShowInfo = () => {
    if (showActionModal) {
      setShowInfoModal(showActionModal)
      setShowActionModal(null)
    }
  }

  const handleClassCardClick = (classData: any) => {
    setShowActionModal({ type: "class", data: classData })
  }

  const handleUserShowInfo = () => {
    if (selectedUser) {
      setShowUserInfo(selectedUser)
      setSelectedUser(null)
    }
  }

  const handleCreateNew = (type: string) => {
    setShowCreateModal(type)
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />
      case "user":
        return (
          <UserManagement
            searchTerm={searchTerms.user}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
            handleTableRowClick={handleTableRowClick}
          />
        )
      case "tuition":
        return (
          <TuitionManagement
            searchTerm={searchTerms.tuition}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
            handleTableRowClick={handleTableRowClick}
          />
        )
      case "schedule":
        return (
          <ScheduleManagement
            searchTerm={searchTerms.schedule}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
            handleTableRowClick={handleTableRowClick}
          />
        )
      case "payroll":
        return (
          <PayrollManagement
            searchTerm={searchTerms.payroll}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
            handleTableRowClick={handleTableRowClick}
          />
        )
      case "teacher-review":
        return (
          <TeacherReviewManagement
            searchTerm={searchTerms.teacherReview}
            updateSearchTerm={updateSearchTerm}
          />
        )
      case "evaluation":
        return (
          <EvaluationManagement
            searchTerm={searchTerms.evaluation}
            updateSearchTerm={updateSearchTerm}
          />
        )
      case "class":
        return (
          <ClassManagement
            searchTerm={searchTerms.class}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
            handleClassCardClick={handleClassCardClick}
          />
        )
      case "subject":
        return (
          <SubjectManagement
            searchTerm={searchTerms.subject}
            updateSearchTerm={updateSearchTerm}
            handleCreateNew={handleCreateNew}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col justify-between">
        <div>

          {/* Logo và tên ứng dụng */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-4 font-extrabold text-xl text-cyan-400">
              <GraduationCap className="h-10 w-10" />
              <span className="tracking-wide">Student Management</span>
            </div>
          </div>

          {/* User Profile */}
          <div
        className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
        onClick={() => handleAccountClick()}
      >
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-white" />
        </div>
        <span className="text-sm text-gray-300">{user?.username ?? "User Account"}</span>
      </div>
          <nav className="space-y-2">
            <div>
              <button
                onClick={() => toggleCategory("general")}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  General Management
                </div>
                {expandedCategories.includes("general") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedCategories.includes("general") && (
                <div className="space-y-1 mt-2 pl-4">
                  <a
                    href="#"
                    onClick={() => handleSectionClick("dashboard")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "dashboard" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="h-5 w-5" />
                      Manager Dashboard
                    </div>
                  </a>
                  <a
                    href="#"
                    onClick={() => handleSectionClick("notification")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "notification" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5" />
                      Notification
                    </div>
                  </a>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleCategory("financial")}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5" />
                  Financial Management
                </div>
                {expandedCategories.includes("financial") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedCategories.includes("financial") && (
                <div className="space-y-1 mt-2 pl-4">
                  <a
                    href="#"
                    onClick={() => handleSectionClick("tuition")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "tuition" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5" />
                      Tuition
                    </div>
                  </a>
                  <a
                    href="#"
                    onClick={() => handleSectionClick("payroll")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "payroll" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      Payroll
                    </div>
                  </a>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleCategory("user")}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5" />
                  User Management
                </div>
                {expandedCategories.includes("user") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedCategories.includes("user") && (
                <div className="space-y-1 mt-2 pl-4">
                  <a
                    href="#"
                    onClick={() => handleSectionClick("user")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "user" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      Users
                    </div>
                  </a>
                  <a
                    href="#"
                    onClick={() => handleSectionClick("teacher-review")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "teacher-review" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5" />
                      Teacher Review
                    </div>
                  </a>
                  <a
                    href="#"
                    onClick={() => handleSectionClick("evaluation")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "evaluation" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5" />
                      Evaluation
                    </div>
                  </a>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleCategory("academics")}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <School className="h-5 w-5" />
                  Academics
                </div>
                {expandedCategories.includes("academics") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedCategories.includes("academics") && (
                <div className="space-y-1 mt-2 pl-4">
                  <a
                    href="#"
                    onClick={() => handleSectionClick("class")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "class" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5" />
                      Class
                    </div>
                  </a>
                  <a
                    href="#"
                    onClick={() => handleSectionClick("subject")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "subject" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5" />
                      Subject
                    </div>
                  </a>
                  {/* Thêm mục Schedules */}
                  <a
                    href="#"
                    onClick={() => handleSectionClick("schedule")}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      activeSection === "schedule" ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      Schedules
                    </div>
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Nút đăng xuất */}
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderMainContent()}

        {showUserInfo && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setShowUserInfo(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <UserInfoModal
                user={showUserInfo}
                onClose={() => setShowUserInfo(null)}
                onChangeRole={(newRole) => {
                  console.log("Change role:", newRole)
                  setShowUserInfo(null)
                }}
              />
            </div>
          </div>
        )}

        {selectedUser && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setSelectedUser(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <RoleModal
                onShowInfo={handleUserShowInfo}
                onClose={() => setSelectedUser(null)}
                onDelete={() => {}}
                user={selectedUser}
              />
            </div>
          </div>
        )}

        {showActionModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setShowActionModal(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ActionModal onClose={() => setShowActionModal(null)} onShowInfo={handleShowInfo} onDelete={() => {}} />
            </div>
          </div>
        )}

        {showCreateModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <CreateModal
                type={showCreateModal}
                onClose={() => setShowCreateModal(null)}
                onCreate={(data) => console.log("Create:", data)}
              />
            </div>
          </div>
        )}

        {showInfoModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setShowInfoModal(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ShowInfoModal
                type={showInfoModal.type}
                data={showInfoModal.data}
                onClose={() => setShowInfoModal(null)}
              />
            </div>
          </div>
        )}
        {showAccountModal && user && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
          onClick={handleCloseAccountModal} // click ngoài đóng modal
        >
          <div onClick={(e) => e.stopPropagation()}>
            <UserAccountModal
              user={user} // dùng luôn user từ hook, đã có roles
              onClose={handleCloseAccountModal}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  )
}