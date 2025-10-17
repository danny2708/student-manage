"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "../../src/contexts/AuthContext"
import type { LoginResponse } from "../../src/services/api/auth"
import { AnimatePresence, motion } from "framer-motion"

import {
  Users, DollarSign, BookOpen, Calendar, GraduationCap, Bell, FileText,
  Star, Settings, ChevronDown, ChevronRight, LayoutDashboard, Wallet,
  UserCheck, School, LogOut, User as UserIcon,
} from "lucide-react"

import { UserInfoModal } from "../dashboard_components/showInfo/UserInfoModal"
import { ActionModal } from "../dashboard_components/showInfo/action_modal"
import { CreateModal } from "../dashboard_components/showInfo/create_modal"
import { ShowInfoModal } from "../dashboard_components/showInfo/ShowInfoModal"
import { UserAccountModal } from "../user_account"
import { RoleModal } from "./users_management/roles-components/RoleModal"
import DashboardContent from "./DashboardContent"

// ⚡ Lazy-load các component quản lý
const UserManagement = dynamic(() => import("../dashboard_components/users/UserManagement"), { ssr: false })
const TuitionManagement = dynamic(() => import("../dashboard_components/tuition/TuitionManagement"), { ssr: false })
const ScheduleManagement = dynamic(() => import("../dashboard_components/schedule/ScheduleManagement"), { ssr: false })
const PayrollManagement = dynamic(() => import("../dashboard_components/payroll/PayrollManagement"), { ssr: false })
const TeacherReviewManagement = dynamic(() => import("../dashboard_components/TeacherReviewManagement"), { ssr: false })
const EvaluationManagement = dynamic(() => import("../dashboard_components/EvaluationManagement"), { ssr: false })
const ClassManagement = dynamic(() => import("../dashboard_components/class/ClassManagement"), { ssr: false })
const SubjectManagement = dynamic(() => import("../dashboard_components/SubjectManagement"), { ssr: false })

