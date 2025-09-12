import * as React from "react"
import { BookOpen, Settings } from "lucide-react"
import { useClasses } from "../../../src/hooks/useClass"

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
  const { classes, loading, error } = useClasses()

  const filteredClasses = classes.filter((cls) =>
    cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <p className="text-gray-500">Loading classes...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

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
            <p className="text-lg font-semibold text-white">{cls.class_name}</p>
            <p className="text-gray-400">
              Teacher: <span className="text-gray-300">{cls.teacher_name ?? "—"}</span>
            </p>
            <p className="text-gray-400">
              Max students: <span className="text-gray-300">{cls.max_students ?? "—"}</span>
            </p>
            <p className="text-gray-400">
              Fee: <span className="text-gray-300">{cls.fee ?? "—"}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
