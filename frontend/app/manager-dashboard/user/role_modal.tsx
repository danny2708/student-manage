"use client"

import { Button } from "../../../components/ui/button"
import { X, UserPlus, Eye, Trash2, Users, BookOpen, Star, FileText, Calendar, GraduationCap } from "lucide-react"
import { useState } from "react"

interface User {
  user_id: number
  username: string
  role: string
  fullName: string
  email: string
}

interface RoleModalProps {
  user: User
  onClose: () => void
  onShowInfo?: () => void // Added onShowInfo prop to trigger user info modal
}

export function RoleModal({ user, onClose, onShowInfo }: RoleModalProps) {
  const [showSubModal, setShowSubModal] = useState(false)
  const [subModalType, setSubModalType] = useState("")

  const handleSubModalClick = (type: string) => {
    if (type === "info" && onShowInfo) {
      onShowInfo()
      return
    }
    setSubModalType(type)
    setShowSubModal(true)
  }

  const getRoleButtons = () => {
    switch (user.role) {
      case "parent":
        return [
          { label: "Children", icon: Users, onClick: () => handleSubModalClick("children") },
          { label: "Tuitions", icon: FileText, onClick: () => handleSubModalClick("tuitions") },
          { label: "Show info", icon: Eye, onClick: () => handleSubModalClick("info") },
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => handleSubModalClick("delete"),
            variant: "destructive" as const,
          },
        ]
      case "teacher":
        return [
          { label: "Assign a class", icon: BookOpen, onClick: () => handleSubModalClick("assign-class") },
          { label: "Evaluations", icon: Star, onClick: () => handleSubModalClick("evaluations") },
          { label: "Teacher reviews", icon: FileText, onClick: () => handleSubModalClick("reviews") },
          { label: "Class taught", icon: GraduationCap, onClick: () => handleSubModalClick("classes") },
          { label: "Payroll", icon: FileText, onClick: () => handleSubModalClick("payroll") },
          { label: "Show info", icon: Eye, onClick: () => handleSubModalClick("info") },
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => handleSubModalClick("delete"),
            variant: "destructive" as const,
          },
        ]
      case "student":
        return [
          { label: "Add to class", icon: BookOpen, onClick: () => handleSubModalClick("add-class") },
          { label: "Evaluations", icon: Star, onClick: () => handleSubModalClick("evaluations") },
          { label: "Teacher reviews", icon: FileText, onClick: () => handleSubModalClick("reviews") },
          { label: "Enrollments", icon: Calendar, onClick: () => handleSubModalClick("enrollments") },
          { label: "Show info", icon: Eye, onClick: () => handleSubModalClick("info") },
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => handleSubModalClick("delete"),
            variant: "destructive" as const,
          },
        ]
      case "manager":
        return [
          { label: "Show info", icon: Eye, onClick: () => handleSubModalClick("info") },
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => handleSubModalClick("delete"),
            variant: "destructive" as const,
          },
        ]
      default:
        return [
          { label: "Add a role", icon: UserPlus, onClick: () => handleSubModalClick("add-role") },
          { label: "Show info", icon: Eye, onClick: () => handleSubModalClick("info") },
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => handleSubModalClick("delete"),
            variant: "destructive" as const,
          },
        ]
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case "parent":
        return "bg-blue-500"
      case "teacher":
        return "bg-orange-500"
      case "student":
        return "bg-green-500"
      case "manager":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const buttons = getRoleButtons()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative pointer-events-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10" aria-label="Close modal">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className={`${getRoleColor()} text-white p-4 rounded-t-lg`}>
          <h3 className="font-semibold text-center">
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "No role"}
          </h3>
          <p className="text-center text-sm opacity-90 mt-1">{user.fullName}</p>
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2">
          {buttons.map((button, index) => {
            const Icon = button.icon
            return (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant || "default"}
                className={`w-full justify-start ${
                  button.variant === "destructive"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {button.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Sub Modal for Student Classes */}
      {showSubModal && subModalType === "add-class" && user.role === "student" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative pointer-events-auto ml-80">
            <button
              onClick={() => setShowSubModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-green-500 text-white p-4 rounded-t-lg">
              <h3 className="font-semibold text-center">Student</h3>
              <p className="text-center text-sm opacity-90 mt-1">{user.fullName}</p>
            </div>

            <div className="p-4 space-y-2">
              <div className="mb-3">
                <h4 className="font-medium text-gray-700 mb-2">Classes</h4>
                <div className="space-y-1">
                  {["1A1", "1A2", "1A3"].map((className) => (
                    <Button
                      key={className}
                      variant="outline"
                      className="w-full justify-start border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Tuitions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
