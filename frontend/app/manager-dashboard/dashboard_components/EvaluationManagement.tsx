// File: components/EvaluationManagement.tsx
import * as React from "react"
import { Settings } from "lucide-react"
import { mockEvaluations } from "../data/mockData"

interface EvaluationManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
}

export default function EvaluationManagement({
  searchTerm,
  updateSearchTerm,
}: EvaluationManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Management</h2>
      </div>
      <div className="text-gray-900flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search evaluations..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("evaluation", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Settings className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                STUDENT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TEACHER
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TYPE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                DATE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {mockEvaluations.map((evaluation) => (
              <tr key={evaluation.evaluation_id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.evaluation_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.student}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.teacher}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      evaluation.type === "discipline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {evaluation.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}