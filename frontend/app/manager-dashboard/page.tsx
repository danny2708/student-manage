"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "../../src/hooks/useAuth"
import type { LoginResponse } from "../../src/services/api/auth"

import {
  Users, DollarSign, BookOpen, Calendar, GraduationCap, Bell, FileText,
  Star, Settings, ChevronDown, ChevronRight, LayoutDashboard, Wallet,
  UserCheck, School, LogOut, User as UserIcon,
} from "lucide-react"

import { UserInfoModal } from "./showInfo/UserInfoModal"
import { ActionModal } from "./showInfo/action_modal"
import { CreateModal } from "./showInfo/create_modal"
import { ShowInfoModal } from "./showInfo/ShowInfoModal"
import { UserAccountModal } from "../user_account"
import { RoleModal } from "./users_management/roles-components/RoleModal"

import DashboardContent from "./dashboard_components/DashboardContent"

// ⚡ Lazy-load các component quản lý
const UserManagement = dynamic(() => import("./dashboard_components/user/UserManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const TuitionManagement = dynamic(() => import("./dashboard_components/tuition/TuitionManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const ScheduleManagement = dynamic(() => import("./dashboard_components/schedule/ScheduleManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const PayrollManagement = dynamic(() => import("./dashboard_components/payroll/PayrollManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const TeacherReviewManagement = dynamic(() => import("./dashboard_components/TeacherReviewManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const EvaluationManagement = dynamic(() => import("./dashboard_components/EvaluationManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const ClassManagement = dynamic(() => import("./dashboard_components/class/ClassManagement"), { ssr: false, loading: () => <p>Loading...</p> })
const SubjectManagement = dynamic(() => import("./dashboard_components/SubjectManagement"), { ssr: false, loading: () => <p>Loading...</p> })

export default function ManagerDashboard() {
  const { user } = useAuth() as { user: LoginResponse | null }
  const router = useRouter()

  const [activeSection, setActiveSection] = useState("dashboard")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["general"])
  const [visitedSections, setVisitedSections] = useState<string[]>(["dashboard"])

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

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const updateSearchTerm = (section: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [section]: value }))
  }

  const handleTableRowClick = (type: string, data: any) => {
    if (type === "user") setSelectedUser(data)
    else setShowActionModal({ type, data })
  }

  const handleShowInfo = () => {
    if (showActionModal) {
      setShowInfoModal(showActionModal)
      setShowActionModal(null)
    }
  }

  const handleUserShowInfo = () => {
    if (selectedUser) {
      setShowUserInfo(selectedUser)
      setSelectedUser(null)
    }
  }

  const handleClassCardClick = (classData: any) => {
    setShowActionModal({ type: "class", data: classData })
  }

  const handleCreateNew = (type: string) => {
    setShowCreateModal(type)
  }

  const setSection = (id: string) => {
    setActiveSection(id)
    if (!visitedSections.includes(id)) {
      setVisitedSections((prev) => [...prev, id])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-4 font-extrabold text-xl text-cyan-400">
              <GraduationCap className="h-10 w-10" />
              <span className="tracking-wide">Student Management</span>
            </div>
          </div>

          <div
            className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
            onClick={() => setShowAccountModal(true)}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm text-gray-300">{user?.username ?? "User Account"}</span>
          </div>

          {/* Các category menu */}
          <nav className="space-y-2">
            {/* GENERAL */}
            <Category name="general" title="General Management" icon={Settings} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="dashboard" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Manager Dashboard" />
              <SidebarLink id="notification" activeSection={activeSection} setSection={setSection} icon={Bell} text="Notification" />
            </Category>

            {/* FINANCIAL */}
            <Category name="financial" title="Financial Management" icon={Wallet} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="tuition" activeSection={activeSection} setSection={setSection} icon={DollarSign} text="Tuition" />
              <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={FileText} text="Payroll" />
            </Category>

            {/* USER */}
            <Category name="user" title="User Management" icon={UserCheck} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="user" activeSection={activeSection} setSection={setSection} icon={Users} text="Users" />
              <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={Star} text="Teacher Review" />
              <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={GraduationCap} text="Evaluation" />
            </Category>

            {/* ACADEMICS */}
            <Category name="academics" title="Academics" icon={School} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Class" />
              <SidebarLink id="subject" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Subject" />
              <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className={activeSection === "dashboard" ? "block" : "hidden"}><DashboardContent /></div>
        {visitedSections.includes("user") && (
          <div className={activeSection === "user" ? "block" : "hidden"}>
            <UserManagement searchTerm={searchTerms.user} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>
          </div>
        )}
        {visitedSections.includes("tuition") && (
          <div className={activeSection === "tuition" ? "block" : "hidden"}>
            <TuitionManagement searchTerm={searchTerms.tuition} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>
          </div>
        )}
        {visitedSections.includes("schedule") && (
          <div className={activeSection === "schedule" ? "block" : "hidden"}>
            <ScheduleManagement searchTerm={searchTerms.schedule} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>
          </div>
        )}
        {visitedSections.includes("payroll") && (
          <div className={activeSection === "payroll" ? "block" : "hidden"}>
            <PayrollManagement searchTerm={searchTerms.payroll} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>
          </div>
        )}
        {visitedSections.includes("teacher-review") && (
          <div className={activeSection === "teacher-review" ? "block" : "hidden"}>
            <TeacherReviewManagement searchTerm={searchTerms.teacherReview} updateSearchTerm={updateSearchTerm}/>
          </div>
        )}
        {visitedSections.includes("evaluation") && (
          <div className={activeSection === "evaluation" ? "block" : "hidden"}>
            <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={updateSearchTerm}/>
          </div>
        )}
        {visitedSections.includes("class") && (
          <div className={activeSection === "class" ? "block" : "hidden"}>
            <ClassManagement searchTerm={searchTerms.class} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleClassCardClick={handleClassCardClick}/>
          </div>
        )}
        {visitedSections.includes("subject") && (
          <div className={activeSection === "subject" ? "block" : "hidden"}>
            <SubjectManagement searchTerm={searchTerms.subject} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew}/>
          </div>
        )}

        {/* --- Modals --- */}
        {showUserInfo && <Modal><UserInfoModal user={showUserInfo} onClose={()=>setShowUserInfo(null)} onChangeRole={()=>setShowUserInfo(null)} /></Modal>}
        {selectedUser && <Modal><RoleModal onShowInfo={handleUserShowInfo} onClose={()=>setSelectedUser(null)} onDelete={()=>{}} user={selectedUser} /></Modal>}
        {showActionModal && <Modal><ActionModal onClose={()=>setShowActionModal(null)} onShowInfo={handleShowInfo} onDelete={()=>{}} /></Modal>}
        {showCreateModal && <Modal><CreateModal type={showCreateModal} onClose={()=>setShowCreateModal(null)} onCreate={()=>{}} /></Modal>}
        {showInfoModal && <Modal><ShowInfoModal type={showInfoModal.type} data={showInfoModal.data} onClose={()=>setShowInfoModal(null)} /></Modal>}
        {showAccountModal && user && <Modal dark onClose={()=>setShowAccountModal(false)}><UserAccountModal user={user} onClose={()=>setShowAccountModal(false)}/></Modal>}
      </div>
    </div>
  )
}

/* ========== COMPONENT PHỤ ========== */

function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  return (
    <a
      href="#"
      onClick={() => setSection(id)}
      className={`block px-3 py-2 rounded-lg transition-colors ${
        activeSection === id ? "bg-cyan-500 text-white" : "hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {text}
      </div>
    </a>
  )
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
  )
}

function Modal({ children, dark = false, onClose }: any) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${dark ? "bg-black/30" : ""}`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
