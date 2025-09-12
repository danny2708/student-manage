"use client"

import { X, User, Calendar, Mail, Phone } from "lucide-react"

interface UserInfoModalProps {
  user: any
  onClose: () => void
  onChangeRole: (newRole: string) => void // Thêm dòng này
}

export function UserInfoModal({ user, onClose, onChangeRole }: UserInfoModalProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900  rounded-lg shadow-xl w-140 overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Close user information modal"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex">
        {/* Left panel with avatar and basic info */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 text-white p-6 flex flex-col items-center justify-center w-40">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 bg-opacity-20 rounded-full flex items-center justify-center mb-3">
            <User className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{user.username}</h3>
          <p className="text-xs opacity-90 mb-3">{user.role || "No role"}</p>
          <button className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded" aria-label="Edit user information">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        {/* Right panel with detailed information */}
        <div className="p-6 flex-1 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-cyan-500 mb-1">
                <span className="text-xs">📋</span>
                <span className="font-medium">ID</span>
              </div>
              <p className="text-gray-600">{user.user_id.toString().padStart(2, "0")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-pink-500 mb-1">
                <span className="text-xs">⚥</span>
                <span className="font-medium">Gender</span>
              </div>
              <p className="text-gray-600">Male</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Date of birth</span>
              </div>
              <p className="text-gray-600">23/02/2012</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-purple-500 mb-1">
                <User className="h-3 w-3" />
                <span className="font-medium">Full name</span>
              </div>
              <p className="text-gray-600">{user.fullName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <Mail className="h-3 w-3" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Phone className="h-3 w-3" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-gray-600">0123456789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