export default function ManagerDashboard() {
  const { user, logout } = useAuth() as { user: LoginResponse | null, logout: () => void }
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [activeSection, setActiveSection] = useState("dashboard")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["general"])
  const [visitedSections, setVisitedSections] = useState<string[]>(["dashboard"])

  const [searchTerms, setSearchTerms] = useState({
    user: "", tuition: "", schedule: "", payroll: "",
    teacherReview: "", evaluation: "", class: "", subject: "",
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
    logout()
    router.replace("/login")
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

  const handleCreateNew = (type: string) => setShowCreateModal(type)

  const setSection = (id: string) => {
    setActiveSection(id)
    if (!visitedSections.includes(id)) {
      setVisitedSections((prev) => [...prev, id])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 relative">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 font-bold text-lg text-cyan-600">
              <GraduationCap className="h-8 w-8" />
              <span>Student Management</span>
            </div>
          </div>

      {/* Divider */}
      <hr className="border-t border-gray-200 mb-6" />

          {/* Account button */}
          <div
            className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
            onClick={() => mounted && setShowAccountModal(true)}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm text-gray-600">
              {mounted ? (user?.username ?? "User Account") : "User Account"}
            </span>
          </div>

      {/* Divider */}
      <hr className="border-t border-gray-200 mb-6" />
      
          {/* Menu */}
          <nav className="space-y-2">
            <Category name="general" title="General Management" icon={Settings} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="dashboard" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Manager Dashboard" />
              <SidebarLink id="notification" activeSection={activeSection} setSection={setSection} icon={Bell} text="Notification" />
            </Category>

            <Category name="financial" title="Financial Management" icon={Wallet} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="tuition" activeSection={activeSection} setSection={setSection} icon={DollarSign} text="Tuition" />
              <SidebarLink id="payroll" activeSection={activeSection} setSection={setSection} icon={FileText} text="Payroll" />
            </Category>

            <Category name="user" title="User Management" icon={UserCheck} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="user" activeSection={activeSection} setSection={setSection} icon={Users} text="Users" />
              <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={Star} text="Teacher Review" />
              <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={GraduationCap} text="Evaluation" />
            </Category>

            <Category name="academics" title="Academics" icon={School} expandedCategories={expandedCategories} toggleCategory={toggleCategory}>
              <SidebarLink id="class" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Class" />
              <SidebarLink id="subject" activeSection={activeSection} setSection={setSection} icon={BookOpen} text="Subject" />
              <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedules" />
            </Category>
          </nav>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className={activeSection === "dashboard" ? "block" : "hidden"}><DashboardContent /></div>
        {visitedSections.includes("user") && activeSection === "user" && <UserManagement searchTerm={searchTerms.user} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew} handleTableRowClick={handleTableRowClick}/>}
        {visitedSections.includes("tuition") && activeSection === "tuition" && <TuitionManagement />}
        {visitedSections.includes("schedule") && activeSection === "schedule" && <ScheduleManagement />}
        {visitedSections.includes("payroll") && activeSection === "payroll" && <PayrollManagement />}
        {visitedSections.includes("teacher-review") && activeSection === "teacher-review" && <TeacherReviewManagement searchTerm={searchTerms.teacherReview} updateSearchTerm={updateSearchTerm}/>}
        {visitedSections.includes("evaluation") && activeSection === "evaluation" && <EvaluationManagement searchTerm={searchTerms.evaluation} updateSearchTerm={updateSearchTerm}/>}
        {visitedSections.includes("class") && activeSection === "class" && <ClassManagement />}
        {visitedSections.includes("subject") && activeSection === "subject" && <SubjectManagement searchTerm={searchTerms.subject} updateSearchTerm={updateSearchTerm} handleCreateNew={handleCreateNew}/>}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showUserInfo && (
          <ModalWrapper onClose={() => setShowUserInfo(null)}>
            <UserInfoModal user={showUserInfo} onClose={()=>setShowUserInfo(null)} onChangeRole={()=>setShowUserInfo(null)} />
          </ModalWrapper>
        )}
        {selectedUser && (
          <ModalWrapper onClose={() => setSelectedUser(null)}>
            <RoleModal onShowInfo={handleUserShowInfo} onClose={()=>setSelectedUser(null)} onDelete={()=>{}} user={selectedUser} />
          </ModalWrapper>
        )}
        {showActionModal && (
          <ModalWrapper onClose={() => setShowActionModal(null)}>
            <ActionModal onClose={()=>setShowActionModal(null)} onShowInfo={handleShowInfo} onDelete={()=>{}} />
          </ModalWrapper>
        )}
        {showCreateModal && (
          <ModalWrapper onClose={()=>setShowCreateModal(null)}>
            <CreateModal type={showCreateModal} onClose={()=>setShowCreateModal(null)} onCreate={()=>{}} />
          </ModalWrapper>
        )}
        {showInfoModal && (
          <ModalWrapper onClose={()=>setShowInfoModal(null)}>
            <ShowInfoModal type={showInfoModal.type} data={showInfoModal.data} onClose={()=>setShowInfoModal(null)} onUpdated={async () => {}} />
          </ModalWrapper>
        )}
        {mounted && showAccountModal && user && (
          <ModalWrapper onClose={()=>setShowAccountModal(false)}>
            <UserAccountModal user={user} onClose={()=>setShowAccountModal(false)} />
          </ModalWrapper>
        )}
      </AnimatePresence>
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
        activeSection === id ? "bg-cyan-500 text-white" : "hover:bg-gray-100"
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
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 rounded-lg transition-colors"
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

function ModalWrapper({ children, onClose }: any) {
  return (
    <motion.div
      key="manager-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {/* Backdrop */}
      <motion.button
        aria-label="close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-black"
        style={{ WebkitTapHighlightColor: "transparent" }}
      />
      {/* Content */}
      <motion.div
        initial={{ y: 12, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="relative w-[90vw] max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
