"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { X, Search, Filter } from "lucide-react"

interface Evaluation {
  evaluation_id: number
  student: string
  teacher: string
  type: "discipline" | "study"
  date: string
}

interface EvaluationModalProps {
  evaluations: Evaluation[]
  onClose: () => void
}

export function EvaluationModal({ evaluations, onClose }: EvaluationModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.teacher.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Student Evaluations</h2>
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
                placeholder="Search evaluations..."
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
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.evaluation_id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{evaluation.evaluation_id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {evaluation.student}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{evaluation.teacher}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluation.type === "discipline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {evaluation.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{evaluation.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
