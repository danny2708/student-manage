// File: components/TuitionManagement.tsx
import * as React from "react"
import { DollarSign, Settings } from "lucide-react"
import { mockTuitions } from "../data/mockData"

interface TuitionManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew: (type: string) => void
  handleTableRowClick: (type: string, data: any) => void
}

export default function TuitionManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleTableRowClick,
}: TuitionManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tuition Management</h2>
        <button
          onClick={() => handleCreateNew("tuition")}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Create New Tuition
        </button>
      </div>
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("tuition", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
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
              <tr
                key={tuition.tuiton_id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleTableRowClick("tuition", tuition)}
              >
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
}