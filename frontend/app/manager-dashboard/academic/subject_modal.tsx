"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { X, Search, Filter } from "lucide-react"

interface Subject {
  subject_id: number
  subject: string
  classes: number
}

interface SubjectModalProps {
  subjects: Subject[]
  onClose: () => void
}

export function SubjectModal({ subjects, onClose }: SubjectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSubjects = subjects.filter((subject) =>
    subject.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Subject Management</h2>
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
                placeholder="Search subjects..."
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
        <div className="overflow-auto max-h-[50vh]">
          <table className="w-full">
            <thead className="bg-gray-800 text-white sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Classes</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 text-white divide-y divide-gray-700">
              {filteredSubjects.map((subject) => (
                <tr key={subject.subject_id} className="hover:bg-gray-700 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{subject.subject_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{subject.classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Subject Button */}
        <div className="p-4 bg-gray-50 border-t">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Add subject</Button>
        </div>
      </div>
    </div>
  )
}
