// File: components/ScheduleManagement.tsx
import * as React from "react"
import { Calendar, Settings } from "lucide-react"
import { mockSchedules } from "../data/mockData"

interface ScheduleManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew: (type: string) => void
  handleTableRowClick: (type: string, data: any) => void
}

export default function ScheduleManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleTableRowClick,
}: ScheduleManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
        <button
          onClick={() => handleCreateNew("schedule")}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Create New Schedule
        </button>
      </div>
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("schedule", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
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
              <tr
                key={schedule.schedule_id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleTableRowClick("schedule", schedule)}
              >
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
}