// File: components/ClassManagement.tsx
import * as React from "react"
import { BookOpen, Settings } from "lucide-react"
import { mockClasses } from "../data/mockData"

interface ClassManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew: (type: string) => void
  handleClassCardClick: (classData: any) => void
}

export default function ClassManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleClassCardClick,
}: ClassManagementProps) {
  // Đảm bảo tên thuộc tính trong filter khớp với dữ liệu của bạn
  const filteredClasses = mockClasses.filter((cls) => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
        <button
          onClick={() => handleCreateNew("class")}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Create New Class
        </button>
      </div>
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("class", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div
            key={cls.class_id}
            onClick={() => handleClassCardClick(cls)}
            className="bg-gray-800 p-6 rounded-lg shadow-xl hover:bg-gray-700 transition-colors cursor-pointer space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-cyan-400">{cls.name}</h3>
              {/* Đã sửa: Giả định tên thuộc tính là `status` */}
            </div>
            <p className="text-gray-400">
              Teacher: <span className="text-gray-300">{cls.teacher}</span>
            </p>
            {/* Đã sửa: Giả định tên thuộc tính là `studentCount` */}
            <p className="text-gray-400">
              Students: <span className="text-gray-300">{cls.studentCount}</span>
            </p>
            {/* Đã sửa: Giả định tên thuộc tính là `subject` và là một mảng */}
            <p className="text-gray-400">
              Subjects: <span className="text-gray-300">{cls.subject}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}