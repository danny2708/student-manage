"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { X, Search, Filter } from "lucide-react"

interface Schedule {
  schedule_id: number
  class: string
  day: string
  room: string
  date: string
  type: "Weekly" | "Once"
  start: string
  end: string
}

interface ScheduleModalProps {
  schedules: Schedule[]
  onClose: () => void
}

export function ScheduleModal({ schedules, onClose }: ScheduleModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Management</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="Close modal">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.schedule_id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.schedule_id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{schedule.class}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.day}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.room}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        schedule.type === "Weekly" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {schedule.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.start}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export type { Schedule }