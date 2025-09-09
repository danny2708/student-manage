"use client"

import { X, Edit } from "lucide-react"

interface ShowInfoModalProps {
  type: string
  data: any
  onClose: () => void
}

export function ShowInfoModal({ type, data, onClose }: ShowInfoModalProps) {
  const renderContent = () => {
    switch (type) {
      case "payroll":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">ID</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{data.payroll_id}</span>
                <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Teacher name</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{data.teacherName}</span>
                <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Month</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">7</span>
                <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Total base</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{data.baseSalary?.toLocaleString()} vnd</span>
                <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Reward bonus</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{data.bonus?.toLocaleString()} vnd</span>
                <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Total</span>
              <span className="text-gray-700">{data.total?.toLocaleString()} vnd</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Sent at</span>
              <span className="text-gray-700">{data.sentAt}</span>
            </div>
          </div>
        )
      case "tuition":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">ID</span>
              <span className="text-gray-700">{data.tuiton_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Student name</span>
              <span className="text-gray-700">{data.studentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Class</span>
              <span className="text-gray-700">{data.className}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Amount</span>
              <span className="text-gray-700">{data.amount?.toLocaleString()} vnd</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Status</span>
              <span className="text-gray-700">{data.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Due date</span>
              <span className="text-gray-700">{data.dueDate}</span>
            </div>
          </div>
        )
      case "schedule":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">ID</span>
              <span className="text-gray-700">{data.schedule_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Class</span>
              <span className="text-gray-700">{data.class}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Day</span>
              <span className="text-gray-700">{data.day}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Room</span>
              <span className="text-gray-700">{data.room}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Date</span>
              <span className="text-gray-700">{data.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Type</span>
              <span className="text-gray-700">{data.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">Start</span>
              <span className="text-gray-700">{data.start}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-600 font-medium">End</span>
              <span className="text-gray-700">{data.end}</span>
            </div>
          </div>
        )
      default:
        return <div>No information available</div>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-80 p-6">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors" aria-label="Close modal">
        <X className="h-5 w-5" />
      </button>

      <div className="mb-6">{renderContent()}</div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
          Delete
        </button>
        <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
          Save changes
        </button>
        <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
          Discard changes
        </button>
      </div>
    </div>
  )
}
